import {execa} from 'execa'
import * as fsp from 'node:fs/promises'
import {
  RegisterMachineResponse_Mount_CephVolume,
  RegisterMachineResponse_Mount_FilesystemType,
} from '../gen/ts/depot/cloud/v3/machine_pb'
import {sleep} from './common'

export async function ensureMounted(
  device: string,
  path: string,
  fstype: RegisterMachineResponse_Mount_FilesystemType,
  cephVolume: RegisterMachineResponse_Mount_CephVolume | undefined,
) {
  console.log(`Ensuring ${device} is mounted at ${path}`)

  if (cephVolume) {
    await attachCeph(cephVolume)
  }

  await waitForDevice(device)
  const realDevice = await fsp.realpath(device)

  const mounts = await fsp.readFile('/proc/mounts', 'utf8')
  if (mounts.includes(`${realDevice} ${path} `)) {
    console.log(`Device ${device} is already mounted at ${path}`)
    return
  }

  const res = await execa('blkid', [realDevice], {reject: false})
  if (res.stdout === '') {
    console.log(`Device ${device} is not formatted`)
    if (fstype === RegisterMachineResponse_Mount_FilesystemType.XFS) {
      if (cephVolume) {
        // -K skips discarding blocks at mkfs time.  No need as this is a new volume.
        await execa('mkfs', ['-t', 'xfs', '-K', realDevice], {stdio: 'inherit'})
      } else {
        await execa('mkfs', ['-t', 'xfs', realDevice], {stdio: 'inherit'})
      }
    } else if (fstype === RegisterMachineResponse_Mount_FilesystemType.BTRFS) {
      await execa('mkfs', ['-t', 'btrfs', realDevice], {stdio: 'inherit'})
    } else {
      await execa('mkfs', ['-t', 'ext4', '-T', 'news', realDevice], {stdio: 'inherit'})
    }
  }

  console.log(`Mounting ${device} at ${path}`)
  await fsp.mkdir(path, {recursive: true})
  await mountDevice(realDevice, path, fstype)
}

async function attachCeph(cephVolume: RegisterMachineResponse_Mount_CephVolume) {
  const {volumeName, clientName, cephConf, key} = cephVolume
  console.log(`Installing ceph configuration for ${clientName}`)
  await writeCephConf(clientName, cephConf, key)

  console.log(`Attaching ceph ${volumeName} for ${clientName}`)
  // NOTE: The API sends the device name as `/dev/rbd/rbd/${volumeName}/${volumeName}`
  // This means we ignore the device name returned from mapping.
  await mapBlockDevice(volumeName, clientName)
}

async function mountDevice(device: string, path: string, fstype: RegisterMachineResponse_Mount_FilesystemType) {
  const types =
    fstype === RegisterMachineResponse_Mount_FilesystemType.EXT4
      ? ['ext4', 'xfs', 'btrfs']
      : fstype === RegisterMachineResponse_Mount_FilesystemType.XFS
      ? ['xfs', 'ext4', 'btrfs']
      : ['btrfs', 'xfs', 'ext4']

  for (const type of types) {
    try {
      await execa('mount', ['-t', type, '-o', 'defaults', device, path], {stdio: 'inherit'})
      return
    } catch {}
  }

  throw new Error(`Failed to mount ${device} at ${path}`)
}

// Unmounts device at path.  If the device is not mounted, this is a no-op.
export async function unmountDevice(path: string) {
  const {exitCode, stderr} = await execa('umount', [path], {reject: false, stdio: 'inherit'})
  if (exitCode === 0 || exitCode === 32) {
    return
  }

  throw new Error(`Failed to unmount ${path}: ${stderr}`)
}

// Bind-mounts the BuildKit executor directory to the ephemeral disk.
export async function mountExecutor() {
  const mounts = await fsp.readFile('/proc/mounts', 'utf8')
  if (mounts.includes('/var/lib/buildkit/runc-overlayfs/executor')) {
    console.log(`Executor dir is already mounted`)
    return
  }

  await execa('mkdir', ['-p', '/mnt/executor'], {stdio: 'inherit'})
  await execa('rm', ['-rf', '/var/lib/buildkit/runc-overlayfs/executor'], {stdio: 'inherit'})
  await execa('mkdir', ['-p', '/var/lib/buildkit/runc-overlayfs/executor'], {stdio: 'inherit'})
  await execa('mount', ['--bind', '/mnt/executor', '/var/lib/buildkit/runc-overlayfs/executor'], {stdio: 'inherit'})
}

async function waitForDevice(device: string) {
  while (true) {
    try {
      const stat = await fsp.stat(device)
      if (stat.isBlockDevice()) return
      await sleep(500)
    } catch (err: any) {
      if (err.code !== 'ENOENT') throw err
    }
  }
}

// Creates the ceph.conf and ceph.client.keyring files.
export async function writeCephConf(clientName: string, cephConf: string, key: string) {
  await fsp.mkdir('/etc/ceph', {recursive: true})
  await fsp.chmod('/etc/ceph', 0o700)
  await fsp.writeFile('/etc/ceph/ceph.conf', cephConf)

  const keyringPath = `/etc/ceph/ceph.${clientName}.keyring`
  const keyring = `[${clientName}]
    key = ${key}`
  await fsp.writeFile(keyringPath, keyring)
  await fsp.chmod(keyringPath, 0o600)
}

// Connects to ceph cluster and maps the RBD to a block device locally.
export async function mapBlockDevice(volumeName: string, clientName: string) {
  const imageSpec = `rbd/${volumeName}/${volumeName}`
  const keyringPath = `/etc/ceph/ceph.${clientName}.keyring`
  await execa('rbd', ['map', imageSpec, '--name', clientName, '--keyring', keyringPath], {stdio: 'inherit'})
}

export async function unmapBlockDevice(volumeName: string) {
  const imageSpec = `rbd/${volumeName}/${volumeName}`
  const {exitCode, stderr} = await execa('rbd', ['unmap', imageSpec], {reject: false, stdio: 'inherit'})
  // 22 means that the device is not mapped a.k.a EINVAL.
  if (exitCode === 0 || exitCode === 22) {
    return
  }

  throw new Error(`Failed to unmap ${imageSpec}: ${stderr}`)
}

let isTrimInProgress = false
// Trims the filesystem on the device.  This seems as if it removes
// data from the block, but the provisioned du metrics stay the same.
// We ignore any failures and just log them.
export async function fstrim(path: string) {
  if (isTrimInProgress) return
  isTrimInProgress = true

  console.log(`Trimming ${path}`)

  try {
    const startTime = Date.now()
    await execa('fstrim', ['-v', path], {stdio: 'inherit'})
    const executionTime = Date.now() - startTime
    console.log(`Trimmed ${path} in ${executionTime} ms`)
  } catch (err: any) {
    console.log(`Failed to trim ${path}: ${err.stderr}`)
  } finally {
    isTrimInProgress = false
  }
}

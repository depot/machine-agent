import {execa} from 'execa'
import * as fsp from 'node:fs/promises'
import {
  RegisterMachineResponse_Mount_CephVolume,
  RegisterMachineResponse_Mount_FilesystemType,
} from '../gen/ts/depot/cloud/v2/machine_pb'
import {mapBlockDevice, writeCephConf} from '../tasks/ceph'
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
      await execa('mkfs', ['-t', 'xfs', realDevice], {stdio: 'inherit'})
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

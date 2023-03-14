import {execa} from 'execa'
import * as fsp from 'node:fs/promises'
import {RegisterMachineResponse_Mount_FilesystemType} from '../gen/depot/cloud/v2/machine'
import {sleep} from './common'

export async function ensureMounted(
  device: string,
  path: string,
  fstype: RegisterMachineResponse_Mount_FilesystemType,
) {
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
    if (fstype === RegisterMachineResponse_Mount_FilesystemType.FILESYSTEM_TYPE_XFS) {
      await execa('mkfs', ['-t', 'xfs', realDevice], {stdio: 'inherit'})
    } else {
      await execa('mkfs', ['-t', 'ext4', '-T', 'news', realDevice], {stdio: 'inherit'})
    }
  }

  console.log(`Mounting ${device} at ${path}`)
  await fsp.mkdir(path, {recursive: true})
  if (fstype === RegisterMachineResponse_Mount_FilesystemType.FILESYSTEM_TYPE_XFS) {
    try {
      await execa('mount', ['-t', 'xfs', '-o', 'defaults', realDevice, path], {stdio: 'inherit'})
    } catch (err: any) {
      console.log(err)
      // Try to mount existing volume as ext4 if xfs fails.
      await execa('mount', ['-t', 'ext4', '-o', 'defaults', realDevice, path], {stdio: 'inherit'})
    }
  } else {
    try {
      await execa('mount', ['-t', 'ext4', '-o', 'defaults', realDevice, path], {stdio: 'inherit'})
    } catch (err: any) {
      console.log(err)
      // Try to mount existing volume as xfs if ext4 fails.
      await execa('mount', ['-t', 'xfs', '-o', 'defaults', realDevice, path], {stdio: 'inherit'})
    }
  }
}

// Bind-mounts the BuildKit executor directory to the ephemeral disk.
export async function mountExecutor() {
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

import {execa} from 'execa'
import * as fsp from 'node:fs/promises'
import {sleep} from './common'

export async function ensureMounted(device: string, path: string) {
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
    await execa('mkfs', ['-t', 'ext4', '-T', 'news', realDevice], {stdio: 'inherit'})
  }

  console.log(`Mounting ${device} at ${path}`)
  await fsp.mkdir(path, {recursive: true})
  await execa('mount', ['-t', 'ext4', '-o', 'defaults', realDevice, path], {stdio: 'inherit'})
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

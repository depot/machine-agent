import {execa} from 'execa'
import {RegisterMachineResponse_BuildKitTask} from '../gen/ts/depot/cloud/v3/machine_pb'
import {client} from '../utils/grpc'
import {unmapBlockDevice, unmountDevice} from '../utils/mounts'

export async function ShutdownBuildkit(rootDir: string, mounts: RegisterMachineResponse_BuildKitTask['mounts']) {
  // Remove estargz cache because we will rely on the buildkit layer cache instead.
  await execa('rm', ['-rf', `${rootDir}/runc-stargz/snapshots/stargz`], {stdio: 'inherit'}).catch((err) => {
    console.error(err)
  })

  await Shutdown(rootDir, mounts)
}

export async function ShutdownDagger(rootDir: string, mounts: RegisterMachineResponse_BuildKitTask['mounts']) {
  await Shutdown(rootDir, mounts)
}

async function Shutdown(rootDir: string, mounts: RegisterMachineResponse_BuildKitTask['mounts']) {
  await Unmount(rootDir, mounts)

  const controller = new AbortController()
  const signal = controller.signal

  const shutdown = client.shutdown({}, {signal})

  const timeout = 5000
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  return shutdown.finally(() => clearTimeout(timeoutId))
}

async function Unmount(rootDir: string, mounts: RegisterMachineResponse_BuildKitTask['mounts']) {
  const start = Date.now()
  await execa('sync', {stdio: 'inherit'}).catch((err) => {
    console.error(err)
  })
  console.log(`sync took ${Date.now() - start}ms`)

  for (const mount of mounts) {
    if (mount.cephVolume) {
      await unmountDevice(mount.path)
      await unmapBlockDevice(mount.cephVolume.volumeName, mount.cephVolume.imageSpec)
    } else {
      await unmountDevice(mount.path)
    }
  }
}

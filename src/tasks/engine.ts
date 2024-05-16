import {isAbortError} from 'abort-controller-x'
import {execa} from 'execa'
import * as fsp from 'fs/promises'
import {onShutdown, onShutdownError} from 'node-graceful-shutdown'
import {RegisterMachineResponse, RegisterMachineResponse_EngineTask} from '../gen/ts/depot/cloud/v3/machine_pb'
import {ensureMounted, unmapBlockDevice, unmountDevice} from '../utils/mounts'
import {reportEngineHealth} from './engineHealth'

export async function startEngine(message: RegisterMachineResponse, task: RegisterMachineResponse_EngineTask) {
  console.log('Starting engine')

  let useCeph = false
  for (const mount of task.mounts) {
    await ensureMounted(mount.device, mount.path, mount.fsType, mount.cephVolume, mount.options)
    if (mount.cephVolume) useCeph = true
  }

  const {machineId, token} = message
  const headers = {Authorization: `Bearer ${token}`}

  await fsp.mkdir('/etc/engine', {recursive: true})
  await fsp.writeFile('/etc/engine/tls.crt', task.cert!.cert, {mode: 0o644})
  await fsp.writeFile('/etc/engine/tls.key', task.cert!.key, {mode: 0o644})
  await fsp.writeFile('/etc/engine/tlsca.crt', task.caCert!.cert, {mode: 0o644})

  const cacheSizeMB = task.cacheSize * 1000000

  const args = [
    'run',
    '--rm',
    '--privileged',
    '--name',
    'engine',
    '-v',
    '/etc/engine:/etc/engine:ro',
    '-v',
    '/var/lib/engine:/var/lib/engine',
    '-p',
    '443:443',
    task.image,
    '--addr',
    'tcp://0.0.0.0:443',
    '--addr',
    'unix:///run/buildkit/buildkitd.sock',
    '--root',
    '/var/lib/engine',
    '--tlscert',
    '/etc/engine/tls.crt',
    '--tlskey',
    '/etc/engine/tls.key',
    '--tlscacert',
    '/etc/engine/tlsca.crt',
    '--oci-worker-gc',
    '--oci-worker-gc-keepstorage',
    `${cacheSizeMB}`,
    '--oci-max-parallelism',
    'num-cpu',
  ]

  const controller = new AbortController()
  const signal = controller.signal

  async function runEngine() {
    try {
      console.log('Execing engine')
      await execa('/usr/bin/docker', args, {stdio: 'inherit', signal})
    } catch (error) {
      if (error instanceof Error && error.message.includes('Command failed with exit code 1')) {
        // Ignore this error, it's expected when the process is killed.
      } else if (isAbortError(error)) {
        // Ignore this error, it's expected when the process is killed.
      } else {
        throw error
      }
    } finally {
      controller.abort()
    }
  }

  const engine = runEngine()

  onShutdownError(async (error) => {
    console.error('Error shutting down:', error)
  })

  onShutdown(async () => {
    setTimeout(() => {
      console.log('Shutdown timed out, killing process')
      process.exit(1)
    }, 1000 * 60).unref()

    controller.abort()
    try {
      await engine
      console.log('Engine exited')
    } catch (error) {
      console.log(`Engine exited with error: ${error}`)
    }

    for (const mount of task.mounts) {
      if (mount.cephVolume) {
        await unmountDevice(mount.path)
        await unmapBlockDevice(mount.cephVolume.volumeName, mount.cephVolume.imageSpec)
      } else {
        await unmountDevice(mount.path)
      }
    }
  })

  try {
    await Promise.all([
      engine,
      reportEngineHealth({machineId, signal, headers, mounts: task.mounts}),
      // reportUsage({machineId, signal, headers}),
    ])
  } catch (error) {
    throw error
  } finally {
    controller.abort()
  }
}

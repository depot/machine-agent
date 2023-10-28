import {isAbortError} from 'abort-controller-x'
import {execa} from 'execa'
import * as fsp from 'fs/promises'
import {onShutdown, onShutdownError} from 'node-graceful-shutdown'
import {RegisterMachineResponse, RegisterMachineResponse_BuildKitTask} from '../gen/ts/depot/cloud/v3/machine_pb'
import {ensureMounted, fstrim, mountExecutor, unmapBlockDevice, unmountDevice} from '../utils/mounts'
import {reportHealth} from './health'
import {reportUsage} from './usage'

export async function startBuildKit(message: RegisterMachineResponse, task: RegisterMachineResponse_BuildKitTask) {
  console.log('Starting BuildKit')

  let useCeph = false
  for (const mount of task.mounts) {
    await ensureMounted(mount.device, mount.path, mount.fsType, mount.cephVolume, mount.options)
    if (mount.cephVolume) useCeph = true
  }

  if (!useCeph) {
    await mountExecutor()
  }

  // Attempt to delete old snapshotter data
  try {
    execa('rm', ['-rf', '/var/lib/buildkit/runc-overlayfs'], {stdio: 'inherit'}).catch((err) => {
      console.error(err)
    })
  } catch {}

  const {machineId, token} = message
  const headers = {Authorization: `Bearer ${token}`}

  await fsp.writeFile('/etc/buildkit/tls.crt', task.cert!.cert, {mode: 0o644})
  await fsp.writeFile('/etc/buildkit/tls.key', task.cert!.key, {mode: 0o644})
  await fsp.writeFile('/etc/buildkit/tlsca.crt', task.caCert!.cert, {mode: 0o644})

  const cacheSizeBytes = task.cacheSize * 1000000000
  const maxParallelism = task.maxParallelism > 0 ? task.maxParallelism : 12

  const config = `
root = "/var/lib/buildkit"

[grpc]
address = ["tcp://0.0.0.0:443", "unix:///run/buildkit/buildkitd.sock"]

[grpc.tls]
cert = "/etc/buildkit/tls.crt"
key = "/etc/buildkit/tls.key"
ca = "/etc/buildkit/tlsca.crt"

[worker.oci]
enabled = true
gc = true
gckeepstorage = ${cacheSizeBytes}
max-parallelism = ${maxParallelism}
snapshotter = "stargz"

[worker.oci.stargzSnapshotter]
no_background_fetch = true
noprefetch = true
no_prometheus = true
max_concurrency = 16
debug = true

[worker.oci.stargzSnapshotter.blob]
chunk_size = 500000

[worker.containerd]
enabled = false

# [[worker.oci.gcpolicy]]
# keepBytes = 10240000000 # 10 GB
# keepDuration = 604800 # 7 days: 3600 * 24 * 7
# filters = [
#   "type==source.local",
#   "type==exec.cachemount",
#   "type==source.git.checkout",
# ]

[[worker.oci.gcpolicy]]
all = true
keepDuration = 1209600 # 14 days: 3600 * 24 * 14

[[worker.oci.gcpolicy]]
all = true
keepBytes = ${cacheSizeBytes}
`
  await fsp.writeFile('/etc/buildkit/buildkitd.toml', config, {mode: 0o644})

  const controller = new AbortController()
  const signal = controller.signal

  const env: Record<string, string> = {
    BUILDKIT_STEP_LOG_MAX_SIZE: '52428800', // 50 MB

    DEPOT_KEEPALIVE_SERVER_POLICY_PERMIT_WITHOUT_STREAM: 'true',
    DEPOT_KEEPALIVE_SERVER_POLICY_MINTIME_MS: '120000', // 2 minutes
    DEPOT_BUILDKIT_TOKEN: token,
  }

  if (task.traceEndpoint) {
    env.OTEL_TRACES_EXPORTER = 'otlp'
    env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'grpc'
    env.OTEL_EXPORTER_OTLP_COMPRESSION = 'gzip'
    env.OTEL_RESOURCE_ATTRIBUTES = `depot.machine.id=${encodeURIComponent(machineId)}`
    env.OTEL_EXPORTER_OTLP_HEADERS = `Authorization=${encodeURIComponent(`Bearer ${token}`)}`
    env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = task.traceEndpoint
  }

  if (task.profiler) {
    console.log('Enabling profiler')
    env.PROFILER_ENDPOINT = task.profiler.endpoint
    env.PROFILER_TOKEN = task.profiler.token
    env.PROFILER_PROJECT_ID = task.profiler.projectId
  }

  if (task.disableParallelGzip) {
    console.log('Disabling parallel gzip')
    env.DEPOT_DISABLE_PARALLEL_GZIP = '1'
  }

  if (task.disableMergeTo) {
    console.log('Disabling merge to')
    env.DEPOT_DISABLE_MERGE_TO = '1'
  }

  if (task.enableSchedulerDebug) {
    console.log('Enabling scheduler debug')
    env.BUILDKIT_SCHEDULER_DEBUG = '1'
  }

  if (task.resolverConcurrency) {
    console.log(`Setting resolver concurrency to ${task.resolverConcurrency}`)
    env.DEPOT_RESOLVER_CONCURRENCY = task.resolverConcurrency.toString()
  }

  const args = task.enableDebugLogging ? ['--debug'] : []

  async function runBuildKit() {
    try {
      console.log('Execing BuildKit')
      await execa('/usr/bin/buildkitd', args, {stdio: 'inherit', signal, env})
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

  const buildkit = runBuildKit()

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
      await buildkit
      console.log('BuildKit exited')
    } catch (error) {
      console.log(`BuildKit exited with error: ${error}`)
    }

    // Remove estargz cache because we will rely on the buildkit layer cache instead.
    await execa('rm', ['-rf', '/var/lib/buildkit/runc-stargz/snapshots/stargz'], {stdio: 'inherit'}).catch((err) => {
      console.error(err)
    })

    for (const mount of task.mounts) {
      if (mount.cephVolume) {
        if (!task.disableFstrim) {
          await fstrim(mount.path)
        }
        await unmountDevice(mount.path)
        await unmapBlockDevice(mount.cephVolume.volumeName)
      } else {
        await unmountDevice(mount.path)
      }
    }
  })

  try {
    await Promise.all([
      buildkit,
      reportHealth({machineId, signal, headers, mounts: task.mounts}),
      reportUsage({machineId, signal, headers}),
    ])
  } catch (error) {
    throw error
  } finally {
    controller.abort()
  }
}

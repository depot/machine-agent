import {isAbortError} from 'abort-controller-x'
import {execa} from 'execa'
import * as fsp from 'fs/promises'
import {onShutdown, onShutdownError} from 'node-graceful-shutdown'
import {RegisterMachineResponse, RegisterMachineResponse_BuildKitTask} from '../gen/ts/depot/cloud/v3/machine_pb'
import {pathExists} from '../utils/common'
import {client} from '../utils/grpc'
import {ensureMounted, fstrim, mountExecutor, unmapBlockDevice, unmountDevice} from '../utils/mounts'
import {reportHealth} from './health'
import {reportUsage} from './usage'

export async function startBuildKit(message: RegisterMachineResponse, task: RegisterMachineResponse_BuildKitTask) {
  console.log('Starting BuildKit')

  // Attempt to set up binfmt
  try {
    execa('docker', ['run', '--privileged', '--rm', 'tonistiigi/binfmt', '--install', 'all'], {stdio: 'inherit'}).catch(
      (err) => {
        console.error(err)
      },
    )
  } catch {}

  if (task.vectorConfig) {
    try {
      await fsp.writeFile('/etc/vector/vector.yaml', task.vectorConfig)
      await execa('systemctl', ['kill', '-s', 'HUP', '--kill-who=main', 'vector.service'], {stdio: 'inherit'})
    } catch {}
  }

  let rootDir = '/var/lib/buildkit'

  let useCeph = false
  for (const mount of task.mounts) {
    rootDir = mount.path
    await ensureMounted(mount.device, mount.path, mount.fsType, mount.cephVolume, mount.options)
    if (mount.cephVolume) useCeph = true
  }

  if (!useCeph) {
    await mountExecutor(rootDir)
  }

  // Attempt to delete old snapshotter data
  try {
    execa('rm', ['-rf', `${rootDir}/runc-overlayfs`], {stdio: 'inherit'}).catch((err) => {
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
root = "${rootDir}"

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
${task.enableCni ? 'cniConfigPath = "/etc/buildkit/cni.conflist"' : ''}

[worker.oci.stargzSnapshotter]
no_background_fetch = true
noprefetch = true
no_prometheus = true
max_concurrency = 16

[worker.oci.stargzSnapshotter.blob]
chunk_size = 50000000 # 50 MB

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

  if (task.enableCni && !(await pathExists('/etc/buildkit/cni.conflist'))) {
    const cniConfig = {
      cniVersion: '1.0.0',
      name: 'buildkit',
      plugins: [
        {
          type: 'bridge',
          bridge: 'buildkit0',
          isDefaultGateway: true,
          forceAddress: false,
          ipMasq: true,
          hairpinMode: true,
          ipam: {type: 'host-local', ranges: [[{subnet: '192.168.0.0/16'}]]},
        },
        {
          type: 'firewall',
        },
      ],
    }
    await fsp.mkdir('/etc/buildkit', {recursive: true})
    await fsp.writeFile('/etc/buildkit/cni.conflist', JSON.stringify(cniConfig, null, 2), {mode: 0o644})
    try {
      await execa('sysctl', ['-w', 'net.ipv4.ip_forward=1'], {stdio: 'inherit', reject: false})
    } catch {}
  }

  if (task.useBuildkitPrivate) {
    try {
      await execa('cp', ['/opt/buildkit-private/bin/*', '/usr/bin/'], {stdio: 'inherit', shell: true})
    } catch (error) {
      console.error('Unable to use buildkit-private', error)
    }
  }

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

  if (task.enableContextLogging) {
    console.log('Enabling context logging')
    env.DEPOT_CONTEXTLOG_ENABLED = '1'
  }

  if (task.resolverConcurrency) {
    console.log(`Setting resolver concurrency to ${task.resolverConcurrency}`)
    env.DEPOT_RESOLVER_CONCURRENCY = task.resolverConcurrency.toString()
  }

  if (task.enableGpu) {
    console.log('Enabling GPU')
    env.DEPOT_ENABLE_GPU = 'true'
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
      } else if (error instanceof Error && error.message.includes('Command failed with exit code 2')) {
        console.error(`BuildKit exited with panic: ${error}`)
        throw error
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

    await shutdown(rootDir, task, headers)
  })

  try {
    const [result] = await Promise.allSettled([
      buildkit,
      reportHealth({controller, headers, path: rootDir}),
      reportUsage({machineId, signal, headers}),
    ])
    if (result.status === 'rejected') {
      throw result.reason
    }

    // If we have successfully stopped buildkit, we can shutdown.
    await shutdown(rootDir, task, headers)
  } catch (error) {
    throw error
  } finally {
    controller.abort()
  }
}

async function shutdown(rootDir: string, task: RegisterMachineResponse_BuildKitTask, headers: HeadersInit) {
  // Remove estargz cache because we will rely on the buildkit layer cache instead.
  await execa('rm', ['-rf', `${rootDir}/runc-stargz/snapshots/stargz`], {stdio: 'inherit'}).catch((err) => {
    console.error(err)
  })

  // Print the time it takes to sync the filesystem.
  const start = Date.now()
  // sync the filesystem to ensure all data is written to disk.
  await execa('sync', {stdio: 'inherit'}).catch((err) => {
    console.error(err)
  })
  console.log(`sync took ${Date.now() - start}ms`)

  for (const mount of task.mounts) {
    if (mount.cephVolume) {
      if (!task.disableFstrim) {
        await fstrim(mount.path)
      }
      await unmountDevice(mount.path)
      await unmapBlockDevice(mount.cephVolume.volumeName, mount.cephVolume.imageSpec)
    } else {
      await unmountDevice(mount.path)
    }
  }

  // Report shutdown to the API to indicate that the machine is no longer available.
  await reportShutdown(headers)
}

async function reportShutdown(headers: HeadersInit) {
  const signal = AbortSignal.timeout(5000)
  return await client.shutdown({}, {headers, signal})
}

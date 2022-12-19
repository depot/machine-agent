import {execa} from 'execa'
import * as fsp from 'fs/promises'
import {Metadata} from 'nice-grpc'
import {RegisterMachineResponse, RegisterMachineResponse_BuildKitTask} from '../gen/depot/cloud/v2/machine'
import {reportHealth} from '../utils/health'
import {ensureMounted} from '../utils/mounts'

export async function startBuildKit(message: RegisterMachineResponse, task: RegisterMachineResponse_BuildKitTask) {
  for (const mount of task.mounts) {
    await ensureMounted(mount.device, mount.path)
  }

  const {machineId, token} = message
  const metadata = Metadata({Authorization: `Bearer ${token}`})

  await fsp.writeFile('/etc/buildkit/tls.crt', task.cert!.cert, {mode: 0o644})
  await fsp.writeFile('/etc/buildkit/tls.key', task.cert!.key, {mode: 0o644})
  await fsp.writeFile('/etc/buildkit/tlsca.crt', task.caCert!.cert, {mode: 0o644})

  const cacheSizeBytes = task.cacheSize * 1000000000

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
max-parallelism = 12

[worker.containerd]
enabled = false

[[worker.oci.gcpolicy]]
keepBytes = 10240000000 # 10 GB
keepDuration = 604800 # 7 days: 3600 * 24 * 7
filters = [
  "type==source.local",
  "type==exec.cachemount",
  "type==source.git.checkout",
]

[[worker.oci.gcpolicy]]
keepBytes = ${cacheSizeBytes}

[[worker.oci.gcpolicy]]
all = true
keepBytes = ${cacheSizeBytes}
`
  await fsp.writeFile('/etc/buildkit/buildkitd.toml', config, {mode: 0o644})

  const controller = new AbortController()
  const signal = controller.signal

  async function runBuildKit() {
    try {
      await execa('/usr/bin/buildkitd', [], {stdio: 'inherit', signal})
    } catch (error) {
      if (error instanceof Error && error.message.includes('Command failed with exit code 1')) {
        // Ignore this error, it's expected when the process is killed.
      } else {
        throw error
      }
    } finally {
      controller.abort()
    }
  }

  try {
    await Promise.all([runBuildKit(), reportHealth({machineId, signal, metadata})])
  } catch (error) {
    throw error
  } finally {
    controller.abort()
  }
}

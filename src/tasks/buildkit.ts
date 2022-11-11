import {execa} from 'execa'
import * as fsp from 'fs/promises'
import {Metadata} from 'nice-grpc'
import {RegisterMachineResponse, RegisterMachineResponse_BuildKitTask} from '../gen/depot/cloud/v2/machine'
import {sleep} from '../utils/common'
import {client} from '../utils/grpc'
import {ensureMounted} from '../utils/mounts'

export async function startBuildKit(message: RegisterMachineResponse, task: RegisterMachineResponse_BuildKitTask) {
  for (const mount of task.mounts) {
    await ensureMounted(mount.device, mount.path)
  }

  const {machineId, token} = message

  await fsp.writeFile('/etc/buildkit/tls.crt', task.cert!.cert, {mode: 0o644})
  await fsp.writeFile('/etc/buildkit/tls.key', task.cert!.key, {mode: 0o644})
  await fsp.writeFile('/etc/buildkit/tlsca.crt', task.caCert!.cert, {mode: 0o644})

  let done = false
  async function* pingHealth() {
    while (true) {
      if (done) return
      await sleep(1000)
      yield {machineId}
    }
  }

  const buildkit = execa('/usr/bin/buildkitd', [], {stdio: 'inherit'}).finally(() => {
    done = true
  })

  const healthLoop = client.pingMachineHealth(pingHealth(), {
    metadata: Metadata({Authorization: `Bearer ${token}`}),
  })

  await Promise.all([buildkit, healthLoop])
}

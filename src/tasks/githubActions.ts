import {execa} from 'execa'
import {Metadata} from 'nice-grpc'
import {RegisterMachineResponse, RegisterMachineResponse_GitHubActionsTask} from '../gen/depot/cloud/v2/machine'
import {sleep} from '../utils/common'
import {client} from '../utils/grpc'

export async function startGitHubActions(
  message: RegisterMachineResponse,
  task: RegisterMachineResponse_GitHubActionsTask,
) {
  const {machineId, token} = message
  const runnerDir = `/home/runner/runners/${task.runnerVersion}`

  await execa(
    './config.sh',
    [
      '--token',
      task.registrationToken,
      '--name',
      task.name,
      '--url',
      task.url,
      '--labels',
      task.labels,
      '--work',
      '/home/runner/work',
      '--unattended',
      '--disableupdate',
      '--ephemeral',
    ],
    {
      cwd: runnerDir,
      stdio: 'inherit',
    },
  )

  let done = false
  async function* pingHealth() {
    while (true) {
      if (done) return
      await sleep(1000)
      yield {machineId}
    }
  }

  const runner = execa('./run', [], {cwd: runnerDir, stdio: 'inherit'}).finally(() => {
    done = true
  })

  const healthLoop = client.pingMachineHealth(pingHealth(), {
    metadata: Metadata({Authorization: `Bearer ${token}`}),
  })

  await Promise.all([runner, healthLoop])
}

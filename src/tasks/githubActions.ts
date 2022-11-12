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
  const metadata = Metadata({Authorization: `Bearer ${token}`})
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

  const controller = new AbortController()
  const signal = controller.signal

  async function* pingHealth() {
    while (true) {
      if (signal.aborted) return
      await sleep(1000)
      yield {machineId}
    }
  }

  try {
    await Promise.all([
      execa('./run.sh', [], {cwd: runnerDir, stdio: 'inherit', signal}).finally(() => {
        controller.abort()
      }),
      client.pingMachineHealth(pingHealth(), {metadata}),
    ])
  } catch (error) {
    throw error
  } finally {
    controller.abort()
  }
}

import {execa} from 'execa'
import {Metadata} from 'nice-grpc'
import {RegisterMachineResponse, RegisterMachineResponse_GitHubActionsTask} from '../gen/depot/cloud/v2/machine'
import {reportHealth} from '../utils/health'

const RUNNER_UID = 1001

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
      uid: RUNNER_UID,
    },
  )

  const controller = new AbortController()
  const signal = controller.signal

  try {
    await Promise.all([
      execa('./run.sh', [], {cwd: runnerDir, stdio: 'inherit', signal, uid: RUNNER_UID}).finally(() => {
        controller.abort()
      }),
      reportHealth({machineId, signal, metadata}),
    ])
  } catch (error) {
    throw error
  } finally {
    controller.abort()
  }
}

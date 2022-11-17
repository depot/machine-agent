import * as Sentry from '@sentry/node'
import {ClientError, Status} from 'nice-grpc-common'
import {startBuildKit} from './tasks/buildkit'
import {startGitHubActions} from './tasks/githubActions'
import {assertNever, promises, sleep} from './utils/common'
import {DEPOT_CLOUD_CONNECTION_ID, DEPOT_MACHINE_AGENT_VERSION} from './utils/env'
import {client} from './utils/grpc'
import {getBase64Signature, getInstanceIdentityDocument} from './utils/imds'

Sentry.init({
  dsn: 'https://1b42edcd994c4c9398034d91ced602f0@o1152282.ingest.sentry.io/4504141762920448',
})

async function main() {
  if (process.argv.includes('--version')) {
    console.log(DEPOT_MACHINE_AGENT_VERSION)
    return
  }

  while (true) {
    try {
      await runLoop()
    } catch (err) {
      Sentry.captureException(err)
      console.log(err)
      await sleep(1000)
    }
  }
}

async function runLoop() {
  try {
    const aws = await promises({document: getInstanceIdentityDocument(), signature: getBase64Signature()})
    const stream = client.registerMachine({connectionId: DEPOT_CLOUD_CONNECTION_ID, cloud: {$case: 'aws', aws}})

    for await (const message of stream) {
      if (!message.task) continue

      switch (message.task?.$case) {
        case 'pending':
          await sleep(1000)
          break

        case 'buildkit':
          await startBuildKit(message, message.task.buildkit)
          break

        case 'githubActions':
          await startGitHubActions(message, message.task.githubActions)
          break

        default:
          assertNever(message.task)
      }
    }
  } catch (err) {
    if (err instanceof ClientError && err.code === Status.INTERNAL && err.details.includes('RST_STREAM')) {
      console.log('Connection closed by server')
    } else {
      throw err
    }
  }
}

main().catch((err) => {
  Sentry.captureException(err)
  console.log(err)
  process.exit(1)
})
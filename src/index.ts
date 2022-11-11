import {startBuildKit} from './tasks/buildkit'
import {startGitHubActions} from './tasks/githubActions'
import {assertNever, promises, sleep} from './utils/common'
import {DEPOT_CLOUD_CONNECTION_ID} from './utils/env'
import {client} from './utils/grpc'
import {getBase64Signature, getInstanceIdentityDocument} from './utils/imds'

async function main() {
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
}

main().catch((err) => {
  console.log(err)
  process.exit(1)
})

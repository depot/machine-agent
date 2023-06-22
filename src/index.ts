import {Code, ConnectError} from '@bufbuild/connect'
import * as Sentry from '@sentry/node'
import {startBuildKit} from './tasks/buildkit'
import {setupCeph} from './tasks/ceph'
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
    const stream = client.registerMachine({connectionId: DEPOT_CLOUD_CONNECTION_ID, cloud: {case: 'aws', value: aws}})

    for await (const message of stream) {
      if (!message.task) continue

      switch (message.task?.case) {
        case 'pending':
          if (message.task.value.cephConfig) {
            const {clientName, cephConf, key} = message.task.value.cephConfig
            await setupCeph(clientName, cephConf, key)
          }
          await sleep(1000)
          break
        case undefined:
          await sleep(1000)
          break
        case 'buildkit':
          await startBuildKit(message, message.task.value)
          break

        default:
          assertNever(message.task)
      }
    }
  } catch (err) {
    if (err instanceof ConnectError && err.code === Code.Internal && err.message.includes('RST_STREAM')) {
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

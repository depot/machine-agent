import {Code, ConnectError} from '@bufbuild/connect'
import * as Sentry from '@sentry/node'
import {execa} from 'execa'
import {startBuildKit} from './tasks/buildkit'
import {promises, sleep} from './utils/common'
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

  void prepareCeph()

  let done = false
  while (!done) {
    try {
      await runLoop()
      done = true
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
      if (message.task.case === 'buildkit') await startBuildKit(message, message.task.value)
    }
  } catch (err) {
    if (err instanceof ConnectError && err.code === Code.Internal && err.message.includes('RST_STREAM')) {
      console.log('Connection closed by server')
    } else {
      throw err
    }
  }
}

async function prepareCeph() {
  try {
    await execa('rbd', ['-h'], {stdio: 'inherit', reject: false})
  } catch {}
}

main().catch((err) => {
  Sentry.captureException(err)
  console.log(err)
  process.exit(1)
})

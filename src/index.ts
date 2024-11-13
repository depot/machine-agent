import {PartialMessage} from '@bufbuild/protobuf'
import {Code, ConnectError} from '@connectrpc/connect'
import * as Sentry from '@sentry/node'
import {execa} from 'execa'
import {RegisterMachineRequest} from './gen/ts/depot/cloud/v3/machine_pb'
import {startBuildKit} from './tasks/buildkit'
import {startEngine} from './tasks/engine'
import {promises, sleep} from './utils/common'
import {DEPOT_CLOUD, DEPOT_CLOUD_CONNECTION_ID, DEPOT_MACHINE_AGENT_VERSION} from './utils/env'
import {getFlyToken} from './utils/fly'
import {client} from './utils/grpc'
import {getBase64Signature, getInstanceIdentityDocument} from './utils/imds'

Sentry.init({
  dsn: 'https://1b42edcd994c4c9398034d91ced602f0@o1152282.ingest.sentry.io/4504141762920448',
  ignoreErrors: [/not_found/],
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
  let buildTask: Promise<void> | undefined
  const controller = new AbortController()
  const signal = controller.signal

  try {
    let req: PartialMessage<RegisterMachineRequest> = {connectionId: DEPOT_CLOUD_CONNECTION_ID}

    switch (DEPOT_CLOUD) {
      case 'aws': {
        console.log('Retrieving AWS IMDS metadata')
        const aws = await promises({document: getInstanceIdentityDocument(), signature: getBase64Signature()})
        req.cloud = {case: 'aws', value: aws}

        break
      }
      case 'fly': {
        console.log('Retrieving fly.io OIDC token')
        const token = await getFlyToken()
        req.cloud = {case: 'fly', value: {token}}

        break
      }
      default:
        throw new Error(`Unknown cloud provider: ${DEPOT_CLOUD}`)
    }

    console.log('Connecting to task stream')
    const stream = client.registerMachine(req, {signal})
    console.log('Connected to task stream')

    for await (const message of stream) {
      if (!message.task) continue
      const {token, machineId} = message

      if (message.task.case === 'buildkit') {
        buildTask = startBuildKit(token, machineId, message.task.value)
        break
      }
      if (message.task.case === 'engine') {
        buildTask = startEngine(token, message.task.value)
        break
      }
    }
  } catch (err) {
    if (err instanceof ConnectError && err.code === Code.Internal && err.message.includes('RST_STREAM')) {
      console.log('Connection closed by server')
    } else {
      throw err
    }
  } finally {
    controller.abort()
  }

  if (buildTask) {
    try {
      await buildTask
    } catch (err) {
      Sentry.captureException(err)
      console.log(err)
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

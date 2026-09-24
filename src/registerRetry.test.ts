import {Code, ConnectError} from '@connectrpc/connect'
import {strict as assert} from 'node:assert'
import {test} from 'node:test'
import {runRegisterLoopWithRetry} from './registerRetry'

const missingInstanceID = () => new ConnectError('Missing instance ID', Code.InvalidArgument)

test('does not report register rejections that recover before the threshold', async () => {
  let attempts = 0
  const reports: unknown[] = []

  await runRegisterLoopWithRetry({
    runLoop: async () => {
      attempts++
      if (attempts <= 19) throw missingInstanceID()
    },
    captureException: (error) => reports.push(error),
    logError: () => {},
    sleep: async () => {},
  })

  assert.equal(attempts, 20)
  assert.equal(reports.length, 0)
})

test('reports a persistent register rejection once at the threshold', async () => {
  let attempts = 0
  const reports: unknown[] = []

  await runRegisterLoopWithRetry({
    runLoop: async () => {
      attempts++
      if (attempts <= 20) throw missingInstanceID()
    },
    captureException: (error) => reports.push(error),
    logError: () => {},
    sleep: async () => {},
  })

  assert.equal(attempts, 21)
  assert.equal(reports.length, 1)
})

test('reports a sustained register rejection at most every five minutes', async () => {
  let attempts = 0
  let currentTime = 0
  const reports: unknown[] = []

  await runRegisterLoopWithRetry({
    runLoop: async () => {
      attempts++
      if (attempts <= 320) throw missingInstanceID()
    },
    captureException: (error) => reports.push(error),
    logError: () => {},
    sleep: async (milliseconds) => {
      currentTime += milliseconds
    },
    now: () => currentTime,
  })

  assert.equal(attempts, 321)
  assert.equal(reports.length, 2)
})

test('reports unrelated invalid argument errors immediately', async () => {
  let attempts = 0
  const reports: unknown[] = []
  const error = new ConnectError('Missing account ID', Code.InvalidArgument)

  await runRegisterLoopWithRetry({
    runLoop: async () => {
      attempts++
      if (attempts === 1) throw error
    },
    captureException: (capturedError) => reports.push(capturedError),
    logError: () => {},
    sleep: async () => {},
  })

  assert.deepEqual(reports, [error])
})

test('resets the report threshold after a nonmatching failure', async () => {
  let attempts = 0
  const reports: unknown[] = []
  const notFound = new ConnectError('Machine not found', Code.NotFound)

  await runRegisterLoopWithRetry({
    runLoop: async () => {
      attempts++
      if (attempts <= 19 || (attempts >= 21 && attempts <= 39)) throw missingInstanceID()
      if (attempts === 20) throw notFound
    },
    captureException: (error) => reports.push(error),
    logError: () => {},
    sleep: async () => {},
  })

  assert.equal(attempts, 40)
  assert.deepEqual(reports, [notFound])
})

import {Code, ConnectError} from '@connectrpc/connect'
import {strict as assert} from 'node:assert'
import {test} from 'node:test'
import {runRegisterLoopWithRetry} from './registerRetry'
import {FlyTokenError, waitForFlyMachineIdentity} from './utils/fly'

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

const flyTokenNotFound = () => new FlyTokenError('unable to get oidc token: Not Found', 404)

test('does not report a transient Fly OIDC token failure that recovers before the threshold', async () => {
  let attempts = 0
  const reports: unknown[] = []

  await runRegisterLoopWithRetry({
    runLoop: async () => {
      attempts++
      if (attempts <= 3) throw flyTokenNotFound()
    },
    captureException: (error) => reports.push(error),
    logError: () => {},
    sleep: async () => {},
  })

  assert.equal(attempts, 4)
  assert.equal(reports.length, 0)
})

test('reports a persistent Fly OIDC token failure once at the threshold', async () => {
  let attempts = 0
  const reports: unknown[] = []

  await runRegisterLoopWithRetry({
    runLoop: async () => {
      attempts++
      if (attempts <= 20) throw flyTokenNotFound()
    },
    captureException: (error) => reports.push(error),
    logError: () => {},
    sleep: async () => {},
  })

  assert.equal(attempts, 21)
  assert.equal(reports.length, 1)
})

test('starts a new report streak when a Fly OIDC token failure follows a nonmatching failure', async () => {
  let attempts = 0
  const reports: unknown[] = []
  const notFound = new ConnectError('Machine not found', Code.NotFound)

  await runRegisterLoopWithRetry({
    runLoop: async () => {
      attempts++
      if (attempts <= 19) throw missingInstanceID()
      if (attempts === 20) throw notFound
      if (attempts === 21) throw flyTokenNotFound()
    },
    captureException: (error) => reports.push(error),
    logError: () => {},
    sleep: async () => {},
  })

  assert.equal(attempts, 22)
  assert.deepEqual(reports, [notFound])
})

test('reports a rejected Fly OIDC token request on the first attempt', async () => {
  let attempts = 0
  const reports: unknown[] = []

  await runRegisterLoopWithRetry({
    runLoop: async () => {
      attempts++
      if (attempts === 1) throw new FlyTokenError('unable to get oidc token: Forbidden', 403)
    },
    captureException: (error) => reports.push(error),
    logError: () => {},
    sleep: async () => {},
  })

  assert.equal(attempts, 2)
  assert.equal(reports.length, 1)
  assert.match(String(reports[0]), /Forbidden/)
})

test('reports a persistent Fly OIDC token timeout at the threshold', async () => {
  let attempts = 0
  const reports: unknown[] = []

  await runRegisterLoopWithRetry({
    runLoop: async () => {
      attempts++
      if (attempts <= 20) throw new FlyTokenError('fly OIDC token request timed out')
    },
    captureException: (error) => reports.push(error),
    logError: () => {},
    sleep: async () => {},
  })

  assert.equal(attempts, 21)
  assert.equal(reports.length, 1)
})

test('waits for the Fly machine identity when the token endpoint answers 404', async () => {
  let calls = 0

  const token = await waitForFlyMachineIdentity(async () => {
    calls++
    if (calls <= 2) throw flyTokenNotFound()
    return 'token'
  })

  assert.equal(token, 'token')
  assert.equal(calls, 3)
})

test('fails at once when the token endpoint rejects the request', async () => {
  let calls = 0
  const forbidden = new FlyTokenError('unable to get oidc token: Forbidden', 403)

  await assert.rejects(
    waitForFlyMachineIdentity(async () => {
      calls++
      throw forbidden
    }),
    (error) => error === forbidden,
  )

  assert.equal(calls, 1)
})

test('stops waiting for the Fly machine identity after the attempt limit', async () => {
  let calls = 0

  await assert.rejects(
    waitForFlyMachineIdentity(async () => {
      calls++
      throw flyTokenNotFound()
    }),
    (error) => error instanceof FlyTokenError && error.status === 404,
  )

  assert.equal(calls, 6)
})

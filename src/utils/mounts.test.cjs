const assert = require('node:assert/strict')
const fsp = require('node:fs/promises')
const {mock, test} = require('node:test')
const {DeviceWaitTimeoutError, waitForDevice} = require('./mounts.ts')

test('waitForDevice yields and rejects when a device stays missing', {timeout: 1_000}, async () => {
  const log = mock.method(console, 'log', () => {})
  const stat = mock.method(fsp, 'stat', async () => {
    throw Object.assign(new Error('missing'), {code: 'ENOENT'})
  })
  const timeoutMs = 25
  const startedAt = Date.now()

  try {
    await assert.rejects(
      waitForDevice('/dev/missing', timeoutMs),
      (error) =>
        error instanceof DeviceWaitTimeoutError &&
        error.message === `device /dev/missing did not appear within ${timeoutMs}ms`,
    )
  } finally {
    stat.mock.restore()
    log.mock.restore()
  }

  assert.ok(Date.now() - startedAt >= timeoutMs)
  assert.ok(stat.mock.callCount() <= 2)
})

test('waitForDevice resolves when a device appears after polling', {timeout: 2_000}, async () => {
  const log = mock.method(console, 'log', () => {})
  let attempts = 0
  const stat = mock.method(fsp, 'stat', async () => {
    attempts += 1
    return {isBlockDevice: () => attempts === 3}
  })

  try {
    await waitForDevice('/dev/delayed', 1_500)
  } finally {
    stat.mock.restore()
    log.mock.restore()
  }

  assert.equal(stat.mock.callCount(), 3)
})

import {Code, ConnectError} from '@connectrpc/connect'
import {isBootRaceFlyTokenError} from './utils/fly'

const RETRY_DELAY_MS = 1_000
const RETRYABLE_FAILURE_REPORT_ATTEMPTS = 20
const RETRYABLE_FAILURE_REPORT_INTERVAL_MS = 5 * 60 * 1_000

interface RegisterRetryOptions {
  runLoop: () => Promise<void>
  captureException: (error: unknown) => void
  logError: (error: unknown) => void
  sleep: (milliseconds: number) => Promise<unknown>
  now?: () => number
}

export async function runRegisterLoopWithRetry({
  runLoop,
  captureException,
  logError,
  sleep,
  now = Date.now,
}: RegisterRetryOptions) {
  let consecutiveRetryableFailures = 0
  let lastRetryableFailureReportAt: number | undefined

  while (true) {
    try {
      await runLoop()
      return
    } catch (error) {
      if (isRetryableBootFailure(error)) {
        consecutiveRetryableFailures++
        const currentTime = now()
        const reachedReportThreshold = consecutiveRetryableFailures === RETRYABLE_FAILURE_REPORT_ATTEMPTS
        const reportIntervalElapsed =
          lastRetryableFailureReportAt !== undefined &&
          currentTime - lastRetryableFailureReportAt >= RETRYABLE_FAILURE_REPORT_INTERVAL_MS

        if (reachedReportThreshold || reportIntervalElapsed) {
          captureException(error)
          lastRetryableFailureReportAt = currentTime
        }
      } else {
        consecutiveRetryableFailures = 0
        lastRetryableFailureReportAt = undefined
        captureException(error)
      }

      logError(error)
      await sleep(RETRY_DELAY_MS)
    }
  }
}

function isRetryableBootFailure(error: unknown) {
  if (isBootRaceFlyTokenError(error)) {
    return true
  }

  return (
    error instanceof ConnectError && error.code === Code.InvalidArgument && error.rawMessage === 'Missing instance ID'
  )
}

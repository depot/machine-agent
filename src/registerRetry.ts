import {Code, ConnectError} from '@connectrpc/connect'

const RETRY_DELAY_MS = 1_000
const REGISTER_REJECTION_REPORT_ATTEMPTS = 20
const REGISTER_REJECTION_REPORT_INTERVAL_MS = 5 * 60 * 1_000

interface RegisterRetryOptions {
  runLoop: () => Promise<void>
  captureException: (error: unknown) => void
  logError: (error: unknown) => void
  log?: (message: string) => void
  sleep: (milliseconds: number) => Promise<unknown>
  now?: () => number
}

export async function runRegisterLoopWithRetry({
  runLoop,
  captureException,
  logError,
  sleep,
  log = console.log,
  now = Date.now,
}: RegisterRetryOptions) {
  let consecutiveRegisterRejections = 0
  let lastRegisterRejectionReportAt: number | undefined

  while (true) {
    try {
      await runLoop()
      return
    } catch (error) {
      if (isRegisterStreamClosedByServer(error)) {
        consecutiveRegisterRejections = 0
        lastRegisterRejectionReportAt = undefined
        log('Connection closed by server')
        await sleep(RETRY_DELAY_MS)
        continue
      }

      if (isMissingInstanceID(error)) {
        consecutiveRegisterRejections++
        const currentTime = now()
        const reachedReportThreshold = consecutiveRegisterRejections === REGISTER_REJECTION_REPORT_ATTEMPTS
        const reportIntervalElapsed =
          lastRegisterRejectionReportAt !== undefined &&
          currentTime - lastRegisterRejectionReportAt >= REGISTER_REJECTION_REPORT_INTERVAL_MS

        if (reachedReportThreshold || reportIntervalElapsed) {
          captureException(error)
          lastRegisterRejectionReportAt = currentTime
        }
      } else {
        consecutiveRegisterRejections = 0
        lastRegisterRejectionReportAt = undefined
        captureException(error)
      }

      logError(error)
      await sleep(RETRY_DELAY_MS)
    }
  }
}

function isMissingInstanceID(error: unknown) {
  return (
    error instanceof ConnectError && error.code === Code.InvalidArgument && error.rawMessage === 'Missing instance ID'
  )
}

function isRegisterStreamClosedByServer(error: unknown) {
  return (
    error instanceof ConnectError &&
    error.code === Code.Canceled &&
    error.rawMessage.includes('http/2 stream closed with error code CANCEL')
  )
}

import {isAbortError} from 'abort-controller-x'
import {Agent, fetch} from 'undici'
import {sleep} from './common'

const MAX_ATTEMPTS = 10
const ATTEMPT_TIMEOUT_MS = 2000
const RETRY_DELAY_MS = 1000

export async function getFlyToken(): Promise<string> {
  const dispatcher = new Agent({
    connect: {
      socketPath: '/.fly/api',
    },
  })

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch('http://localhost/v1/tokens/oidc', {
        signal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS),
        method: 'POST',
        body: JSON.stringify({aud: 'https://depot.dev'}),
        headers: {'Content-Type': 'application/json'},
        dispatcher,
      })
      const data = await res.text()

      if (res.ok) {
        return data
      }

      if (attempt === MAX_ATTEMPTS) {
        throw new Error(`unable to get oidc token: ${res.statusText}`)
      }
    } catch (err) {
      if (isAbortError(err) || (err instanceof DOMException && err.name === 'TimeoutError')) {
        if (attempt === MAX_ATTEMPTS) {
          throw new Error(`fly OIDC token request timed out`)
        }
      } else {
        throw err
      }
    }

    await sleep(RETRY_DELAY_MS)
  }

  throw new Error('unable to get fly OIDC token')
}

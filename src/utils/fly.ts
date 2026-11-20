import {isAbortError, retry} from 'abort-controller-x'
import {Agent, fetch} from 'undici'

export const FLY_TOKEN_REQUEST_TIMEOUT_MS = 5_000

export class FlyTokenError extends Error {
  // status is undefined when the request timed out before a response arrived.
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
    this.name = 'FlyTokenError'
  }
}

// A timeout, a 404, and a 5xx are the answers the guest agent gives while it has
// not minted the machine identity yet. Any other status rejects the request.
export function isBootRaceFlyTokenError(error: unknown) {
  return error instanceof FlyTokenError && (error.status === undefined || error.status === 404 || error.status >= 500)
}

export async function getFlyToken(): Promise<string> {
  return waitForFlyMachineIdentity(requestFlyToken)
}

export function waitForFlyMachineIdentity(request: () => Promise<string>): Promise<string> {
  return retry(new AbortController().signal, request, {
    baseMs: 250,
    maxDelayMs: 2_000,
    maxAttempts: 5,
    onError: (error) => {
      if (!isBootRaceFlyTokenError(error)) throw error
    },
  })
}

async function requestFlyToken(): Promise<string> {
  try {
    const res = await fetch('http://localhost/v1/tokens/oidc', {
      signal: AbortSignal.timeout(FLY_TOKEN_REQUEST_TIMEOUT_MS),
      method: 'POST',
      body: JSON.stringify({aud: 'https://depot.dev'}),
      headers: {'Content-Type': 'application/json'},
      dispatcher: new Agent({
        connect: {
          socketPath: '/.fly/api',
        },
      }),
    })

    if (!res.ok) {
      throw new FlyTokenError(`unable to get oidc token: ${res.statusText}`, res.status)
    }

    const data = await res.text()
    return data
  } catch (err) {
    if (isAbortError(err)) {
      throw new FlyTokenError(`fly OIDC token request timed out`)
    } else {
      throw err
    }
  }
}

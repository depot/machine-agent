import {isAbortError} from 'abort-controller-x'
import {Agent, fetch} from 'undici'

export async function getFlyToken(): Promise<string> {
  try {
    const res = await fetch('http://localhost/v1/tokens/oidc', {
      signal: AbortSignal.timeout(1000),
      dispatcher: new Agent({
        connect: {
          socketPath: '/.fly/api',
        },
      }),
    })

    const data = await res.text()
    return data
  } catch (err) {
    if (isAbortError(err)) {
      throw new Error(`fly OIDC token request timed out`)
    } else {
      throw err
    }
  }
}

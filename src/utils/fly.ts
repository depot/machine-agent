import {isAbortError} from 'abort-controller-x'
import {Agent, fetch} from 'undici'

export async function getFlyToken(): Promise<string> {
  try {
    const res = await fetch('http://localhost/v1/tokens/oidc', {
      signal: AbortSignal.timeout(5000),
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
      throw new Error(`unable to get oidc token: ${res.statusText}`)
    }

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

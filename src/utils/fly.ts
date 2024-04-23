import {isAbortError} from 'abort-controller-x'
import {Agent, fetch} from 'undici'

export async function getFlyToken(): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 1000)

  try {
    const res = await fetch('http://localhost/v1/tokens/oidc', {
      signal: controller.signal,
      dispatcher: new Agent({
        connect: {
          socketPath: '/.fly/api',
        },
      }),
    })

    const data = await res.text()
    clearTimeout(timeout)
    return data
  } catch (err) {
    if (isAbortError(err)) {
      throw new Error(`fly OIDC token request timed out`)
    } else {
      throw err
    }
  }
}

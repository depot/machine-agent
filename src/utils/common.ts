import * as fsp from 'node:fs/promises'

export async function promises<T extends Record<string, any>>(promises: T): Promise<{[K in keyof T]: Awaited<T[K]>}> {
  const entries = Object.entries(promises)
  const values = await Promise.all(
    entries.map(([key, promise]) => Promise.resolve(promise).then((value) => [key, value])),
  )
  return Object.fromEntries(values) as {[K in keyof T]: Awaited<T[K]>}
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function assertNever(x: never): never {
  throw new Error('Unexpected value: ' + x)
}

export async function pathExists(path: string) {
  try {
    await fsp.access(path)
    return true
  } catch {
    return false
  }
}

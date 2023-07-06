import {sleep} from '../utils/common'
import {fstrim} from '../utils/mounts'

export interface TrimParams {
  buildkitStatus: {ready: boolean}
  signal: AbortSignal

  mounts: Mount[]
}

export interface Mount {
  path: string
}

export async function trimLoop({buildkitStatus, signal, mounts}: TrimParams) {
  // Wait for ready signal
  while (true) {
    if (signal.aborted) return

    await sleep(1000)
    if (buildkitStatus.ready) {
      break
    }
  }

  // Trim every 2 minutes
  const TRIM_INTERVAL = 2 * 60 * 1000
  let nextRunTime = Date.now() + TRIM_INTERVAL
  while (true) {
    if (signal.aborted) return

    await sleep(1000)
    if (Date.now() < nextRunTime) continue

    for (const {path} of mounts) {
      await fstrim(path)
    }

    nextRunTime = Date.now() + TRIM_INTERVAL
  }
}

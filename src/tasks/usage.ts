import {execa} from 'execa'
import {du} from '../utils/buildkit'
import {sleep} from '../utils/common'
import {client} from '../utils/grpc'

export interface ReportUsageParams {
  machineId: string
  signal: AbortSignal
  headers: HeadersInit
}

export interface Mount {
  device: string
  path: string
}

export async function reportUsage({machineId, signal, headers}: ReportUsageParams) {
  // Report every minute
  const REPORT_INTERVAL = 60 * 1000

  await waitForHealthy(signal)

  let nextRunTime = Date.now() + REPORT_INTERVAL
  while (true) {
    if (signal.aborted) return
    await sleep(1000)
    if (signal.aborted) return

    if (Date.now() < nextRunTime) continue

    try {
      const buildkitDuJson = await du()
      if (buildkitDuJson) {
        await client.usage({machineId, cache: {buildkitDuJson}}, {headers, signal})
      }
    } catch (error) {
      console.log('Error reporting usage:', error)
    }

    nextRunTime = Date.now() + REPORT_INTERVAL
  }
}

export async function waitForHealthy(signal: AbortSignal) {
  let isHealthy = await healthy()
  while (!signal.aborted && !isHealthy) {
    await sleep(1000)
    isHealthy = await healthy()
  }
}

async function healthy(): Promise<boolean> {
  try {
    const res = await execa(
      'buildctl',
      [
        '--tlsservername',
        'localhost',
        '--tlscert',
        '/etc/buildkit/tls.crt',
        '--tlskey',
        '/etc/buildkit/tls.key',
        '--tlscacert',
        '/etc/buildkit/tlsca.crt',
        '--timeout',
        '1',
        '--addr',
        'tcp://localhost:443',
        'health',
      ],
      {reject: false},
    )
    if (res.exitCode !== 0) return false
    const health = res.stdout.trim()
    return health === 'SERVING'
  } catch (err) {
    console.log('Error getting buildkitd health', err)
    return false
  }
}

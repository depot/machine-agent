import {execa} from 'execa'
import {sleep} from '../utils/common'
import {stats} from '../utils/disk'
import {client} from '../utils/grpc'

export interface ReportHealthParams {
  machineId: string
  signal: AbortSignal
  headers: HeadersInit
  path: string
}

export async function reportEngineHealth({machineId, signal, headers, path}: ReportHealthParams) {
  while (true) {
    if (signal.aborted) return

    await waitForWorkers(signal)

    try {
      while (true) {
        if (signal.aborted) return

        const disk_stats = await stats(path)
        const disk_space = disk_stats
          ? [
              {
                path,
                freeMb: disk_stats.freeMb,
                totalMb: disk_stats.totalMb,
                freeInodes: disk_stats.freeInodes,
                totalInodes: disk_stats.totalInodes,
              },
            ]
          : undefined

        await client.pingMachineHealth({machineId, disks: disk_space}, {headers, signal})
        await sleep(1000)
      }
    } catch (error) {
      console.log('Error reporting health:', error)
    }
    await sleep(1000)
  }
}

export async function waitForWorkers(signal: AbortSignal) {
  let workers: EngineWorker[] = await listEngineWorkers()
  while (!signal.aborted && workers.length === 0) {
    console.log('Waiting for engine workers to start')
    await sleep(250)
    workers = await listEngineWorkers()
  }
}

interface EngineWorker {
  id: string
  labels: Record<string, string>
  platforms: {architecture: string; os: string; variant?: string}[]
  gcPolicy: {
    filter: string[] | null
    all: boolean
    keepDuration: number
    keepBytes: number
  }[]
  buildkitVersion: {
    package: string
    version: string
    revision: string
  }
}

async function listEngineWorkers(): Promise<EngineWorker[]> {
  try {
    const res = await execa(
      'buildctl',
      [
        '--tlsservername',
        'localhost',
        '--tlscert',
        '/etc/engine/tls.crt',
        '--tlskey',
        '/etc/engine/tls.key',
        '--tlscacert',
        '/etc/engine/tlsca.crt',
        '--timeout',
        '1',
        '--addr',
        'tcp://localhost:443',
        'debug',
        'workers',
        '--format',
        '{{json .}}',
      ],
      {reject: false},
    )
    if (res.exitCode !== 0) return []
    const workers = JSON.parse(res.stdout)
    return workers
  } catch (err) {
    console.log('Error listing engine workers', err)
    return []
  }
}

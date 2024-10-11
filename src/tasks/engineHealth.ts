import {PlainMessage} from '@bufbuild/protobuf'
import {execa} from 'execa'
import {DiskSpace} from '../gen/ts/depot/cloud/v3/machine_pb'
import {sleep} from '../utils/common'
import {stats} from '../utils/disk'
import {client} from '../utils/grpc'

export interface ReportHealthParams {
  signal: AbortSignal
  headers: HeadersInit
  path: string
}

export async function reportEngineHealth({signal, headers, path}: ReportHealthParams) {
  while (!signal.aborted) {
    await waitForWorkers(signal)

    try {
      async function* stream() {
        while (!signal.aborted) {
          const diskStats = await stats(path)
          if (diskStats) {
            const diskSpace: PlainMessage<DiskSpace> = {
              path,
              freeMb: diskStats.freeMb,
              totalMb: diskStats.totalMb,
              freeInodes: diskStats.freeInodes,
              totalInodes: diskStats.totalInodes,
            }
            yield {disks: [diskSpace]}
          }
          await sleep(1000)
        }
      }

      const res = await client.reportMachineHealth(stream(), {headers, signal})
      if (res.shouldTerminate) return
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

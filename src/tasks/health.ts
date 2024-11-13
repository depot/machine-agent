import {PlainMessage} from '@bufbuild/protobuf'
import {isAbortError} from 'abort-controller-x'
import {execa} from 'execa'
import {DiskSpace} from '../gen/ts/depot/cloud/v3/machine_pb'
import {sleep} from '../utils/common'
import {stats} from '../utils/disk'
import {client} from '../utils/grpc'

export interface ReportHealthParams {
  controller: AbortController
  headers: HeadersInit
  path: string
}

export async function reportHealth({controller, headers, path}: ReportHealthParams) {
  const signal = controller.signal
  while (!signal.aborted) {
    await waitForBuildKitWorkers(signal)

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
      if (res.shouldTerminate) {
        console.log('shutdown requested')
        controller.abort()
        return
      }
    } catch (error) {
      if (!isAbortError(error)) {
        console.log('Error reporting health:', error)
      }
    }
    await sleep(1000)
  }
}

export async function waitForBuildKitWorkers(signal: AbortSignal) {
  let workers: BuildKitWorker[] = await listBuildKitWorkers()
  while (!signal.aborted && workers.length === 0) {
    console.log('Waiting for BuildKit workers to start')
    await sleep(250)
    workers = await listBuildKitWorkers()
  }
}

interface BuildKitWorker {
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

async function listBuildKitWorkers(): Promise<BuildKitWorker[]> {
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
    console.log('Error listing BuildKit workers', err)
    return []
  }
}

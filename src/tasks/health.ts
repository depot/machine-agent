import {execa} from 'execa'
import {Metadata} from 'nice-grpc-common'
import {DiskSpace} from '../gen/depot/cloud/v2/machine'
import {promises, sleep} from '../utils/common'
import {DiskStats, stats} from '../utils/disk'
import {client} from '../utils/grpc'

export interface ReportHealthParams {
  machineId: string
  signal: AbortSignal
  metadata: Metadata
  paths: string[]
}

export async function reportHealth({machineId, signal, metadata, paths}: ReportHealthParams) {
  async function* pingHealth() {
    while (true) {
      if (signal.aborted) return
      await sleep(1000)

      const disk_stats = await promises(paths.map(stats))

      const disks: DiskSpace[] = disk_stats
        .filter((item: DiskStats | undefined): item is DiskStats => {
          return item !== undefined
        })
        .map(({path, freeMb, totalMb, freeInodes, totalInodes}) => {
          return {
            path,
            freeMb,
            totalMb,
            freeInodes,
            totalInodes,
          }
        })

      yield {machineId, disks}
    }
  }

  while (true) {
    if (signal.aborted) return

    let workers: BuildKitWorker[] = await listBuildKitWorkers()
    while (workers.length === 0) {
      console.log('Waiting for BuildKit workers to start')
      await sleep(250)
      workers = await listBuildKitWorkers()
    }

    try {
      await client.pingMachineHealth(pingHealth(), {metadata, signal})
    } catch (error) {
      console.log('Error reporting health:', error)
    }
    await sleep(1000)
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

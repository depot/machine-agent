import {PlainMessage} from '@bufbuild/protobuf'
import {execa} from 'execa'
import {DiskSpace} from '../gen/ts/depot/cloud/v3/machine_pb'
import {sleep} from '../utils/common'
import {DiskStats, stats} from '../utils/disk'
import {client} from '../utils/grpc'

export interface ReportHealthParams {
  buildkitStatus: {ready: boolean}
  machineId: string
  signal: AbortSignal
  headers: HeadersInit
  mounts: Mount[]
}

export interface Mount {
  device: string
  path: string
}

export async function reportHealth({buildkitStatus, machineId, signal, headers, mounts}: ReportHealthParams) {
  while (true) {
    if (signal.aborted) return

    // Wait for ready signal
    if (!buildkitStatus.ready && !signal.aborted) {
      await sleep(100)
      continue
    }

    await waitForBuildKitWorkers(signal)

    try {
      while (true) {
        if (signal.aborted) return

        const disk_stats = await Promise.all(mounts.map(({device, path}) => stats(device, path)))
        const disks: PlainMessage<DiskSpace>[] = disk_stats
          .filter((item: DiskStats | undefined): item is DiskStats => {
            return item !== undefined
          })
          .map(({device, path, freeMb, totalMb, freeInodes, totalInodes}) => {
            return {
              device,
              path,
              freeMb,
              totalMb,
              freeInodes,
              totalInodes,
            }
          })

        await client.pingMachineHealth({machineId, disks}, {headers, signal})
        await sleep(1000)
      }
    } catch (error) {
      console.log('Error reporting health:', error)
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

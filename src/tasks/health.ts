import {execa} from 'execa'
import {Metadata} from 'nice-grpc-common'
import {sleep} from '../utils/common'
import {client} from '../utils/grpc'

export interface ReportHealthParams {
  machineId: string
  signal: AbortSignal
  metadata: Metadata
}

export async function reportHealth({machineId, signal, metadata}: ReportHealthParams) {
  async function* pingHealth() {
    while (true) {
      if (signal.aborted) return
      await sleep(1000)
      yield {machineId}
    }
  }

  while (true) {
    if (signal.aborted) return

    let workers: BuildKitWorker[] = await listBuildKitWorkers(machineId)
    while (workers.length === 0) {
      console.log('Waiting for BuildKit workers to start')
      await sleep(250)
      workers = await listBuildKitWorkers(machineId)
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

async function listBuildKitWorkers(machineID: string): Promise<BuildKitWorker[]> {
  try {
    const res = await execa(
      'buildctl',
      [
        '--tlsservername',
        machineID,
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

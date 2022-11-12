import {Metadata} from 'nice-grpc-common'
import {sleep} from './common'
import {client} from './grpc'

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

    try {
      await client.pingMachineHealth(pingHealth(), {metadata, signal})
    } catch (error) {
      console.log('Error reporting health:', error)
    }
    await sleep(1000)
  }
}

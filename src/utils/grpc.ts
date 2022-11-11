import {createChannel, createClient, Metadata} from 'nice-grpc'
import {MachineServiceClient, MachineServiceDefinition} from '../gen/depot/cloud/v2/machine'
import {DEPOT_CLOUD_API_HOST, DEPOT_MACHINE_AGENT_VERSION} from './env'

const channel = createChannel(DEPOT_CLOUD_API_HOST)

export const client: MachineServiceClient = createClient(MachineServiceDefinition, channel, {
  '*': {
    metadata: Metadata({
      // Authorization: `Bearer ${CLOUD_AGENT_CONNECTION_TOKEN}`,
      'User-Agent': `machine-agent/${DEPOT_MACHINE_AGENT_VERSION}`,
    }),
  },
})

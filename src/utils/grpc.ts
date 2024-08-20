import {createPromiseClient, Interceptor} from '@connectrpc/connect'
import {createConnectTransport} from '@connectrpc/connect-node'
import {MachineService} from '../gen/ts/depot/cloud/v3/machine_connect'
import {DEPOT_CLOUD_API_HOST, DEPOT_MACHINE_AGENT_VERSION} from './env'

const userAgentInterceptor: Interceptor = (next) => async (req) => {
  req.header.set('User-Agent', `machine-agent/${DEPOT_MACHINE_AGENT_VERSION}`)
  return await next(req)
}

const transport = createConnectTransport({
  httpVersion: '2',
  baseUrl: DEPOT_CLOUD_API_HOST,
  interceptors: [userAgentInterceptor],
  pingIntervalMs: 1000 * 60, // 1 minute
  idleConnectionTimeoutMs: 1000 * 60 * 10, // 10 minutes
})

export const client = createPromiseClient(MachineService, transport)

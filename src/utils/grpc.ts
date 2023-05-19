import {createPromiseClient, Interceptor} from '@bufbuild/connect'
import {createConnectTransport} from '@bufbuild/connect-node'
import {MachineService} from '../gen/ts/depot/cloud/v2/machine_connect'
import {DEPOT_CLOUD_API_HOST, DEPOT_MACHINE_AGENT_VERSION} from './env'

const userAgentInterceptor: Interceptor = (next) => async (req) => {
  req.header.set('User-Agent', `machine-agent/${DEPOT_MACHINE_AGENT_VERSION}`)
  return await next(req)
}

const transport = createConnectTransport({
  httpVersion: '2',
  baseUrl: DEPOT_CLOUD_API_HOST,
  interceptors: [userAgentInterceptor],
})

export const client = createPromiseClient(MachineService, transport)

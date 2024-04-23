// DEPOT_CLOUD defines the cloud provider. It defaults to 'aws' but can be 'fly'.
export const DEPOT_CLOUD = process.env.DEPOT_CLOUD ?? 'aws'

export const DEPOT_CLOUD_CONNECTION_ID = process.env.DEPOT_CLOUD_CONNECTION_ID ?? ''
export const DEPOT_MACHINE_AGENT_VERSION = process.env.DEPOT_MACHINE_AGENT_VERSION ?? 'dev'
export const DEPOT_CLOUD_API_HOST = process.env.DEPOT_CLOUD_API_HOST ?? 'https://api.depot.dev'

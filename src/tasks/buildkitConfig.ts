import {RegisterMachineResponse_BuildKitTask} from '../gen/ts/depot/cloud/v3/machine_pb'

export function buildkitConfig(
  rootDir: string,
  task: Pick<
    RegisterMachineResponse_BuildKitTask,
    'cacheSize' | 'maxParallelism' | 'enableCni' | 'additionalBuildkitdConfig' | 'cacheKeepDays'
  >,
) {
  const cacheSizeBytes = task.cacheSize * 1000000000
  const maxParallelism = task.maxParallelism > 0 ? task.maxParallelism : 12
  const cacheKeepDays = task.cacheKeepDays && task.cacheKeepDays > 0 ? task.cacheKeepDays : 14

  return `
root = "${rootDir}"

[grpc]
address = ["tcp://0.0.0.0:443", "unix:///run/buildkit/buildkitd.sock"]

[grpc.tls]
cert = "/etc/buildkit/tls.crt"
key = "/etc/buildkit/tls.key"
ca = "/etc/buildkit/tlsca.crt"

[worker.oci]
enabled = true
gc = true
gckeepstorage = ${cacheSizeBytes}
max-parallelism = ${maxParallelism}
snapshotter = "stargz"
${task.enableCni ? 'cniConfigPath = "/etc/buildkit/cni.conflist"' : ''}

[worker.oci.stargzSnapshotter]
no_background_fetch = true
noprefetch = true
no_prometheus = true
max_concurrency = 16

[worker.oci.stargzSnapshotter.blob]
chunk_size = 50000000 # 50 MB

[worker.containerd]
enabled = false

# [[worker.oci.gcpolicy]]
# keepBytes = 10240000000 # 10 GB
# keepDuration = 604800 # 7 days: 3600 * 24 * 7
# filters = [
#   "type==source.local",
#   "type==exec.cachemount",
#   "type==source.git.checkout",
# ]

[[worker.oci.gcpolicy]]
all = true
keepDuration = ${cacheKeepDays * 24 * 60 * 60}

[[worker.oci.gcpolicy]]
all = true
keepBytes = ${cacheSizeBytes}

${task.additionalBuildkitdConfig || ''}
`
}

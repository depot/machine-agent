import {execa} from 'execa'
import * as fsp from 'node:fs/promises'
import {sleep} from '../utils/common'
import {fstrim} from '../utils/mounts'

// Creates the ceph.conf and ceph.client.keyring files.
export async function writeCephConf(clientName: string, cephConf: string, key: string) {
  await fsp.mkdir('/etc/ceph', {recursive: true})
  await fsp.chmod('/etc/ceph', 0o700)
  await fsp.writeFile('/etc/ceph/ceph.conf', cephConf)

  const keyringPath = `/etc/ceph/ceph.${clientName}.keyring`
  const keyring = `[${clientName}]
    key = ${key}
`
  await fsp.writeFile(keyringPath, keyring)
  await fsp.chmod(keyringPath, 0o600)
}

// Connects to ceph cluster and maps the RBD to a block device locally.
export async function mapBlockDevice(volumeName: string, clientName: string) {
  const imageSpec = `rbd/${volumeName}/${volumeName}`
  const keyringPath = `/etc/ceph/ceph.${clientName}.keyring`
  await execa('rbd', ['map', imageSpec, '--name', clientName, '--keyring', keyringPath], {stdio: 'inherit'})
}

export interface TrimParams {
  buildkitStatus: {ready: boolean}
  signal: AbortSignal

  mounts: Mount[]
}

export interface Mount {
  path: string
}

export async function trimLoop({buildkitStatus, signal, mounts}: TrimParams) {
  // Wait for ready signal
  while (true) {
    if (signal.aborted) return

    await sleep(1000)
    if (buildkitStatus.ready) {
      break
    }
  }

  // Trim every 5 minutes
  const TRIM_INTERVAL = 5 * 60 * 1000
  let nextRunTime = Date.now() + TRIM_INTERVAL
  while (true) {
    if (signal.aborted) return

    await sleep(1000)
    if (Date.now() < nextRunTime) continue

    for (const {path} of mounts) {
      await fstrim(path)
    }

    nextRunTime = Date.now() + TRIM_INTERVAL
  }
}

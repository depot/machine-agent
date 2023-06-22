import {execa} from 'execa'
import * as fsp from 'node:fs/promises'

// Creates the ceph.conf and ceph.client.keyring files.
export async function setupCeph(clientName: string, cephConf: string, key: string) {
  await fsp.mkdir('/etc/ceph', {recursive: true})
  await fsp.chmod('/etc/ceph', 0o700)
  await fsp.writeFile('/etc/ceph/ceph.conf', cephConf)

  const keyringPath = `/etc/ceph/ceph.${clientName}.keyring`
  const keyring = `[${clientName}]
    key = ${key}`
  await fsp.writeFile(keyringPath, keyring)
  await fsp.chmod(keyringPath, 0o600)
}

// Returns the device of the attached block device.
export async function mapBlockDevice(volumeName: string, clientName: string): Promise<string> {
  const imageSpec = `rbd/${volumeName}/${volumeName}`
  const keyringPath = `/etc/ceph/ceph.${clientName}.keyring`
  const {stdout: device} = await execa('rbd', ['map', imageSpec, '--name', clientName, '--keyring', keyringPath])
  return device
}

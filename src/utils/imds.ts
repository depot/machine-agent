import {fetch} from 'undici'

export async function getInstanceIdentityDocument() {
  const token = await getToken()
  const data = await getMetadata('latest/dynamic/instance-identity/document', token)
  return data
}

export async function getPKCS7Signature() {
  const token = await getToken()
  const data = await getMetadata('latest/dynamic/instance-identity/pkcs7', token)
  return data
}

export async function getBase64Signature() {
  const token = await getToken()
  const data = await getMetadata('latest/dynamic/instance-identity/signature', token)
  return data
}

export async function getRSA2048Signature() {
  const token = await getToken()
  const data = await getMetadata('latest/dynamic/instance-identity/rsa2048', token)
  return data
}

async function getToken(ttlSeconds: number = 21600) {
  const res = await fetch('http://169.254.169.254/latest/api/token', {
    method: 'PUT',
    headers: {'X-aws-ec2-metadata-token-ttl-seconds': ttlSeconds.toString()},
  })
  const token = await res.text()
  return token
}

async function getMetadata(path: string, token: string) {
  const res = await fetch(`http://169.254.169.254/${path}`, {
    headers: {'X-aws-ec2-metadata-token': token},
  })
  const data = await res.text()
  return data
}

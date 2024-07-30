import {execa} from 'execa'

export async function du(): Promise<string | undefined> {
  const {exitCode, stdout, stderr} = await execa(
    '/usr/bin/buildctl',
    [
      '--tlsservername',
      'localhost',
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
      'du',
      '--verbose',
      '--format',
      '{{json .}}',
    ],
    {
      stdout: 'pipe',
      stderr: 'inherit',
      stdin: 'inherit',
    },
  )
  if (exitCode !== 0) {
    console.error('Unable to get disk usage', stderr)
    return undefined
  }
  return stdout
}

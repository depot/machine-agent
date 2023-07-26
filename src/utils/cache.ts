import {execa} from 'execa'

export async function du(): Promise<string | undefined> {
  const {exitCode, stdout} = await execa('/usr/bin/buildctl', ['du', '--verbose', '--format', '{{json .}}'], {
    stdout: 'pipe',
    stderr: 'inherit',
    stdin: 'inherit',
  })
  return exitCode == 0 ? stdout : undefined
}

import {execa} from 'execa'

export async function du(): Promise<string | undefined> {
  const {exitCode, stdout} = await execa('/usr/bin/buildctl', ['du', '--verbose', `--format '{{json .}}'`], {
    stdio: 'inherit',
  })
  return exitCode == 0 ? stdout : undefined
}

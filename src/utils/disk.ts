import {execa} from 'execa'

export async function availableMegabytes(path: string) {
  try {
    const {exitCode, stdout} = await execa('stat', ['-f', '-c', '%a %S', path])
    if (exitCode == 0) {
      const output = stdout as string
      const [freeBlocks, blockSize] = output.split(' ')
      return Number((BigInt(freeBlocks) * BigInt(blockSize)) / BigInt(1024) / BigInt(1024))
    }
  } catch (e) {
    console.log(e)
  }
}

import {execa} from 'execa'

export interface DiskStats {
  device: string
  path: string
  freeMb: bigint
  totalMb: bigint
  freeInodes: bigint
  totalInodes: bigint
}

export async function stats(device: string, path: string): Promise<DiskStats | undefined> {
  try {
    const {exitCode, stdout} = await execa('stat', ['-f', '-c', '%S %a %b %d %c', path])
    if (exitCode == 0) {
      const output = stdout as string
      const [blockSize, freeBlocks, totalBlocks, freeInodes, totalInodes] = output.split(' ')
      const diskStats = {
        device,
        path,
        freeMb: (BigInt(blockSize) * BigInt(freeBlocks)) / BigInt(1024) / BigInt(1024),
        totalMb: (BigInt(blockSize) * BigInt(totalBlocks)) / BigInt(1024) / BigInt(1024),
        freeInodes: BigInt(freeInodes),
        totalInodes: BigInt(totalInodes),
      }
      return diskStats
    }
  } catch (e) {
    console.log(e)
  }
}

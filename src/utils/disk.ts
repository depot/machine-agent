import {execa} from 'execa'

export interface DiskStats {
  device: string
  path: string
  freeMb: number
  totalMb: number
  freeInodes: number
  totalInodes: number
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
        freeMb: Number((BigInt(blockSize) * BigInt(freeBlocks)) / BigInt(1024) / BigInt(1024)),
        totalMb: Number((BigInt(blockSize) * BigInt(totalBlocks)) / BigInt(1024) / BigInt(1024)),
        freeInodes: Number(freeInodes),
        totalInodes: Number(totalInodes),
      }
      return diskStats
    }
  } catch (e) {
    console.log(e)
  }
}

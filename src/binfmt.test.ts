import {strict as assert} from 'node:assert'
import * as fsp from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'
import {test} from 'node:test'
import {binfmtRegisterLine, findEmulators} from './utils/binfmt'

test('builds the binfmt_misc register line for qemu-aarch64', () => {
  assert.equal(
    binfmtRegisterLine('qemu-aarch64', '/usr/bin/buildkit-qemu-aarch64'),
    ':qemu-aarch64:M::' +
      '\\x7f\\x45\\x4c\\x46\\x02\\x01\\x01\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x02\\x00\\xb7\\x00:' +
      '\\xff\\xff\\xff\\xff\\xff\\xff\\xff\\x00\\xff\\xff\\xff\\xff\\xff\\xff\\xff\\xff\\xfe\\xff\\xff\\xff:' +
      '/usr/bin/buildkit-qemu-aarch64:POCF',
  )
})

test('rejects an unknown emulator', () => {
  assert.throws(() => binfmtRegisterLine('qemu-mips64', '/usr/bin/qemu-mips64'))
})

test('finds buildkit-qemu-* binaries, prefers qemu-*, and skips native architectures', async () => {
  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), 'binfmt-test-'))
  try {
    for (const file of [
      'buildkit-qemu-aarch64',
      'buildkit-qemu-arm',
      'qemu-arm',
      'buildkit-qemu-i386',
      'buildkit-qemu-mips64',
      'buildkitd',
    ]) {
      await fsp.writeFile(path.join(dir, file), '')
    }

    const x64 = await findEmulators(dir, 'x64')
    assert.deepEqual(Object.fromEntries(x64), {
      'qemu-aarch64': path.join(dir, 'buildkit-qemu-aarch64'),
      'qemu-arm': path.join(dir, 'qemu-arm'),
    })

    const arm64 = await findEmulators(dir, 'arm64')
    assert.deepEqual(Object.fromEntries(arm64), {
      'qemu-arm': path.join(dir, 'qemu-arm'),
      'qemu-i386': path.join(dir, 'buildkit-qemu-i386'),
    })
  } finally {
    await fsp.rm(dir, {recursive: true, force: true})
  }
})

test('finds no emulators in a missing directory', async () => {
  assert.equal((await findEmulators('/nonexistent-binfmt-test-dir', 'x64')).size, 0)
})

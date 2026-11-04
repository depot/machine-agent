import {execa} from 'execa'
import * as fsp from 'node:fs/promises'
import * as path from 'node:path'

const binfmtMount = '/proc/sys/fs/binfmt_misc'
const emulatorsDirectory = '/usr/bin'
const emulatorFlags = 'POCF'

interface EmulatorRegistration {
  magic: string
  mask: string
}

// Magic and mask bytes match depot/container-builder guest/binfmt.go and tonistiigi/binfmt.
export const emulatorRegistrations: Record<string, EmulatorRegistration> = {
  'qemu-aarch64': {
    magic: '\x7fELF\x02\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\xb7\x00',
    mask: '\xff\xff\xff\xff\xff\xff\xff\x00\xff\xff\xff\xff\xff\xff\xff\xff\xfe\xff\xff\xff',
  },
  'qemu-arm': {
    magic: '\x7fELF\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x28\x00',
    mask: '\xff\xff\xff\xff\xff\xff\xff\x00\xff\xff\xff\xff\xff\xff\xff\xff\xfe\xff\xff\xff',
  },
  'qemu-ppc64le': {
    magic: '\x7fELF\x02\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x15\x00',
    mask: '\xff\xff\xff\xff\xff\xff\xff\xfc\x00\xff\xff\xff\xff\xff\xff\xff\xfe\xff\xff\x00',
  },
  'qemu-s390x': {
    magic: '\x7fELF\x02\x02\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x16',
    mask: '\xff\xff\xff\xff\xff\xff\xff\xfc\x00\xff\xff\xff\xff\xff\xff\xff\xff\xfe\xff\xff',
  },
  'qemu-riscv64': {
    magic: '\x7fELF\x02\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\xf3\x00',
    mask: '\xff\xff\xff\xff\xff\xff\xff\x00\xff\xff\xff\xff\xff\xff\xff\xff\xfe\xff\xff\xff',
  },
  'qemu-i386': {
    magic: '\x7fELF\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x00\x02\x00\x03\x00',
    mask: '\xff\xff\xff\xff\xff\xfe\xfe\x00\xff\xff\xff\xff\xff\xff\xff\xff\xfe\xff\xff\xff',
  },
}

// Emulators for architectures the host already executes natively.
const nativeEmulators: Partial<Record<NodeJS.Architecture, string[]>> = {
  x64: ['qemu-i386'],
  arm64: ['qemu-aarch64'],
}

function escapeBinfmtBytes(value: string): string {
  let escaped = ''
  for (let i = 0; i < value.length; i++) {
    escaped += `\\x${value.charCodeAt(i).toString(16).padStart(2, '0')}`
  }
  return escaped
}

export function binfmtRegisterLine(name: string, binary: string): string {
  const registration = emulatorRegistrations[name]
  if (!registration) throw new Error(`Unknown emulator ${name}`)
  const magic = escapeBinfmtBytes(registration.magic)
  const mask = escapeBinfmtBytes(registration.mask)
  return `:${name}:M::${magic}:${mask}:${binary}:${emulatorFlags}`
}

// Resolves the emulator binary for each known emulator name. The depot/buildkit release tarball
// ships them as `buildkit-qemu-*`; a plain `qemu-*` binary takes precedence when present.
export async function findEmulators(
  directory = emulatorsDirectory,
  arch: NodeJS.Architecture = process.arch,
): Promise<Map<string, string>> {
  const entries = new Set(await fsp.readdir(directory).catch(() => [] as string[]))
  const skip = nativeEmulators[arch] ?? []
  const emulators = new Map<string, string>()
  for (const name of Object.keys(emulatorRegistrations)) {
    if (skip.includes(name)) continue
    const file = [name, `buildkit-${name}`].find((candidate) => entries.has(candidate))
    if (file) emulators.set(name, path.join(directory, file))
  }
  return emulators
}

function errorCode(error: unknown): string | undefined {
  return error instanceof Error ? (error as NodeJS.ErrnoException).code : undefined
}

async function ensureBinfmtMounted() {
  const register = path.join(binfmtMount, 'register')
  try {
    await fsp.access(register)
    return
  } catch {}
  const result = await execa('mount', ['-t', 'binfmt_misc', 'binfmt_misc', binfmtMount], {reject: false})
  try {
    await fsp.access(register)
  } catch {
    throw new Error(`mount ${binfmtMount}: ${result.stderr || `exit code ${result.exitCode}`}`)
  }
}

// Registers the QEMU emulators in binfmt_misc and returns the names that are registered.
// Returns an empty list when no emulator binary is present.
export async function registerQemuEmulators(): Promise<string[]> {
  const emulators = await findEmulators()
  if (emulators.size === 0) return []

  await ensureBinfmtMounted()

  const registered: string[] = []
  for (const [name, binary] of emulators) {
    try {
      await fsp.writeFile(path.join(binfmtMount, 'register'), binfmtRegisterLine(name, binary))
    } catch (error) {
      const code = errorCode(error)
      if (code !== 'EEXIST' && code !== 'EBUSY') {
        throw new Error(`register ${name}: ${error instanceof Error ? error.message : error}`)
      }
    }
    registered.push(name)
  }
  return registered
}

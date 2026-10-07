import {strict as assert} from 'node:assert'
import {test} from 'node:test'
import {RegisterMachineResponse_BuildKitTask} from '../gen/ts/depot/cloud/v3/machine_pb'
import {buildkitConfig} from './buildkitConfig'

for (const {name, keepDays, wantDuration} of [
  {name: 'older API without retention', keepDays: undefined, wantDuration: 1209600},
  {name: 'zero retention', keepDays: 0, wantDuration: 1209600},
  {name: 'negative retention', keepDays: -1, wantDuration: 1209600},
  {name: 'seven days', keepDays: 7, wantDuration: 604800},
  {name: 'fourteen days', keepDays: 14, wantDuration: 1209600},
  {name: 'thirty days', keepDays: 30, wantDuration: 2592000},
]) {
  test(`uses ${name} after decoding the builder task`, () => {
    const sent = new RegisterMachineResponse_BuildKitTask({cacheSize: 100, maxParallelism: 4, cacheKeepDays: keepDays})
    const task = RegisterMachineResponse_BuildKitTask.fromBinary(sent.toBinary())
    const config = buildkitConfig('/var/lib/buildkit', task)

    assert.match(config, new RegExp(`^keepDuration = ${wantDuration}$`, 'm'))
    assert.match(config, /^keepBytes = 100000000000$/m)
  })
}

test('preserves startup defaults, CNI and additional configuration', () => {
  const config = buildkitConfig(
    '/b',
    new RegisterMachineResponse_BuildKitTask({
      cacheSize: 100,
      enableCni: true,
      cacheKeepDays: 7,
      additionalBuildkitdConfig: '[registry."example.com"]\nhttp = true',
    }),
  )

  assert.match(config, /^root = "\/b"$/m)
  assert.match(config, /^max-parallelism = 12$/m)
  assert.match(config, /^cniConfigPath = "\/etc\/buildkit\/cni.conflist"$/m)
  assert.ok(config.includes('[registry."example.com"]\nhttp = true'))
})

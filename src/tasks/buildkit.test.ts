import {BinaryWriter, WireType} from '@bufbuild/protobuf'
import {execa} from 'execa'
import {strict as assert} from 'node:assert'
import {test} from 'node:test'
import {RegisterMachineResponse, RegisterMachineResponse_BuildKitTask} from '../gen/ts/depot/cloud/v3/machine_pb'
import {buildkitEnv} from './buildkit'

const message = new RegisterMachineResponse({machineId: 'machine-1', token: 'test-token'})
const oomFlag = 'DEPOT_BUILDKIT_PREFER_BUILD_STEP_OOM_KILL'

test('decodes the API environment map at protobuf field 32', () => {
  const bytes = new BinaryWriter()
    .tag(32, WireType.LengthDelimited)
    .fork()
    .tag(1, WireType.LengthDelimited)
    .string(oomFlag)
    .tag(2, WireType.LengthDelimited)
    .string('1')
    .join()
    .finish()
  const task = RegisterMachineResponse_BuildKitTask.fromBinary(bytes)

  assert.deepEqual(task.buildkitEnv, {[oomFlag]: '1'})
  assert.equal(buildkitEnv(message, task)[oomFlag], '1')
})

test('decodes the environment map from a registration JSON response', () => {
  const response = RegisterMachineResponse.fromJson({
    machineId: 'machine-1',
    token: 'test-token',
    buildkit: {buildkitEnv: {[oomFlag]: '1'}},
  })

  assert.equal(response.task.case, 'buildkit')
  if (response.task.case !== 'buildkit') assert.fail('expected BuildKit task')
  assert.equal(buildkitEnv(response, response.task.value)[oomFlag], '1')
})

test('absent and empty maps preserve the current environment', () => {
  const expected = {
    BUILDKIT_STEP_LOG_MAX_SIZE: '52428800',
    DEPOT_KEEPALIVE_SERVER_POLICY_PERMIT_WITHOUT_STREAM: 'true',
    DEPOT_KEEPALIVE_SERVER_POLICY_MINTIME_MS: '120000',
    DEPOT_BUILDKIT_TOKEN: 'test-token',
  }

  for (const json of ['{}', '{"buildkitEnv":{}}']) {
    const env = buildkitEnv(message, RegisterMachineResponse_BuildKitTask.fromJsonString(json))
    assert.equal(env[oomFlag], undefined)
    assert.deepEqual(env, expected)
  }
})

test('API values override defaults and legacy task settings without changing the task', () => {
  const task = new RegisterMachineResponse_BuildKitTask({
    traceEndpoint: 'https://old-traces.example.com',
    enableSqliteMetadata: true,
    buildkitEnv: {
      [oomFlag]: '1',
      BUILDKIT_STEP_LOG_MAX_SIZE: '1024',
      OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: 'https://new-traces.example.com',
      DEPOT_SQLITE_METADATA: '0',
    },
  })
  const before = task.toJson()
  const env = buildkitEnv(message, task)

  for (const [key, value] of Object.entries(task.buildkitEnv)) assert.equal(env[key], value)
  assert.equal(env.DEPOT_BUILDKIT_TOKEN, 'test-token')
  assert.equal(env.OTEL_EXPORTER_OTLP_HEADERS, 'Authorization=Bearer%20test-token')
  assert.deepEqual(task.toJson(), before)
})

test('spawned processes receive the OOM flag over an inherited value and keep unrelated inherited variables', async () => {
  const previous = process.env[oomFlag]
  process.env[oomFlag] = '0'
  try {
    const task = new RegisterMachineResponse_BuildKitTask({buildkitEnv: {[oomFlag]: '1'}})
    const result = await execa(
      process.execPath,
      [
        '-e',
        'console.log(JSON.stringify({oom: process.env.DEPOT_BUILDKIT_PREFER_BUILD_STEP_OOM_KILL, path: process.env.PATH}))',
      ],
      {env: buildkitEnv(message, task)},
    )
    assert.deepEqual(JSON.parse(result.stdout), {oom: '1', path: process.env.PATH})
  } finally {
    if (previous === undefined) delete process.env[oomFlag]
    else process.env[oomFlag] = previous
  }
})

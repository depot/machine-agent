/* eslint-disable */
import type {CallContext, CallOptions} from 'nice-grpc-common'
import _m0 from 'protobufjs/minimal'

export const protobufPackage = 'depot.cloud.v2'

export interface RegisterMachineRequest {
  connectionId: string
  cloud?: {$case: 'aws'; aws: RegisterMachineRequest_AWSRegistration}
}

export interface RegisterMachineRequest_AWSRegistration {
  document: string
  signature: string
}

export interface RegisterMachineResponse {
  machineId: string
  token: string
  task?:
    | {$case: 'pending'; pending: RegisterMachineResponse_PendingTask}
    | {
        $case: 'buildkit'
        buildkit: RegisterMachineResponse_BuildKitTask
      }
    | {$case: 'githubActions'; githubActions: RegisterMachineResponse_GitHubActionsTask}
}

export interface RegisterMachineResponse_Mount {
  path: string
  device: string
}

/** PendingTask represents an instruction to wait for a task to be assigned */
export interface RegisterMachineResponse_PendingTask {}

/** BuildkitTask represents an instruction to start a buildkit daemon */
export interface RegisterMachineResponse_BuildKitTask {
  serverName: string
  cert: Cert | undefined
  caCert: Cert | undefined
  mounts: RegisterMachineResponse_Mount[]
}

/** GithubActionsTask represents an instruction to start a GitHub Actions runner */
export interface RegisterMachineResponse_GitHubActionsTask {
  registrationToken: string
  name: string
  url: string
  labels: string
  runnerVersion: string
}

export interface PingMachineHealthRequest {
  machineId: string
}

export interface PingMachineHealthResponse {
  shouldTerminate: boolean
}

export interface Cert {
  cert: string
  key: string
}

function createBaseRegisterMachineRequest(): RegisterMachineRequest {
  return {connectionId: '', cloud: undefined}
}

export const RegisterMachineRequest = {
  encode(message: RegisterMachineRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.connectionId !== '') {
      writer.uint32(10).string(message.connectionId)
    }
    if (message.cloud?.$case === 'aws') {
      RegisterMachineRequest_AWSRegistration.encode(message.cloud.aws, writer.uint32(18).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RegisterMachineRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRegisterMachineRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.connectionId = reader.string()
          break
        case 2:
          message.cloud = {$case: 'aws', aws: RegisterMachineRequest_AWSRegistration.decode(reader, reader.uint32())}
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): RegisterMachineRequest {
    return {
      connectionId: isSet(object.connectionId) ? String(object.connectionId) : '',
      cloud: isSet(object.aws)
        ? {$case: 'aws', aws: RegisterMachineRequest_AWSRegistration.fromJSON(object.aws)}
        : undefined,
    }
  },

  toJSON(message: RegisterMachineRequest): unknown {
    const obj: any = {}
    message.connectionId !== undefined && (obj.connectionId = message.connectionId)
    message.cloud?.$case === 'aws' &&
      (obj.aws = message.cloud?.aws ? RegisterMachineRequest_AWSRegistration.toJSON(message.cloud?.aws) : undefined)
    return obj
  },

  fromPartial(object: DeepPartial<RegisterMachineRequest>): RegisterMachineRequest {
    const message = createBaseRegisterMachineRequest()
    message.connectionId = object.connectionId ?? ''
    if (object.cloud?.$case === 'aws' && object.cloud?.aws !== undefined && object.cloud?.aws !== null) {
      message.cloud = {$case: 'aws', aws: RegisterMachineRequest_AWSRegistration.fromPartial(object.cloud.aws)}
    }
    return message
  },
}

function createBaseRegisterMachineRequest_AWSRegistration(): RegisterMachineRequest_AWSRegistration {
  return {document: '', signature: ''}
}

export const RegisterMachineRequest_AWSRegistration = {
  encode(message: RegisterMachineRequest_AWSRegistration, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.document !== '') {
      writer.uint32(10).string(message.document)
    }
    if (message.signature !== '') {
      writer.uint32(18).string(message.signature)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RegisterMachineRequest_AWSRegistration {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRegisterMachineRequest_AWSRegistration()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.document = reader.string()
          break
        case 2:
          message.signature = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): RegisterMachineRequest_AWSRegistration {
    return {
      document: isSet(object.document) ? String(object.document) : '',
      signature: isSet(object.signature) ? String(object.signature) : '',
    }
  },

  toJSON(message: RegisterMachineRequest_AWSRegistration): unknown {
    const obj: any = {}
    message.document !== undefined && (obj.document = message.document)
    message.signature !== undefined && (obj.signature = message.signature)
    return obj
  },

  fromPartial(object: DeepPartial<RegisterMachineRequest_AWSRegistration>): RegisterMachineRequest_AWSRegistration {
    const message = createBaseRegisterMachineRequest_AWSRegistration()
    message.document = object.document ?? ''
    message.signature = object.signature ?? ''
    return message
  },
}

function createBaseRegisterMachineResponse(): RegisterMachineResponse {
  return {machineId: '', token: '', task: undefined}
}

export const RegisterMachineResponse = {
  encode(message: RegisterMachineResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.machineId !== '') {
      writer.uint32(10).string(message.machineId)
    }
    if (message.token !== '') {
      writer.uint32(18).string(message.token)
    }
    if (message.task?.$case === 'pending') {
      RegisterMachineResponse_PendingTask.encode(message.task.pending, writer.uint32(26).fork()).ldelim()
    }
    if (message.task?.$case === 'buildkit') {
      RegisterMachineResponse_BuildKitTask.encode(message.task.buildkit, writer.uint32(34).fork()).ldelim()
    }
    if (message.task?.$case === 'githubActions') {
      RegisterMachineResponse_GitHubActionsTask.encode(message.task.githubActions, writer.uint32(42).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RegisterMachineResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRegisterMachineResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.machineId = reader.string()
          break
        case 2:
          message.token = reader.string()
          break
        case 3:
          message.task = {
            $case: 'pending',
            pending: RegisterMachineResponse_PendingTask.decode(reader, reader.uint32()),
          }
          break
        case 4:
          message.task = {
            $case: 'buildkit',
            buildkit: RegisterMachineResponse_BuildKitTask.decode(reader, reader.uint32()),
          }
          break
        case 5:
          message.task = {
            $case: 'githubActions',
            githubActions: RegisterMachineResponse_GitHubActionsTask.decode(reader, reader.uint32()),
          }
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): RegisterMachineResponse {
    return {
      machineId: isSet(object.machineId) ? String(object.machineId) : '',
      token: isSet(object.token) ? String(object.token) : '',
      task: isSet(object.pending)
        ? {$case: 'pending', pending: RegisterMachineResponse_PendingTask.fromJSON(object.pending)}
        : isSet(object.buildkit)
        ? {$case: 'buildkit', buildkit: RegisterMachineResponse_BuildKitTask.fromJSON(object.buildkit)}
        : isSet(object.githubActions)
        ? {
            $case: 'githubActions',
            githubActions: RegisterMachineResponse_GitHubActionsTask.fromJSON(object.githubActions),
          }
        : undefined,
    }
  },

  toJSON(message: RegisterMachineResponse): unknown {
    const obj: any = {}
    message.machineId !== undefined && (obj.machineId = message.machineId)
    message.token !== undefined && (obj.token = message.token)
    message.task?.$case === 'pending' &&
      (obj.pending = message.task?.pending
        ? RegisterMachineResponse_PendingTask.toJSON(message.task?.pending)
        : undefined)
    message.task?.$case === 'buildkit' &&
      (obj.buildkit = message.task?.buildkit
        ? RegisterMachineResponse_BuildKitTask.toJSON(message.task?.buildkit)
        : undefined)
    message.task?.$case === 'githubActions' &&
      (obj.githubActions = message.task?.githubActions
        ? RegisterMachineResponse_GitHubActionsTask.toJSON(message.task?.githubActions)
        : undefined)
    return obj
  },

  fromPartial(object: DeepPartial<RegisterMachineResponse>): RegisterMachineResponse {
    const message = createBaseRegisterMachineResponse()
    message.machineId = object.machineId ?? ''
    message.token = object.token ?? ''
    if (object.task?.$case === 'pending' && object.task?.pending !== undefined && object.task?.pending !== null) {
      message.task = {
        $case: 'pending',
        pending: RegisterMachineResponse_PendingTask.fromPartial(object.task.pending),
      }
    }
    if (object.task?.$case === 'buildkit' && object.task?.buildkit !== undefined && object.task?.buildkit !== null) {
      message.task = {
        $case: 'buildkit',
        buildkit: RegisterMachineResponse_BuildKitTask.fromPartial(object.task.buildkit),
      }
    }
    if (
      object.task?.$case === 'githubActions' &&
      object.task?.githubActions !== undefined &&
      object.task?.githubActions !== null
    ) {
      message.task = {
        $case: 'githubActions',
        githubActions: RegisterMachineResponse_GitHubActionsTask.fromPartial(object.task.githubActions),
      }
    }
    return message
  },
}

function createBaseRegisterMachineResponse_Mount(): RegisterMachineResponse_Mount {
  return {path: '', device: ''}
}

export const RegisterMachineResponse_Mount = {
  encode(message: RegisterMachineResponse_Mount, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.path !== '') {
      writer.uint32(10).string(message.path)
    }
    if (message.device !== '') {
      writer.uint32(18).string(message.device)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RegisterMachineResponse_Mount {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRegisterMachineResponse_Mount()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.path = reader.string()
          break
        case 2:
          message.device = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): RegisterMachineResponse_Mount {
    return {
      path: isSet(object.path) ? String(object.path) : '',
      device: isSet(object.device) ? String(object.device) : '',
    }
  },

  toJSON(message: RegisterMachineResponse_Mount): unknown {
    const obj: any = {}
    message.path !== undefined && (obj.path = message.path)
    message.device !== undefined && (obj.device = message.device)
    return obj
  },

  fromPartial(object: DeepPartial<RegisterMachineResponse_Mount>): RegisterMachineResponse_Mount {
    const message = createBaseRegisterMachineResponse_Mount()
    message.path = object.path ?? ''
    message.device = object.device ?? ''
    return message
  },
}

function createBaseRegisterMachineResponse_PendingTask(): RegisterMachineResponse_PendingTask {
  return {}
}

export const RegisterMachineResponse_PendingTask = {
  encode(_: RegisterMachineResponse_PendingTask, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RegisterMachineResponse_PendingTask {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRegisterMachineResponse_PendingTask()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(_: any): RegisterMachineResponse_PendingTask {
    return {}
  },

  toJSON(_: RegisterMachineResponse_PendingTask): unknown {
    const obj: any = {}
    return obj
  },

  fromPartial(_: DeepPartial<RegisterMachineResponse_PendingTask>): RegisterMachineResponse_PendingTask {
    const message = createBaseRegisterMachineResponse_PendingTask()
    return message
  },
}

function createBaseRegisterMachineResponse_BuildKitTask(): RegisterMachineResponse_BuildKitTask {
  return {serverName: '', cert: undefined, caCert: undefined, mounts: []}
}

export const RegisterMachineResponse_BuildKitTask = {
  encode(message: RegisterMachineResponse_BuildKitTask, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.serverName !== '') {
      writer.uint32(10).string(message.serverName)
    }
    if (message.cert !== undefined) {
      Cert.encode(message.cert, writer.uint32(18).fork()).ldelim()
    }
    if (message.caCert !== undefined) {
      Cert.encode(message.caCert, writer.uint32(26).fork()).ldelim()
    }
    for (const v of message.mounts) {
      RegisterMachineResponse_Mount.encode(v!, writer.uint32(34).fork()).ldelim()
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RegisterMachineResponse_BuildKitTask {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRegisterMachineResponse_BuildKitTask()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.serverName = reader.string()
          break
        case 2:
          message.cert = Cert.decode(reader, reader.uint32())
          break
        case 3:
          message.caCert = Cert.decode(reader, reader.uint32())
          break
        case 4:
          message.mounts.push(RegisterMachineResponse_Mount.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): RegisterMachineResponse_BuildKitTask {
    return {
      serverName: isSet(object.serverName) ? String(object.serverName) : '',
      cert: isSet(object.cert) ? Cert.fromJSON(object.cert) : undefined,
      caCert: isSet(object.caCert) ? Cert.fromJSON(object.caCert) : undefined,
      mounts: Array.isArray(object?.mounts)
        ? object.mounts.map((e: any) => RegisterMachineResponse_Mount.fromJSON(e))
        : [],
    }
  },

  toJSON(message: RegisterMachineResponse_BuildKitTask): unknown {
    const obj: any = {}
    message.serverName !== undefined && (obj.serverName = message.serverName)
    message.cert !== undefined && (obj.cert = message.cert ? Cert.toJSON(message.cert) : undefined)
    message.caCert !== undefined && (obj.caCert = message.caCert ? Cert.toJSON(message.caCert) : undefined)
    if (message.mounts) {
      obj.mounts = message.mounts.map((e) => (e ? RegisterMachineResponse_Mount.toJSON(e) : undefined))
    } else {
      obj.mounts = []
    }
    return obj
  },

  fromPartial(object: DeepPartial<RegisterMachineResponse_BuildKitTask>): RegisterMachineResponse_BuildKitTask {
    const message = createBaseRegisterMachineResponse_BuildKitTask()
    message.serverName = object.serverName ?? ''
    message.cert = object.cert !== undefined && object.cert !== null ? Cert.fromPartial(object.cert) : undefined
    message.caCert = object.caCert !== undefined && object.caCert !== null ? Cert.fromPartial(object.caCert) : undefined
    message.mounts = object.mounts?.map((e) => RegisterMachineResponse_Mount.fromPartial(e)) || []
    return message
  },
}

function createBaseRegisterMachineResponse_GitHubActionsTask(): RegisterMachineResponse_GitHubActionsTask {
  return {registrationToken: '', name: '', url: '', labels: '', runnerVersion: ''}
}

export const RegisterMachineResponse_GitHubActionsTask = {
  encode(message: RegisterMachineResponse_GitHubActionsTask, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.registrationToken !== '') {
      writer.uint32(10).string(message.registrationToken)
    }
    if (message.name !== '') {
      writer.uint32(18).string(message.name)
    }
    if (message.url !== '') {
      writer.uint32(26).string(message.url)
    }
    if (message.labels !== '') {
      writer.uint32(34).string(message.labels)
    }
    if (message.runnerVersion !== '') {
      writer.uint32(42).string(message.runnerVersion)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RegisterMachineResponse_GitHubActionsTask {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRegisterMachineResponse_GitHubActionsTask()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.registrationToken = reader.string()
          break
        case 2:
          message.name = reader.string()
          break
        case 3:
          message.url = reader.string()
          break
        case 4:
          message.labels = reader.string()
          break
        case 5:
          message.runnerVersion = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): RegisterMachineResponse_GitHubActionsTask {
    return {
      registrationToken: isSet(object.registrationToken) ? String(object.registrationToken) : '',
      name: isSet(object.name) ? String(object.name) : '',
      url: isSet(object.url) ? String(object.url) : '',
      labels: isSet(object.labels) ? String(object.labels) : '',
      runnerVersion: isSet(object.runnerVersion) ? String(object.runnerVersion) : '',
    }
  },

  toJSON(message: RegisterMachineResponse_GitHubActionsTask): unknown {
    const obj: any = {}
    message.registrationToken !== undefined && (obj.registrationToken = message.registrationToken)
    message.name !== undefined && (obj.name = message.name)
    message.url !== undefined && (obj.url = message.url)
    message.labels !== undefined && (obj.labels = message.labels)
    message.runnerVersion !== undefined && (obj.runnerVersion = message.runnerVersion)
    return obj
  },

  fromPartial(
    object: DeepPartial<RegisterMachineResponse_GitHubActionsTask>,
  ): RegisterMachineResponse_GitHubActionsTask {
    const message = createBaseRegisterMachineResponse_GitHubActionsTask()
    message.registrationToken = object.registrationToken ?? ''
    message.name = object.name ?? ''
    message.url = object.url ?? ''
    message.labels = object.labels ?? ''
    message.runnerVersion = object.runnerVersion ?? ''
    return message
  },
}

function createBasePingMachineHealthRequest(): PingMachineHealthRequest {
  return {machineId: ''}
}

export const PingMachineHealthRequest = {
  encode(message: PingMachineHealthRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.machineId !== '') {
      writer.uint32(10).string(message.machineId)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PingMachineHealthRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBasePingMachineHealthRequest()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.machineId = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): PingMachineHealthRequest {
    return {machineId: isSet(object.machineId) ? String(object.machineId) : ''}
  },

  toJSON(message: PingMachineHealthRequest): unknown {
    const obj: any = {}
    message.machineId !== undefined && (obj.machineId = message.machineId)
    return obj
  },

  fromPartial(object: DeepPartial<PingMachineHealthRequest>): PingMachineHealthRequest {
    const message = createBasePingMachineHealthRequest()
    message.machineId = object.machineId ?? ''
    return message
  },
}

function createBasePingMachineHealthResponse(): PingMachineHealthResponse {
  return {shouldTerminate: false}
}

export const PingMachineHealthResponse = {
  encode(message: PingMachineHealthResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.shouldTerminate === true) {
      writer.uint32(8).bool(message.shouldTerminate)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): PingMachineHealthResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBasePingMachineHealthResponse()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.shouldTerminate = reader.bool()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): PingMachineHealthResponse {
    return {shouldTerminate: isSet(object.shouldTerminate) ? Boolean(object.shouldTerminate) : false}
  },

  toJSON(message: PingMachineHealthResponse): unknown {
    const obj: any = {}
    message.shouldTerminate !== undefined && (obj.shouldTerminate = message.shouldTerminate)
    return obj
  },

  fromPartial(object: DeepPartial<PingMachineHealthResponse>): PingMachineHealthResponse {
    const message = createBasePingMachineHealthResponse()
    message.shouldTerminate = object.shouldTerminate ?? false
    return message
  },
}

function createBaseCert(): Cert {
  return {cert: '', key: ''}
}

export const Cert = {
  encode(message: Cert, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.cert !== '') {
      writer.uint32(10).string(message.cert)
    }
    if (message.key !== '') {
      writer.uint32(18).string(message.key)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Cert {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseCert()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.cert = reader.string()
          break
        case 2:
          message.key = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): Cert {
    return {cert: isSet(object.cert) ? String(object.cert) : '', key: isSet(object.key) ? String(object.key) : ''}
  },

  toJSON(message: Cert): unknown {
    const obj: any = {}
    message.cert !== undefined && (obj.cert = message.cert)
    message.key !== undefined && (obj.key = message.key)
    return obj
  },

  fromPartial(object: DeepPartial<Cert>): Cert {
    const message = createBaseCert()
    message.cert = object.cert ?? ''
    message.key = object.key ?? ''
    return message
  },
}

export type MachineServiceDefinition = typeof MachineServiceDefinition
export const MachineServiceDefinition = {
  name: 'MachineService',
  fullName: 'depot.cloud.v2.MachineService',
  methods: {
    registerMachine: {
      name: 'RegisterMachine',
      requestType: RegisterMachineRequest,
      requestStream: false,
      responseType: RegisterMachineResponse,
      responseStream: true,
      options: {},
    },
    pingMachineHealth: {
      name: 'PingMachineHealth',
      requestType: PingMachineHealthRequest,
      requestStream: true,
      responseType: PingMachineHealthResponse,
      responseStream: false,
      options: {},
    },
  },
} as const

export interface MachineServiceServiceImplementation<CallContextExt = {}> {
  registerMachine(
    request: RegisterMachineRequest,
    context: CallContext & CallContextExt,
  ): ServerStreamingMethodResult<DeepPartial<RegisterMachineResponse>>
  pingMachineHealth(
    request: AsyncIterable<PingMachineHealthRequest>,
    context: CallContext & CallContextExt,
  ): Promise<DeepPartial<PingMachineHealthResponse>>
}

export interface MachineServiceClient<CallOptionsExt = {}> {
  registerMachine(
    request: DeepPartial<RegisterMachineRequest>,
    options?: CallOptions & CallOptionsExt,
  ): AsyncIterable<RegisterMachineResponse>
  pingMachineHealth(
    request: AsyncIterable<DeepPartial<PingMachineHealthRequest>>,
    options?: CallOptions & CallOptionsExt,
  ): Promise<PingMachineHealthResponse>
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {$case: string}
  ? {[K in keyof Omit<T, '$case'>]?: DeepPartial<T[K]>} & {$case: T['$case']}
  : T extends {}
  ? {[K in keyof T]?: DeepPartial<T[K]>}
  : Partial<T>

function isSet(value: any): boolean {
  return value !== null && value !== undefined
}

export type ServerStreamingMethodResult<Response> = {[Symbol.asyncIterator](): AsyncIterator<Response, void>}
/* eslint-disable */
import Long from 'long'
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
}

export interface RegisterMachineResponse_Mount {
  path: string
  device: string
  fsType: RegisterMachineResponse_Mount_FilesystemType
}

export enum RegisterMachineResponse_Mount_FilesystemType {
  FILESYSTEM_TYPE_UNSPECIFIED = 0,
  FILESYSTEM_TYPE_EXT4 = 1,
  FILESYSTEM_TYPE_XFS = 2,
  FILESYSTEM_TYPE_BTRFS = 3,
  UNRECOGNIZED = -1,
}

export function registerMachineResponse_Mount_FilesystemTypeFromJSON(
  object: any,
): RegisterMachineResponse_Mount_FilesystemType {
  switch (object) {
    case 0:
    case 'FILESYSTEM_TYPE_UNSPECIFIED':
      return RegisterMachineResponse_Mount_FilesystemType.FILESYSTEM_TYPE_UNSPECIFIED
    case 1:
    case 'FILESYSTEM_TYPE_EXT4':
      return RegisterMachineResponse_Mount_FilesystemType.FILESYSTEM_TYPE_EXT4
    case 2:
    case 'FILESYSTEM_TYPE_XFS':
      return RegisterMachineResponse_Mount_FilesystemType.FILESYSTEM_TYPE_XFS
    case 3:
    case 'FILESYSTEM_TYPE_BTRFS':
      return RegisterMachineResponse_Mount_FilesystemType.FILESYSTEM_TYPE_BTRFS
    case -1:
    case 'UNRECOGNIZED':
    default:
      return RegisterMachineResponse_Mount_FilesystemType.UNRECOGNIZED
  }
}

export function registerMachineResponse_Mount_FilesystemTypeToJSON(
  object: RegisterMachineResponse_Mount_FilesystemType,
): string {
  switch (object) {
    case RegisterMachineResponse_Mount_FilesystemType.FILESYSTEM_TYPE_UNSPECIFIED:
      return 'FILESYSTEM_TYPE_UNSPECIFIED'
    case RegisterMachineResponse_Mount_FilesystemType.FILESYSTEM_TYPE_EXT4:
      return 'FILESYSTEM_TYPE_EXT4'
    case RegisterMachineResponse_Mount_FilesystemType.FILESYSTEM_TYPE_XFS:
      return 'FILESYSTEM_TYPE_XFS'
    case RegisterMachineResponse_Mount_FilesystemType.FILESYSTEM_TYPE_BTRFS:
      return 'FILESYSTEM_TYPE_BTRFS'
    case RegisterMachineResponse_Mount_FilesystemType.UNRECOGNIZED:
    default:
      return 'UNRECOGNIZED'
  }
}

/** PendingTask represents an instruction to wait for a task to be assigned */
export interface RegisterMachineResponse_PendingTask {}

/** BuildkitTask represents an instruction to start a buildkit daemon */
export interface RegisterMachineResponse_BuildKitTask {
  serverName: string
  cert: Cert | undefined
  caCert: Cert | undefined
  mounts: RegisterMachineResponse_Mount[]
  cacheSize: number
  traceEndpoint?: string | undefined
  profiler?: RegisterMachineResponse_Profiler | undefined
  disableParallelGzip?: boolean | undefined
  runGcBeforeStart?: boolean | undefined
}

/** Specifies sending buildkit profiling data to a remote endpoint. */
export interface RegisterMachineResponse_Profiler {
  endpoint: string
  token: string
  projectId: string
}

export interface PingMachineHealthRequest {
  machineId: string
  disks: DiskSpace[]
}

export interface DiskSpace {
  device: string
  path: string
  freeMb: number
  totalMb: number
  freeInodes: number
  totalInodes: number
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
    return message
  },
}

function createBaseRegisterMachineResponse_Mount(): RegisterMachineResponse_Mount {
  return {path: '', device: '', fsType: 0}
}

export const RegisterMachineResponse_Mount = {
  encode(message: RegisterMachineResponse_Mount, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.path !== '') {
      writer.uint32(10).string(message.path)
    }
    if (message.device !== '') {
      writer.uint32(18).string(message.device)
    }
    if (message.fsType !== 0) {
      writer.uint32(24).int32(message.fsType)
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
        case 3:
          message.fsType = reader.int32() as any
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
      fsType: isSet(object.fsType) ? registerMachineResponse_Mount_FilesystemTypeFromJSON(object.fsType) : 0,
    }
  },

  toJSON(message: RegisterMachineResponse_Mount): unknown {
    const obj: any = {}
    message.path !== undefined && (obj.path = message.path)
    message.device !== undefined && (obj.device = message.device)
    message.fsType !== undefined && (obj.fsType = registerMachineResponse_Mount_FilesystemTypeToJSON(message.fsType))
    return obj
  },

  fromPartial(object: DeepPartial<RegisterMachineResponse_Mount>): RegisterMachineResponse_Mount {
    const message = createBaseRegisterMachineResponse_Mount()
    message.path = object.path ?? ''
    message.device = object.device ?? ''
    message.fsType = object.fsType ?? 0
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
  return {
    serverName: '',
    cert: undefined,
    caCert: undefined,
    mounts: [],
    cacheSize: 0,
    traceEndpoint: undefined,
    profiler: undefined,
    disableParallelGzip: undefined,
    runGcBeforeStart: undefined,
  }
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
    if (message.cacheSize !== 0) {
      writer.uint32(40).int32(message.cacheSize)
    }
    if (message.traceEndpoint !== undefined) {
      writer.uint32(50).string(message.traceEndpoint)
    }
    if (message.profiler !== undefined) {
      RegisterMachineResponse_Profiler.encode(message.profiler, writer.uint32(58).fork()).ldelim()
    }
    if (message.disableParallelGzip !== undefined) {
      writer.uint32(64).bool(message.disableParallelGzip)
    }
    if (message.runGcBeforeStart !== undefined) {
      writer.uint32(72).bool(message.runGcBeforeStart)
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
        case 5:
          message.cacheSize = reader.int32()
          break
        case 6:
          message.traceEndpoint = reader.string()
          break
        case 7:
          message.profiler = RegisterMachineResponse_Profiler.decode(reader, reader.uint32())
          break
        case 8:
          message.disableParallelGzip = reader.bool()
          break
        case 9:
          message.runGcBeforeStart = reader.bool()
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
      cacheSize: isSet(object.cacheSize) ? Number(object.cacheSize) : 0,
      traceEndpoint: isSet(object.traceEndpoint) ? String(object.traceEndpoint) : undefined,
      profiler: isSet(object.profiler) ? RegisterMachineResponse_Profiler.fromJSON(object.profiler) : undefined,
      disableParallelGzip: isSet(object.disableParallelGzip) ? Boolean(object.disableParallelGzip) : undefined,
      runGcBeforeStart: isSet(object.runGcBeforeStart) ? Boolean(object.runGcBeforeStart) : undefined,
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
    message.cacheSize !== undefined && (obj.cacheSize = Math.round(message.cacheSize))
    message.traceEndpoint !== undefined && (obj.traceEndpoint = message.traceEndpoint)
    message.profiler !== undefined &&
      (obj.profiler = message.profiler ? RegisterMachineResponse_Profiler.toJSON(message.profiler) : undefined)
    message.disableParallelGzip !== undefined && (obj.disableParallelGzip = message.disableParallelGzip)
    message.runGcBeforeStart !== undefined && (obj.runGcBeforeStart = message.runGcBeforeStart)
    return obj
  },

  fromPartial(object: DeepPartial<RegisterMachineResponse_BuildKitTask>): RegisterMachineResponse_BuildKitTask {
    const message = createBaseRegisterMachineResponse_BuildKitTask()
    message.serverName = object.serverName ?? ''
    message.cert = object.cert !== undefined && object.cert !== null ? Cert.fromPartial(object.cert) : undefined
    message.caCert = object.caCert !== undefined && object.caCert !== null ? Cert.fromPartial(object.caCert) : undefined
    message.mounts = object.mounts?.map((e) => RegisterMachineResponse_Mount.fromPartial(e)) || []
    message.cacheSize = object.cacheSize ?? 0
    message.traceEndpoint = object.traceEndpoint ?? undefined
    message.profiler =
      object.profiler !== undefined && object.profiler !== null
        ? RegisterMachineResponse_Profiler.fromPartial(object.profiler)
        : undefined
    message.disableParallelGzip = object.disableParallelGzip ?? undefined
    message.runGcBeforeStart = object.runGcBeforeStart ?? undefined
    return message
  },
}

function createBaseRegisterMachineResponse_Profiler(): RegisterMachineResponse_Profiler {
  return {endpoint: '', token: '', projectId: ''}
}

export const RegisterMachineResponse_Profiler = {
  encode(message: RegisterMachineResponse_Profiler, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.endpoint !== '') {
      writer.uint32(10).string(message.endpoint)
    }
    if (message.token !== '') {
      writer.uint32(18).string(message.token)
    }
    if (message.projectId !== '') {
      writer.uint32(26).string(message.projectId)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RegisterMachineResponse_Profiler {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseRegisterMachineResponse_Profiler()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.endpoint = reader.string()
          break
        case 2:
          message.token = reader.string()
          break
        case 3:
          message.projectId = reader.string()
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): RegisterMachineResponse_Profiler {
    return {
      endpoint: isSet(object.endpoint) ? String(object.endpoint) : '',
      token: isSet(object.token) ? String(object.token) : '',
      projectId: isSet(object.projectId) ? String(object.projectId) : '',
    }
  },

  toJSON(message: RegisterMachineResponse_Profiler): unknown {
    const obj: any = {}
    message.endpoint !== undefined && (obj.endpoint = message.endpoint)
    message.token !== undefined && (obj.token = message.token)
    message.projectId !== undefined && (obj.projectId = message.projectId)
    return obj
  },

  fromPartial(object: DeepPartial<RegisterMachineResponse_Profiler>): RegisterMachineResponse_Profiler {
    const message = createBaseRegisterMachineResponse_Profiler()
    message.endpoint = object.endpoint ?? ''
    message.token = object.token ?? ''
    message.projectId = object.projectId ?? ''
    return message
  },
}

function createBasePingMachineHealthRequest(): PingMachineHealthRequest {
  return {machineId: '', disks: []}
}

export const PingMachineHealthRequest = {
  encode(message: PingMachineHealthRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.machineId !== '') {
      writer.uint32(10).string(message.machineId)
    }
    for (const v of message.disks) {
      DiskSpace.encode(v!, writer.uint32(18).fork()).ldelim()
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
        case 2:
          message.disks.push(DiskSpace.decode(reader, reader.uint32()))
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): PingMachineHealthRequest {
    return {
      machineId: isSet(object.machineId) ? String(object.machineId) : '',
      disks: Array.isArray(object?.disks) ? object.disks.map((e: any) => DiskSpace.fromJSON(e)) : [],
    }
  },

  toJSON(message: PingMachineHealthRequest): unknown {
    const obj: any = {}
    message.machineId !== undefined && (obj.machineId = message.machineId)
    if (message.disks) {
      obj.disks = message.disks.map((e) => (e ? DiskSpace.toJSON(e) : undefined))
    } else {
      obj.disks = []
    }
    return obj
  },

  fromPartial(object: DeepPartial<PingMachineHealthRequest>): PingMachineHealthRequest {
    const message = createBasePingMachineHealthRequest()
    message.machineId = object.machineId ?? ''
    message.disks = object.disks?.map((e) => DiskSpace.fromPartial(e)) || []
    return message
  },
}

function createBaseDiskSpace(): DiskSpace {
  return {device: '', path: '', freeMb: 0, totalMb: 0, freeInodes: 0, totalInodes: 0}
}

export const DiskSpace = {
  encode(message: DiskSpace, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.device !== '') {
      writer.uint32(10).string(message.device)
    }
    if (message.path !== '') {
      writer.uint32(18).string(message.path)
    }
    if (message.freeMb !== 0) {
      writer.uint32(24).int64(message.freeMb)
    }
    if (message.totalMb !== 0) {
      writer.uint32(32).int64(message.totalMb)
    }
    if (message.freeInodes !== 0) {
      writer.uint32(40).int64(message.freeInodes)
    }
    if (message.totalInodes !== 0) {
      writer.uint32(48).int64(message.totalInodes)
    }
    return writer
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DiskSpace {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input)
    let end = length === undefined ? reader.len : reader.pos + length
    const message = createBaseDiskSpace()
    while (reader.pos < end) {
      const tag = reader.uint32()
      switch (tag >>> 3) {
        case 1:
          message.device = reader.string()
          break
        case 2:
          message.path = reader.string()
          break
        case 3:
          message.freeMb = longToNumber(reader.int64() as Long)
          break
        case 4:
          message.totalMb = longToNumber(reader.int64() as Long)
          break
        case 5:
          message.freeInodes = longToNumber(reader.int64() as Long)
          break
        case 6:
          message.totalInodes = longToNumber(reader.int64() as Long)
          break
        default:
          reader.skipType(tag & 7)
          break
      }
    }
    return message
  },

  fromJSON(object: any): DiskSpace {
    return {
      device: isSet(object.device) ? String(object.device) : '',
      path: isSet(object.path) ? String(object.path) : '',
      freeMb: isSet(object.freeMb) ? Number(object.freeMb) : 0,
      totalMb: isSet(object.totalMb) ? Number(object.totalMb) : 0,
      freeInodes: isSet(object.freeInodes) ? Number(object.freeInodes) : 0,
      totalInodes: isSet(object.totalInodes) ? Number(object.totalInodes) : 0,
    }
  },

  toJSON(message: DiskSpace): unknown {
    const obj: any = {}
    message.device !== undefined && (obj.device = message.device)
    message.path !== undefined && (obj.path = message.path)
    message.freeMb !== undefined && (obj.freeMb = Math.round(message.freeMb))
    message.totalMb !== undefined && (obj.totalMb = Math.round(message.totalMb))
    message.freeInodes !== undefined && (obj.freeInodes = Math.round(message.freeInodes))
    message.totalInodes !== undefined && (obj.totalInodes = Math.round(message.totalInodes))
    return obj
  },

  fromPartial(object: DeepPartial<DiskSpace>): DiskSpace {
    const message = createBaseDiskSpace()
    message.device = object.device ?? ''
    message.path = object.path ?? ''
    message.freeMb = object.freeMb ?? 0
    message.totalMb = object.totalMb ?? 0
    message.freeInodes = object.freeInodes ?? 0
    message.totalInodes = object.totalInodes ?? 0
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

declare var self: any | undefined
declare var window: any | undefined
declare var global: any | undefined
var globalThis: any = (() => {
  if (typeof globalThis !== 'undefined') {
    return globalThis
  }
  if (typeof self !== 'undefined') {
    return self
  }
  if (typeof window !== 'undefined') {
    return window
  }
  if (typeof global !== 'undefined') {
    return global
  }
  throw 'Unable to locate global object'
})()

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

function longToNumber(long: Long): number {
  if (long.gt(Number.MAX_SAFE_INTEGER)) {
    throw new globalThis.Error('Value is larger than Number.MAX_SAFE_INTEGER')
  }
  return long.toNumber()
}

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any
  _m0.configure()
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined
}

export type ServerStreamingMethodResult<Response> = {[Symbol.asyncIterator](): AsyncIterator<Response, void>}

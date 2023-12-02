// @generated by protoc-gen-connect-es v0.13.0 with parameter "target=ts,import_extension=none"
// @generated from file depot/cloud/v3/machine.proto (package depot.cloud.v3, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import {MethodKind} from '@bufbuild/protobuf'
import {
  PingMachineHealthRequest,
  PingMachineHealthResponse,
  RegisterMachineRequest,
  RegisterMachineResponse,
  UsageRequest,
  UsageResponse,
} from './machine_pb'

/**
 * @generated from service depot.cloud.v3.MachineService
 */
export const MachineService = {
  typeName: 'depot.cloud.v3.MachineService',
  methods: {
    /**
     * @generated from rpc depot.cloud.v3.MachineService.RegisterMachine
     */
    registerMachine: {
      name: 'RegisterMachine',
      I: RegisterMachineRequest,
      O: RegisterMachineResponse,
      kind: MethodKind.ServerStreaming,
    },
    /**
     * @generated from rpc depot.cloud.v3.MachineService.PingMachineHealth
     */
    pingMachineHealth: {
      name: 'PingMachineHealth',
      I: PingMachineHealthRequest,
      O: PingMachineHealthResponse,
      kind: MethodKind.Unary,
    },
    /**
     * @generated from rpc depot.cloud.v3.MachineService.Usage
     */
    usage: {
      name: 'Usage',
      I: UsageRequest,
      O: UsageResponse,
      kind: MethodKind.Unary,
    },
  },
} as const

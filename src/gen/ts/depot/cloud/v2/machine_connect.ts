// @generated by protoc-gen-connect-es v0.10.1 with parameter "target=ts,import_extension=none"
// @generated from file depot/cloud/v2/machine.proto (package depot.cloud.v2, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import {MethodKind} from '@bufbuild/protobuf'
import {
  PingMachineHealthRequest,
  PingMachineHealthResponse,
  RegisterMachineRequest,
  RegisterMachineResponse,
} from './machine_pb'

/**
 * @generated from service depot.cloud.v2.MachineService
 */
export const MachineService = {
  typeName: 'depot.cloud.v2.MachineService',
  methods: {
    /**
     * @generated from rpc depot.cloud.v2.MachineService.RegisterMachine
     */
    registerMachine: {
      name: 'RegisterMachine',
      I: RegisterMachineRequest,
      O: RegisterMachineResponse,
      kind: MethodKind.ServerStreaming,
    },
    /**
     * @generated from rpc depot.cloud.v2.MachineService.PingMachineHealth
     */
    pingMachineHealth: {
      name: 'PingMachineHealth',
      I: PingMachineHealthRequest,
      O: PingMachineHealthResponse,
      kind: MethodKind.ClientStreaming,
    },
  },
} as const

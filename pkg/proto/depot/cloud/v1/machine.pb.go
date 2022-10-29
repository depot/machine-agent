// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.28.1
// 	protoc        (unknown)
// source: depot/cloud/v1/machine.proto

package cloudv1

import (
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	_ "google.golang.org/protobuf/types/known/timestamppb"
	reflect "reflect"
	sync "sync"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

type RegisterMachineRequest_Cloud int32

const (
	RegisterMachineRequest_CLOUD_UNSPECIFIED RegisterMachineRequest_Cloud = 0
	RegisterMachineRequest_CLOUD_AWS         RegisterMachineRequest_Cloud = 1
	RegisterMachineRequest_CLOUD_FLY         RegisterMachineRequest_Cloud = 2
)

// Enum value maps for RegisterMachineRequest_Cloud.
var (
	RegisterMachineRequest_Cloud_name = map[int32]string{
		0: "CLOUD_UNSPECIFIED",
		1: "CLOUD_AWS",
		2: "CLOUD_FLY",
	}
	RegisterMachineRequest_Cloud_value = map[string]int32{
		"CLOUD_UNSPECIFIED": 0,
		"CLOUD_AWS":         1,
		"CLOUD_FLY":         2,
	}
)

func (x RegisterMachineRequest_Cloud) Enum() *RegisterMachineRequest_Cloud {
	p := new(RegisterMachineRequest_Cloud)
	*p = x
	return p
}

func (x RegisterMachineRequest_Cloud) String() string {
	return protoimpl.X.EnumStringOf(x.Descriptor(), protoreflect.EnumNumber(x))
}

func (RegisterMachineRequest_Cloud) Descriptor() protoreflect.EnumDescriptor {
	return file_depot_cloud_v1_machine_proto_enumTypes[0].Descriptor()
}

func (RegisterMachineRequest_Cloud) Type() protoreflect.EnumType {
	return &file_depot_cloud_v1_machine_proto_enumTypes[0]
}

func (x RegisterMachineRequest_Cloud) Number() protoreflect.EnumNumber {
	return protoreflect.EnumNumber(x)
}

// Deprecated: Use RegisterMachineRequest_Cloud.Descriptor instead.
func (RegisterMachineRequest_Cloud) EnumDescriptor() ([]byte, []int) {
	return file_depot_cloud_v1_machine_proto_rawDescGZIP(), []int{0, 0}
}

type RegisterMachineResponse_Kind int32

const (
	RegisterMachineResponse_KIND_UNSPECIFIED    RegisterMachineResponse_Kind = 0
	RegisterMachineResponse_KIND_BUILDKIT       RegisterMachineResponse_Kind = 1
	RegisterMachineResponse_KIND_GITHUB_ACTIONS RegisterMachineResponse_Kind = 2
	RegisterMachineResponse_KIND_PENDING        RegisterMachineResponse_Kind = 3
)

// Enum value maps for RegisterMachineResponse_Kind.
var (
	RegisterMachineResponse_Kind_name = map[int32]string{
		0: "KIND_UNSPECIFIED",
		1: "KIND_BUILDKIT",
		2: "KIND_GITHUB_ACTIONS",
		3: "KIND_PENDING",
	}
	RegisterMachineResponse_Kind_value = map[string]int32{
		"KIND_UNSPECIFIED":    0,
		"KIND_BUILDKIT":       1,
		"KIND_GITHUB_ACTIONS": 2,
		"KIND_PENDING":        3,
	}
)

func (x RegisterMachineResponse_Kind) Enum() *RegisterMachineResponse_Kind {
	p := new(RegisterMachineResponse_Kind)
	*p = x
	return p
}

func (x RegisterMachineResponse_Kind) String() string {
	return protoimpl.X.EnumStringOf(x.Descriptor(), protoreflect.EnumNumber(x))
}

func (RegisterMachineResponse_Kind) Descriptor() protoreflect.EnumDescriptor {
	return file_depot_cloud_v1_machine_proto_enumTypes[1].Descriptor()
}

func (RegisterMachineResponse_Kind) Type() protoreflect.EnumType {
	return &file_depot_cloud_v1_machine_proto_enumTypes[1]
}

func (x RegisterMachineResponse_Kind) Number() protoreflect.EnumNumber {
	return protoreflect.EnumNumber(x)
}

// Deprecated: Use RegisterMachineResponse_Kind.Descriptor instead.
func (RegisterMachineResponse_Kind) EnumDescriptor() ([]byte, []int) {
	return file_depot_cloud_v1_machine_proto_rawDescGZIP(), []int{1, 0}
}

type RegisterMachineRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	ConnectionId string                       `protobuf:"bytes,1,opt,name=connection_id,json=connectionId,proto3" json:"connection_id,omitempty"`
	Cloud        RegisterMachineRequest_Cloud `protobuf:"varint,2,opt,name=cloud,proto3,enum=depot.cloud.v1.RegisterMachineRequest_Cloud" json:"cloud,omitempty"`
	Document     string                       `protobuf:"bytes,3,opt,name=document,proto3" json:"document,omitempty"`
	Signature    string                       `protobuf:"bytes,4,opt,name=signature,proto3" json:"signature,omitempty"`
}

func (x *RegisterMachineRequest) Reset() {
	*x = RegisterMachineRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_depot_cloud_v1_machine_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *RegisterMachineRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*RegisterMachineRequest) ProtoMessage() {}

func (x *RegisterMachineRequest) ProtoReflect() protoreflect.Message {
	mi := &file_depot_cloud_v1_machine_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use RegisterMachineRequest.ProtoReflect.Descriptor instead.
func (*RegisterMachineRequest) Descriptor() ([]byte, []int) {
	return file_depot_cloud_v1_machine_proto_rawDescGZIP(), []int{0}
}

func (x *RegisterMachineRequest) GetConnectionId() string {
	if x != nil {
		return x.ConnectionId
	}
	return ""
}

func (x *RegisterMachineRequest) GetCloud() RegisterMachineRequest_Cloud {
	if x != nil {
		return x.Cloud
	}
	return RegisterMachineRequest_CLOUD_UNSPECIFIED
}

func (x *RegisterMachineRequest) GetDocument() string {
	if x != nil {
		return x.Document
	}
	return ""
}

func (x *RegisterMachineRequest) GetSignature() string {
	if x != nil {
		return x.Signature
	}
	return ""
}

type RegisterMachineResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	MachineId   string                           `protobuf:"bytes,1,opt,name=machine_id,json=machineId,proto3" json:"machine_id,omitempty"`
	Kind        RegisterMachineResponse_Kind     `protobuf:"varint,2,opt,name=kind,proto3,enum=depot.cloud.v1.RegisterMachineResponse_Kind" json:"kind,omitempty"`
	Mounts      []*RegisterMachineResponse_Mount `protobuf:"bytes,3,rep,name=mounts,proto3" json:"mounts,omitempty"`
	Cert        *RegisterMachineResponse_Cert    `protobuf:"bytes,4,opt,name=cert,proto3" json:"cert,omitempty"`
	CaCert      *RegisterMachineResponse_Cert    `protobuf:"bytes,5,opt,name=ca_cert,json=caCert,proto3" json:"ca_cert,omitempty"`
	Token       string                           `protobuf:"bytes,6,opt,name=token,proto3" json:"token,omitempty"`
	GithubToken *string                          `protobuf:"bytes,7,opt,name=github_token,json=githubToken,proto3,oneof" json:"github_token,omitempty"`
}

func (x *RegisterMachineResponse) Reset() {
	*x = RegisterMachineResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_depot_cloud_v1_machine_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *RegisterMachineResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*RegisterMachineResponse) ProtoMessage() {}

func (x *RegisterMachineResponse) ProtoReflect() protoreflect.Message {
	mi := &file_depot_cloud_v1_machine_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use RegisterMachineResponse.ProtoReflect.Descriptor instead.
func (*RegisterMachineResponse) Descriptor() ([]byte, []int) {
	return file_depot_cloud_v1_machine_proto_rawDescGZIP(), []int{1}
}

func (x *RegisterMachineResponse) GetMachineId() string {
	if x != nil {
		return x.MachineId
	}
	return ""
}

func (x *RegisterMachineResponse) GetKind() RegisterMachineResponse_Kind {
	if x != nil {
		return x.Kind
	}
	return RegisterMachineResponse_KIND_UNSPECIFIED
}

func (x *RegisterMachineResponse) GetMounts() []*RegisterMachineResponse_Mount {
	if x != nil {
		return x.Mounts
	}
	return nil
}

func (x *RegisterMachineResponse) GetCert() *RegisterMachineResponse_Cert {
	if x != nil {
		return x.Cert
	}
	return nil
}

func (x *RegisterMachineResponse) GetCaCert() *RegisterMachineResponse_Cert {
	if x != nil {
		return x.CaCert
	}
	return nil
}

func (x *RegisterMachineResponse) GetToken() string {
	if x != nil {
		return x.Token
	}
	return ""
}

func (x *RegisterMachineResponse) GetGithubToken() string {
	if x != nil && x.GithubToken != nil {
		return *x.GithubToken
	}
	return ""
}

type PingMachineHealthRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	MachineId string `protobuf:"bytes,1,opt,name=machine_id,json=machineId,proto3" json:"machine_id,omitempty"`
}

func (x *PingMachineHealthRequest) Reset() {
	*x = PingMachineHealthRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_depot_cloud_v1_machine_proto_msgTypes[2]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *PingMachineHealthRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*PingMachineHealthRequest) ProtoMessage() {}

func (x *PingMachineHealthRequest) ProtoReflect() protoreflect.Message {
	mi := &file_depot_cloud_v1_machine_proto_msgTypes[2]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use PingMachineHealthRequest.ProtoReflect.Descriptor instead.
func (*PingMachineHealthRequest) Descriptor() ([]byte, []int) {
	return file_depot_cloud_v1_machine_proto_rawDescGZIP(), []int{2}
}

func (x *PingMachineHealthRequest) GetMachineId() string {
	if x != nil {
		return x.MachineId
	}
	return ""
}

type PingMachineHealthResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	ShouldTerminate bool `protobuf:"varint,1,opt,name=should_terminate,json=shouldTerminate,proto3" json:"should_terminate,omitempty"`
}

func (x *PingMachineHealthResponse) Reset() {
	*x = PingMachineHealthResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_depot_cloud_v1_machine_proto_msgTypes[3]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *PingMachineHealthResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*PingMachineHealthResponse) ProtoMessage() {}

func (x *PingMachineHealthResponse) ProtoReflect() protoreflect.Message {
	mi := &file_depot_cloud_v1_machine_proto_msgTypes[3]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use PingMachineHealthResponse.ProtoReflect.Descriptor instead.
func (*PingMachineHealthResponse) Descriptor() ([]byte, []int) {
	return file_depot_cloud_v1_machine_proto_rawDescGZIP(), []int{3}
}

func (x *PingMachineHealthResponse) GetShouldTerminate() bool {
	if x != nil {
		return x.ShouldTerminate
	}
	return false
}

type RegisterMachineResponse_Cert struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Cert string `protobuf:"bytes,1,opt,name=cert,proto3" json:"cert,omitempty"`
	Key  string `protobuf:"bytes,2,opt,name=key,proto3" json:"key,omitempty"`
}

func (x *RegisterMachineResponse_Cert) Reset() {
	*x = RegisterMachineResponse_Cert{}
	if protoimpl.UnsafeEnabled {
		mi := &file_depot_cloud_v1_machine_proto_msgTypes[4]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *RegisterMachineResponse_Cert) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*RegisterMachineResponse_Cert) ProtoMessage() {}

func (x *RegisterMachineResponse_Cert) ProtoReflect() protoreflect.Message {
	mi := &file_depot_cloud_v1_machine_proto_msgTypes[4]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use RegisterMachineResponse_Cert.ProtoReflect.Descriptor instead.
func (*RegisterMachineResponse_Cert) Descriptor() ([]byte, []int) {
	return file_depot_cloud_v1_machine_proto_rawDescGZIP(), []int{1, 0}
}

func (x *RegisterMachineResponse_Cert) GetCert() string {
	if x != nil {
		return x.Cert
	}
	return ""
}

func (x *RegisterMachineResponse_Cert) GetKey() string {
	if x != nil {
		return x.Key
	}
	return ""
}

type RegisterMachineResponse_Mount struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Path   string `protobuf:"bytes,1,opt,name=path,proto3" json:"path,omitempty"`
	Device string `protobuf:"bytes,2,opt,name=device,proto3" json:"device,omitempty"`
}

func (x *RegisterMachineResponse_Mount) Reset() {
	*x = RegisterMachineResponse_Mount{}
	if protoimpl.UnsafeEnabled {
		mi := &file_depot_cloud_v1_machine_proto_msgTypes[5]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *RegisterMachineResponse_Mount) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*RegisterMachineResponse_Mount) ProtoMessage() {}

func (x *RegisterMachineResponse_Mount) ProtoReflect() protoreflect.Message {
	mi := &file_depot_cloud_v1_machine_proto_msgTypes[5]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use RegisterMachineResponse_Mount.ProtoReflect.Descriptor instead.
func (*RegisterMachineResponse_Mount) Descriptor() ([]byte, []int) {
	return file_depot_cloud_v1_machine_proto_rawDescGZIP(), []int{1, 1}
}

func (x *RegisterMachineResponse_Mount) GetPath() string {
	if x != nil {
		return x.Path
	}
	return ""
}

func (x *RegisterMachineResponse_Mount) GetDevice() string {
	if x != nil {
		return x.Device
	}
	return ""
}

var File_depot_cloud_v1_machine_proto protoreflect.FileDescriptor

var file_depot_cloud_v1_machine_proto_rawDesc = []byte{
	0x0a, 0x1c, 0x64, 0x65, 0x70, 0x6f, 0x74, 0x2f, 0x63, 0x6c, 0x6f, 0x75, 0x64, 0x2f, 0x76, 0x31,
	0x2f, 0x6d, 0x61, 0x63, 0x68, 0x69, 0x6e, 0x65, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x12, 0x0e,
	0x64, 0x65, 0x70, 0x6f, 0x74, 0x2e, 0x63, 0x6c, 0x6f, 0x75, 0x64, 0x2e, 0x76, 0x31, 0x1a, 0x1f,
	0x67, 0x6f, 0x6f, 0x67, 0x6c, 0x65, 0x2f, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x62, 0x75, 0x66, 0x2f,
	0x74, 0x69, 0x6d, 0x65, 0x73, 0x74, 0x61, 0x6d, 0x70, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x22,
	0xf9, 0x01, 0x0a, 0x16, 0x52, 0x65, 0x67, 0x69, 0x73, 0x74, 0x65, 0x72, 0x4d, 0x61, 0x63, 0x68,
	0x69, 0x6e, 0x65, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x12, 0x23, 0x0a, 0x0d, 0x63, 0x6f,
	0x6e, 0x6e, 0x65, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x5f, 0x69, 0x64, 0x18, 0x01, 0x20, 0x01, 0x28,
	0x09, 0x52, 0x0c, 0x63, 0x6f, 0x6e, 0x6e, 0x65, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x49, 0x64, 0x12,
	0x42, 0x0a, 0x05, 0x63, 0x6c, 0x6f, 0x75, 0x64, 0x18, 0x02, 0x20, 0x01, 0x28, 0x0e, 0x32, 0x2c,
	0x2e, 0x64, 0x65, 0x70, 0x6f, 0x74, 0x2e, 0x63, 0x6c, 0x6f, 0x75, 0x64, 0x2e, 0x76, 0x31, 0x2e,
	0x52, 0x65, 0x67, 0x69, 0x73, 0x74, 0x65, 0x72, 0x4d, 0x61, 0x63, 0x68, 0x69, 0x6e, 0x65, 0x52,
	0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x2e, 0x43, 0x6c, 0x6f, 0x75, 0x64, 0x52, 0x05, 0x63, 0x6c,
	0x6f, 0x75, 0x64, 0x12, 0x1a, 0x0a, 0x08, 0x64, 0x6f, 0x63, 0x75, 0x6d, 0x65, 0x6e, 0x74, 0x18,
	0x03, 0x20, 0x01, 0x28, 0x09, 0x52, 0x08, 0x64, 0x6f, 0x63, 0x75, 0x6d, 0x65, 0x6e, 0x74, 0x12,
	0x1c, 0x0a, 0x09, 0x73, 0x69, 0x67, 0x6e, 0x61, 0x74, 0x75, 0x72, 0x65, 0x18, 0x04, 0x20, 0x01,
	0x28, 0x09, 0x52, 0x09, 0x73, 0x69, 0x67, 0x6e, 0x61, 0x74, 0x75, 0x72, 0x65, 0x22, 0x3c, 0x0a,
	0x05, 0x43, 0x6c, 0x6f, 0x75, 0x64, 0x12, 0x15, 0x0a, 0x11, 0x43, 0x4c, 0x4f, 0x55, 0x44, 0x5f,
	0x55, 0x4e, 0x53, 0x50, 0x45, 0x43, 0x49, 0x46, 0x49, 0x45, 0x44, 0x10, 0x00, 0x12, 0x0d, 0x0a,
	0x09, 0x43, 0x4c, 0x4f, 0x55, 0x44, 0x5f, 0x41, 0x57, 0x53, 0x10, 0x01, 0x12, 0x0d, 0x0a, 0x09,
	0x43, 0x4c, 0x4f, 0x55, 0x44, 0x5f, 0x46, 0x4c, 0x59, 0x10, 0x02, 0x22, 0xd8, 0x04, 0x0a, 0x17,
	0x52, 0x65, 0x67, 0x69, 0x73, 0x74, 0x65, 0x72, 0x4d, 0x61, 0x63, 0x68, 0x69, 0x6e, 0x65, 0x52,
	0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x12, 0x1d, 0x0a, 0x0a, 0x6d, 0x61, 0x63, 0x68, 0x69,
	0x6e, 0x65, 0x5f, 0x69, 0x64, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x09, 0x6d, 0x61, 0x63,
	0x68, 0x69, 0x6e, 0x65, 0x49, 0x64, 0x12, 0x40, 0x0a, 0x04, 0x6b, 0x69, 0x6e, 0x64, 0x18, 0x02,
	0x20, 0x01, 0x28, 0x0e, 0x32, 0x2c, 0x2e, 0x64, 0x65, 0x70, 0x6f, 0x74, 0x2e, 0x63, 0x6c, 0x6f,
	0x75, 0x64, 0x2e, 0x76, 0x31, 0x2e, 0x52, 0x65, 0x67, 0x69, 0x73, 0x74, 0x65, 0x72, 0x4d, 0x61,
	0x63, 0x68, 0x69, 0x6e, 0x65, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x2e, 0x4b, 0x69,
	0x6e, 0x64, 0x52, 0x04, 0x6b, 0x69, 0x6e, 0x64, 0x12, 0x45, 0x0a, 0x06, 0x6d, 0x6f, 0x75, 0x6e,
	0x74, 0x73, 0x18, 0x03, 0x20, 0x03, 0x28, 0x0b, 0x32, 0x2d, 0x2e, 0x64, 0x65, 0x70, 0x6f, 0x74,
	0x2e, 0x63, 0x6c, 0x6f, 0x75, 0x64, 0x2e, 0x76, 0x31, 0x2e, 0x52, 0x65, 0x67, 0x69, 0x73, 0x74,
	0x65, 0x72, 0x4d, 0x61, 0x63, 0x68, 0x69, 0x6e, 0x65, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73,
	0x65, 0x2e, 0x4d, 0x6f, 0x75, 0x6e, 0x74, 0x52, 0x06, 0x6d, 0x6f, 0x75, 0x6e, 0x74, 0x73, 0x12,
	0x40, 0x0a, 0x04, 0x63, 0x65, 0x72, 0x74, 0x18, 0x04, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x2c, 0x2e,
	0x64, 0x65, 0x70, 0x6f, 0x74, 0x2e, 0x63, 0x6c, 0x6f, 0x75, 0x64, 0x2e, 0x76, 0x31, 0x2e, 0x52,
	0x65, 0x67, 0x69, 0x73, 0x74, 0x65, 0x72, 0x4d, 0x61, 0x63, 0x68, 0x69, 0x6e, 0x65, 0x52, 0x65,
	0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x2e, 0x43, 0x65, 0x72, 0x74, 0x52, 0x04, 0x63, 0x65, 0x72,
	0x74, 0x12, 0x45, 0x0a, 0x07, 0x63, 0x61, 0x5f, 0x63, 0x65, 0x72, 0x74, 0x18, 0x05, 0x20, 0x01,
	0x28, 0x0b, 0x32, 0x2c, 0x2e, 0x64, 0x65, 0x70, 0x6f, 0x74, 0x2e, 0x63, 0x6c, 0x6f, 0x75, 0x64,
	0x2e, 0x76, 0x31, 0x2e, 0x52, 0x65, 0x67, 0x69, 0x73, 0x74, 0x65, 0x72, 0x4d, 0x61, 0x63, 0x68,
	0x69, 0x6e, 0x65, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x2e, 0x43, 0x65, 0x72, 0x74,
	0x52, 0x06, 0x63, 0x61, 0x43, 0x65, 0x72, 0x74, 0x12, 0x14, 0x0a, 0x05, 0x74, 0x6f, 0x6b, 0x65,
	0x6e, 0x18, 0x06, 0x20, 0x01, 0x28, 0x09, 0x52, 0x05, 0x74, 0x6f, 0x6b, 0x65, 0x6e, 0x12, 0x26,
	0x0a, 0x0c, 0x67, 0x69, 0x74, 0x68, 0x75, 0x62, 0x5f, 0x74, 0x6f, 0x6b, 0x65, 0x6e, 0x18, 0x07,
	0x20, 0x01, 0x28, 0x09, 0x48, 0x00, 0x52, 0x0b, 0x67, 0x69, 0x74, 0x68, 0x75, 0x62, 0x54, 0x6f,
	0x6b, 0x65, 0x6e, 0x88, 0x01, 0x01, 0x1a, 0x2c, 0x0a, 0x04, 0x43, 0x65, 0x72, 0x74, 0x12, 0x12,
	0x0a, 0x04, 0x63, 0x65, 0x72, 0x74, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x04, 0x63, 0x65,
	0x72, 0x74, 0x12, 0x10, 0x0a, 0x03, 0x6b, 0x65, 0x79, 0x18, 0x02, 0x20, 0x01, 0x28, 0x09, 0x52,
	0x03, 0x6b, 0x65, 0x79, 0x1a, 0x33, 0x0a, 0x05, 0x4d, 0x6f, 0x75, 0x6e, 0x74, 0x12, 0x12, 0x0a,
	0x04, 0x70, 0x61, 0x74, 0x68, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x04, 0x70, 0x61, 0x74,
	0x68, 0x12, 0x16, 0x0a, 0x06, 0x64, 0x65, 0x76, 0x69, 0x63, 0x65, 0x18, 0x02, 0x20, 0x01, 0x28,
	0x09, 0x52, 0x06, 0x64, 0x65, 0x76, 0x69, 0x63, 0x65, 0x22, 0x5a, 0x0a, 0x04, 0x4b, 0x69, 0x6e,
	0x64, 0x12, 0x14, 0x0a, 0x10, 0x4b, 0x49, 0x4e, 0x44, 0x5f, 0x55, 0x4e, 0x53, 0x50, 0x45, 0x43,
	0x49, 0x46, 0x49, 0x45, 0x44, 0x10, 0x00, 0x12, 0x11, 0x0a, 0x0d, 0x4b, 0x49, 0x4e, 0x44, 0x5f,
	0x42, 0x55, 0x49, 0x4c, 0x44, 0x4b, 0x49, 0x54, 0x10, 0x01, 0x12, 0x17, 0x0a, 0x13, 0x4b, 0x49,
	0x4e, 0x44, 0x5f, 0x47, 0x49, 0x54, 0x48, 0x55, 0x42, 0x5f, 0x41, 0x43, 0x54, 0x49, 0x4f, 0x4e,
	0x53, 0x10, 0x02, 0x12, 0x10, 0x0a, 0x0c, 0x4b, 0x49, 0x4e, 0x44, 0x5f, 0x50, 0x45, 0x4e, 0x44,
	0x49, 0x4e, 0x47, 0x10, 0x03, 0x42, 0x0f, 0x0a, 0x0d, 0x5f, 0x67, 0x69, 0x74, 0x68, 0x75, 0x62,
	0x5f, 0x74, 0x6f, 0x6b, 0x65, 0x6e, 0x22, 0x39, 0x0a, 0x18, 0x50, 0x69, 0x6e, 0x67, 0x4d, 0x61,
	0x63, 0x68, 0x69, 0x6e, 0x65, 0x48, 0x65, 0x61, 0x6c, 0x74, 0x68, 0x52, 0x65, 0x71, 0x75, 0x65,
	0x73, 0x74, 0x12, 0x1d, 0x0a, 0x0a, 0x6d, 0x61, 0x63, 0x68, 0x69, 0x6e, 0x65, 0x5f, 0x69, 0x64,
	0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x09, 0x6d, 0x61, 0x63, 0x68, 0x69, 0x6e, 0x65, 0x49,
	0x64, 0x22, 0x46, 0x0a, 0x19, 0x50, 0x69, 0x6e, 0x67, 0x4d, 0x61, 0x63, 0x68, 0x69, 0x6e, 0x65,
	0x48, 0x65, 0x61, 0x6c, 0x74, 0x68, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x12, 0x29,
	0x0a, 0x10, 0x73, 0x68, 0x6f, 0x75, 0x6c, 0x64, 0x5f, 0x74, 0x65, 0x72, 0x6d, 0x69, 0x6e, 0x61,
	0x74, 0x65, 0x18, 0x01, 0x20, 0x01, 0x28, 0x08, 0x52, 0x0f, 0x73, 0x68, 0x6f, 0x75, 0x6c, 0x64,
	0x54, 0x65, 0x72, 0x6d, 0x69, 0x6e, 0x61, 0x74, 0x65, 0x32, 0xde, 0x01, 0x0a, 0x0e, 0x4d, 0x61,
	0x63, 0x68, 0x69, 0x6e, 0x65, 0x53, 0x65, 0x72, 0x76, 0x69, 0x63, 0x65, 0x12, 0x62, 0x0a, 0x0f,
	0x52, 0x65, 0x67, 0x69, 0x73, 0x74, 0x65, 0x72, 0x4d, 0x61, 0x63, 0x68, 0x69, 0x6e, 0x65, 0x12,
	0x26, 0x2e, 0x64, 0x65, 0x70, 0x6f, 0x74, 0x2e, 0x63, 0x6c, 0x6f, 0x75, 0x64, 0x2e, 0x76, 0x31,
	0x2e, 0x52, 0x65, 0x67, 0x69, 0x73, 0x74, 0x65, 0x72, 0x4d, 0x61, 0x63, 0x68, 0x69, 0x6e, 0x65,
	0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x1a, 0x27, 0x2e, 0x64, 0x65, 0x70, 0x6f, 0x74, 0x2e,
	0x63, 0x6c, 0x6f, 0x75, 0x64, 0x2e, 0x76, 0x31, 0x2e, 0x52, 0x65, 0x67, 0x69, 0x73, 0x74, 0x65,
	0x72, 0x4d, 0x61, 0x63, 0x68, 0x69, 0x6e, 0x65, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65,
	0x12, 0x68, 0x0a, 0x11, 0x50, 0x69, 0x6e, 0x67, 0x4d, 0x61, 0x63, 0x68, 0x69, 0x6e, 0x65, 0x48,
	0x65, 0x61, 0x6c, 0x74, 0x68, 0x12, 0x28, 0x2e, 0x64, 0x65, 0x70, 0x6f, 0x74, 0x2e, 0x63, 0x6c,
	0x6f, 0x75, 0x64, 0x2e, 0x76, 0x31, 0x2e, 0x50, 0x69, 0x6e, 0x67, 0x4d, 0x61, 0x63, 0x68, 0x69,
	0x6e, 0x65, 0x48, 0x65, 0x61, 0x6c, 0x74, 0x68, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73, 0x74, 0x1a,
	0x29, 0x2e, 0x64, 0x65, 0x70, 0x6f, 0x74, 0x2e, 0x63, 0x6c, 0x6f, 0x75, 0x64, 0x2e, 0x76, 0x31,
	0x2e, 0x50, 0x69, 0x6e, 0x67, 0x4d, 0x61, 0x63, 0x68, 0x69, 0x6e, 0x65, 0x48, 0x65, 0x61, 0x6c,
	0x74, 0x68, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x42, 0xbd, 0x01, 0x0a, 0x12, 0x63,
	0x6f, 0x6d, 0x2e, 0x64, 0x65, 0x70, 0x6f, 0x74, 0x2e, 0x63, 0x6c, 0x6f, 0x75, 0x64, 0x2e, 0x76,
	0x31, 0x42, 0x0c, 0x4d, 0x61, 0x63, 0x68, 0x69, 0x6e, 0x65, 0x50, 0x72, 0x6f, 0x74, 0x6f, 0x50,
	0x01, 0x5a, 0x3f, 0x67, 0x69, 0x74, 0x68, 0x75, 0x62, 0x2e, 0x63, 0x6f, 0x6d, 0x2f, 0x64, 0x65,
	0x70, 0x6f, 0x74, 0x2f, 0x6d, 0x61, 0x63, 0x68, 0x69, 0x6e, 0x65, 0x2d, 0x61, 0x67, 0x65, 0x6e,
	0x74, 0x2f, 0x70, 0x6b, 0x67, 0x2f, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x2f, 0x64, 0x65, 0x70, 0x6f,
	0x74, 0x2f, 0x63, 0x6c, 0x6f, 0x75, 0x64, 0x2f, 0x76, 0x31, 0x3b, 0x63, 0x6c, 0x6f, 0x75, 0x64,
	0x76, 0x31, 0xa2, 0x02, 0x03, 0x44, 0x43, 0x58, 0xaa, 0x02, 0x0e, 0x44, 0x65, 0x70, 0x6f, 0x74,
	0x2e, 0x43, 0x6c, 0x6f, 0x75, 0x64, 0x2e, 0x56, 0x31, 0xca, 0x02, 0x0e, 0x44, 0x65, 0x70, 0x6f,
	0x74, 0x5c, 0x43, 0x6c, 0x6f, 0x75, 0x64, 0x5c, 0x56, 0x31, 0xe2, 0x02, 0x1a, 0x44, 0x65, 0x70,
	0x6f, 0x74, 0x5c, 0x43, 0x6c, 0x6f, 0x75, 0x64, 0x5c, 0x56, 0x31, 0x5c, 0x47, 0x50, 0x42, 0x4d,
	0x65, 0x74, 0x61, 0x64, 0x61, 0x74, 0x61, 0xea, 0x02, 0x10, 0x44, 0x65, 0x70, 0x6f, 0x74, 0x3a,
	0x3a, 0x43, 0x6c, 0x6f, 0x75, 0x64, 0x3a, 0x3a, 0x56, 0x31, 0x62, 0x06, 0x70, 0x72, 0x6f, 0x74,
	0x6f, 0x33,
}

var (
	file_depot_cloud_v1_machine_proto_rawDescOnce sync.Once
	file_depot_cloud_v1_machine_proto_rawDescData = file_depot_cloud_v1_machine_proto_rawDesc
)

func file_depot_cloud_v1_machine_proto_rawDescGZIP() []byte {
	file_depot_cloud_v1_machine_proto_rawDescOnce.Do(func() {
		file_depot_cloud_v1_machine_proto_rawDescData = protoimpl.X.CompressGZIP(file_depot_cloud_v1_machine_proto_rawDescData)
	})
	return file_depot_cloud_v1_machine_proto_rawDescData
}

var file_depot_cloud_v1_machine_proto_enumTypes = make([]protoimpl.EnumInfo, 2)
var file_depot_cloud_v1_machine_proto_msgTypes = make([]protoimpl.MessageInfo, 6)
var file_depot_cloud_v1_machine_proto_goTypes = []interface{}{
	(RegisterMachineRequest_Cloud)(0),     // 0: depot.cloud.v1.RegisterMachineRequest.Cloud
	(RegisterMachineResponse_Kind)(0),     // 1: depot.cloud.v1.RegisterMachineResponse.Kind
	(*RegisterMachineRequest)(nil),        // 2: depot.cloud.v1.RegisterMachineRequest
	(*RegisterMachineResponse)(nil),       // 3: depot.cloud.v1.RegisterMachineResponse
	(*PingMachineHealthRequest)(nil),      // 4: depot.cloud.v1.PingMachineHealthRequest
	(*PingMachineHealthResponse)(nil),     // 5: depot.cloud.v1.PingMachineHealthResponse
	(*RegisterMachineResponse_Cert)(nil),  // 6: depot.cloud.v1.RegisterMachineResponse.Cert
	(*RegisterMachineResponse_Mount)(nil), // 7: depot.cloud.v1.RegisterMachineResponse.Mount
}
var file_depot_cloud_v1_machine_proto_depIdxs = []int32{
	0, // 0: depot.cloud.v1.RegisterMachineRequest.cloud:type_name -> depot.cloud.v1.RegisterMachineRequest.Cloud
	1, // 1: depot.cloud.v1.RegisterMachineResponse.kind:type_name -> depot.cloud.v1.RegisterMachineResponse.Kind
	7, // 2: depot.cloud.v1.RegisterMachineResponse.mounts:type_name -> depot.cloud.v1.RegisterMachineResponse.Mount
	6, // 3: depot.cloud.v1.RegisterMachineResponse.cert:type_name -> depot.cloud.v1.RegisterMachineResponse.Cert
	6, // 4: depot.cloud.v1.RegisterMachineResponse.ca_cert:type_name -> depot.cloud.v1.RegisterMachineResponse.Cert
	2, // 5: depot.cloud.v1.MachineService.RegisterMachine:input_type -> depot.cloud.v1.RegisterMachineRequest
	4, // 6: depot.cloud.v1.MachineService.PingMachineHealth:input_type -> depot.cloud.v1.PingMachineHealthRequest
	3, // 7: depot.cloud.v1.MachineService.RegisterMachine:output_type -> depot.cloud.v1.RegisterMachineResponse
	5, // 8: depot.cloud.v1.MachineService.PingMachineHealth:output_type -> depot.cloud.v1.PingMachineHealthResponse
	7, // [7:9] is the sub-list for method output_type
	5, // [5:7] is the sub-list for method input_type
	5, // [5:5] is the sub-list for extension type_name
	5, // [5:5] is the sub-list for extension extendee
	0, // [0:5] is the sub-list for field type_name
}

func init() { file_depot_cloud_v1_machine_proto_init() }
func file_depot_cloud_v1_machine_proto_init() {
	if File_depot_cloud_v1_machine_proto != nil {
		return
	}
	if !protoimpl.UnsafeEnabled {
		file_depot_cloud_v1_machine_proto_msgTypes[0].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*RegisterMachineRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_depot_cloud_v1_machine_proto_msgTypes[1].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*RegisterMachineResponse); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_depot_cloud_v1_machine_proto_msgTypes[2].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*PingMachineHealthRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_depot_cloud_v1_machine_proto_msgTypes[3].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*PingMachineHealthResponse); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_depot_cloud_v1_machine_proto_msgTypes[4].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*RegisterMachineResponse_Cert); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_depot_cloud_v1_machine_proto_msgTypes[5].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*RegisterMachineResponse_Mount); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
	}
	file_depot_cloud_v1_machine_proto_msgTypes[1].OneofWrappers = []interface{}{}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: file_depot_cloud_v1_machine_proto_rawDesc,
			NumEnums:      2,
			NumMessages:   6,
			NumExtensions: 0,
			NumServices:   1,
		},
		GoTypes:           file_depot_cloud_v1_machine_proto_goTypes,
		DependencyIndexes: file_depot_cloud_v1_machine_proto_depIdxs,
		EnumInfos:         file_depot_cloud_v1_machine_proto_enumTypes,
		MessageInfos:      file_depot_cloud_v1_machine_proto_msgTypes,
	}.Build()
	File_depot_cloud_v1_machine_proto = out.File
	file_depot_cloud_v1_machine_proto_rawDesc = nil
	file_depot_cloud_v1_machine_proto_goTypes = nil
	file_depot_cloud_v1_machine_proto_depIdxs = nil
}

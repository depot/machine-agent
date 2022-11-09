package api

import (
	"fmt"
	"net/http"
	"os"
	"runtime"

	"github.com/bufbuild/connect-go"
	"github.com/depot/machine-agent/internal/build"
	"github.com/depot/machine-agent/pkg/proto/depot/cloud/v2/cloudv2connect"
)

func NewRPCFromEnv() cloudv2connect.MachineServiceClient {
	baseURL := os.Getenv("DEPOT_CLOUD_API_HOST")
	if baseURL == "" {
		baseURL = "https://api.depot.dev"
	}
	return cloudv2connect.NewMachineServiceClient(http.DefaultClient, baseURL, connect.WithGRPC())
}

func GetConnectionID() string {
	return os.Getenv("DEPOT_CLOUD_CONNECTION_ID")
}

func WithHeaders[T any](req *connect.Request[T], token string) *connect.Request[T] {
	req.Header().Add("User-Agent", fmt.Sprintf("depot-cli/%s/%s/%s", build.Version, runtime.GOOS, runtime.GOARCH))
	if token != "" {
		req.Header().Add("Authorization", "Bearer "+token)
	}
	return req
}

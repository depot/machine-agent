package api

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"runtime"

	"github.com/depot/machine-agent/internal/build"
	cloudv1 "github.com/depot/machine-agent/pkg/proto/depot/cloud/v1"
	"github.com/twitchtv/twirp"
)

func NewRPCFromEnv() cloudv1.MachineService {
	baseURL := os.Getenv("DEPOT_CLOUD_API_HOST")
	if baseURL == "" {
		baseURL = "https://cloud.depot.dev"
	}
	return cloudv1.NewMachineServiceProtobufClient(baseURL, &http.Client{}, twirp.WithClientPathPrefix("/rpc"))
}

func GetConnectionID() string {
	return os.Getenv("DEPOT_CLOUD_CONNECTION_ID")
}

func WithHeaders(ctx context.Context, token string) (context.Context, error) {
	header := make(http.Header)
	header.Set("User-Agent", fmt.Sprintf("depot-cli/%s/%s/%s", build.Version, runtime.GOOS, runtime.GOARCH))
	if token != "" {
		header.Set("Authorization", "Bearer "+token)
	}
	return twirp.WithHTTPRequestHeaders(ctx, header)
}

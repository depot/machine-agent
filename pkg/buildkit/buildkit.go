package buildkit

import (
	"context"

	"github.com/moby/buildkit/client"
)

type TlsOpts struct {
	ServerName string
	CACert     string
	Cert       string
	Key        string
}

func NewClient(ctx context.Context, address string, tlsOpts *TlsOpts) (*client.Client, error) {
	return client.New(ctx, address, client.WithCredentials(tlsOpts.ServerName, tlsOpts.CACert, tlsOpts.Cert, tlsOpts.Key))
}

package start

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"time"

	"github.com/bufbuild/connect-go"
	"github.com/depot/machine-agent/pkg/api"
	"github.com/depot/machine-agent/pkg/buildkit"
	"github.com/depot/machine-agent/pkg/ec2"
	"github.com/depot/machine-agent/pkg/mounts"
	cloudv1 "github.com/depot/machine-agent/pkg/proto/depot/cloud/v1"
	"github.com/spf13/cobra"
)

func New() *cobra.Command {
	cmd := &cobra.Command{
		Use: "start",
		RunE: func(cmd *cobra.Command, args []string) error {
			client := api.NewRPCFromEnv()

			cloudProvider := os.Getenv("DEPOT_CLOUD_PROVIDER")
			if cloudProvider == "" {
				cloudProvider = "aws"
			}
			if cloudProvider != "aws" && cloudProvider != "fly" {
				return fmt.Errorf("unsupported cloud provider: %s", cloudProvider)
			}

			var doc string
			var signature string
			var err error

			if cloudProvider == "aws" {
				doc, signature, err = ec2.GetSignedIdentity()
				if err != nil {
					return err
				}
			}

			// With Fly, we send the registration token from the environment.
			if cloudProvider == "fly" {
				doc = ""
				signature = os.Getenv("DEPOT_CLOUD_REGISTRATION_TOKEN")
				if signature == "" {
					return fmt.Errorf("DEPOT_CLOUD_REGISTRATION_TOKEN must be set")
				}
			}

			req := cloudv1.RegisterMachineRequest{
				ConnectionId: api.GetConnectionID(),
				Cloud:        cloudv1.RegisterMachineRequest_CLOUD_AWS,
				Document:     doc,
				Signature:    signature,
			}
			if cloudProvider == "fly" {
				req.Cloud = cloudv1.RegisterMachineRequest_CLOUD_FLY
			}

			res, err := client.RegisterMachine(context.Background(), api.WithHeaders(connect.NewRequest(&req), ""))
			if err != nil {
				return err
			}

			fmt.Printf("Registered machine: %+v\n", res)
			machineID := res.Msg.MachineId

			if cloudProvider == "aws" {
				for _, mount := range res.Msg.Mounts {
					err := mounts.EnsureMounted(mount.Device, mount.Path)
					if err != nil {
						return err
					}
				}
			}
			// Fly machines have already mounted their volumes

			if res.Msg.Kind == cloudv1.RegisterMachineResponse_KIND_BUILDKIT {
				err = os.WriteFile("/etc/buildkit/tls.crt", []byte(res.Msg.Cert.Cert), 0644)
				if err != nil {
					return err
				}
				err = os.WriteFile("/etc/buildkit/tls.key", []byte(res.Msg.Cert.Key), 0644)
				if err != nil {
					return err
				}
				err = os.WriteFile("/etc/buildkit/tlsca.crt", []byte(res.Msg.CaCert.Cert), 0644)
				if err != nil {
					return err
				}

				buildkitClient, err := buildkit.NewClient(context.Background(), "tcp://127.0.0.1:443", &buildkit.TlsOpts{
					ServerName: "localhost",
					Cert:       "/etc/buildkit/tls.crt",
					Key:        "/etc/buildkit/tls.key",
					CACert:     "/etc/buildkit/tlsca.crt",
				})
				if err != nil {
					return err
				}

				token := res.Msg.Token

				go func() {
					for {
						info, err := buildkitClient.ListWorkers(context.Background())
						if err != nil {
							fmt.Printf("error listing workers: %v\n", err)
						} else {
							fmt.Printf("workers: %+v\n", info)

							req := cloudv1.PingMachineHealthRequest{MachineId: machineID}
							res, err := client.PingMachineHealth(context.Background(), api.WithHeaders(connect.NewRequest(&req), token))
							if err != nil {
								fmt.Printf("error reporting health: %v\n", err)
							} else {
								fmt.Printf("reported health: %+v\n", res)
								if res.Msg.ShouldTerminate {
									err := exec.Command("shutdown", "-h", "now").Run()
									if err != nil {
										fmt.Printf("error shutting down: %v\n", err)
									}
								}
							}
						}

						<-time.After(time.Second)
					}
				}()

				for {
					cmd := exec.Command("/usr/bin/buildkitd")
					cmd.Stderr = os.Stderr
					cmd.Stdout = os.Stdout
					err := cmd.Run()
					if err != nil {
						return err
					}
					<-time.After(time.Second)
				}
			}

			return nil
		},
	}
	return cmd
}

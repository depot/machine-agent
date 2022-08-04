package listen

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"time"

	"github.com/depot/machine-agent/pkg/api"
	"github.com/depot/machine-agent/pkg/buildkit"
	"github.com/depot/machine-agent/pkg/ec2"
	"github.com/depot/machine-agent/pkg/mounts"
	"github.com/spf13/cobra"
)

func New() *cobra.Command {
	cmd := &cobra.Command{
		Use: "listen",
		RunE: func(cmd *cobra.Command, args []string) error {
			client := api.NewFromEnv("")

			http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
				fmt.Fprintf(w, "Hello world")
			})

			doc, signature, err := ec2.GetSignedIdentity()
			if err != nil {
				return err
			}
			res, err := client.RegisterMachine(api.RegisterMachineRequest{
				Cloud:     "aws",
				Document:  doc,
				Signature: signature,
			})
			if err != nil {
				return err
			}

			fmt.Printf("Registered machine: %+v\n", res)
			machineID := res.ID
			client = api.NewFromEnv(res.Token)

			for _, mount := range res.Mounts {
				err := mounts.EnsureMounted(mount.Device, mount.Path)
				if err != nil {
					return err
				}
			}

			if res.Kind == "buildkit" {
				err = os.WriteFile("/etc/buildkit/tls.crt", []byte(res.Cert), 0644)
				if err != nil {
					return err
				}
				err = os.WriteFile("/etc/buildkit/tls.key", []byte(res.Key), 0644)
				if err != nil {
					return err
				}
				err = os.WriteFile("/etc/buildkit/tlsca.crt", []byte(res.CaCert), 0644)
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

				go func() {
					for {
						info, err := buildkitClient.ListWorkers(context.Background())
						if err != nil {
							fmt.Printf("error listing workers: %v\n", err)
						} else {
							fmt.Printf("workers: %+v\n", info)
							res, err := client.ReportHealth(machineID)
							if err != nil {
								fmt.Printf("error reporting health: %v\n", err)
							} else {
								fmt.Printf("reported health: %+v\n", res)
								if res.ShouldTerminate {
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

			return http.ListenAndServe(":8080", nil)
		},
	}
	return cmd
}

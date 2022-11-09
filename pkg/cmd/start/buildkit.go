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
	"github.com/depot/machine-agent/pkg/mounts"
	cloudv2 "github.com/depot/machine-agent/pkg/proto/depot/cloud/v2"
	"github.com/depot/machine-agent/pkg/proto/depot/cloud/v2/cloudv2connect"
)

func startBuildKit(client cloudv2connect.MachineServiceClient, task *cloudv2.RegisterMachineResponse_Buildkit, res *cloudv2.RegisterMachineResponse) error {
	for _, mount := range task.Buildkit.Mounts {
		err := mounts.EnsureMounted(mount.Device, mount.Path)
		if err != nil {
			return err
		}
	}

	machineID := res.MachineId
	token := res.Token

	err := os.WriteFile("/etc/buildkit/tls.crt", []byte(task.Buildkit.Cert.Cert), 0644)
	if err != nil {
		return err
	}
	err = os.WriteFile("/etc/buildkit/tls.key", []byte(task.Buildkit.Cert.Key), 0644)
	if err != nil {
		return err
	}
	err = os.WriteFile("/etc/buildkit/tlsca.crt", []byte(task.Buildkit.CaCert.Cert), 0644)
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
			_, err := buildkitClient.ListWorkers(context.Background())
			if err != nil {
				fmt.Printf("error listing workers: %v\n", err)
			} else {
				req := cloudv2.PingMachineHealthRequest{MachineId: machineID}
				res, err := client.PingMachineHealth(context.Background(), api.WithHeaders(connect.NewRequest(&req), token))
				if err != nil {
					fmt.Printf("error reporting health: %v\n", err)
				} else {
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

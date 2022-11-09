package start

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"runtime"
	"time"

	"github.com/depot/machine-agent/internal/build"
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
		req := &cloudv2.PingMachineHealthRequest{MachineId: machineID}
		stream := client.PingMachineHealth(context.Background())
		stream.RequestHeader().Add("User-Agent", fmt.Sprintf("depot-cli/%s/%s/%s", build.Version, runtime.GOOS, runtime.GOARCH))
		stream.RequestHeader().Add("Authorization", "Bearer "+token)

		for {
			_, err := buildkitClient.ListWorkers(context.Background())
			if err != nil {
				fmt.Printf("error listing workers: %v\n", err)
			} else {
				err := stream.Send(req)
				if err != nil {
					fmt.Printf("error reporting health: %v\n", err)
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

package start

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"runtime"
	"time"

	"github.com/depot/machine-agent/internal/build"
	cloudv2 "github.com/depot/machine-agent/pkg/proto/depot/cloud/v2"
	"github.com/depot/machine-agent/pkg/proto/depot/cloud/v2/cloudv2connect"
)

func startGitHubActions(client cloudv2connect.MachineServiceClient, task *cloudv2.RegisterMachineResponse_GithubActions, res *cloudv2.RegisterMachineResponse) error {
	machineID := res.MachineId
	token := res.Token

	running := true
	defer func() {
		running = false
	}()
	go func() {
		req := &cloudv2.PingMachineHealthRequest{MachineId: machineID}
		stream := client.PingMachineHealth(context.Background())
		stream.RequestHeader().Add("User-Agent", fmt.Sprintf("depot-cli/%s/%s/%s", build.Version, runtime.GOOS, runtime.GOARCH))
		stream.RequestHeader().Add("Authorization", "Bearer "+token)

		for {
			if !running {
				res, err := stream.CloseAndReceive()
				if err != nil {
					fmt.Println("error closing stream:", err)
				}

				if res.Msg.ShouldTerminate {
					err := exec.Command("shutdown", "-h", "now").Run()
					if err != nil {
						fmt.Printf("error shutting down: %v\n", err)
					}
				}

				return
			}

			err := stream.Send(req)
			if err != nil {
				fmt.Printf("error reporting health: %v\n", err)
			}

			<-time.After(time.Second)
		}
	}()

	runnerDir := "/home/runner/runners/" + task.GithubActions.RunnerVersion

	cmd := exec.Command(
		"./config.sh",
		"--token", task.GithubActions.RegistrationToken,
		"--name", task.GithubActions.Name,
		"--url", task.GithubActions.Url,
		"--labels", task.GithubActions.Labels,
		"--work", "/home/runner/work",
		"--unattended",
		"--disableupdate",
		"--ephemeral",
	)
	cmd.Dir = runnerDir
	cmd.Stderr = os.Stderr
	cmd.Stdout = os.Stdout
	err := cmd.Run()
	if err != nil {
		return err
	}

	cmd = exec.Command("./run.sh")
	cmd.Dir = runnerDir
	cmd.Stderr = os.Stderr
	cmd.Stdout = os.Stdout
	err = cmd.Run()
	if err != nil {
		return err
	}

	return nil
}

package start

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"time"

	"github.com/bufbuild/connect-go"
	"github.com/depot/machine-agent/pkg/api"
	cloudv2 "github.com/depot/machine-agent/pkg/proto/depot/cloud/v2"
	"github.com/depot/machine-agent/pkg/proto/depot/cloud/v2/cloudv2connect"
)

func startGitHubActions(client cloudv2connect.MachineServiceClient, task *cloudv2.RegisterMachineResponse_GithubActions, res *connect.Response[cloudv2.RegisterMachineResponse]) error {
	machineID := res.Msg.MachineId

	token := res.Msg.Token

	running := true
	defer func() {
		running = false
	}()
	go func() {
		for {
			if !running {
				return
			}

			req := cloudv2.PingMachineHealthRequest{MachineId: machineID}
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

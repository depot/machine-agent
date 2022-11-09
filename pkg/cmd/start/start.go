package start

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/bufbuild/connect-go"
	"github.com/depot/machine-agent/pkg/api"
	"github.com/depot/machine-agent/pkg/ec2"
	cloudv2 "github.com/depot/machine-agent/pkg/proto/depot/cloud/v2"
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
			if cloudProvider != "aws" {
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

			req := cloudv2.RegisterMachineRequest{
				ConnectionId: api.GetConnectionID(),
				Cloud: &cloudv2.RegisterMachineRequest_Aws{
					Aws: &cloudv2.RegisterMachineRequest_AWSRegistration{
						Document:  doc,
						Signature: signature,
					},
				},
			}

			res, err := client.RegisterMachine(context.Background(), api.WithHeaders(connect.NewRequest(&req), ""))
			if err != nil {
				return err
			}

			for {
				switch task := res.Msg.Task.(type) {
				case *cloudv2.RegisterMachineResponse_Pending:
					time.Sleep(1 * time.Second)
					res, err = client.RegisterMachine(context.Background(), api.WithHeaders(connect.NewRequest(&req), ""))
					if err != nil {
						return err
					}

				case *cloudv2.RegisterMachineResponse_Buildkit:
					return startBuildKit(client, task, res)

				case *cloudv2.RegisterMachineResponse_GithubActions:
					return startGitHubActions(client, task, res)

				default:
					return fmt.Errorf("unexpected task: %v", task)
				}
			}
		},
	}
	return cmd
}

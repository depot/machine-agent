package start

import (
	"context"
	"fmt"
	"log"
	"os"

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

			stream, err := client.RegisterMachine(context.Background(), api.WithHeaders(connect.NewRequest(&req), ""))
			if err != nil {
				return err
			}

			for stream.Receive() {
				res := stream.Msg()
				switch task := res.Task.(type) {
				case *cloudv2.RegisterMachineResponse_Pending:
					log.Println("Waiting for task to be assigned...")

				case *cloudv2.RegisterMachineResponse_Buildkit:
					return startBuildKit(client, task, res)

				case *cloudv2.RegisterMachineResponse_GithubActions:
					return startGitHubActions(client, task, res)

				default:
					return fmt.Errorf("unexpected task: %v", task)
				}
			}

			err = stream.Err()
			if err != nil {
				fmt.Printf("error: %+v\n", err)
				return err
			}

			return nil
		},
	}
	return cmd
}

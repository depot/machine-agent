package prepare

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/ec2/imds"
	"github.com/depot/builder-agent/pkg/ec2"
	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
	"github.com/spf13/cobra"
)

func New() *cobra.Command {
	cmd := &cobra.Command{
		Use: "prepare",
		RunE: func(cmd *cobra.Command, args []string) error {
			err := prepullImage("ghcr.io/depot/builder-circleci:main")
			if err != nil {
				return err
			}

			err = prepullImage("ghcr.io/depot/builder-buildkit:main")
			if err != nil {
				return err
			}

			err = prepullImage("ghcr.io/depot/cli:latest")
			if err != nil {
				return err
			}

			ctx := context.Background()
			cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("us-west-2"))
			if err != nil {
				return err
			}
			imdsClient := imds.NewFromConfig(cfg)
			doc, err := imdsClient.GetInstanceIdentityDocument(ctx, &imds.GetInstanceIdentityDocumentInput{})
			if err != nil {
				return err
			}

			fmt.Printf("Identity: %+v\n", doc)

			asgName := os.Getenv("ASG_NAME")
			err = ec2.NotifyReady(doc.Region, asgName, "launching", doc.InstanceID)
			if err != nil {
				return err
			}

			return nil
		},
	}
	return cmd
}

func prepullImage(ref string) error {
	log.Println("Pre-pulling Docker image:", ref)

	ctx := context.Background()
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return err
	}

	reader, err := cli.ImagePull(ctx, ref, types.ImagePullOptions{})
	if err != nil {
		return err
	}

	defer reader.Close()
	_, err = io.Copy(os.Stdout, reader)
	if err != nil {
		return err
	}

	return nil
}

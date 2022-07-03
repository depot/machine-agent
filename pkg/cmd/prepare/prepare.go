package prepare

import (
	"context"
	"fmt"
	"io"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/ec2imds"
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
			imdsClient := ec2imds.New(ec2imds.Options{})
			doc, err := imdsClient.GetInstanceIdentityDocument(ctx, &ec2imds.GetInstanceIdentityDocumentInput{})
			if err != nil {
				return err
			}

			fmt.Printf("Instance ID: %s\n", doc.InstanceID)

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

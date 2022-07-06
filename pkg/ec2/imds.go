package ec2

import (
	"context"
	"io"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/ec2/imds"
)

func GetInstanceIdentity() (*imds.GetInstanceIdentityDocumentOutput, error) {
	ctx := context.Background()
	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return nil, err
	}
	imdsClient := imds.NewFromConfig(cfg)
	return imdsClient.GetInstanceIdentityDocument(ctx, &imds.GetInstanceIdentityDocumentInput{})
}

func GetTargetState() (string, error) {
	ctx := context.Background()
	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return "", err
	}
	imdsClient := imds.NewFromConfig(cfg)
	out, err := imdsClient.GetMetadata(ctx, &imds.GetMetadataInput{Path: "autoscaling/target-lifecycle-state"})
	if err != nil {
		return "", err
	}
	defer out.Content.Close()
	bytes, err := io.ReadAll(out.Content)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

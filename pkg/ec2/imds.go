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

func GetSignedIdentity() (string, string, error) {
	ctx := context.Background()
	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return "", "", err
	}
	imdsClient := imds.NewFromConfig(cfg)

	signatureRes, err := imdsClient.GetDynamicData(ctx, &imds.GetDynamicDataInput{Path: "instance-identity/signature"})
	if err != nil {
		return "", "", err
	}
	defer signatureRes.Content.Close()
	signature, err := io.ReadAll(signatureRes.Content)
	if err != nil {
		return "", "", err
	}
	documentRes, err := imdsClient.GetDynamicData(ctx, &imds.GetDynamicDataInput{Path: "instance-identity/document"})
	if err != nil {
		return "", "", err
	}
	defer documentRes.Content.Close()
	document, err := io.ReadAll(documentRes.Content)
	if err != nil {
		return "", "", err
	}
	return string(document), string(signature), nil
}

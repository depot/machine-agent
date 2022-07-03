package ec2

import (
	"context"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/autoscaling"
)

func NotifyReady(region, autoScalingGroupName, lifecycleHookName, instanceID string) error {
	ctx := context.Background()

	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion(region))
	if err != nil {
		return err
	}

	client := autoscaling.NewFromConfig(cfg)

	// groupName := ""
	// hookName := ""
	action := "CONTINUE"
	// instanceID := ""

	_, err = client.CompleteLifecycleAction(ctx, &autoscaling.CompleteLifecycleActionInput{
		AutoScalingGroupName:  &autoScalingGroupName,
		LifecycleHookName:     &lifecycleHookName,
		LifecycleActionResult: &action,
		InstanceId:            &instanceID,
	})
	return err
}

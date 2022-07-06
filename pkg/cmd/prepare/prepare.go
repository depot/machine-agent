package prepare

import (
	"fmt"
	"os"

	"github.com/depot/builder-agent/pkg/docker"
	"github.com/depot/builder-agent/pkg/ec2"
	"github.com/spf13/cobra"
)

func New() *cobra.Command {
	cmd := &cobra.Command{
		Use: "prepare",
		RunE: func(cmd *cobra.Command, args []string) error {
			err := docker.PullImage("ghcr.io/depot/builder-circleci:main")
			if err != nil {
				return err
			}

			err = docker.PullImage("ghcr.io/depot/builder-buildkit:main")
			if err != nil {
				return err
			}

			identity, err := ec2.GetInstanceIdentity()
			if err != nil {
				return err
			}

			targetState, err := ec2.GetTargetState()
			if err != nil {
				return err
			}

			fmt.Printf("Identity: %+v\n", identity)
			fmt.Printf("TargetState: %s\n", targetState)

			// If target state is Warmed:Stopped, signal that preparation is complete
			if targetState == "Warmed:Stopped" {
				asgName := os.Getenv("ASG_NAME")
				err = ec2.NotifyReady(identity.Region, asgName, "launching", identity.InstanceID)
				if err != nil {
					return err
				}
			}

			return nil
		},
	}
	return cmd
}

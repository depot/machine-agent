package listen

import (
	"context"
	"fmt"
	"net/http"
	"os"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/ec2/imds"
	"github.com/depot/builder-agent/pkg/ec2"
	"github.com/spf13/cobra"
)

func New() *cobra.Command {
	cmd := &cobra.Command{
		Use: "listen",
		RunE: func(cmd *cobra.Command, args []string) error {
			http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
				fmt.Fprintf(w, "Hello world")
			})

			// Signal to the ASG that we are ready
			asgName := os.Getenv("ASG_NAME")
			if asgName != "" {
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
				_ = ec2.NotifyReady(doc.Region, asgName, "launching", doc.InstanceID)
			}

			return http.ListenAndServe(":8080", nil)
		},
	}
	return cmd
}

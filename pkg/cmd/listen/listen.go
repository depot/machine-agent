package listen

import (
	"fmt"
	"net/http"

	"github.com/depot/machine-agent/pkg/api"
	"github.com/depot/machine-agent/pkg/ec2"
	"github.com/spf13/cobra"
)

func New() *cobra.Command {
	cmd := &cobra.Command{
		Use: "listen",
		RunE: func(cmd *cobra.Command, args []string) error {
			client := api.NewFromEnv("")

			http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
				fmt.Fprintf(w, "Hello world")
			})

			doc, signature, err := ec2.GetSignedIdentity()
			if err != nil {
				return err
			}
			res, err := client.RegisterMachine(api.RegisterMachineRequest{
				Cloud:     "aws",
				Document:  doc,
				Signature: signature,
			})
			if err != nil {
				return err
			}

			fmt.Printf("Registered builder: %+v\n", res)

			return http.ListenAndServe(":8080", nil)
		},
	}
	return cmd
}

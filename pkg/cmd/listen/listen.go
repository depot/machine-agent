package listen

import (
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"time"

	"github.com/depot/machine-agent/pkg/api"
	"github.com/depot/machine-agent/pkg/ec2"
	"github.com/depot/machine-agent/pkg/mounts"
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

			for _, mount := range res.Mounts {
				err := mounts.EnsureMounted(mount.Device, mount.Path)
				if err != nil {
					return err
				}
			}

			if res.Role == "buildkit" {
				os.WriteFile("/etc/buildkit/tls.crt", []byte(res.Cert), 0644)
				os.WriteFile("/etc/buildkit/tls.key", []byte(res.Key), 0644)
				os.WriteFile("/etc/buildkit/tlsca.crt", []byte(res.CaCert), 0644)

				os.WriteFile("/etc/buildkit/buildkitd.toml", []byte(`
root = "/var/lib/buildkit"

[grpc]
address = ["tcp://0.0.0.0:8080"]
[grpc.tls]
cert = "/etc/buildkit/tls.crt"
key = "/etc/buildkit/tls.key"
ca = "/etc/buildkit/tlsca.crt"

[worker.oci]
enabled = true
gc = true
gckeepstorage = 45000000000 # 45GB

[worker.containerd]
enabled = false
`), 0644)

				for {
					cmd := exec.Command("/usr/bin/buildkitd")
					cmd.Stderr = os.Stderr
					cmd.Stdout = os.Stdout
					err := cmd.Run()
					if err != nil {
						return err
					}
					<-time.After(time.Second)
				}
			}

			return http.ListenAndServe(":8080", nil)
		},
	}
	return cmd
}

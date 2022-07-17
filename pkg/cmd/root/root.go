package root

import (
	listenCmd "github.com/depot/machine-agent/pkg/cmd/listen"
	versionCmd "github.com/depot/machine-agent/pkg/cmd/version"
	"github.com/depot/machine-agent/pkg/config"
	"github.com/spf13/cobra"
)

func NewCmdRoot(version, buildDate string) *cobra.Command {
	var cmd = &cobra.Command{
		Use:          "machine-agent <command> [flags]",
		Short:        "Depot machine agent",
		SilenceUsage: true,

		Run: func(cmd *cobra.Command, args []string) {
			_ = cmd.Usage()
		},
	}

	// Initialize config
	_ = config.NewConfig()

	formattedVersion := versionCmd.Format(version, buildDate)
	cmd.SetVersionTemplate(formattedVersion)
	cmd.Version = formattedVersion
	cmd.Flags().Bool("version", false, "Print the version and exit")

	// Child commands
	cmd.AddCommand(listenCmd.New())
	cmd.AddCommand(versionCmd.NewCmdVersion(version, buildDate))

	return cmd
}

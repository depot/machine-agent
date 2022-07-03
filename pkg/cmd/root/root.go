package root

import (
	prepareCmd "github.com/depot/builder-agent/pkg/cmd/prepare"
	versionCmd "github.com/depot/builder-agent/pkg/cmd/version"
	"github.com/depot/builder-agent/pkg/config"
	"github.com/spf13/cobra"
)

func NewCmdRoot(version, buildDate string) *cobra.Command {
	var cmd = &cobra.Command{
		Use:          "builder-agent <command> [flags]",
		Short:        "Depot builder agent",
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
	cmd.AddCommand(prepareCmd.New())
	cmd.AddCommand(versionCmd.NewCmdVersion(version, buildDate))

	return cmd
}

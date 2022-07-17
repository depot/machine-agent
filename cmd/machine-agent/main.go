package main

import (
	"log"
	"os"

	"github.com/depot/machine-agent/internal/build"
	"github.com/depot/machine-agent/pkg/cmd/root"
	"github.com/getsentry/sentry-go"
)

func main() {
	code := runMain()
	os.Exit(code)
}

func runMain() int {
	if os.Getenv("DEPOT_ERROR_TELEMETRY") != "0" {
		err := sentry.Init(sentry.ClientOptions{
			Dsn:         "https://11fe722b8c624d7bb3280cf9342efc79@o1152282.ingest.sentry.io/6546409",
			Environment: build.SentryEnvironment,
			Release:     build.Version,
		})
		if err != nil {
			log.Fatalf("sentry.Init: %s", err)
		}
	}

	buildVersion := build.Version
	buildDate := build.Date

	rootCmd := root.NewCmdRoot(buildVersion, buildDate)

	if err := rootCmd.Execute(); err != nil {
		return 1
	}

	return 0
}

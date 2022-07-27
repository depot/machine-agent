package exec

import (
	"bytes"
	"os/exec"
)

type ExecResult struct {
	Stdout string
	Stderr string
	Exit   int
}

func Exec(command string, args []string, dir string) (*ExecResult, error) {
	cmd := exec.Command(command, args...)
	cmd.Dir = dir

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()

	return &ExecResult{
		Stdout: stdout.String(),
		Stderr: stderr.String(),
		Exit:   cmd.ProcessState.ExitCode(),
	}, err
}

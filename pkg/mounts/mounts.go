package mounts

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"time"

	"github.com/depot/machine-agent/pkg/exec"
)

func EnsureMounted(device, path string) error {
	err := WaitForDevice(device)
	if err != nil {
		return err
	}

	realDevice, err := filepath.EvalSymlinks(device)
	if err != nil {
		return err
	}

	re := regexp.MustCompile(fmt.Sprintf("^%s %s ", realDevice, path))
	mounts, err := os.ReadFile("/proc/mounts")
	if err != nil {
		return err
	}
	if re.Match(mounts) {
		log.Printf("%s already mounted at %s\n", device, path)
		return nil
	}

	res, _ := exec.Exec("blkid", []string{realDevice}, "")
	if res.Stdout == "" {
		log.Printf("Creating filesystem on %s\n", device)
		res, err = exec.Exec("mkfs", []string{"-t", "ext4", "-T", "news", realDevice}, "")
		if err != nil {
			return err
		}
		log.Printf("%s\n", res.Stderr)
	}

	log.Printf("Mounting %s at %s\n", device, path)
	err = os.MkdirAll(path, 0755)
	if err != nil {
		return err
	}
	res, err = exec.Exec("mount", []string{"-t", "ext4", "-o", "defaults", realDevice, path}, "")
	if err != nil {
		return err
	}
	if res.Stderr != "" {
		log.Printf("%s\n", res.Stderr)
	}

	return nil
}

func WaitForDevice(device string) error {
	for {
		log.Printf("Waiting for device %s\n", device)
		path, err := filepath.EvalSymlinks(device)
		if err == nil {
			info, err := os.Stat(path)
			fmt.Printf("%+v\n", path)
			fmt.Printf("%+v\n", info)
			fmt.Printf("%+v\n", err)
			if err == nil && info.Mode()&os.ModeDevice != 0 {
				return nil
			}
		}
		<-time.After(time.Second)
	}
}

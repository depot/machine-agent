#!/bin/bash
set -e

rm -rf dist/artifacts
pnpm build:ts
pnpm build:binaries

cd dist

mkdir -p machine-agent_linux_x64/bin
mkdir -p machine-agent_linux_arm64/bin

cp machine-agent-x64 machine-agent_linux_x64/bin/machine-agent
cp machine-agent-arm64 machine-agent_linux_arm64/bin/machine-agent

mkdir -p artifacts
tar -czf artifacts/machine-agent_linux_x64.tar.gz -C machine-agent_linux_x64 .
tar -czf artifacts/machine-agent_linux_arm64.tar.gz -C machine-agent_linux_arm64 .

cd artifacts
sha256sum * > machine-agent_checksums.txt

#!/bin/bash
set -e

VERSION="${VERSION:-dev}"

rm -rf dist/artifacts
pnpm build:ts --define:process.env.DEPOT_MACHINE_AGENT_VERSION=\"${VERSION}\"
pnpm build:binaries

cd dist

mkdir -p machine-agent_linux_amd64/bin
mkdir -p machine-agent_linux_arm64/bin

cp machine-agent-x64 machine-agent_linux_amd64/bin/machine-agent
cp machine-agent-arm64 machine-agent_linux_arm64/bin/machine-agent

mkdir -p artifacts
cd machine-agent_linux_amd64
tar -czf ../artifacts/machine-agent_linux_amd64.tar.gz *
cd ..
cd machine-agent_linux_arm64
tar -czf ../artifacts/machine-agent_linux_arm64.tar.gz *
cd ..

cd artifacts
sha256sum * > machine-agent_checksums.txt

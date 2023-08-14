
ARG buildkit=ghcr.io/depot/buildkit:v0.11.6-depot.15
FROM ${buildkit} AS buildkit-source

FROM scratch AS buildkit-amd64
COPY --link --from=buildkit-source /usr/bin/buildctl /usr/bin/
COPY --link --from=buildkit-source /usr/bin/buildkit-qemu-aarch64 /usr/bin/
COPY --link --from=buildkit-source /usr/bin/buildkit-qemu-i386 /usr/bin/
COPY --link --from=buildkit-source /usr/bin/buildkit-qemu-mips64 /usr/bin/
COPY --link --from=buildkit-source /usr/bin/buildkit-qemu-mips64el /usr/bin/
COPY --link --from=buildkit-source /usr/bin/buildkit-qemu-ppc64le /usr/bin/
COPY --link --from=buildkit-source /usr/bin/buildkit-qemu-riscv64 /usr/bin/
COPY --link --from=buildkit-source /usr/bin/buildkit-qemu-s390x /usr/bin/
COPY --link --from=buildkit-source /usr/bin/buildkit-runc /usr/bin/
COPY --link --from=buildkit-source /usr/bin/buildkitd /usr/bin/

FROM scratch AS buildkit-arm64
COPY --link --from=buildkit-source /usr/bin/buildctl /usr/bin/
COPY --link --from=buildkit-source /usr/bin/buildkit-qemu-i386 /usr/bin/
COPY --link --from=buildkit-source /usr/bin/buildkit-qemu-mips64 /usr/bin/
COPY --link --from=buildkit-source /usr/bin/buildkit-qemu-mips64el /usr/bin/
COPY --link --from=buildkit-source /usr/bin/buildkit-qemu-ppc64le /usr/bin/
COPY --link --from=buildkit-source /usr/bin/buildkit-qemu-riscv64 /usr/bin/
COPY --link --from=buildkit-source /usr/bin/buildkit-qemu-s390x /usr/bin/
COPY --link --from=buildkit-source /usr/bin/buildkit-qemu-x86_64 /usr/bin/
COPY --link --from=buildkit-source /usr/bin/buildkit-runc /usr/bin/
COPY --link --from=buildkit-source /usr/bin/buildkitd /usr/bin/

ARG TARGETARCH
FROM buildkit-$TARGETARCH AS buildkit

FROM ubuntu:20.04 AS base

ENV DEBIAN_FRONTEND=noninteractive
RUN \
  apt-get update && \
  apt-get install -y ca-certificates curl openssl && \
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
  apt-get install -y nodejs && \
  rm -rf /var/lib/apt/lists/*

FROM base AS build

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM base

RUN \
  apt-get update && \
  apt-get install -y git openssh-client pigz xz-utils && \
  curl --silent --remote-name --location https://github.com/ceph/ceph/raw/quincy/src/cephadm/cephadm && \
  chmod +x cephadm && \
  ./cephadm add-repo --release quincy && \
  ./cephadm install ceph-common && \
  rm -rf /var/lib/apt/lists/*

COPY --link --from=buildkit /usr/bin/ /usr/bin/
COPY --link --from=build /app/dist /app/dist

ARG VERSION=dev
ENV VERSION=${VERSION}
WORKDIR /app
CMD ["node", "/app/dist/index.js"]

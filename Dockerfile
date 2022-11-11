FROM node:18 AS build

ENV PKG_CACHE_PATH=/tmp/pkg-cache
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable
RUN pnpm install --frozen-lockfile
COPY . .
RUN --mount=type=cache,target=/tmp/pkg-cache pnpm build

FROM scratch
COPY --from=build /app/dist/artifacts/ /

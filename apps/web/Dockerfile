# syntax=docker/dockerfile:1

ARG NODE_VERSION=24-alpine

FROM node:${NODE_VERSION} AS build

WORKDIR /repo

ENV CI=true

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json biome.json ./
COPY apps/web/package.json apps/web/package.json

RUN pnpm install --frozen-lockfile --filter web...

COPY . .

RUN pnpm --filter web build

FROM nginxinc/nginx-unprivileged:1.29-alpine AS runtime

USER root

RUN apk upgrade --no-cache

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chmod=755 apps/web/docker-entrypoint.d/40-generate-config-json.sh /docker-entrypoint.d/40-generate-config-json.sh
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html

USER 101

EXPOSE 8080

# syntax=docker/dockerfile:1

ARG NODE_VERSION=24-alpine

FROM node:${NODE_VERSION} AS deps

WORKDIR /repo

ENV CI=true

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json biome.json ./
COPY apps/idp/package.json apps/idp/package.json

RUN pnpm install --frozen-lockfile --filter idp...

FROM deps AS build

COPY . .

RUN pnpm turbo run build --filter=idp

FROM node:${NODE_VERSION} AS runtime

WORKDIR /repo

ENV NODE_ENV=production \
    IDP_APP_ENV=production \
    IDP_HOST=0.0.0.0 \
    IDP_PORT=3001

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/idp/package.json apps/idp/package.json

RUN pnpm install --prod --no-optional --frozen-lockfile --filter idp...

RUN rm -rf \
    /root/.cache/node/corepack \
    /usr/local/bin/corepack \
    /usr/local/bin/npm \
    /usr/local/bin/npx \
    /usr/local/bin/pnpm \
    /usr/local/bin/pnpx \
    /usr/local/lib/node_modules/corepack \
    /usr/local/lib/node_modules/npm

COPY --from=build /repo/apps/idp/dist apps/idp/dist

USER node

EXPOSE 3001

CMD ["node", "apps/idp/dist/server.js"]

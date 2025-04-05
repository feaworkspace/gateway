#check=skip=SecretsUsedInArgOrEnv

###################################################################################
FROM node:20-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

###################################################################################
FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

###################################################################################
FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run --filter=workspace-server build

###################################################################################
FROM base

LABEL org.opencontainers.image.source=https://github.com/feavy/workspace
LABEL org.opencontainers.image.description="Workspace Server Docker Image"
LABEL org.opencontainers.image.licenses=MIT

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/apps/server/.output /app/dist
COPY --from=build /app/apps/server/entrypoint.sh /app/entrypoint.sh

ENV GOOGLE_APPLICATION_CREDENTIALS=/app/serviceAccountKey.json
ENV NITRO_PORT=8080
EXPOSE 8080

ENTRYPOINT [ "/app/entrypoint.sh" ]

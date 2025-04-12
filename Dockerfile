#check=skip=SecretsUsedInArgOrEnv

FROM node:20-slim AS base

LABEL org.opencontainers.image.source=https://github.com/feaworkspace/gateway
LABEL org.opencontainers.image.description="Workspace Gateway Docker Image"
LABEL org.opencontainers.image.licenses=MIT

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# FROM base AS build
COPY . /app
WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# FROM base AS app

# COPY --from=build /app /app
WORKDIR /app

ENV GOOGLE_APPLICATION_CREDENTIALS=/app/serviceAccountKey.json
ENV PORT=28543
EXPOSE 28543

ENTRYPOINT [ "/app/entrypoint.sh" ]

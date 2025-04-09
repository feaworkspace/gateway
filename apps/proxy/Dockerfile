#check=skip=SecretsUsedInArgOrEnv

FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
# RUN pnpm run -r build
RUN pnpm deploy --filter=proxy --prod /prod/app

FROM base AS app

LABEL org.opencontainers.image.source=https://github.com/feavy/workspace
LABEL org.opencontainers.image.description="Workspace Proxy Docker Image"
LABEL org.opencontainers.image.licenses=MIT

COPY --from=build /prod/app /prod/app
COPY --from=build /usr/src/app/apps/proxy/entrypoint.sh /app/entrypoint.sh
WORKDIR /prod/app

ENV GOOGLE_APPLICATION_CREDENTIALS=/app/serviceAccountKey.json
ENV PORT=28543
EXPOSE 28543

ENTRYPOINT [ "/app/entrypoint.sh" ]

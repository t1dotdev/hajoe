FROM node:26-alpine AS build
WORKDIR /app
COPY --from=oven/bun:1-alpine /usr/local/bin/bun /usr/local/bin/bun
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM node:26-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY --from=build /app/.output ./.output
# SQL migrations run on first request; uploads live on a Dokploy volume mounted at /data
COPY --from=build /app/drizzle ./drizzle
RUN mkdir -p /data/uploads && chown -R node:node /data
ENV UPLOAD_DIR=/data/uploads
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]

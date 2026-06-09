# App image: builds the frontend and runs the Hono server
FROM node:22-slim
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile && pnpm rebuild esbuild @swc/core
COPY . .
RUN pnpm vite build
EXPOSE 3333
RUN chmod +x /app/docker/entrypoint.sh
CMD ["/app/docker/entrypoint.sh"]

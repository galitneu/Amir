# App image: builds the frontend and runs the Hono server
FROM node:22-slim

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Install dependencies first (better layer caching)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile \
    && pnpm rebuild esbuild @swc/core

# Copy the rest of the source and build the frontend
COPY . .
RUN pnpm vite build

EXPOSE 3333

# entrypoint writes env.json from environment variables, then starts the server
RUN chmod +x /app/docker/entrypoint.sh
CMD ["/app/docker/entrypoint.sh"]

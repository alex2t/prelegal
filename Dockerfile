### Build the frontend as a static export ###
FROM node:22-slim AS frontend-build
WORKDIR /app/frontend

# Support custom CA certificates (e.g., antivirus SSL inspection, corporate proxies)
COPY certificates* /usr/local/share/ca-certificates/
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && \
    update-ca-certificates && \
    rm -rf /var/lib/apt/lists/*
ENV SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt
ENV NODE_EXTRA_CA_CERTS=/etc/ssl/certs/ca-certificates.crt

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

### Backend runtime, serving the static export ###
FROM python:3.11-slim AS backend
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Support custom CA certificates
COPY certificates* /usr/local/share/ca-certificates/
RUN update-ca-certificates
ENV UV_SYSTEM_CERTS=1
ENV SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt

WORKDIR /app
COPY backend/pyproject.toml backend/uv.lock backend/README.md ./
COPY backend/src ./src
RUN uv sync --locked --no-dev

COPY --from=frontend-build /app/frontend/out ./src/backend/static

ENV PATH="/app/.venv/bin:$PATH"
EXPOSE 8000
CMD ["uv", "run", "--no-sync", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

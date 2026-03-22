# ── Stage 1: Build Next.js frontend ──────────────────────────
FROM node:20-slim AS frontend-builder

WORKDIR /build/frontend
COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
ENV NEXT_PUBLIC_API_URL=""
RUN npm run build

# ── Stage 2: Runtime ─────────────────────────────────────────
FROM python:3.11-slim

# Install Node.js 20, nginx, supervisor
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl gnupg nginx supervisor && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Backend deps ──
COPY backend/requirements-local.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements-local.txt

# ── Backend source ──
COPY backend/ ./backend/

# ── Frontend standalone build ──
COPY --from=frontend-builder /build/frontend/.next/standalone ./frontend/
COPY --from=frontend-builder /build/frontend/.next/static ./frontend/.next/static
COPY --from=frontend-builder /build/frontend/public ./frontend/public

# ── Config files ──
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Remove default nginx site
RUN rm -f /etc/nginx/sites-enabled/default

# Copy .env for backend (will be overridden by HF secrets)
COPY backend/.env.example ./backend/.env

EXPOSE 7860

CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

# Multi-Stage Dockerfile for LORCEN-RAG (Production Serving)

# ── Stage 1: Build React Production Frontend ───────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ── Stage 2: Python 3.11 Backend Server ────────────────────────────
FROM python:3.11-slim AS backend

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

WORKDIR /app

# Install OS build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install CPU-only lightweight PyTorch to keep memory footprint under 200MB (prevent 512MB OOM)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install remaining Python requirements
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt


# Copy source code, data indices, and built frontend assets
COPY src/ ./src/
COPY data/ ./data/
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY start.sh ./
RUN chmod +x start.sh

EXPOSE 10000 8000 7860

# Run FastAPI production server via dedicated start.sh
CMD ["./start.sh"]






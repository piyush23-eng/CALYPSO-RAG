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

# Pre-cache model weights during build time to avoid runtime HuggingFace downloads and 502 gateway timeouts
ENV HF_HOME=/app/hf_cache \
    HF_HUB_DISABLE_SYMLINKS_WARNING=1 \
    HF_HUB_ENABLE_HF_TRANSFER=0

RUN mkdir -p /app/hf_cache && \
    python -c "from sentence_transformers import SentenceTransformer, CrossEncoder; SentenceTransformer('BAAI/bge-small-en-v1.5'); CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')"

# Lock runtime to offline mode so it uses pre-cached weights and never contacts HF Hub
ENV TRANSFORMERS_OFFLINE=1 \
    HF_HUB_OFFLINE=1 \
    HF_DATASETS_OFFLINE=1




# Copy source code, data indices, and built frontend assets
COPY src/ ./src/
COPY data/ ./data/
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY start.sh ./
RUN chmod +x start.sh

EXPOSE 10000 8000 7860

# Run FastAPI production server via dedicated start.sh
CMD ["./start.sh"]






#!/bin/bash
export PORT="${PORT:-10000}"
export PYTHONUNBUFFERED=1
export PYTHONPATH=/app

# Auto-build indexes if missing on container boot
if [ ! -f "data/processed/bm25_index.pkl" ]; then
    echo "⚡ Initializing Knowledge Base & Building BM25 index from data/raw..."
    python scripts/build_index.py --raw_dir data/raw --processed_dir data/processed
fi

echo "🚀 Starting LORCEN-RAG Server on 0.0.0.0:$PORT..."
exec python -m uvicorn src.api.server:app --host 0.0.0.0 --port "$PORT" --log-level info



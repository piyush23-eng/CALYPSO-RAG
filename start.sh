#!/bin/bash
export PORT="${PORT:-10000}"
export PYTHONUNBUFFERED=1
export PYTHONPATH=/app
echo "🚀 Starting LORCEN-RAG Server on 0.0.0.0:$PORT..."
exec python -m uvicorn src.api.server:app --host 0.0.0.0 --port "$PORT" --log-level info


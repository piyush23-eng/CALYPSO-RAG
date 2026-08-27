#!/bin/bash
PORT="${PORT:-10000}"
echo "🚀 Starting LORCEN-RAG Server on 0.0.0.0:$PORT..."
exec uvicorn src.api.server:app --host 0.0.0.0 --port "$PORT"

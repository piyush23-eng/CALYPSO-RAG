# 🚀 LORCEN-RAG Deployment Guide

LORCEN-RAG is containerized with multi-stage Docker builds and supports 1-click cloud hosting.

---

## 🌟 Option 1: Deploy on Render (Recommended Free/Easy Web Service)

1. Go to **[Render.com](https://render.com/)** and connect your GitHub repository: `https://github.com/piyush23-eng/LORCEN-RAG`.
2. Click **New +** $\to$ **Web Service**.
3. Select **Docker** environment (Render will automatically detect `Dockerfile`).
4. Set the port to `8000`.
5. Click **Create Web Service**.

*Alternatively, use Render Blueprint with the included `render.yaml`.*

---

## 🌟 Option 2: Deploy on Hugging Face Spaces (Docker Space)

1. Go to **[Hugging Face Spaces](https://huggingface.co/new-space)**.
2. Select **Space SDK: Docker** (Blank).
3. Clone the Space repo or link your GitHub repo.
4. Push `Dockerfile`, `requirements.txt`, `src/`, `data/`, and `frontend/`.
5. HF Spaces will automatically build the container and serve on port `7860` / `8000`.

---

## 🌟 Option 3: Deploy on Railway / Fly.io

### Railway:
1. Link your GitHub repo on **[Railway.app](https://railway.app/)**.
2. Railway will automatically build using the `Dockerfile` and expose the web service.

### Fly.io:
```bash
fly launch
fly deploy
```

---

## 🌟 Option 4: Local Docker Run

```bash
# Build production multi-stage container
docker build -t lorcen-rag .

# Run container on port 8000
docker run -p 8000:8000 lorcen-rag
```

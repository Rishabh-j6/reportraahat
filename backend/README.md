---
title: ReportRaahat API
emoji: 🏥
colorFrom: orange
colorTo: green
sdk: docker
app_port: 7860
pinned: true
short_description: AI-powered medical report simplifier for rural India
---

# ReportRaahat API

FastAPI backend for ReportRaahat — AI-powered medical report analyzer for rural India.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/analyze/` | Analyze medical report (base64 image or PDF) |
| `POST` | `/chat/` | Chat with Dr. Raahat AI doctor |
| `GET`  | `/nutrition` | Nutrition recommendations by dietary flags |
| `GET`  | `/exercise` | Weekly exercise plan by condition |
| `GET`  | `/health` | Health check |
| `GET`  | `/docs` | Interactive API docs |

## Environment Variables

Set these in **Space Settings → Repository secrets**:

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | OpenRouter API key for LLM access |
| `HF_TOKEN` | Hugging Face token for model loading |

# ReportRaahat
> Samjho Apni Sehat. Jiyo Ek Behtar Zindagi.

AI-Powered Medical Report Simplifier — HackerzStreet 4.0 | MUJ Healthcare

---

## Stack
- **Frontend:** Next.js 15 + TypeScript + Tailwind + Framer Motion
- **Backend:** FastAPI + Python

## Team
| Member | Role | Branch |
|--------|------|--------|
| Member 1 (ML) | Fine-tuning, RAG, FastAPI ML routes | `feature/ml-backend` |
| Member 2 (FE) | Upload page, Dashboard, Bento Grid | `feature/dashboard` |
| Member 3 (FE) | Chat, Avatar, Gamification | `feature/chat-avatar` |
| Member 4 (BE) | Zustand store, Nutrition, Exercise, FastAPI non-ML | `feature/nutrition-wellness` |

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
```

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

## Branching Rules
```
main  ←  stable demo-ready only
dev   ←  merge here first, never push direct to main
  ├── feature/ml-backend
  ├── feature/dashboard
  ├── feature/chat-avatar
  └── feature/nutrition-wellness
```

## Day 1 Handshakes (do before writing feature code)
1. **Member 1** publishes `backend/app/schemas.py` Pydantic models
2. **Member 4** publishes `frontend/lib/store.ts` GUCType interface
3. **Member 3** defines `addXP(n)` and `setAvatarState(s)` actions in store
4. All members agree on `NEXT_PUBLIC_API_URL` in `.env.local`

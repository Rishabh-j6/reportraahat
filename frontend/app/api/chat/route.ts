// OWNER: Member 1 (ML Engineer)
// POST /api/chat
// Accepts: { message, session_id, language, report_context, chat_history }
// Returns: { answer: string }
// Logic:
//   Forward to FastAPI POST /chat
//   FastAPI injects full GUC as Dr. Raahat system prompt
//   Uses OpenRouter (mistral-7b or llama-3-8b, free)

import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  // TODO Member 1: implement
  return NextResponse.json({ answer: "Chat route — Member 1" })
}

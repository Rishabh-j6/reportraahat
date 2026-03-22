// POST /api/chat
// Accepts: { message, history, guc }
// Forwards to FastAPI POST /chat
// Returns: { reply: string }

import { NextRequest, NextResponse } from "next/server"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
const TIMEOUT_MS = 12_000

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, history = [], guc = {} } = body

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 })
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history, guc }),
      signal: controller.signal,
    })
    clearTimeout(timer)

    if (!res.ok) {
      const errText = await res.text().catch(() => "Unknown error")
      console.error("[chat] Backend error:", res.status, errText)
      return NextResponse.json(
        { reply: "Sorry, I'm having trouble connecting right now. Please try again." },
        { status: 200 } // Return 200 so the UI shows the fallback message
      )
    }

    const data = await res.json()
    return NextResponse.json({ reply: data.reply ?? data.answer ?? "I'm here to help." })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("[chat] Error:", message)
    return NextResponse.json(
      { reply: "Sorry, the doctor is unavailable right now. Please try again in a moment." },
      { status: 200 }
    )
  }
}

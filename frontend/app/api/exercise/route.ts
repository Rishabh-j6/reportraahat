// POST /api/exercise
// Proxies to backend POST /exercise/

import { NextRequest, NextResponse } from "next/server"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
const TIMEOUT_MS = 10_000

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const res = await fetch(`${API_BASE}/exercise/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    clearTimeout(timer)

    if (!res.ok) {
      return NextResponse.json({ error: "Exercise API error" }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { error: "Exercise service unavailable" },
      { status: 503 }
    )
  }
}

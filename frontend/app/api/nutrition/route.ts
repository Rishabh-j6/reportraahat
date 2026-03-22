// POST /api/nutrition
// Proxies to backend POST /nutrition/
// Accepts: { dietary_flags, allergy_flags, vegetarian }

import { NextRequest, NextResponse } from "next/server"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
const TIMEOUT_MS = 10_000

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const res = await fetch(`${API_BASE}/nutrition/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    clearTimeout(timer)

    if (!res.ok) {
      // Try fallback
      const fallback = await fetch(`${API_BASE}/nutrition/fallback`)
      if (fallback.ok) {
        const data = await fallback.json()
        return NextResponse.json(data)
      }
      return NextResponse.json({ error: "Nutrition API error" }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    // Try fallback on timeout/error
    try {
      const fallback = await fetch(`${API_BASE}/nutrition/fallback`)
      if (fallback.ok) {
        const data = await fallback.json()
        return NextResponse.json(data)
      }
    } catch { /* ignore */ }

    return NextResponse.json(
      { error: "Nutrition service unavailable" },
      { status: 503 }
    )
  }
}

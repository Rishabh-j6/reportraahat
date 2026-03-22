import { NextRequest, NextResponse } from "next/server"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
const TIMEOUT_MS = 8000

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { imageBase64, language = "EN" } = body

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
      const res = await fetch(`${API_BASE}/analyze/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_base64: imageBase64, language }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (!res.ok) throw new Error(`Backend returned ${res.status}`)

      const data = await res.json()
      return NextResponse.json(data)
    } catch (err) {
      clearTimeout(timeout)
      throw err
    }
  } catch {
    // Signal frontend to use mock fallback
    return NextResponse.json(null, { status: 503 })
  }
}

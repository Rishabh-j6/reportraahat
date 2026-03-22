// POST /api/analyze-report
// Accepts FormData with: file (File), language (string)
// Forwards to FastAPI POST /analyze as multipart/form-data
// Returns: ParsedReport-shaped JSON

import { NextRequest, NextResponse } from "next/server"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
const TIMEOUT_MS = 15_000

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const language = (formData.get("language") as string) || "EN"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Build FormData for the backend
    const backendForm = new FormData()
    backendForm.append("file", file)
    backendForm.append("language", language)

    // Call the backend with timeout
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

    const res = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      body: backendForm,
      signal: controller.signal,
    })
    clearTimeout(timer)

    if (!res.ok) {
      const errText = await res.text().catch(() => "Unknown error")
      console.error("[analyze-report] Backend error:", res.status, errText)
      return NextResponse.json(
        { error: "Backend analysis failed", detail: errText },
        { status: res.status }
      )
    }

    const data = await res.json()

    // Transform backend AnalyzeResponse → frontend ParsedReport shape
    const report = {
      is_readable: data.is_readable,
      report_type: data.report_type,
      findings: (data.findings ?? []).map((f: Record<string, unknown>) => ({
        parameter: f.parameter,
        value: String(f.value),
        unit: f.unit ?? "",
        normal_range: f.normal_range ?? "",
        status: f.status,
        simple_name_hindi: f.simple_name_hindi ?? f.parameter,
        simple_name_english: f.simple_name_english ?? f.parameter,
        layman_explanation_hindi: f.layman_explanation_hindi ?? "",
        layman_explanation_english: f.layman_explanation_english ?? "",
        indian_population_mean: f.indian_population_mean ?? null,
        indian_population_std: f.indian_population_std ?? null,
        status_vs_india: f.status_vs_india ?? "",
      })),
      affected_organs: data.affected_organs ?? [],
      overall_summary_hindi: data.overall_summary_hindi ?? "",
      overall_summary_english: data.overall_summary_english ?? "",
      severity_level: data.severity_level ?? "NORMAL",
      dietary_flags: data.dietary_flags ?? [],
      exercise_flags: data.exercise_flags ?? [],
      ai_confidence_score: data.ai_confidence_score ?? 0,
      grounded_in: data.grounded_in ?? "",
      disclaimer: data.disclaimer ?? "AI-generated. Always consult a qualified doctor.",
    }

    return NextResponse.json(report)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error"
    if (message.includes("abort")) {
      console.error("[analyze-report] Request timed out after", TIMEOUT_MS, "ms")
      return NextResponse.json(
        { error: "Analysis timed out – using fallback", useMock: true },
        { status: 504 }
      )
    }
    console.error("[analyze-report] Error:", message)
    return NextResponse.json(
      { error: "Failed to analyze report", detail: message, useMock: true },
      { status: 500 }
    )
  }
}

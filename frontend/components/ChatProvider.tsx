"use client"
import { useGUCStore } from "@/lib/store"
import DoctorChat from "@/components/DoctorChat"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export default function ChatProvider() {
  const store = useGUCStore()

  const handleSend = async (message: string): Promise<string> => {
    const guc = {
      name: store.profile.name,
      age: store.profile.age,
      gender: store.profile.gender,
      language: store.profile.language,
      location: store.profile.location,
      latestReport: store.latestReport,
      mentalWellness: store.mentalWellness,
      medicationsActive: store.medicationsActive,
      allergyFlags: store.allergyFlags,
    }

    store.appendChatMessage("user", message)

    try {
      const res = await fetch(`${API_BASE}/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          guc,
          history: store.chatHistory.slice(-10),
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      const reply: string = data.reply ?? data.answer ?? "I could not process your question right now."
      store.appendChatMessage("assistant", reply)
      return reply
    } catch {
      return "Dr. Raahat is currently unavailable. Please ensure the backend is running and try again."
    }
  }

  return <DoctorChat onSend={handleSend} />
}

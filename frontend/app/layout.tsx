"use client"
import { Inter, Noto_Sans_Devanagari } from "next/font/google"
import Link from "next/link"
import "./globals.css"
import { NavLinks } from "@/components/NavLinks"
import DoctorChat from "@/components/DoctorChat"
import AvatarPanel from "@/components/AvatarPanel"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-devanagari",
})

const navLinks = [
  { label: "Home", to: "/", icon: "" },
  { label: "Dashboard", to: "/dashboard", icon: "" },
  { label: "Avatar", to: "/avatar", icon: "" },
  { label: "Nutrition", to: "/nutrition", icon: "" },
  { label: "Exercise", to: "/exercise", icon: "" },
  { label: "Wellness", to: "/wellness", icon: "" },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${devanagari.variable}`}>
      <body
        className="min-h-screen text-white"
        style={{ background: "#0d0d1a", fontFamily: "var(--font-inter), var(--font-devanagari), system-ui, sans-serif" }}
      >
        {/* Sidebar */}
        <aside
          className="fixed top-0 left-0 h-full w-56 flex flex-col z-30"
          style={{
            background: "rgba(13,13,26,0.95)",
            borderRight: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Subtle ambient glow inside sidebar */}
          <div
            className="absolute top-0 left-0 w-full h-48 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 20% 0%, rgba(255,153,51,0.08) 0%, transparent 70%)",
            }}
          />

          {/* Brand */}
          <div className="relative px-5 pt-7 pb-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 transition-transform group-hover:scale-110"
                style={{ background: "rgba(255,153,51,0.15)", border: "1px solid rgba(255,153,51,0.25)" }}
              >
                🏥
              </div>
              <div className="leading-none">
                <div className="text-xs font-semibold tracking-wide" style={{ color: "rgba(255,255,255,0.35)" }}>
                  Report
                </div>
                <div className="text-base font-black tracking-tight" style={{ color: "#FF9933" }}>
                  Raahat
                </div>
              </div>
            </Link>
          </div>

          {/* Divider */}
          <div className="mx-4 mb-4" style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

          {/* Navigation */}
          <div className="flex-1 px-2 overflow-y-auto">
            <NavLinks links={navLinks} />
          </div>

          {/* Bottom: tagline */}
          <div className="px-5 py-5">
            <p className="text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.2)" }}>
              Made for rural India 🇮🇳
            </p>
          </div>
        </aside>

        {/* Main content area — offset by sidebar */}
        <main className="ml-56 min-h-screen">{children}</main>

        {/* Floating overlays */}
        <DoctorChat onSend={async (msg) => { return "Test response" }} />
        <AvatarPanel />
      </body>
    </html>
  )
}
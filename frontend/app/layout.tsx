"use client"
import { Plus_Jakarta_Sans, Noto_Sans_Devanagari } from "next/font/google"
import "./globals.css"
import { BottomNav, TopBar } from "@/components/NavLinks"
import DoctorChat from "@/components/DoctorChat"
import AvatarPanel from "@/components/AvatarPanel"

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-jakarta",
})

const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-devanagari",
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${jakarta.variable} ${devanagari.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-screen text-on-surface"
        style={{
          background: "#12121f",
          fontFamily: "'Be Vietnam Pro', var(--font-devanagari), system-ui, sans-serif",
        }}
      >
        {/* Top header bar */}
        <TopBar />

        {/* Main content area — full width, padded for top bar + bottom nav */}
        <main className="min-h-screen">{children}</main>

        {/* Bottom navigation */}
        <BottomNav />

        {/* Floating overlays */}
        <DoctorChat onSend={async (msg) => { return "Test response" }} />
        <AvatarPanel />
      </body>
    </html>
  )
}
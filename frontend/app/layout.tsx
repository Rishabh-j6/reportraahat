"use client"
import { Inter } from "next/font/google"
import Link from "next/link"
import "./globals.css"
import { NavLinks } from "@/components/NavLinks"
import ChatProvider from "@/components/ChatProvider"
import AvatarPanel from "@/components/AvatarPanel"

const inter = Inter({ subsets: ["latin"] })

const navLinks = [
  { label: "Home", to: "/", icon: "🏠" },
  { label: "Dashboard", to: "/dashboard", icon: "📊" },
  { label: "Avatar", to: "/avatar", icon: "⚡" },
  { label: "Nutrition", to: "/nutrition", icon: "🥗" },
  { label: "Exercise", to: "/exercise", icon: "🏃" },
  { label: "Wellness", to: "/wellness", icon: "🧘" },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-[#0F172A] text-white`}>
        <aside className="fixed top-0 left-0 h-full w-56 border-r border-[#334155]
          flex flex-col py-8 px-4 bg-[#1E293B]">
          <Link href="/" className="text-2xl font-bold mb-10 px-3 text-[#FF9933]">
            MediSaral
          </Link>
          <NavLinks links={navLinks} />
        </aside>

        <main className="ml-56 min-h-screen">{children}</main>

        <ChatProvider />
        <AvatarPanel />
      </body>
    </html>
  )
}
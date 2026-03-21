import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Link from "next/link"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MediSaral",
  description: "Samjho Apni Sehat",
}

const navLinks = [
  { href: "/",          label: "🏠 Home"      },
  { href: "/dashboard", label: "📊 Dashboard" },
  { href: "/avatar",    label: "⚡ Avatar"     },
  { href: "/nutrition", label: "🥗 Nutrition"  },
  { href: "/exercise",  label: "🏃 Exercise"   },
  { href: "/wellness",  label: "🧘 Wellness"   },
]

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex min-h-screen bg-[#0F172A] text-white`}>

        {/* Side Nav */}
        <aside className="w-56 min-h-screen bg-[#1E293B] border-r border-[#334155]
          flex flex-col px-4 py-6 gap-2 fixed left-0 top-0 z-40">

          {/* Logo */}
          <div className="text-[#FF9933] font-bold text-xl px-3 mb-6">
            MediSaral
          </div>

          {/* Links */}
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-slate-400 hover:text-white hover:bg-[#0F172A]
                px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
            >
              {link.label}
            </Link>
          ))}
        </aside>

        {/* Main content — offset by sidebar width */}
        <main className="ml-56 flex-1 min-h-screen">
          {children}
        </main>

      </body>
    </html>
  )
}
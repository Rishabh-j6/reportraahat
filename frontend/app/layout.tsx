// OWNER: Member 3
// Root layout — nav bar lives here
// Add <AvatarPanel /> and <DoctorChat /> here once store is wired

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ReportRaahat",
  description: "Samjho Apni Sehat. Jiyo Ek Behtar Zindagi.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* TODO Member 3: add nav + AvatarPanel + DoctorChat here */}
        {children}
      </body>
    </html>
  )
}

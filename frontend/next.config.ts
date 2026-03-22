import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Allow the backend URL to be set per environment.
  // In Vercel: set NEXT_PUBLIC_API_URL = https://<your-hf-space>.hf.space
  // Locally:   set NEXT_PUBLIC_API_URL = http://localhost:8000  (or leave blank for default)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  },
}

export default nextConfig

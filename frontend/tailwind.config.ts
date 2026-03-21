import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary:  "#FF9933",
        bg:       "#0F172A",
        surface:  "#1E293B",
        border:   "#334155",
      },
    },
  },
  plugins: [],
}

export default config

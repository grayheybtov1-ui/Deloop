/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        devhub: {
          bg: "#0b0f19",
          card: "#111827",
          border: "#1f2937",
          borderHover: "#374151",
          muted: "#9ca3af",
          accent: "#3b82f6",
          accentHover: "#2563eb",
          purple: "#8b5cf6",
          emerald: "#10b981",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
      }
    },
  },
  plugins: [],
}

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
        Deloop: {
          bg: "var(--bg-main)",
          card: "var(--bg-card)",
          border: "var(--border-color)",
          borderHover: "var(--border-hover)",
          muted: "var(--text-muted)",
          accent: "var(--color-accent)",
          accentHover: "#1d4ed8",
        },
        devhub: {
          bg: "#0b0f19",
          card: "#111827",
          border: "#1f2937",
          borderHover: "#374151",
          muted: "#9ca3af",
          accent: "#3b82f6",
          accentHover: "#2563eb",
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

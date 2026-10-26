/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        Deloop: {
          bg: "var(--bg-main)",
          card: "var(--bg-card)",
          subtle: "var(--bg-subtle)",
          border: "var(--border-color)",
          borderHover: "var(--border-hover)",
          text: "var(--text-main)",
          muted: "var(--text-muted)",
          accent: "var(--color-accent)",
          accentHover: "var(--color-accent-hover)",
          "nav-bg": "var(--nav-bg)",
          "nav-border": "var(--nav-border)",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
        mono: ["SF Mono", "Fira Code", "Consolas", "monospace"],
      },
      screens: {
        xs: "480px",
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-4px)" },
          "40%, 80%": { transform: "translateX(4px)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        shake: "shake 0.4s ease-in-out",
        fadeIn: "fadeIn 0.2s ease-out",
      },
    },
  },
  plugins: [],
}

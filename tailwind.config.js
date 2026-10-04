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
        ig: {
          bg: "var(--bg-main)",
          card: "var(--bg-card)",
          subtle: "var(--bg-subtle)",
          border: "var(--border-color)",
          "border-hover": "var(--border-hover)",
          text: "var(--text-main)",
          muted: "var(--text-muted)",
          accent: "var(--color-accent)",
          "accent-hover": "var(--color-accent-hover)",
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
    },
  },
  plugins: [],
}

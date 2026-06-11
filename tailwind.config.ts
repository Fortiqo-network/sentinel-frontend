import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // All sen.* tokens backed by CSS variables — swap :root / .dark values
        // in globals.css to change the entire theme without touching components.
        sen: {
          bg:          "rgb(var(--sen-bg) / <alpha-value>)",
          surface:     "rgb(var(--sen-surface) / <alpha-value>)",
          "surface-2": "rgb(var(--sen-surface-2) / <alpha-value>)",
          border:      "rgb(var(--sen-border) / <alpha-value>)",
          "border-hi": "rgb(var(--sen-border-hi) / <alpha-value>)",
          gold:        "rgb(var(--sen-gold) / <alpha-value>)",
          "gold-dim":  "rgb(var(--sen-gold-dim) / <alpha-value>)",
          teal:        "rgb(var(--sen-teal) / <alpha-value>)",
          text:        "rgb(var(--sen-text) / <alpha-value>)",
          muted:       "rgb(var(--sen-muted) / <alpha-value>)",
          danger:      "rgb(var(--sen-danger) / <alpha-value>)",
        },
        trust: {
          low:    "#F87171",
          medium: "#FBBF24",
          high:   "#4ADE80",
          elite:  "#22D3EE",
        },
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        "scan-in":    "scanIn 0.45s ease forwards",
        "fade-up":    "fadeUp 0.5s ease forwards",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glowPulse 2.5s ease-in-out infinite",
      },
      keyframes: {
        scanIn: {
          "0%":   { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.35" },
          "50%":      { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sentinel brand: slate base + indigo accent
        sentinel: {
          50: "#f0f4ff",
          100: "#e0e9ff",
          200: "#c7d7fe",
          300: "#a5bafc",
          400: "#8193f8",
          500: "#6366f1", // primary indigo
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        trust: {
          // Trust score colour bands: 0-39 red, 40-69 amber, 70-89 green, 90-100 emerald
          low: "#ef4444",
          medium: "#f59e0b",
          high: "#22c55e",
          elite: "#10b981",
        },
        // Cinematic surface scale — the deep-space canvas the marketing
        // experience is painted on. Distinct from the light-mode app tokens.
        void: {
          950: "#04050a",
          900: "#070811",
          800: "#0b0d1a",
          700: "#111426",
          600: "#1a1e35",
          500: "#262b47",
        },
        // Aurora accents — the indigo→violet→cyan triad used for glows,
        // gradients, and the 3D scene lighting.
        aurora: {
          indigo: "#6366f1",
          violet: "#a78bfa",
          cyan: "#22d3ee",
          blush: "#f472b6",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Fluid display sizes that scale with the viewport for full-screen heroes.
        "display-sm": ["clamp(2.25rem, 6vw, 3.5rem)", { lineHeight: "1.04", letterSpacing: "-0.03em" }],
        display: ["clamp(2.75rem, 9vw, 6rem)", { lineHeight: "0.98", letterSpacing: "-0.035em" }],
        "display-lg": ["clamp(3.25rem, 12vw, 9rem)", { lineHeight: "0.94", letterSpacing: "-0.04em" }],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      backgroundImage: {
        "aurora-radial":
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.35), transparent 70%)",
        "aurora-conic":
          "conic-gradient(from 180deg at 50% 50%, #6366f1, #a78bfa, #22d3ee, #6366f1)",
        "grid-fade":
          "linear-gradient(rgba(255,255,255,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.55) 1px, transparent 1px)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        float: "float 7s ease-in-out infinite",
        "glow-pulse": "glowPulse 4s ease-in-out infinite",
        "gradient-pan": "gradientPan 8s ease infinite",
        "spin-slow": "spin 22s linear infinite",
        "scroll-hint": "scrollHint 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.85" },
        },
        gradientPan: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        scrollHint: {
          "0%": { transform: "translateY(0)", opacity: "0" },
          "40%": { opacity: "1" },
          "80%, 100%": { transform: "translateY(10px)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

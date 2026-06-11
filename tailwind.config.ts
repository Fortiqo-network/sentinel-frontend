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
        // Brand surface — the "ink" canvas the cinematic experience is painted
        // on (Sentinel identity). Distinct from the light-mode app tokens.
        ink: {
          950: "#0B0C0F",
          900: "#0E1014",
          800: "#111318",
          700: "#191C23",
          600: "#23262e",
          500: "#2c2f38",
        },
        // Brand neutrals + the single amber/gold accent (the sealed core).
        porcelain: "#ECEAE3",
        graphite: {
          DEFAULT: "#80848F",
          dim: "#4A4E58",
        },
        gold: {
          DEFAULT: "#E7A03C",
          deep: "#B97718",
        },
        // Cinematic surface scale (legacy alias → ink) kept for any older refs.
        void: {
          950: "#0B0C0F",
          900: "#0E1014",
          800: "#111318",
          700: "#191C23",
          600: "#23262e",
          500: "#2c2f38",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        brand: ["var(--font-archivo)", "system-ui", "sans-serif"],
        "brand-mono": ["var(--font-plex-mono)", "ui-monospace", "monospace"],
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
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(231,160,60,0.18), transparent 70%)",
        "aurora-conic":
          "conic-gradient(from 180deg at 50% 50%, #E7A03C, #ECEAE3, #B97718, #E7A03C)",
        "grid-fade":
          "linear-gradient(rgba(236,234,227,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(236,234,227,0.5) 1px, transparent 1px)",
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

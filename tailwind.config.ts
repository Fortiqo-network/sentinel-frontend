import type { Config } from "tailwindcss";
import { colors } from "./src/lib/design/colors";
import { fontFamily, fontSize } from "./src/lib/design/typography";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors,
      fontFamily,
      fontSize,
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
        "pulse-slow":    "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in":       "fadeIn 0.2s ease-in-out",
        "slide-up":      "slideUp 0.3s ease-out",
        float:           "float 7s ease-in-out infinite",
        "glow-pulse":    "glowPulse 4s ease-in-out infinite",
        "gradient-pan":  "gradientPan 8s ease infinite",
        "spin-slow":     "spin 22s linear infinite",
        "scroll-hint":   "scrollHint 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-14px)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.4" },
          "50%":      { opacity: "0.85" },
        },
        gradientPan: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%":      { backgroundPosition: "100% 50%" },
        },
        scrollHint: {
          "0%":        { transform: "translateY(0)", opacity: "0" },
          "40%":       { opacity: "1" },
          "80%, 100%": { transform: "translateY(10px)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

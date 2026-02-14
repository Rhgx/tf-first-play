import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        fadeOutSlide: {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-8px)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.35s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "fade-in-up": "slideUp 0.45s ease-out forwards",
        "fade-out": "fadeOutSlide 0.25s ease-in forwards",
        "pulse-soft": "pulseSoft 1.2s ease-in-out infinite",
      },
      colors: {
        hud: {
          tanLight: "rgb(var(--hud-tan-light) / <alpha-value>)",
          tanDark: "rgb(var(--hud-tan-dark) / <alpha-value>)",
          black: "rgb(var(--hud-black) / <alpha-value>)",
          orange: "rgb(var(--hud-orange) / <alpha-value>)",
          panel: "rgb(var(--hud-panel) / <alpha-value>)",
        },
      },
      fontFamily: {
        tf2: ["TF2 Secondary", "sans-serif"],
        tf2Build: ["TF2 Build", "sans-serif"],
        tf2Professor: ["TF2 Professor", "serif"],
      },
      boxShadow: {
        hud: "0 0 0 1px rgba(235,226,202,0.2), inset 0 0 0 1px rgba(46,43,42,0.9)",
      },
    },
  },
  plugins: [],
} satisfies Config;

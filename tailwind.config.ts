import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
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

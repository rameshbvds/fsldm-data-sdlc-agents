import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        gold: { 400: "#d4af6a", 500: "#c9a961", 600: "#b08c3f", DEFAULT: "#c9a961" },
        navy: { 900: "#070c1a", 950: "#040814" },
        ocbc: { 50: "#fff5f5", 500: "#ED1C24", 600: "#C8161D", 700: "#A11218", DEFAULT: "#ED1C24" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: { lg: "12px", xl: "16px", "2xl": "20px" },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "border-flow": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out",
        shimmer: "shimmer 3s ease-in-out infinite",
        "border-flow": "border-flow 6s ease infinite",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #d4af6a 0%, #c9a961 50%, #b08c3f 100%)",
        "navy-gradient": "linear-gradient(135deg, #040814 0%, #0a1628 50%, #131e35 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

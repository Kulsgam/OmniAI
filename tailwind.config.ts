import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      black: "#000000",
      white: "#FFFFFF",
      bg: "rgb(var(--theme-background))",
      fg: "rgb(var(--theme-foreground))",
      accent: "rgb(var(--theme-accent))",
      "accent-light": "rgb(var(--theme-accent-light))",
      "accent-dark": "rgb(var(--theme-accent-dark))",
      "accent-darker": "rgb(var(--theme-accent-darker))",
      error: "rgb(var(--theme-error))",
    },
    fontFamily: {
      title: ["var(--font-parkinsans)", "serif"],
      body: ["var(--font-outfit)", "sans-serif"],
    },
  },
  plugins: [],
} satisfies Config;

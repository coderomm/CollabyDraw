import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // primary: "#6758ff",
        // "primary-hover": "#5246cc",
        // "primary-btn-text": "#ffffff",
        // secondary: "#f3f2ff",
        // "secondary-hover": "#e9e8ff",
        // "secondary-btn-text": "#6758ff",
      },
    },
  },
  plugins: [],
} satisfies Config;

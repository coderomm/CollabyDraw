import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs670': '670px',
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        lightb: "#f1f0ff",
        "w-bg": "var(--island-bg-color)",
        "w-text": "var(--w-text)",
        "w-button-hover-bg": "var(--w-button-hover-bg)",
        "default-border-color-dark": "var(--default-border-color-dark)",
        "d-btn-hover-bg": "var(--d-btn-hover-bg)",
        "color-promo": "var(--color-promo)",
        "light-btn-bg": "var(--color-surface-low)",
        "light-btn-bg2": "var(--light-button-bg2)",
        "light-btn-hover-bg": "var(--l-btn-hover-bg)",
        "icon-fill-color": "var(--icon-fill-color)",
        "icon-fill-color-d": "var(--icon-fill-color-d)",
        "text-primary-color": "var(--text-primary-color)",
        "selected-tool-bg-light": "var(--color-surface-primary-container)",
        "selected-tool-bg-dark": "var(--selected-tool-bg-dark)",
        "scrollbar-thumb": "var(--scrollbar-thumb)",
        "scrollbar-thumb-hover": "var(--scrollbar-thumb-hover)",
        "color-slider-track": "var(--color-slider-track)",
        "color-slider-thumb": "var(--color-slider-thumb)",
        "default-border-color": "var(--default-border-color)",
        "color-on-primary-container": "var(--color-on-primary-container)",
        "color-primary": "var(--color-primary)",
        "color-primary-hover": "var(--color-primary-hover)",
        "tool-btn-bg-hover-dark": "var(--tool-btn-bg-hover-dark)",
        "yellow-light": "var(--yellow-light)",
        "yellow-lighter": "var(--yellow-lighter)",
        "yellow-darker": "var(--yellow-darker)",
        "surface-loww": "var(--surface-loww)",
        "form-input": "var(--form-input)",
        "form-input-hover": "var(--form-input-hover)",
        "color-border-input": "var(--color-border-input)",
        "form-color-text": "var(--form-color-text)",
        "color-outline-focus": "var(--color-outline-focus)",
        "brand-active": "var(--brand-active)",
        "brand-hover": "var(--brand-hover)",
        "island-bg-color": "var(--island-bg-color)",
        "dialog-border-color": "var(--dialog-border-color)",
        "loading-text-color": "var(--loading-text-color)",
        "collaby-textfield": "var(--CollabyTextField--background)",
        "collaby-textfield-readonly":
          "var(--CollabyTextField--readonly--background)",
        "color-on-surface": "var(--color-on-surface)",
        "button-hover-bg": "var(--button-hover-bg)",
        "button-active-bg": "var(--button-active-bg)",
        "color-primary-text": "var(--color-primary-text)",
      },
      textColor: {
        "collaby-textfield": "var(--CollabyTextField--color)",
        "collaby-textfield-label": "var(--CollabyTextField--label-color)",
        "collaby-textfield-readonly":
          "var(--CollabyTextField--readonly--color)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      borderColor: {
        "collaby-textfield": "var(--CollabyTextField--border)",
        "collaby-textfield-readonly":
          "var(--CollabyTextField--readonly--border)",
        "collaby-textfield-hover": "var(--CollabyTextField--border-hover)",
        "collaby-textfield-active": "var(--CollabyTextField--border-active)",
        "collaby-textfield-placeholder": "var(--CollabyTextField--placeholder)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        "outline-primary-darkest": "0 0 0 1px var(--color-primary-darkest)",
        "outline-primary-light-darker":
          "0 0 0 1px var(--color-primary-light-darker)",
        "shadow-tool-focus": "0 0 0 1px var(--color-primary-hover)",
        "input-shadow": "0 0 0 1px var(--color-border-input)",
        "modal-shadow":
          "0px 100px 80px rgba(0, 0, 0, .07), 0px 41.7776px 33.4221px rgba(0, 0, 0, .0503198), 0px 22.3363px 17.869px rgba(0, 0, 0, .0417275), 0px 12.5216px 10.0172px rgba(0, 0, 0, .035), 0px 6.6501px 5.32008px rgba(0, 0, 0, .0282725), 0px 2.76726px 2.21381px rgba(0, 0, 0, .0196802)",
        "brand-color-shadow": "0 0 0 1px var(--brand-hover)",
      },
      fontFamily: {
        sans: "var(--font-geist-sans), system-ui, sans-serif",
        mono: "var(--font-geist-mono), monospace",
        assistant: "var(--font-assistant), sans-serif",
        collabyfont: ["Collabyfont", "sans-serif"],
      },
      filter: {
        "canvas-theme-filter": "var(--theme-filter)",
      },
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("tailwindcss-animate"),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("tailwind-scrollbar")({ nocompatible: true }),
  ],
} satisfies Config;

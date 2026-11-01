import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        midnight: {
          DEFAULT: "#101B35",
          50: "#EEF3FD",
          100: "#D7E3FA",
          200: "#B4CBF6",
          300: "#86AAF0",
          400: "#4D80E6",
          500: "#2B5FC7",
          600: "#1D3157",
          700: "#172745",
          800: "#131F38",
          900: "#101B35",
          950: "#0A1122",
        },
        gold: {
          DEFAULT: "#D4AF37",
          50: "#FCF9EE",
          100: "#F7F0D4",
          200: "#EFE0A9",
          300: "#E6CD78",
          400: "#DCB848",
          500: "#D4AF37",
          600: "#B89425",
          700: "#92731C",
          800: "#6C5517",
          900: "#4E3D12",
        },
        surface: {
          DEFAULT: "#F4F6FA",
          card: "#FFFFFF",
          muted: "#EAEFF7",
          subtle: "#F9FAFC",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        premium: "0 10px 25px -5px rgba(16, 27, 53, 0.08), 0 8px 10px -6px rgba(16, 27, 53, 0.04)",
        card: "0 2px 10px 0 rgba(16, 27, 53, 0.04), 0 1px 3px 0 rgba(16, 27, 53, 0.02)",
        gold: "0 4px 14px 0 rgba(212, 175, 55, 0.35)",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [],
};

export default config;


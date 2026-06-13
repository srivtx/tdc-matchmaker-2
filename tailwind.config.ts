import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // V2 warm-neutral palette
        ink: {
          50:  "#faf8f3",
          100: "#f4f1e8",
          200: "#e8e4d6",
          300: "#c9c3b1",
          400: "#9a9382",
          500: "#6b6557",
          600: "#45413a",
          700: "#2a2823",
          800: "#191712",
          900: "#0d0c08",
          950: "#050402",
        },
        ember: {
          50:  "#fdf2ed",
          100: "#f9dccd",
          200: "#f4b69b",
          300: "#ec8e6a",
          400: "#e36640",
          500: "#c84a2e",
          600: "#a33825",
          700: "#7d2b1d",
          800: "#561e15",
          900: "#2f100b",
        },
        moss:  { 500: "#5a7a4f", 50: "#e2ebd9" },
        honey: { 500: "#c08a2c", 50: "#f3e8d0" },
        slate: { 500: "#5a6878", 50: "#e0e3e8" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
        serif: ["'Instrument Serif'", "Georgia", "serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        sm: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
};
export default config;

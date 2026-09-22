/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#047857",
          light: "#059669",
          dark: "#064e3b",
          deep: "#022c22",
        },
        gold: {
          DEFAULT: "#d97706",
          light: "#f59e0b",
          dark: "#b45309",
        },
        islamic: {
          bg: "#f8faf9",
          "dark-bg": "#03130c",
          "dark-card": "#082216",
          "dark-border": "#113824",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        arabic: ["'Amiri Quran'", "'Amiri'", "serif"],
        urdu: ["'Noto Nastaliq Urdu'", "'Jameel Noori Nastaleeq'", "'Amiri'", "serif"]
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      }
    },
  },
  plugins: [],
};

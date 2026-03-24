/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        primary: "#13ec80",
        "primary-dark": "#0fba66",
        "background-light": "#f6f8f7",
        "background-dark": "#102219",
        "sidebar-border": "#283930",
        "card-dark": "#1a2e24",
        "slate-850": "#1a2520",
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
      },
    },
  },
  plugins: [],
}


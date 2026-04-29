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
        "background-dark": "#0d1a12",
        "sidebar-border": "#1e2f22",
        "card-dark": "#121f17",
        "surface-2": "#1a2d1f",
        "border-subtle": "#1e2f22",
        "border-medium": "#2a4032",
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
      },
    },
  },
  plugins: [],
}


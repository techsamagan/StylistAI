/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        // ASANUR — quiet luxury (espresso). `primary` is the single champagne accent.
        primary: "#B7A98F",        // champagne (was green #13ec80)
        "primary-dark": "#9C8E74",
        champagne: "#B7A98F",
        ink: "#16140F",
        bone: "#F6F3EC",
        clay: "#8C8175",
        // espresso surfaces (dark canvas)
        "background-light": "#F6F3EC",
        "background-dark": "#17120E",
        "card-dark": "#1E1813",
        "surface-2": "#251D16",
        "sidebar-border": "#33291F",
        "border-subtle": "#33291F",
        "border-medium": "#43372A",
      },
      fontFamily: {
        // `display` is the workhorse UI/body font (was Manrope).
        display: ["Instrument Sans", "system-ui", "sans-serif"],
        sans: ["Instrument Sans", "system-ui", "sans-serif"],
        // `serif` carries the ASANUR wordmark + editorial headlines.
        serif: ["Fraunces", "Georgia", "serif"],
      },
      letterSpacing: {
        wordmark: "0.34em",
      },
    },
  },
  plugins: [],
}

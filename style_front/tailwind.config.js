/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        // FitCheck AI — Luxury Fashion. Semantic tokens backed by CSS vars in index.css.
        // Light = ivory + gold; .dark = espresso + gold. Same classes, both themes.
        canvas:        "rgb(var(--c-canvas) / <alpha-value>)",   // app background
        card:          "rgb(var(--c-card) / <alpha-value>)",     // raised surface / cards
        field:         "rgb(var(--c-field) / <alpha-value>)",    // inputs / sunken
        beige:         "rgb(var(--c-beige) / <alpha-value>)",    // secondary warm surface
        line:          "rgb(var(--c-line) / <alpha-value>)",     // hairline border
        "line-strong": "rgb(var(--c-line-strong) / <alpha-value>)",
        fg:            "rgb(var(--c-fg) / <alpha-value>)",       // primary text
        muted:         "rgb(var(--c-muted) / <alpha-value>)",    // secondary text
        subtle:        "rgb(var(--c-subtle) / <alpha-value>)",   // tertiary/faint text
        gold:          "rgb(var(--c-gold) / <alpha-value>)",     // luxury gold accent (fills/borders)
        "gold-soft":   "rgb(var(--c-gold-soft) / <alpha-value>)",// readable gold for text labels
        primary:       "rgb(var(--c-gold) / <alpha-value>)",     // alias -> gold
        "primary-dark":"rgb(var(--c-gold-dark) / <alpha-value>)",
        error:         "rgb(var(--c-error) / <alpha-value>)",
        success:       "rgb(var(--c-success) / <alpha-value>)",
        // fixed (do not theme): dark text that always sits on gold fills
        charcoal: "#1F2937",
        clay: "#8C8175",
        champagne: "#B7A98F",
        // legacy aliases -> tokens so any stray refs stay coherent in both themes
        ink:               "rgb(var(--c-fg) / <alpha-value>)",
        bone:              "rgb(var(--c-canvas) / <alpha-value>)",
        "background-light":"rgb(var(--c-canvas) / <alpha-value>)",
        "background-dark": "rgb(var(--c-canvas) / <alpha-value>)",
        "card-dark":       "rgb(var(--c-card) / <alpha-value>)",
        "surface-2":       "rgb(var(--c-field) / <alpha-value>)",
        "sidebar-border":  "rgb(var(--c-line) / <alpha-value>)",
        "border-subtle":   "rgb(var(--c-line) / <alpha-value>)",
        "border-medium":   "rgb(var(--c-line-strong) / <alpha-value>)",
      },
      fontFamily: {
        // Poppins — workhorse UI/body. Playfair Display — luxury headings + wordmark.
        display: ["Poppins", "system-ui", "sans-serif"],
        sans: ["Poppins", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
      },
      letterSpacing: {
        wordmark: "0.34em",
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Make sure this is 'class'
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        "background-light": "var(--color-background-light)",
        card: "var(--color-card)",
        "card-hover": "var(--color-card-hover)",
        "card-light": "var(--color-card-light)",
        text: "var(--color-text)",
        "text-light": "var(--color-text-light)",
        "text-dark": "var(--color-text-dark)",
        primary: "var(--color-primary)",
        "primary-light": "var(--color-primary-light)",
        secondary: "var(--color-secondary)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}

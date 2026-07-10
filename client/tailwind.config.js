/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#C9972A",
        secondary: "#7A1128",
        accent: "#0F6E62",
        background: "#FFF8EC",
        ink: "#241A12",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        heading: ["Playfair Display", "serif"],
        tamil: ["Noto Sans Tamil", "sans-serif"],
      }
    },
  },
  plugins: [],
}

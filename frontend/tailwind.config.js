/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        patriotic: {
          green: "#006A4E",
          greenDark: "#004d38",
          red: "#F42A41",
          gold: "#F59E0B",
          dark: "#0F172A",
        },
      },
      fontFamily: {
        bangla: ["Hind Siliguri", "Noto Sans Bengali", "sans-serif"],
        display: ["Tiro Bangla", "Hind Siliguri", "serif"],
      },
    },
  },
  plugins: [],
}

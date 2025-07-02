/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#f9fafb",
        secondary: "#444444",
        border: "#e1e1e1",
        tab: "39da4b2",
      },
      fontFamily: {
        poppins: ["Inter", "system-ui", "Avenir", "Helvetica", "Arial", "sans-serif"],
      },
      boxShadow: {
        'custom': '10px 10px 19px #1c1e22, -10px -10px 19px #262a2e',
      },
    },
  },
  plugins: [],
};

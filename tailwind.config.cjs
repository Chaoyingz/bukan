/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "ngray": {
          3: "rgba(55, 53, 47, 0.03)",
          5: "rgba(55, 53, 47, 0.05)",
          8: "rgba(55, 53, 47, 0.08)",
          9: "rgba(55, 53, 47, 0.09)",
          10: "rgba(55, 53, 47, 0.1)",
          15: "rgba(55, 53, 47, 0.15)",
          25: "rgba(55, 53, 47, 0.25)",
          50: "rgba(55, 53, 47, 0.5)",
          70: "rgba(55, 53, 47, 0.7)",
          100: "rgba(55, 53, 47)",
        }
      },
    },
  },
  plugins: [],
  variants: {
    extend: {
      display: ["group-hover"]
    }
  },
}

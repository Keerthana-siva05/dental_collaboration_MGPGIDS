/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {

      colors: {
        "purple-light": "#D8BFD8", // Change this to your preferred light purple
        "blue-light": "#87CEFA", // Light blue
        "purple-dark": "#6A0DAD", // Dark purple
        "blue-dark": "#1E3A8A",    // Change this to your preferred dark blue
      },
    },
  },
  plugins: [],
};

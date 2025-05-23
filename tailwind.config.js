/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class', // Enable dark mode with class strategy
    theme: {
      extend: {
        colors: {
          'primary': '#159A9C',
          'secondary': '#002333',
          'accent': '#DEEFE7',
        },
      },
    },
    plugins: [],
  }
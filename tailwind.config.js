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
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        'accent-1': 'var(--color-accent-1)',
        'accent-2': 'var(--color-accent-2)',
        'accent-3': 'var(--color-accent-3)',
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        button: 'var(--color-button)',
        'button-hover': 'var(--color-button-hover)',
        'button-secondary': 'var(--color-button-secondary)',
        'button-secondary-hover': 'var(--color-button-secondary-hover)',
        'focus-ring': 'var(--color-focus-ring)',
      },
      backgroundColor: {
        DEFAULT: 'var(--color-background)',
        card: 'var(--color-card)',
      },
      textColor: {
        DEFAULT: 'var(--color-foreground)',
        card: 'var(--color-card-foreground)',
      },
      borderColor: {
        DEFAULT: 'var(--color-border)',
      },
    },
  },
  plugins: [],
}
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
        // Antigravity Palette
        charcoal: "#0F1115",      // Deep workspace base
        "liquid-teal": "#00F5FF", // Bioluminescent primary
        "hyper-violet": "#8B5CF6", // Agent/Action state
        "glass-border": "rgba(255, 255, 255, 0.12)",
      },
      backgroundImage: {
        'chrome-gradient': 'linear-gradient(135deg, #0F1115 0%, #1A1D23 100%)',
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
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
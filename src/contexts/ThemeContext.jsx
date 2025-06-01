import { createContext, useContext, useState, useEffect } from 'react';

// Utility function to adjust hex color brightness
const adjustColor = (hex, percent) => {
  // Remove the # if present
  hex = hex.replace('#', '');
  
  // Convert to RGB
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // Adjust the brightness
  r = Math.max(0, Math.min(255, r + percent));
  g = Math.max(0, Math.min(255, g + percent));
  b = Math.max(0, Math.min(255, b + percent));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const ThemeContext = createContext();

// Theme definitions
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  BLUE: 'blue',
  PURPLE: 'purple',
  GREEN: 'green',
  AMBER: 'amber',
  SLATE: 'slate',
  MIDNIGHT: 'midnight',
  SUNSET: 'sunset',
  NEON: 'neon',
  MONOCHROME: 'monochrome'
};

// Theme color mappings (CSS variables will be set based on these)
export const THEME_COLORS = {
  [THEMES.LIGHT]: {
    name: 'Light',
    primary: '#0d9488', // teal-600
    secondary: '#4f46e5', // indigo-600
    accent: '#0891b2', // cyan-600
    background: '#ffffff',
    foreground: '#1f2937',
    card: '#ffffff',
    cardForeground: '#1f2937',
    isDark: false
  },
  [THEMES.DARK]: {
    name: 'Dark',
    primary: '#2dd4bf', // teal-400
    secondary: '#818cf8', // indigo-400
    accent: '#06b6d4', // cyan-500
    background: '#111827', // gray-900
    foreground: '#f9fafb',
    card: '#1f2937', // gray-800
    cardForeground: '#f9fafb',
    isDark: true
  },
  [THEMES.BLUE]: {
    name: 'Blue',
    primary: '#3b82f6', // blue-500
    secondary: '#8b5cf6', // violet-500
    accent: '#06b6d4', // cyan-500
    background: '#0f172a', // slate-900
    foreground: '#f8fafc',
    card: '#1e293b', // slate-800
    cardForeground: '#f8fafc',
    isDark: true
  },
  [THEMES.PURPLE]: {
    name: 'Purple',
    primary: '#a855f7', // purple-500
    secondary: '#ec4899', // pink-500
    accent: '#8b5cf6', // violet-500
    background: '#ffffff',
    foreground: '#1f2937',
    card: '#ffffff',
    cardForeground: '#1f2937',
    isDark: false
  },
  [THEMES.GREEN]: {
    name: 'Forest',
    primary: '#10b981', // emerald-500
    secondary: '#0d9488', // teal-600
    accent: '#84cc16', // lime-500
    background: '#1a2e05', // custom dark green
    foreground: '#f9fafb',
    card: '#2c4a0c', // custom medium green
    cardForeground: '#f9fafb',
    isDark: true
  },
  [THEMES.AMBER]: {
    name: 'Amber',
    primary: '#f59e0b', // amber-500
    secondary: '#d97706', // amber-600
    accent: '#ef4444', // red-500
    background: '#ffffff',
    foreground: '#1f2937',
    card: '#ffffff',
    cardForeground: '#1f2937',
    isDark: false
  },
  [THEMES.SLATE]: {
    name: 'Slate',
    primary: '#64748b', // slate-500
    secondary: '#475569', // slate-600
    accent: '#94a3b8', // slate-400
    background: '#f8fafc', // slate-50
    foreground: '#0f172a', // slate-900
    card: '#f1f5f9', // slate-100
    cardForeground: '#0f172a', // slate-900
    isDark: false
  },
  [THEMES.MIDNIGHT]: {
    name: 'Midnight',
    primary: '#6366f1', // indigo-500
    secondary: '#4f46e5', // indigo-600
    accent: '#818cf8', // indigo-400
    background: '#020617', // slate-950
    foreground: '#f8fafc', // slate-50
    card: '#0f172a', // slate-900
    cardForeground: '#f8fafc', // slate-50
    isDark: true
  },
  [THEMES.SUNSET]: {
    name: 'Sunset',
    primary: '#f97316', // orange-500
    secondary: '#ea580c', // orange-600
    accent: '#fb923c', // orange-400
    background: '#fff7ed', // orange-50
    foreground: '#431407', // orange-950
    card: '#ffedd5', // orange-100
    cardForeground: '#431407', // orange-950
    isDark: false
  },
  [THEMES.NEON]: {
    name: 'Neon',
    primary: '#22c55e', // green-500
    secondary: '#ec4899', // pink-500
    accent: '#facc15', // yellow-400
    background: '#18181b', // zinc-900
    foreground: '#fafafa', // zinc-50
    card: '#27272a', // zinc-800
    cardForeground: '#fafafa', // zinc-50
    isDark: true
  },
  [THEMES.MONOCHROME]: {
    name: 'Monochrome',
    primary: '#525252', // neutral-600
    secondary: '#737373', // neutral-500
    accent: '#a3a3a3', // neutral-400
    background: '#fafafa', // neutral-50
    foreground: '#171717', // neutral-900
    card: '#f5f5f5', // neutral-100
    cardForeground: '#171717', // neutral-900
    isDark: false
  }
};

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  // Check local storage or use system preference as fallback
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && THEME_COLORS[savedTheme]) {
      return savedTheme;
    }
    // Check if user prefers dark mode
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.DARK : THEMES.LIGHT;
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Apply theme colors to CSS variables
  const applyTheme = (themeName) => {
    const root = window.document.documentElement;
    const colors = THEME_COLORS[themeName];
    
    if (!colors) return;
    
    // Remove all theme classes
    Object.keys(THEMES).forEach(key => {
      root.classList.remove(THEMES[key]);
    });
    
    // Handle dark mode class separately
    if (colors.isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Add current theme class
    root.classList.add(themeName);
    
    // Set CSS variables for colors
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-foreground', colors.foreground);
    root.style.setProperty('--color-card', colors.card);
    root.style.setProperty('--color-card-foreground', colors.cardForeground);
    root.style.setProperty('--color-border', colors.isDark ? '#374151' : '#e5e7eb');
    
    // Set text selection color
    root.style.setProperty('--color-selection-bg', colors.primary);
    root.style.setProperty('--color-selection-text', '#ffffff');
    
    // Apply accent colors to UI elements
    root.style.setProperty('--color-accent-1', colors.primary);
    root.style.setProperty('--color-accent-2', colors.secondary);
    root.style.setProperty('--color-accent-3', colors.accent);
    root.style.setProperty('--color-accent-foreground', '#ffffff');
    
    // Button styles
    root.style.setProperty('--color-button', colors.primary);
    root.style.setProperty('--color-button-hover', adjustColor(colors.primary, -15));
    root.style.setProperty('--color-button-secondary', colors.secondary);
    root.style.setProperty('--color-button-secondary-hover', adjustColor(colors.secondary, -15));
    
    // Focus ring colors
    root.style.setProperty('--color-focus-ring', colors.accent);
    
    // Save to localStorage
    localStorage.setItem('theme', themeName);
  };

  // Apply theme when it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Simple toggle between light and dark (for the main header button)
  const toggleTheme = () => {
    const currentTheme = THEME_COLORS[theme];
    setTheme(currentTheme.isDark ? THEMES.LIGHT : THEMES.DARK);
  };
  
  // Set a specific theme
  const setSpecificTheme = (themeName) => {
    if (THEME_COLORS[themeName]) {
      setTheme(themeName);
    }
  };

  const value = {
    theme,
    toggleTheme,
    setTheme: setSpecificTheme,
    themeOptions: THEMES,
    themeColors: THEME_COLORS,
    isDark: THEME_COLORS[theme]?.isDark || false
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

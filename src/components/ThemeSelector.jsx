import { useTheme } from '../contexts/ThemeContext';
import { Palette, Check, Sun, Moon, Sparkles } from 'lucide-react';

export default function ThemeSelector() {
  const { theme, setTheme, themeOptions, themeColors } = useTheme();
  
  // Group themes by light/dark for better organization
  const lightThemes = [];
  const darkThemes = [];
  
  Object.keys(themeOptions).forEach((themeKey) => {
    const themeValue = themeOptions[themeKey];
    const themeColor = themeColors[themeValue];
    
    if (!themeColor) return;
    
    if (themeColor.isDark) {
      darkThemes.push({ key: themeKey, value: themeValue, color: themeColor });
    } else {
      lightThemes.push({ key: themeKey, value: themeValue, color: themeColor });
    }
  });
  
  const renderThemeButton = (themeValue, themeColor) => (
    <button
      key={themeValue}
      onClick={() => setTheme(themeValue)}
      className={`
        relative p-2 rounded-lg flex flex-col items-center transition-all
        border ${theme === themeValue ? 'border-2 border-accent' : 'border border-gray-200 dark:border-gray-700'}
        hover:border-accent hover:shadow-md
      `}
      style={{
        background: themeColor.card,
        color: themeColor.cardForeground,
        borderColor: theme === themeValue ? themeColor.accent : undefined
      }}
      aria-label={`Select ${themeColor.name} theme`}
    >
      {theme === themeValue && (
        <div className="absolute top-1 right-1 rounded-full p-0.5" 
             style={{ background: themeColor.accent, color: 'white' }}>
          <Check size={14} />
        </div>
      )}
      
      <div className="flex gap-1.5 mb-2 mt-1">
        <div className="w-5 h-5 rounded-full" 
             style={{ background: themeColor.primary }}
             title="Primary color"></div>
        <div className="w-5 h-5 rounded-full" 
             style={{ background: themeColor.secondary }}
             title="Secondary color"></div>
        <div className="w-5 h-5 rounded-full" 
             style={{ background: themeColor.accent }}
             title="Accent color"></div>
      </div>
      
      <span className="text-xs font-medium" style={{ color: themeColor.cardForeground }}>
        {themeColor.name}
      </span>
    </button>
  );
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 mb-2 font-medium text-sm">
        <Sun size={16} className="text-amber-500" />
        <span>Light Themes</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
        {lightThemes.map(theme => renderThemeButton(theme.value, theme.color))}
      </div>
      
      <div className="flex items-center gap-1 mb-2 font-medium text-sm">
        <Moon size={16} className="text-indigo-400" />
        <span>Dark Themes</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {darkThemes.map(theme => renderThemeButton(theme.value, theme.color))}
      </div>
    </div>
  );
}

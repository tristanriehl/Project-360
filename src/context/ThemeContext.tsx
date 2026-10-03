import React, { createContext, useContext, useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
  resolvedTheme: 'light'
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('app-theme') as ThemeMode;
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    } catch (e) {}
    return 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    if (theme === 'dark') return 'dark';
    if (theme === 'light') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let isDark = false;
      if (theme === 'dark') {
        isDark = true;
      } else if (theme === 'light') {
        isDark = false;
      } else {
        isDark = mediaQuery.matches;
      }

      setResolvedTheme(isDark ? 'dark' : 'light');
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    const handleChange = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    try {
      localStorage.setItem('app-theme', mode);
    } catch (e) {}
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export const ThemeToggle: React.FC<{ isCollapsed?: boolean }> = ({ isCollapsed }) => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  if (isCollapsed) {
    const nextMode: ThemeMode = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    return (
      <button
        onClick={() => setTheme(nextMode)}
        title={`Thème: ${theme === 'system' ? 'Système' : theme === 'dark' ? 'Sombre' : 'Clair'} (Cliquer pour changer)`}
        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
      >
        {theme === 'system' ? (
          <Monitor className="w-4 h-4 text-blue-500" />
        ) : theme === 'dark' ? (
          <Moon className="w-4 h-4 text-indigo-400" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
      <button
        onClick={() => setTheme('system')}
        title="Thème Système (Auto)"
        className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-1.5 rounded-lg text-[11px] font-semibold transition-all ${
          theme === 'system'
            ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <Monitor className="w-3.5 h-3.5" />
        <span>Système</span>
      </button>

      <button
        onClick={() => setTheme('light')}
        title="Thème Clair"
        className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-1.5 rounded-lg text-[11px] font-semibold transition-all ${
          theme === 'light'
            ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
        <span>Clair</span>
      </button>

      <button
        onClick={() => setTheme('dark')}
        title="Thème Sombre"
        className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-1.5 rounded-lg text-[11px] font-semibold transition-all ${
          theme === 'dark'
            ? 'bg-white dark:bg-slate-900 text-indigo-400 shadow-xs'
            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
        <span>Sombre</span>
      </button>
    </div>
  );
};

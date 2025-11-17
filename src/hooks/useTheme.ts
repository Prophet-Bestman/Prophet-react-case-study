import { useState, useEffect } from 'react';

type ThemeMode = 'light' | 'dark' | 'auto';

const THEME_KEY = 'app_theme';

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

export const useTheme = () => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem(THEME_KEY);
    return (stored as ThemeMode) || 'auto';
  });

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, mode);

    const actualTheme = mode === 'auto' ? systemTheme : mode;
    document.documentElement.setAttribute('data-theme', actualTheme);
  }, [mode, systemTheme]);

  const toggleTheme = () => {
    setMode((current) => {
      if (current === 'auto') return 'light';
      if (current === 'light') return 'dark';
      return 'auto';
    });
  };

  const setThemeMode = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  const actualTheme = mode === 'auto' ? systemTheme : mode;

  return {
    mode,
    actualTheme,
    toggleTheme,
    setThemeMode,
  };
};

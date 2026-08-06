import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export const THEMES = {
  dark: {
    bg: '#080808',
    surface: '#0f0f0f',
    surfaceHover: '#141414',
    border: 'rgba(255,255,255,0.07)',
    borderHover: 'rgba(255,255,255,0.14)',
    text: {
      primary: 'rgba(255,255,255,0.92)',
      secondary: 'rgba(255,255,255,0.45)',
      tertiary: 'rgba(255,255,255,0.22)',
    },
    accent: '#fff',
  },
  light: {
    bg: '#f6f8fa',
    surface: '#ffffff',
    surfaceHover: '#f0f2f4',
    border: 'rgba(0,0,0,0.1)',
    borderHover: 'rgba(0,0,0,0.22)',
    text: {
      primary: '#0d1117',
      secondary: '#444c56',
      tertiary: '#808890',
    },
    accent: '#0d1117',
  },
};

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('jes-theme') || 'dark';
  });

  const toggle = () => {
    setMode((m) => {
      const next = m === 'dark' ? 'light' : 'dark';
      localStorage.setItem('jes-theme', next);
      return next;
    });
  };

  // Apply bg color to document body
  useEffect(() => {
    document.body.style.background = THEMES[mode].bg;
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggle, t: THEMES[mode] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

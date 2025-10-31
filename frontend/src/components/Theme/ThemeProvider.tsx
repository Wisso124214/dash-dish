import {
  ThemeProviderContext,
  type ThemeContextValue,
} from './ThemeProviderContext';
import { useEffect, useState, type ReactNode } from 'react';

function setBgClasses() {
  const bgImg = document.getElementById('bg-img');
  const bgColor = document.getElementById('bg-color');
  const bgAbsolute = getComputedStyle(document.body)
    .getPropertyValue('--background-absolute')
    .trim();
  // Considera blanco si es blanco puro o cercano
  const isBgWhite =
    bgAbsolute === '#fff' ||
    bgAbsolute === 'white' ||
    bgAbsolute === 'rgb(255, 255, 255)';
  if (bgImg) {
    bgImg.classList.remove('bg-img-white', 'bg-img-black');
    if (isBgWhite) {
      bgImg.classList.add('bg-img-white');
    } else {
      bgImg.classList.add('bg-img-black');
    }
  }
  if (bgColor) {
    bgColor.classList.remove('bg-color-white', 'bg-color-black');
    if (isBgWhite) {
      bgColor.classList.add('bg-color-white');
    } else {
      bgColor.classList.add('bg-color-black');
    }
  }
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: string;
  storageKey?: string;
  [key: string]: unknown;
}

export default function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<string>(
    () => localStorage.getItem(storageKey) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);

    window.addEventListener('DOMContentLoaded', setBgClasses);
    setTimeout(setBgClasses, 0);
  }, [theme]);

  const value: ThemeContextValue = {
    theme,
    setTheme: (theme: string) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

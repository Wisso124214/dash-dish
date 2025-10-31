import { createContext } from 'react';

export type ThemeContextValue = {
  theme: string;
  setTheme: (theme: string) => void;
};

const initialState: ThemeContextValue = {
  theme: 'system',
  setTheme: () => {},
};

export const ThemeProviderContext =
  createContext<ThemeContextValue>(initialState);

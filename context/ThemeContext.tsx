import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import { AppTheme, THEME, ThemeType } from '../constants/theme';

const THEME_STORAGE_KEY = 'xarajat_theme_pref';

type ThemeContextType = {
  theme: AppTheme;
  themeType: ThemeType;
  toggleTheme: () => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemTheme = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
  const [themeType, setThemeType] = useState<ThemeType>(systemTheme);

  useEffect(() => {
    const loadTheme = async () => {
      const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') {
        setThemeType(saved);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = () => {
    const next = themeType === 'light' ? 'dark' : 'light';
    setThemeType(next);
    AsyncStorage.setItem(THEME_STORAGE_KEY, next);
  };

  const theme = THEME[themeType];

  return (
    <ThemeContext.Provider value={{ theme, themeType, toggleTheme, isDark: themeType === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

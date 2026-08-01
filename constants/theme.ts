export const THEME = {
  light: {
    background_base: '#F8FAFC',
    surface: '#FFFFFF',
    surface_secondary: '#F1F5F9',
    text_primary: '#0F172A',
    text_secondary: '#64748B',
    border: '#E2E8F0',
    brand_primary: '#2563EB',
    brand_secondary: '#0D9488',
    danger: '#EF4444',
    warning: '#F59E0B',
  },
  dark: {
    background_base: '#0F172A',
    surface: '#1E293B',
    surface_secondary: '#334155',
    text_primary: '#F1F5F9',
    text_secondary: '#94A3B8',
    border: '#334155',
    brand_primary: '#60A5FA',
    brand_secondary: '#2DD4BF',
    danger: '#FB7185',
    warning: '#FBBF24',
  },
};

export type ThemeType = 'light' | 'dark';
export type AppTheme = typeof THEME.light;

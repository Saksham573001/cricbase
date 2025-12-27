export const theme = {
  colors: {
    primary: '#9333ea', // Purple accent (Moctale style)
    primaryDark: '#7c3aed',
    primaryLight: '#a855f7',
    secondary: '#f59e0b', // Cricket gold
    background: '#0a0a0a', // Dark background
    backgroundSecondary: '#111111',
    surface: '#1a1a1a', // Dark surface
    surfaceHover: '#252525',
    text: '#ffffff',
    textSecondary: '#a3a3a3',
    textTertiary: '#737373',
    border: '#2a2a2a',
    borderLight: '#3a3a3a',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    cricketGreen: '#22c55e',
    cricketRed: '#dc2626',
    purple: '#9333ea',
    purpleLight: '#a855f7',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
};

export type Theme = typeof theme;


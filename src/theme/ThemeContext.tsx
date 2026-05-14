import React, {createContext, useContext} from 'react';
import {useColorScheme} from 'react-native';
import {colors as palette} from './colors';
import {spacing as spacingTokens} from './spacing';
import {radius} from './radius';
import {typography} from './typography';

// ─── Resolved color type (includes new + legacy aliases) ─────────────────────

export type ThemeColors = {
  // New tokens
  bg: string;
  surface: string;
  surfaceAlt: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderStrong: string;
  // Legacy aliases
  background: string;
  card: string;
  inputBackground: string;
  tabBar: string;
  tabBarBorder: string;
  // Extra tokens
  unreadBg: string;
  shimmer1: string;
  shimmer2: string;
  overlay: string;
  divider: string;
  shadow: string;
  // Palette
  primary: string;
  accent: string;
  success: string;
  error: string;
  warning: string;
};

// ─── Resolved spacing type (includes xxl and '2xl' alias) ────────────────────

const spacing = {
  ...spacingTokens,
  '2xl': 48,
} as const;

// ─── Light / dark resolved color objects ─────────────────────────────────────

export const lightColors: ThemeColors = {
  // New tokens
  bg:            palette.light.bg,
  surface:       palette.light.surface,
  surfaceAlt:    palette.light.surfaceAlt,
  textPrimary:   palette.light.textPrimary,
  textSecondary: palette.light.textSecondary,
  textMuted:     palette.light.textMuted,
  border:        palette.light.border,
  borderStrong:  palette.light.borderStrong,
  // Legacy aliases
  background:    palette.light.bg,
  card:          palette.light.surface,
  inputBackground: palette.light.bg,
  tabBar:        palette.light.surface,
  tabBarBorder:  palette.light.border,
  // Extra tokens
  unreadBg:  '#F0EFFE',
  shimmer1:  '#F0F0F5',
  shimmer2:  '#E8E8F0',
  overlay:   'rgba(0,0,0,0.4)',
  divider:   'rgba(0,0,0,0.06)',
  shadow:    'rgba(108,99,255,0.10)',
  // Palette
  primary: palette.primary,
  accent:  palette.accent,
  success: palette.success,
  error:   palette.error,
  warning: palette.warning,
};

export const darkColors: ThemeColors = {
  // New tokens
  bg:            palette.dark.bg,
  surface:       palette.dark.surface,
  surfaceAlt:    palette.dark.surfaceAlt,
  textPrimary:   palette.dark.textPrimary,
  textSecondary: palette.dark.textSecondary,
  textMuted:     palette.dark.textMuted,
  border:        palette.dark.border,
  borderStrong:  palette.dark.borderStrong,
  // Legacy aliases
  background:    palette.dark.bg,
  card:          palette.dark.surface,
  inputBackground: palette.dark.bg,
  tabBar:        palette.dark.surface,
  tabBarBorder:  palette.dark.border,
  // Extra tokens
  unreadBg:  '#1E1A2E',
  shimmer1:  '#1F1F2A',
  shimmer2:  '#2A2A38',
  overlay:   'rgba(0,0,0,0.6)',
  divider:   'rgba(255,255,255,0.06)',
  shadow:    'transparent',
  // Palette
  primary: palette.primary,
  accent:  palette.accent,
  success: palette.success,
  error:   palette.error,
  warning: palette.warning,
};

// ─── Theme type ───────────────────────────────────────────────────────────────

type Theme = {
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  isDark: boolean;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const defaultTheme: Theme = {
  colors: lightColors,
  isDark: false,
  radius,
  spacing,
  typography,
};

const ThemeContext = createContext<Theme>(defaultTheme);

export function ThemeProvider({children}: {children: React.ReactNode}): React.JSX.Element {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const theme: Theme = {
    colors: isDark ? darkColors : lightColors,
    isDark,
    radius,
    spacing,
    typography,
  };

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

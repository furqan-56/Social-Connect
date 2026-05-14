// ─── New modular exports ──────────────────────────────────────────────────────
export {colors} from './colors';
export {spacing} from './spacing';
export {radius} from './radius';
export {typography} from './typography';

// ─── ThemeContext re-exports (backward compat) ────────────────────────────────
export {lightColors, darkColors, ThemeProvider, useTheme} from './ThemeContext';
export type {ThemeColors} from './ThemeContext';

// ─── Legacy palette alias (any file that imports `palette` from theme/index) ──
export const palette = {
  primary: '#6C63FF',
  accent:  '#FF6584',
  success: '#22C55E',
  warning: '#F59E0B',
  error:   '#EF4444',
} as const;

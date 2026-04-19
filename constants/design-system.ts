/**
 * Dark-first enterprise UI tokens (layout, radii, typography scale).
 * Screen components resolve semantic colors via `useAppPalette`.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const,
    letterSpacing: -0.35,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500' as const,
    letterSpacing: -0.1,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
    letterSpacing: -0.05,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
  },
};

export type ColorSchemeName = 'light' | 'dark';

export const palette = {
  dark: {
    canvas: '#09090b',
    surface: '#111113',
    surfaceElevated: '#161618',
    borderSubtle: 'rgba(255,255,255,0.06)',
    textPrimary: '#fafafa',
    textSecondary: '#a1a1aa',
    textMuted: '#71717a',
    accent: '#6366f1',
    accentMuted: 'rgba(99,102,241,0.14)',
    danger: '#f87171',
    success: '#4ade80',
    shadow: '#000000',
  },
  light: {
    canvas: '#f4f4f5',
    surface: '#ffffff',
    surfaceElevated: '#fafafa',
    borderSubtle: 'rgba(24,24,27,0.08)',
    textPrimary: '#18181b',
    textSecondary: '#52525b',
    textMuted: '#a1a1aa',
    accent: '#4f46e5',
    accentMuted: 'rgba(79,70,229,0.12)',
    danger: '#dc2626',
    success: '#16a34a',
    shadow: 'rgba(24,24,27,0.12)',
  },
} as const;

export type SemanticColor = keyof typeof palette.dark;

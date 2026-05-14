export const typography = {
  display:  { fontSize: 28, fontWeight: '700' as const, lineHeight: 36, letterSpacing: -0.5 },
  heading:  { fontSize: 22, fontWeight: '700' as const, lineHeight: 28, letterSpacing: -0.3 },
  title:    { fontSize: 17, fontWeight: '600' as const, lineHeight: 24, letterSpacing: -0.1 },
  body:     { fontSize: 15, fontWeight: '400' as const, lineHeight: 22, letterSpacing: 0 },
  caption:  { fontSize: 12, fontWeight: '400' as const, lineHeight: 18, letterSpacing: 0 },
  micro:    { fontSize: 10, fontWeight: '500' as const, lineHeight: 14, letterSpacing: 0.2 },
  // backward compat aliases (components use these)
  sectionHeader: { fontSize: 17, fontWeight: '600' as const, lineHeight: 24, letterSpacing: -0.1 },
} as const;

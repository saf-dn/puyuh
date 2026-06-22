/** ─── Design Tokens ─────────────────────────────────────────── */
export const C = {
  // Backgrounds
  bg:      '#0F0F0F',   // page background
  card:    '#1A1A1A',   // card surface
  card2:   '#222222',   // elevated card / inner card
  border:  '#2A2A2A',   // subtle dividers

  // Accent
  red:     '#E53935',   // primary CTA / active
  redDim:  '#3D1A1A',   // red with low opacity bg
  redSoft: 'rgba(229,57,53,0.15)',

  // Text
  textPrimary:   '#FFFFFF',
  textSecondary: '#9E9E9E',
  textMuted:     '#555555',

  // Status
  income:  '#22C55E',   // green for positive values
  expense: '#EF4444',   // red for expenses

  // Misc
  white: '#FFFFFF',
} as const;

export const F = {
  body: 'Inter_400Regular',
  bodyMed: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  
  heading: 'Outfit_500Medium',
  headingSemi: 'Outfit_600SemiBold',
  headingBold: 'Outfit_700Bold',
} as const;

export const R = {
  sm:  10,
  md:  14,
  lg:  20,
  xl:  28,
  pill: 999,
} as const;

export const S = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

/** Returns hex color with appended alpha. Used by form placeholders. */
export function fadedColor(color: string | symbol, alpha = '80'): string {
  return `${String(color)}${alpha}`;
}

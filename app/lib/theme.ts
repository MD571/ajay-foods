// app/lib/theme.ts
// Single source of truth for the design system.
// To redesign the site: change values here + matching CSS vars in globals.css.

export const theme = {
  // Brand colours
  primary:      '#5C0F0F',
  primaryMid:   '#7A1A1A',
  primaryLight: '#A33420',

  // Accent
  gold:         '#D4A853',
  goldLight:    '#E8C97A',

  // Backgrounds
  bg:           '#FDF5EC',   // page background
  surface:      '#FFF8F2',   // cards, inputs

  // Borders
  border:       '#EAD9C0',

  // Text
  textDark:     '#3D0A0A',
  textMid:      '#7A4A3A',
  textMuted:    '#9A6A5A',

  // Diet indicators (unchanged)
  vegGreen:     '#1E7A4A',
  vegBg:        '#e8f5ee',
  nonVegRed:    '#8B1A1A',
  nonVegBg:     '#fde8e8',
} as const

export type ThemeKey = keyof typeof theme
export type ThemeValue = (typeof theme)[ThemeKey]

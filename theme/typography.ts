import { TextStyle } from 'react-native';
import { colors } from './colors';

// ---- Type scales (like CSS font-size) ----
const sizes = { h1: 28, h2: 24, h3: 20, h4: 18, body: 16, small: 14, caption: 12, };

export const typography: Record<string, TextStyle> = {
  // ---- Headings ----
  h1: {
    fontSize: sizes.h1,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: sizes.h1 * 1.3,
  },
  h2: {
    fontSize: sizes.h2,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: sizes.h2 * 1.3,
  },
  h3: {
    fontSize: sizes.h3,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: sizes.h3 * 1.3,
  },
  h4: {
    fontSize: sizes.h4,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: sizes.h4 * 1.3,
  },

  // ---- Body text ----
  bodyLarge: {
    fontSize: sizes.body,
    fontWeight: '400',
    color: colors.textPrimary,
    lineHeight: sizes.body * 1.5,
  },
  body: {
    fontSize: sizes.body,
    fontWeight: '400',
    color: colors.textPrimary,
    lineHeight: sizes.body * 1.5,
  },
  bodySmall: {
    fontSize: sizes.small,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: sizes.small * 1.5,
  },

  // ---- Accents ----
  caption: {
    fontSize: sizes.caption,
    fontWeight: '400',
    color: colors.textTertiary,
    lineHeight: sizes.caption * 1.5,
  },
  button: {
    fontSize: sizes.body,
    fontWeight: '600',
    color: colors.white,
    lineHeight: sizes.body * 1.4,
  },
  label: {
    fontSize: sizes.small,
    fontWeight: '500',
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
};
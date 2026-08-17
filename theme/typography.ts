import { TextStyle } from 'react-native';
import { colors } from './colors';

const sizes = { h1: 28, h2: 24, h3: 20, h4: 18, body: 16, small: 14, caption: 12 };

// ---- Font family map (Airbnb Cereal) ----
const font = {
  bold: 'AirbnbCereal_W_Bd',
  book: 'AirbnbCereal_W_Bk',
  black: 'AirbnbCereal_W_Blk',
  light: 'AirbnbCereal_W_Lt',
  medium: 'AirbnbCereal_W_Md',
  extraBold: 'AirbnbCereal_W_XBd',
};

export const typography: Record<string, TextStyle> = {
  // ---- Headings ----
  title: {
    fontFamily: font.bold,    
    fontSize: 19,
    color: colors.textPrimary,
    letterSpacing: 0,
    marginLeft: 50,
    marginBottom: 20,
  },
  h1: {
    fontFamily: font.extraBold,
    fontSize: sizes.h1,
    color: colors.textPrimary,
    lineHeight: sizes.h1 * 1.3,
  },
  h2: {
    fontFamily: font.bold,          
    fontSize: sizes.h2,
    color: colors.textPrimary,
    lineHeight: sizes.h2 * 1.3,
  },
  h3: {
    fontFamily: font.bold,         
    fontSize: sizes.h3,
    color: colors.textPrimary,
    lineHeight: sizes.h3 * 1.3,
  },
  h4: {
    fontFamily: font.medium,        
    fontSize: sizes.h4,
    color: colors.textPrimary,
    lineHeight: sizes.h4 * 1.3,
  },

  // ---- Body text ----
  bodyLarge: {
    fontFamily: font.book,         
    fontSize: sizes.body,
    color: colors.textPrimary,
    lineHeight: sizes.body * 1.5,
  },
  body: {
    fontFamily: font.book,        
    fontSize: sizes.body,
    color: colors.textPrimary,
    lineHeight: sizes.body * 1.5,
  },
  bodySmall: {
    fontFamily: font.book,           
    fontSize: sizes.small,
    color: colors.textSecondary,
    lineHeight: sizes.small * 1.5,
  },

  // ---- Accents ----
  caption: {
    fontFamily: font.light,      
    fontSize: sizes.caption,
    color: colors.textTertiary,
    lineHeight: sizes.caption * 1.5,
  },
  button: {
    fontFamily: font.medium,      
    fontSize: sizes.body,
    color: '#000',
    lineHeight: sizes.body * 1.4,
  },
  label: {
    fontFamily: font.bold,       
    fontSize: sizes.small,
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ---- NEW: Card-specific text styles ----
  brand: { fontFamily: font.medium, fontSize: 10, color: colors.textSecondary, },
  productName: { fontFamily: font.bold, fontSize: 20, color: colors.textPrimary, },
  description: { fontFamily: font.book, fontSize: 14, color: colors.textSecondary, lineHeight: 18, },
  
  price: { fontFamily: font.bold, fontSize: 25, color: colors.primary, },
  priceDecimal: { fontFamily: font.medium, fontSize: 11, color: colors.primary, },
};
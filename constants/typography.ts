export const typography = {
  fontFamily: {
    regular: "Arial",
    medium: "Arial",
    bold: "Arial",
  },
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    "2xl": 28,
  },
  weights: {
    regular: "400",
    medium: "500",
    bold: "700",
  },
} as const;

export type TypographySize = keyof typeof typography.sizes;
export type TypographyWeight = keyof typeof typography.weights;

/**
 * Utility functions for working with SampleColor enum
 */

export const COLOR_LABELS: Record<string, string> = {
  BLACK: "Black",
  WHITE: "White",
  NAVY: "Navy",
  GRAY: "Gray",
  CHARCOAL: "Charcoal",
  BEIGE: "Beige",
  CAMEL: "Camel",
  IVORY: "Ivory",
  ROSE: "Rose",
  SAGE: "Sage",
  LIGHT_BLUE: "Light Blue",
  RED: "Red",
  BLUE: "Blue",
  GREEN: "Green",
  YELLOW: "Yellow",
  ORANGE: "Orange",
  PURPLE: "Purple",
  PINK: "Pink",
  BROWN: "Brown",
  TAN: "Tan",
  CREAM: "Cream",
  OLIVE: "Olive",
  BURGUNDY: "Burgundy",
  MAROON: "Maroon",
  TEAL: "Teal",
  CORAL: "Coral",
  LAVENDER: "Lavender",
  MINT: "Mint",
  KHAKI: "Khaki",
  DENIM: "Denim",
};

export function formatColor(color: string | null | undefined): string {
  if (!color) return "";
  return COLOR_LABELS[color] || color;
}

export const COLOR_OPTIONS = Object.entries(COLOR_LABELS).map(([value, label]) => ({
  value,
  label,
}));


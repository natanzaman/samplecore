/**
 * Utility functions for working with SampleSize enum
 */

export const SIZE_LABELS: Record<string, string> = {
  XS: "XS",
  S: "S",
  M: "M",
  L: "L",
  XL: "XL",
  XXL: "XXL",
  XXXL: "XXXL",
  ONE_SIZE: "One Size",
  SMALL: "Small",
  MEDIUM: "Medium",
  LARGE: "Large",
  EXTRA_LARGE: "Extra Large",
  PETITE: "Petite",
  TALL: "Tall",
  REGULAR: "Regular",
};

export function formatSize(size: string | null | undefined): string {
  if (!size) return "";
  return SIZE_LABELS[size] || size;
}

export const SIZE_OPTIONS = Object.entries(SIZE_LABELS).map(([value, label]) => ({
  value,
  label,
}));


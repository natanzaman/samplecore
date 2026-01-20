/**
 * Utility functions for working with InventoryLocation enum
 */

export const LOCATION_LABELS: Record<string, string> = {
  STUDIO_A: "Studio A",
  STUDIO_B: "Studio B",
  WAREHOUSE_A: "Warehouse A",
  WAREHOUSE_B: "Warehouse B",
  WAREHOUSE_C: "Warehouse C",
  SHOWROOM: "Showroom",
  PHOTO_STUDIO: "Photo Studio",
  OFFICE: "Office",
};

export function formatLocation(location: string | null | undefined): string {
  if (!location) return "No Location";
  return LOCATION_LABELS[location] || location;
}

export const LOCATION_OPTIONS = Object.entries(LOCATION_LABELS).map(([value, label]) => ({
  value,
  label,
}));

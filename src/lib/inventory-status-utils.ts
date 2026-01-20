/**
 * Utility functions for working with InventoryStatus enum
 */

export const INVENTORY_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Available",
  IN_USE: "In Use",
  RESERVED: "Reserved",
  DAMAGED: "Damaged",
  ARCHIVED: "Archived",
};

export function formatInventoryStatus(status: string | null | undefined): string {
  if (!status) return "";
  return INVENTORY_STATUS_LABELS[status] || status.replace(/_/g, " ");
}

export const INVENTORY_STATUS_OPTIONS = Object.entries(INVENTORY_STATUS_LABELS).map(
  ([value, label]) => ({
    value,
    label,
  })
);

// Status color variants for badges
export function getInventoryStatusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "AVAILABLE":
      return "default";
    case "IN_USE":
      return "secondary";
    case "RESERVED":
      return "outline";
    case "DAMAGED":
      return "destructive";
    case "ARCHIVED":
      return "secondary";
    default:
      return "default";
  }
}

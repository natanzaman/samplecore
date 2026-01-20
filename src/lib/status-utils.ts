/**
 * Utility functions for working with RequestStatus enum
 */

export const STATUS_LABELS: Record<string, string> = {
  REQUESTED: "Requested",
  APPROVED: "Approved",
  SHIPPED: "Shipped",
  HANDED_OFF: "Handed Off",
  IN_USE: "In Use",
  RETURNED: "Returned",
  CLOSED: "Closed",
};

export function formatStatus(status: string | null | undefined): string {
  if (!status) return "";
  return STATUS_LABELS[status] || status.replace(/_/g, " ");
}

export const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

// Status flow for validation
export const STATUS_FLOW: Record<string, string[]> = {
  REQUESTED: ["APPROVED", "CLOSED"],
  APPROVED: ["SHIPPED", "HANDED_OFF", "CLOSED"],
  SHIPPED: ["HANDED_OFF", "IN_USE", "RETURNED", "CLOSED"],
  HANDED_OFF: ["IN_USE", "RETURNED", "CLOSED"],
  IN_USE: ["RETURNED", "CLOSED"],
  RETURNED: ["CLOSED"],
  CLOSED: [],
};

// Get valid next statuses for a given status
export function getValidNextStatuses(currentStatus: string): string[] {
  return STATUS_FLOW[currentStatus] || [];
}

// Check if a status transition is valid
export function isValidStatusTransition(from: string, to: string): boolean {
  return STATUS_FLOW[from]?.includes(to) ?? false;
}

// Status color variants for badges
export function getStatusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "REQUESTED":
      return "outline";
    case "APPROVED":
      return "default";
    case "SHIPPED":
      return "secondary";
    case "HANDED_OFF":
      return "secondary";
    case "IN_USE":
      return "default";
    case "RETURNED":
      return "outline";
    case "CLOSED":
      return "secondary";
    default:
      return "default";
  }
}

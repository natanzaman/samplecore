import { describe, it, expect } from "vitest";
import {
  formatColor,
  formatSize,
  formatLocation,
  formatStage,
  formatStatus,
  formatInventoryStatus,
  getStageVariant,
  getStatusVariant,
  getInventoryStatusVariant,
  getValidNextStatuses,
  isValidStatusTransition,
  COLOR_OPTIONS,
  SIZE_OPTIONS,
  LOCATION_OPTIONS,
  STAGE_OPTIONS,
  STATUS_OPTIONS,
  INVENTORY_STATUS_OPTIONS,
} from "@/lib";
import { cn, formatDate } from "@/lib/utils";

describe("Formatting Functions", () => {
  describe("formatColor", () => {
    it("should format color enum values to readable labels", () => {
      expect(formatColor("BLACK")).toBe("Black");
      expect(formatColor("LIGHT_BLUE")).toBe("Light Blue");
      expect(formatColor("NAVY")).toBe("Navy");
    });

    it("should return empty string for null/undefined", () => {
      expect(formatColor(null)).toBe("");
      expect(formatColor(undefined)).toBe("");
    });

    it("should return original value if not in labels", () => {
      expect(formatColor("UNKNOWN_COLOR")).toBe("UNKNOWN_COLOR");
    });
  });

  describe("formatSize", () => {
    it("should format size enum values to readable labels", () => {
      expect(formatSize("XS")).toBe("XS");
      expect(formatSize("ONE_SIZE")).toBe("One Size");
      expect(formatSize("EXTRA_LARGE")).toBe("Extra Large");
    });

    it("should return empty string for null/undefined", () => {
      expect(formatSize(null)).toBe("");
      expect(formatSize(undefined)).toBe("");
    });
  });

  describe("formatLocation", () => {
    it("should format location enum values to readable labels", () => {
      expect(formatLocation("STUDIO_A")).toBe("Studio A");
      expect(formatLocation("PHOTO_STUDIO")).toBe("Photo Studio");
      expect(formatLocation("WAREHOUSE_A")).toBe("Warehouse A");
    });

    it("should return 'No Location' for null/undefined", () => {
      expect(formatLocation(null)).toBe("No Location");
      expect(formatLocation(undefined)).toBe("No Location");
    });
  });

  describe("formatStage", () => {
    it("should format stage enum values to readable labels", () => {
      expect(formatStage("PROTOTYPE")).toBe("Prototype");
      expect(formatStage("DEVELOPMENT")).toBe("Development");
      expect(formatStage("PRODUCTION")).toBe("Production");
      expect(formatStage("ARCHIVED")).toBe("Archived");
    });

    it("should return empty string for null/undefined", () => {
      expect(formatStage(null)).toBe("");
      expect(formatStage(undefined)).toBe("");
    });
  });

  describe("formatStatus", () => {
    it("should format status enum values to readable labels", () => {
      expect(formatStatus("REQUESTED")).toBe("Requested");
      expect(formatStatus("APPROVED")).toBe("Approved");
      expect(formatStatus("HANDED_OFF")).toBe("Handed Off");
      expect(formatStatus("IN_USE")).toBe("In Use");
    });

    it("should return empty string for null/undefined", () => {
      expect(formatStatus(null)).toBe("");
      expect(formatStatus(undefined)).toBe("");
    });
  });

  describe("formatInventoryStatus", () => {
    it("should format inventory status enum values to readable labels", () => {
      expect(formatInventoryStatus("AVAILABLE")).toBe("Available");
      expect(formatInventoryStatus("IN_USE")).toBe("In Use");
      expect(formatInventoryStatus("RESERVED")).toBe("Reserved");
      expect(formatInventoryStatus("DAMAGED")).toBe("Damaged");
    });

    it("should return empty string for null/undefined", () => {
      expect(formatInventoryStatus(null)).toBe("");
      expect(formatInventoryStatus(undefined)).toBe("");
    });
  });
});

describe("Badge Variant Functions", () => {
  describe("getStageVariant", () => {
    it("should return correct variants for stages", () => {
      expect(getStageVariant("PROTOTYPE")).toBe("outline");
      expect(getStageVariant("DEVELOPMENT")).toBe("secondary");
      expect(getStageVariant("PRODUCTION")).toBe("default");
      expect(getStageVariant("ARCHIVED")).toBe("secondary");
    });

    it("should return default for unknown stage", () => {
      expect(getStageVariant("UNKNOWN")).toBe("default");
    });
  });

  describe("getStatusVariant", () => {
    it("should return correct variants for statuses", () => {
      expect(getStatusVariant("REQUESTED")).toBe("outline");
      expect(getStatusVariant("APPROVED")).toBe("default");
      expect(getStatusVariant("SHIPPED")).toBe("secondary");
      expect(getStatusVariant("IN_USE")).toBe("default");
      expect(getStatusVariant("CLOSED")).toBe("secondary");
    });
  });

  describe("getInventoryStatusVariant", () => {
    it("should return correct variants for inventory statuses", () => {
      expect(getInventoryStatusVariant("AVAILABLE")).toBe("default");
      expect(getInventoryStatusVariant("IN_USE")).toBe("secondary");
      expect(getInventoryStatusVariant("RESERVED")).toBe("outline");
      expect(getInventoryStatusVariant("DAMAGED")).toBe("destructive");
      expect(getInventoryStatusVariant("ARCHIVED")).toBe("secondary");
    });
  });
});

describe("Status Flow Functions", () => {
  describe("getValidNextStatuses", () => {
    it("should return valid next statuses for REQUESTED", () => {
      const next = getValidNextStatuses("REQUESTED");
      expect(next).toContain("APPROVED");
      expect(next).toContain("CLOSED");
      expect(next).not.toContain("RETURNED");
    });

    it("should return valid next statuses for APPROVED", () => {
      const next = getValidNextStatuses("APPROVED");
      expect(next).toContain("SHIPPED");
      expect(next).toContain("HANDED_OFF");
      expect(next).toContain("CLOSED");
    });

    it("should return empty array for CLOSED", () => {
      const next = getValidNextStatuses("CLOSED");
      expect(next).toEqual([]);
    });
  });

  describe("isValidStatusTransition", () => {
    it("should return true for valid transitions", () => {
      expect(isValidStatusTransition("REQUESTED", "APPROVED")).toBe(true);
      expect(isValidStatusTransition("APPROVED", "SHIPPED")).toBe(true);
      expect(isValidStatusTransition("IN_USE", "RETURNED")).toBe(true);
    });

    it("should return false for invalid transitions", () => {
      expect(isValidStatusTransition("REQUESTED", "SHIPPED")).toBe(false);
      expect(isValidStatusTransition("CLOSED", "REQUESTED")).toBe(false);
      expect(isValidStatusTransition("RETURNED", "APPROVED")).toBe(false);
    });
  });
});

describe("Options Arrays", () => {
  it("COLOR_OPTIONS should have value and label", () => {
    expect(COLOR_OPTIONS.length).toBeGreaterThan(0);
    expect(COLOR_OPTIONS[0]).toHaveProperty("value");
    expect(COLOR_OPTIONS[0]).toHaveProperty("label");
  });

  it("SIZE_OPTIONS should have value and label", () => {
    expect(SIZE_OPTIONS.length).toBeGreaterThan(0);
    expect(SIZE_OPTIONS[0]).toHaveProperty("value");
    expect(SIZE_OPTIONS[0]).toHaveProperty("label");
  });

  it("LOCATION_OPTIONS should have value and label", () => {
    expect(LOCATION_OPTIONS.length).toBeGreaterThan(0);
    expect(LOCATION_OPTIONS[0]).toHaveProperty("value");
    expect(LOCATION_OPTIONS[0]).toHaveProperty("label");
  });

  it("STAGE_OPTIONS should have value and label", () => {
    expect(STAGE_OPTIONS.length).toBe(4);
    expect(STAGE_OPTIONS[0]).toHaveProperty("value");
    expect(STAGE_OPTIONS[0]).toHaveProperty("label");
  });

  it("STATUS_OPTIONS should have value and label", () => {
    expect(STATUS_OPTIONS.length).toBe(7);
    expect(STATUS_OPTIONS[0]).toHaveProperty("value");
    expect(STATUS_OPTIONS[0]).toHaveProperty("label");
  });

  it("INVENTORY_STATUS_OPTIONS should have value and label", () => {
    expect(INVENTORY_STATUS_OPTIONS.length).toBe(5);
    expect(INVENTORY_STATUS_OPTIONS[0]).toHaveProperty("value");
    expect(INVENTORY_STATUS_OPTIONS[0]).toHaveProperty("label");
  });
});

describe("Core Utils", () => {
  describe("cn", () => {
    it("should merge class names", () => {
      expect(cn("px-4", "py-2")).toBe("px-4 py-2");
    });

    it("should handle conditional classes", () => {
      expect(cn("px-4", false && "hidden", "py-2")).toBe("px-4 py-2");
      expect(cn("px-4", true && "hidden", "py-2")).toBe("px-4 hidden py-2");
    });

    it("should merge tailwind classes correctly", () => {
      expect(cn("px-4", "px-2")).toBe("px-2"); // Later class wins
    });
  });

  describe("formatDate", () => {
    it("should format Date object", () => {
      const date = new Date("2024-12-25T10:30:00");
      const result = formatDate(date);
      expect(result).toContain("Dec");
      expect(result).toContain("25");
      expect(result).toContain("2024");
    });

    it("should format date string", () => {
      const result = formatDate("2024-12-25T10:30:00");
      expect(result).toContain("Dec");
      expect(result).toContain("25");
    });

    it("should return dash for null/undefined", () => {
      expect(formatDate(null)).toBe("—");
      expect(formatDate(undefined)).toBe("—");
    });
  });
});

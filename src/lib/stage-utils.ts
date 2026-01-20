/**
 * Utility functions for working with SampleStage enum
 */

export const STAGE_LABELS: Record<string, string> = {
  PROTOTYPE: "Prototype",
  DEVELOPMENT: "Development",
  PRODUCTION: "Production",
  ARCHIVED: "Archived",
};

export function formatStage(stage: string | null | undefined): string {
  if (!stage) return "";
  return STAGE_LABELS[stage] || stage;
}

export const STAGE_OPTIONS = Object.entries(STAGE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

// Stage color variants for badges
export function getStageVariant(
  stage: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (stage) {
    case "PROTOTYPE":
      return "outline";
    case "DEVELOPMENT":
      return "secondary";
    case "PRODUCTION":
      return "default";
    case "ARCHIVED":
      return "secondary";
    default:
      return "default";
  }
}

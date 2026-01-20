/**
 * Centralized exports for lib utilities
 * This allows cleaner imports: import { formatColor, formatSize } from "@/lib"
 */

// Core utilities
export { cn, formatDate } from "./utils";

// Database
export { db } from "./db";

// Auth
export { getCurrentUser, MOCK_USER_ID, MOCK_USER_NAME } from "./auth";

// Formatting utilities
export { formatColor, COLOR_OPTIONS, COLOR_LABELS } from "./color-utils";
export { formatSize, SIZE_OPTIONS, SIZE_LABELS } from "./size-utils";
export { formatLocation, LOCATION_OPTIONS, LOCATION_LABELS } from "./location-utils";
export { formatStage, STAGE_OPTIONS, STAGE_LABELS, getStageVariant } from "./stage-utils";
export {
  formatStatus,
  STATUS_OPTIONS,
  STATUS_LABELS,
  STATUS_FLOW,
  getValidNextStatuses,
  isValidStatusTransition,
  getStatusVariant,
} from "./status-utils";
export {
  formatInventoryStatus,
  INVENTORY_STATUS_OPTIONS,
  INVENTORY_STATUS_LABELS,
  getInventoryStatusVariant,
} from "./inventory-status-utils";

// Error handling
export { handleUniqueConstraintError } from "./errors";

// API utilities
export {
  successResponse,
  createdResponse,
  errorResponse,
  notFoundResponse,
  serverErrorResponse,
  handleApiError,
  withErrorHandling,
} from "./api-utils";

// Types (re-export for convenience)
export type {
  SampleItemWithRelations,
  SampleItemWithInventory,
  SampleItemBasic,
  ProductionItemWithSamples,
  ProductionItemWithLatestSample,
  RequestWithRelations,
  RequestWithSampleAndTeam,
  TeamWithRequests,
  TeamWithCount,
  CommentWithReplies,
  InventoryWithSample,
} from "./types";

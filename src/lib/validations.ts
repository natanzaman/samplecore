import { z } from "zod";

// Request Status enum
export const RequestStatusSchema = z.enum([
  "REQUESTED",
  "APPROVED",
  "SHIPPED",
  "HANDED_OFF",
  "IN_USE",
  "RETURNED",
  "CLOSED",
]);

// Sample Stage enum
export const SampleStageSchema = z.enum([
  "PROTOTYPE",
  "DEVELOPMENT",
  "PRODUCTION",
  "ARCHIVED",
]);

// Sample Color enum
export const SampleColorSchema = z.enum([
  "BLACK",
  "WHITE",
  "NAVY",
  "GRAY",
  "CHARCOAL",
  "BEIGE",
  "CAMEL",
  "IVORY",
  "ROSE",
  "SAGE",
  "LIGHT_BLUE",
  "RED",
  "BLUE",
  "GREEN",
  "YELLOW",
  "ORANGE",
  "PURPLE",
  "PINK",
  "BROWN",
  "TAN",
  "CREAM",
  "OLIVE",
  "BURGUNDY",
  "MAROON",
  "TEAL",
  "CORAL",
  "LAVENDER",
  "MINT",
  "KHAKI",
  "DENIM",
]);

// Sample Size enum
export const SampleSizeSchema = z.enum([
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
  "ONE_SIZE",
  "SMALL",
  "MEDIUM",
  "LARGE",
  "EXTRA_LARGE",
  "PETITE",
  "TALL",
  "REGULAR",
]);

// Inventory Status enum
export const InventoryStatusSchema = z.enum([
  "AVAILABLE",
  "IN_USE",
  "RESERVED",
  "DAMAGED",
  "ARCHIVED",
]);

// Inventory Location enum
export const InventoryLocationSchema = z.enum([
  "STUDIO_A",
  "STUDIO_B",
  "WAREHOUSE_A",
  "WAREHOUSE_B",
  "WAREHOUSE_C",
  "SHOWROOM",
  "PHOTO_STUDIO",
  "OFFICE",
]);

// Production Item schemas
export const CreateProductionItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(1000).optional(),
});

export const UpdateProductionItemSchema = CreateProductionItemSchema.partial();

// Sample Item schemas
export const CreateSampleItemSchema = z.object({
  productionItemId: z.string().cuid(),
  stage: SampleStageSchema.default("PROTOTYPE"),
  color: SampleColorSchema.optional(),
  size: SampleSizeSchema.optional(),
  revision: z.string().max(10).default("A"),
  notes: z.string().max(1000).optional(),
});

export const UpdateSampleItemSchema = CreateSampleItemSchema.partial().extend({
  productionItemId: z.string().cuid().optional(),
});

// Inventory schemas
export const CreateInventorySchema = z.object({
  sampleItemId: z.string().cuid(),
  quantity: z.number().int().min(0).default(0),
  location: InventoryLocationSchema.optional(),
  status: InventoryStatusSchema.default("AVAILABLE"),
  notes: z.string().max(1000).optional(),
});

export const UpdateInventorySchema = CreateInventorySchema.partial().extend({
  sampleItemId: z.string().cuid().optional(),
});

// Team schemas
export const CreateTeamSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  address: z.string().max(500).optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().max(50).optional(),
  isInternal: z.boolean().default(true),
});

export const UpdateTeamSchema = CreateTeamSchema.partial();

// Sample Request schemas
export const CreateSampleRequestSchema = z.object({
  sampleItemId: z.string().cuid(),
  teamId: z.string().cuid(),
  quantity: z.number().int().min(1).default(1),
  shippingMethod: z.string().max(255).optional(),
  notes: z.string().max(1000).optional(),
});

export const UpdateSampleRequestSchema = z.object({
  status: RequestStatusSchema.optional(),
  quantity: z.number().int().min(1).optional(),
  shippingMethod: z.string().max(255).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
  approvedAt: z.coerce.date().optional(),
  shippedAt: z.coerce.date().optional(),
  handedOffAt: z.coerce.date().optional(),
  returnedAt: z.coerce.date().optional(),
  closedAt: z.coerce.date().optional(),
});

// Comment schemas
export const CreateCommentSchema = z.object({
  productionItemId: z.string().cuid().optional(),
  sampleItemId: z.string().cuid().optional(),
  requestId: z.string().cuid().optional(),
  parentCommentId: z.string().cuid().optional(),
  content: z.string().min(1, "Content is required").max(2000),
}).refine(
  (data) => data.productionItemId || data.sampleItemId || data.requestId || data.parentCommentId,
  "One of productionItemId, sampleItemId, requestId, or parentCommentId must be provided"
);

export const UpdateCommentSchema = z.object({
  content: z.string().min(1).max(2000).optional(),
});

// Type exports
export type CreateProductionItemInput = z.infer<typeof CreateProductionItemSchema>;
export type UpdateProductionItemInput = z.infer<typeof UpdateProductionItemSchema>;
export type CreateSampleItemInput = z.infer<typeof CreateSampleItemSchema>;
export type UpdateSampleItemInput = z.infer<typeof UpdateSampleItemSchema>;
export type CreateInventoryInput = z.infer<typeof CreateInventorySchema>;
export type UpdateInventoryInput = z.infer<typeof UpdateInventorySchema>;
export type CreateTeamInput = z.infer<typeof CreateTeamSchema>;
export type UpdateTeamInput = z.infer<typeof UpdateTeamSchema>;
export type CreateSampleRequestInput = z.infer<typeof CreateSampleRequestSchema>;
export type UpdateSampleRequestInput = z.infer<typeof UpdateSampleRequestSchema>;
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export type UpdateCommentInput = z.infer<typeof UpdateCommentSchema>;


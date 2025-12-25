import { NextRequest, NextResponse } from "next/server";
import { InventoryService } from "@/services/inventory";
import { CreateSampleItemSchema, CreateInventorySchema, InventoryLocationSchema } from "@/lib/validations";
import { z } from "zod";

const BatchCreateSampleItemSchema = z.object({
  stage: z.enum(["PROTOTYPE", "DEVELOPMENT", "PRODUCTION", "ARCHIVED"]),
  color: z.string().max(100).optional().nullable(),
  size: z.string().max(50).optional().nullable(),
  revision: z.string().max(10).default("A"),
  notes: z.string().max(1000).optional().nullable(),
  initialQuantity: z.number().int().min(0).default(0),
  location: InventoryLocationSchema.optional().nullable(),
});

const BatchCreateSchema = z.object({
  productionItemId: z.string().cuid(),
  variations: z.array(BatchCreateSampleItemSchema).min(1, "At least one variation is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = BatchCreateSchema.parse(body);

    // Create all sample items with their initial inventory
    const results = await InventoryService.createSampleItemsWithInventory(
      validated.productionItemId,
      validated.variations
    );

    return NextResponse.json(results, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


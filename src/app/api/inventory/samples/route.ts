import { NextRequest, NextResponse } from "next/server";
import { InventoryService } from "@/services/inventory";
import { CreateSampleItemSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateSampleItemSchema.parse(body);

    const newSampleItem = await InventoryService.createSampleItem(validated);

    return NextResponse.json(newSampleItem, { status: 201 });
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


import { NextRequest, NextResponse } from "next/server";
import { InventoryService } from "@/services/inventory";
import { CreateInventorySchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateInventorySchema.parse(body);

    const newInventory = await InventoryService.createInventory(validated);

    return NextResponse.json(newInventory, { status: 201 });
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


import { NextRequest, NextResponse } from "next/server";
import { InventoryService } from "@/services/inventory";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sampleItems = await InventoryService.getSampleItemsByProductionId(params.id);
    return NextResponse.json(sampleItems);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


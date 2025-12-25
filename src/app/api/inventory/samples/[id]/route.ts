import { NextRequest, NextResponse } from "next/server";
import { InventoryService } from "@/services/inventory";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sampleItem = await InventoryService.getSampleItemById(params.id);
    if (!sampleItem) {
      return NextResponse.json({ message: "Sample item not found" }, { status: 404 });
    }
    return NextResponse.json(sampleItem);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


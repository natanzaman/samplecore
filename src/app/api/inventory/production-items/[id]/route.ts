import { NextRequest, NextResponse } from "next/server";
import { InventoryService } from "@/services/inventory";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productionItem = await InventoryService.getProductionItemById(params.id);
    if (!productionItem) {
      return NextResponse.json({ message: "Production item not found" }, { status: 404 });
    }
    return NextResponse.json(productionItem);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


import { NextResponse } from "next/server";
import { InventoryService } from "@/services/inventory";

export async function GET() {
  try {
    const { colors, sizes } = await InventoryService.getUniqueColorsAndSizes();
    return NextResponse.json({ colors, sizes });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch filter options" },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { InventoryService } from "@/services/inventory";
import { CreateProductionItemSchema } from "@/lib/validations";

export async function GET() {
  try {
    const productionItems = await InventoryService.getProductionItemsWithSamples();
    return NextResponse.json(productionItems);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateProductionItemSchema.parse(body);

    const newProductionItem = await InventoryService.createProductionItem(validated);

    return NextResponse.json(newProductionItem, { status: 201 });
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


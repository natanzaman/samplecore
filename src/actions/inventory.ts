"use server";

import { revalidatePath } from "next/cache";
import { InventoryService } from "@/services/inventory";
import type { SampleColor, SampleSize, InventoryLocation, SampleStage } from "@prisma/client";

export async function createProductionItem(data: {
  name: string;
  description?: string;
}) {
  try {
    const result = await InventoryService.createProductionItem(data);
    revalidatePath("/inventory");
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to create production item:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create production item" 
    };
  }
}

export async function createSampleItem(data: {
  productionItemId: string;
  stage: SampleStage;
  color?: SampleColor | null;
  size?: SampleSize | null;
  revision: string;
}) {
  try {
    const result = await InventoryService.createSampleItem(data);
    revalidatePath("/inventory");
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to create sample item:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create sample item" 
    };
  }
}

export async function addInventory(data: {
  sampleItemId: string;
  location?: InventoryLocation | null;
  status?: string;
  notes?: string;
}) {
  try {
    const result = await InventoryService.createInventory(data);
    revalidatePath("/inventory");
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to add inventory:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to add inventory" 
    };
  }
}

export async function updateInventory(
  inventoryId: string,
  data: {
    status?: string;
    location?: InventoryLocation | null;
    notes?: string;
  }
) {
  try {
    const result = await InventoryService.updateInventory(inventoryId, data);
    revalidatePath("/inventory");
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to update inventory:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update inventory" 
    };
  }
}

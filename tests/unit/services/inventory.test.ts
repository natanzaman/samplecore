import { describe, it, expect, beforeEach } from "vitest";
import { InventoryService } from "@/services/inventory";
import { db } from "@/lib/db";
import type { ProductionItem, SampleItem } from "@prisma/client";

describe("InventoryService", () => {
  let productionItem: ProductionItem;
  let sampleItem: SampleItem;

  beforeEach(async () => {
    // Clean up test data
    await db.sampleInventory.deleteMany();
    await db.sampleItem.deleteMany();
    await db.productionItem.deleteMany();

    // Create test data
    productionItem = await db.productionItem.create({
      data: {
        name: "Test Production Item",
        description: "Test description",
      },
    });

    sampleItem = await db.sampleItem.create({
      data: {
        productionItemId: productionItem.id,
        stage: "PROTOTYPE",
        color: "Black",
        size: "M",
        revision: "A",
      },
    });
  });

  it("should get production items with samples", async () => {
    const items = await InventoryService.getProductionItemsWithSamples();
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].sampleItems.length).toBeGreaterThan(0);
  });

  it("should get production item by ID", async () => {
    const item = await InventoryService.getProductionItemById(productionItem.id);
    expect(item).toBeDefined();
    expect(item?.id).toBe(productionItem.id);
    expect(item?.sampleItems).toBeDefined();
  });

  it("should get sample item by ID", async () => {
    const item = await InventoryService.getSampleItemById(sampleItem.id);
    expect(item).toBeDefined();
    expect(item?.id).toBe(sampleItem.id);
    expect(item?.productionItem).toBeDefined();
  });

  it("should create a sample item", async () => {
    const newSample = await InventoryService.createSampleItem({
      productionItemId: productionItem.id,
      stage: "DEVELOPMENT",
      color: "Navy",
      size: "L",
      revision: "B",
    });

    expect(newSample).toBeDefined();
    expect(newSample.stage).toBe("DEVELOPMENT");
    expect(newSample.color).toBe("Navy");
  });
});


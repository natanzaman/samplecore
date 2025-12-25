import { describe, it, expect, beforeEach } from "vitest";
import { db } from "@/lib/db";

describe("Database Schema", () => {
  beforeEach(async () => {
    // Clean up test data
    await db.auditEvent.deleteMany();
    await db.comment.deleteMany();
    await db.sampleRequest.deleteMany();
    await db.sampleInventory.deleteMany();
    await db.sampleItem.deleteMany();
    await db.team.deleteMany();
    await db.productionItem.deleteMany();
  });

  it("should create production item with sample items", async () => {
    const productionItem = await db.productionItem.create({
      data: {
        name: "Test Item",
        description: "Test description",
        sampleItems: {
          create: [
            {
              stage: "PROTOTYPE",
              color: "Black",
              size: "M",
              revision: "A",
            },
          ],
        },
      },
      include: {
        sampleItems: true,
      },
    });

    expect(productionItem).toBeDefined();
    expect(productionItem.sampleItems.length).toBe(1);
    expect(productionItem.sampleItems[0].stage).toBe("PROTOTYPE");
  });

  it("should enforce unique constraint on sample items", async () => {
    const productionItem = await db.productionItem.create({
      data: { name: "Test Item" },
    });

    await db.sampleItem.create({
      data: {
        productionItemId: productionItem.id,
        stage: "PROTOTYPE",
        color: "Black",
        size: "M",
        revision: "A",
      },
    });

    // Attempting to create duplicate should fail
    await expect(
      db.sampleItem.create({
        data: {
          productionItemId: productionItem.id,
          stage: "PROTOTYPE",
          color: "Black",
          size: "M",
          revision: "A",
        },
      })
    ).rejects.toThrow();
  });

  it("should cascade delete sample items when production item is deleted", async () => {
    const productionItem = await db.productionItem.create({
      data: {
        name: "Test Item",
        sampleItems: {
          create: [
            {
              stage: "PROTOTYPE",
              color: "Black",
              size: "M",
            },
          ],
        },
      },
    });

    const sampleItem = await db.sampleItem.findFirst({
      where: { productionItemId: productionItem.id },
    });

    expect(sampleItem).toBeDefined();

    await db.productionItem.delete({
      where: { id: productionItem.id },
    });

    const deletedSample = await db.sampleItem.findUnique({
      where: { id: sampleItem!.id },
    });

    expect(deletedSample).toBeNull();
  });

  it("should create request with team and sample item", async () => {
    const productionItem = await db.productionItem.create({
      data: { name: "Test Item" },
    });

    const sampleItem = await db.sampleItem.create({
      data: {
        productionItemId: productionItem.id,
        stage: "PROTOTYPE",
      },
    });

    const team = await db.team.create({
      data: {
        name: "Test Team",
        isInternal: true,
      },
    });

    const request = await db.sampleRequest.create({
      data: {
        sampleItemId: sampleItem.id,
        teamId: team.id,
        quantity: 1,
        status: "REQUESTED",
      },
      include: {
        sampleItem: true,
        team: true,
      },
    });

    expect(request).toBeDefined();
    expect(request.sampleItem.id).toBe(sampleItem.id);
    expect(request.team.id).toBe(team.id);
  });
});


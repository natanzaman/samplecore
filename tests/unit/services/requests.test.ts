import { describe, it, expect, beforeEach } from "vitest";
import { RequestsService } from "@/services/requests";
import { TeamsService } from "@/services/teams";
import { InventoryService } from "@/services/inventory";
import { db } from "@/lib/db";

describe("RequestsService", () => {
  let productionItemId: string;
  let sampleItemId: string;
  let teamId: string;

  beforeEach(async () => {
    // Clean up
    await db.comment.deleteMany();
    await db.sampleRequest.deleteMany();
    await db.sampleInventory.deleteMany();
    await db.sampleItem.deleteMany();
    await db.team.deleteMany();
    await db.productionItem.deleteMany();

    // Create test data
    const productionItem = await db.productionItem.create({
      data: { name: "Test Item", description: "Test" },
    });
    productionItemId = productionItem.id;

    const sampleItem = await db.sampleItem.create({
      data: {
        productionItemId: productionItem.id,
        stage: "PROTOTYPE",
        color: "Black",
        size: "M",
      },
    });
    sampleItemId = sampleItem.id;

    const team = await db.team.create({
      data: {
        name: "Test Team",
        isInternal: true,
      },
    });
    teamId = team.id;
  });

  it("should create a request", async () => {
    const request = await RequestsService.createRequest({
      sampleItemId,
      teamId,
      quantity: 1,
      shippingMethod: "Internal Hand-off",
    });

    expect(request).toBeDefined();
    expect(request.status).toBe("REQUESTED");
    expect(request.quantity).toBe(1);
  });

  it("should get requests with filters", async () => {
    await RequestsService.createRequest({
      sampleItemId,
      teamId,
      quantity: 1,
    });

    const requests = await RequestsService.getRequests({ status: "REQUESTED" });
    expect(requests.length).toBeGreaterThan(0);
    expect(requests[0].status).toBe("REQUESTED");
  });

  it("should update request status", async () => {
    const request = await RequestsService.createRequest({
      sampleItemId,
      teamId,
      quantity: 1,
    });

    const updated = await RequestsService.updateRequest(request.id, {
      status: "APPROVED",
      approvedAt: new Date(),
    });

    expect(updated.status).toBe("APPROVED");
    expect(updated.approvedAt).toBeDefined();
  });
});


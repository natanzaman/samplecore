import { db } from "@/lib/db";
import type {
  CreateProductionItemInput,
  CreateSampleItemInput,
  UpdateSampleItemInput,
  CreateInventoryInput,
  UpdateInventoryInput,
} from "@/lib/validations";
import { AuditService } from "./audit";
import { getCurrentUser } from "@/lib/auth";

/**
 * Inventory service - handles sample items and inventory management
 */
export class InventoryService {
  /**
   * Get all production items with their latest sample items
   */
  static async getProductionItemsWithSamples(filters?: {
    stage?: string;
    color?: string;
    size?: string;
  }) {
    const whereClause: any = {};
    
    // Build filter for sample items
    const sampleItemFilters: any = {};
    if (filters?.stage && filters.stage !== "all") {
      sampleItemFilters.stage = filters.stage as any;
    }
    if (filters?.color && filters.color !== "all") {
      // Use exact match for color (case-insensitive via Prisma)
      sampleItemFilters.color = filters.color;
    }
    if (filters?.size && filters.size !== "all") {
      // Use exact match for size (case-insensitive via Prisma)
      sampleItemFilters.size = filters.size;
    }
    
    if (Object.keys(sampleItemFilters).length > 0) {
      whereClause.sampleItems = {
        some: sampleItemFilters,
      };
    }

    return db.productionItem.findMany({
      where: whereClause,
      include: {
        sampleItems: {
          orderBy: { createdAt: "desc" },
          take: 1, // Latest sample item
          include: {
            inventory: {
              where: {
                status: "AVAILABLE",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Get unique colors and sizes from all sample items
   */
  static async getUniqueColorsAndSizes() {
    const [colors, sizes] = await Promise.all([
      db.sampleItem.findMany({
        where: { color: { not: null } },
        select: { color: true },
        distinct: ["color"],
      }),
      db.sampleItem.findMany({
        where: { size: { not: null } },
        select: { size: true },
        distinct: ["size"],
      }),
    ]);

    return {
      colors: colors.map((c) => c.color).filter((c): c is string => c !== null).sort(),
      sizes: sizes.map((s) => s.size).filter((s): s is string => s !== null).sort(),
    };
  }

  /**
   * Get production item by ID with all sample items
   */
  static async getProductionItemById(id: string) {
    return db.productionItem.findUnique({
      where: { id },
      include: {
        comments: {
          where: { parentCommentId: null }, // Only top-level comments
          orderBy: { createdAt: "desc" },
          include: {
            replies: {
              orderBy: { createdAt: "asc" },
              include: {
                replies: {
                  orderBy: { createdAt: "asc" },
                },
              },
            },
          },
        },
        sampleItems: {
          include: {
            inventory: true,
            _count: {
              select: {
                requests: true,
                comments: true,
              },
            },
          },
          orderBy: [
            { stage: "asc" },
            { createdAt: "desc" },
          ],
        },
      },
    });
  }

  /**
   * Get sample item by ID with full details
   */
  static async getSampleItemById(id: string) {
    return db.sampleItem.findUnique({
      where: { id },
      include: {
        productionItem: true,
        inventory: {
          orderBy: { createdAt: "desc" },
        },
        comments: {
          where: { parentCommentId: null }, // Only top-level comments
          orderBy: { createdAt: "desc" },
          include: {
            replies: {
              orderBy: { createdAt: "asc" },
              include: {
                replies: {
                  orderBy: { createdAt: "asc" },
                  include: {
                    replies: {
                      orderBy: { createdAt: "asc" },
                    },
                  },
                },
              },
            },
          },
        },
        requests: {
          include: {
            team: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  /**
   * Create a new production item
   */
  static async createProductionItem(data: CreateProductionItemInput) {
    const user = getCurrentUser();
    try {
      const productionItem = await db.productionItem.create({
        data,
      });

      // Audit
      await AuditService.createEvent({
        entityType: "ProductionItem",
        entityId: productionItem.id,
        action: "CREATED",
        userId: user.id,
        metadata: { name: productionItem.name },
      });

      return productionItem;
    } catch (error) {
      const { handleUniqueConstraintError } = await import("@/lib/errors");
      const errorMessage = await handleUniqueConstraintError(error, "ProductionItem", data);
      throw new Error(errorMessage);
    }
  }

  /**
   * Get all sample items for a production item
   */
  static async getSampleItemsByProductionId(productionItemId: string) {
    return db.sampleItem.findMany({
      where: { productionItemId },
      include: {
        inventory: true,
        _count: {
          select: {
            requests: true,
            comments: true,
          },
        },
      },
      orderBy: [
        { stage: "asc" },
        { createdAt: "desc" },
      ],
    });
  }

  /**
   * Create a new sample item
   */
  static async createSampleItem(data: CreateSampleItemInput) {
    const user = getCurrentUser();
    try {
      const sampleItem = await db.sampleItem.create({
        data,
        include: {
          productionItem: true,
        },
      });

      // Audit
      await AuditService.createEvent({
        entityType: "SampleItem",
        entityId: sampleItem.id,
        action: "CREATED",
        userId: user.id,
        metadata: { stage: sampleItem.stage, color: sampleItem.color, size: sampleItem.size },
      });

      return sampleItem;
    } catch (error) {
      const { handleUniqueConstraintError } = await import("@/lib/errors");
      const errorMessage = await handleUniqueConstraintError(error, "SampleItem", data);
      throw new Error(errorMessage);
    }
  }

  /**
   * Create multiple sample items with initial inventory
   */
  static async createSampleItemsWithInventory(
    productionItemId: string,
    variations: Array<{
      stage: string;
      color?: string | null;
      size?: string | null;
      revision: string;
      notes?: string | null;
      initialQuantity: number;
      location?: "STUDIO_A" | "STUDIO_B" | "WAREHOUSE_A" | "WAREHOUSE_B" | "WAREHOUSE_C" | "SHOWROOM" | "PHOTO_STUDIO" | "OFFICE" | null;
      color?: string | null;
    }>
  ) {
    const user = getCurrentUser();
    const results = [];
    const { handleUniqueConstraintError } = await import("@/lib/errors");

    for (const variation of variations) {
      const { initialQuantity, location, ...sampleData } = variation;
      
      try {
        // Create sample item
        const sampleItem = await db.sampleItem.create({
          data: {
            ...sampleData,
            productionItemId,
            stage: variation.stage as any,
          },
          include: {
            productionItem: true,
          },
        });

        // Create initial inventory if quantity > 0
        if (initialQuantity > 0) {
          await db.sampleInventory.create({
            data: {
              sampleItemId: sampleItem.id,
              quantity: initialQuantity,
              location: location || null,
              status: "AVAILABLE",
            },
          });
        }

        // Audit
        await AuditService.createEvent({
          entityType: "SampleItem",
          entityId: sampleItem.id,
          action: "CREATED",
          userId: user.id,
          metadata: {
            stage: sampleItem.stage,
            color: sampleItem.color,
            size: sampleItem.size,
            initialQuantity,
          },
        });

        // Fetch the sample item with inventory included
        const sampleItemWithInventory = await db.sampleItem.findUnique({
          where: { id: sampleItem.id },
          include: {
            productionItem: true,
            inventory: true,
          },
        });

        if (sampleItemWithInventory) {
          results.push(sampleItemWithInventory);
        } else {
          results.push(sampleItem);
        }
      } catch (error) {
        const errorMessage = await handleUniqueConstraintError(
          error,
          "SampleItem",
          {
            productionItemId,
            stage: variation.stage,
            color: variation.color,
            size: variation.size,
            revision: variation.revision,
          }
        );
        throw new Error(errorMessage);
      }
    }

    return results;
  }

  /**
   * Update a sample item
   */
  static async updateSampleItem(id: string, data: UpdateSampleItemInput) {
    const user = getCurrentUser();
    const sampleItem = await db.sampleItem.update({
      where: { id },
      data,
      include: {
        productionItem: true,
      },
    });

    // Audit
    await AuditService.createEvent({
      entityType: "SampleItem",
      entityId: sampleItem.id,
      action: "UPDATED",
      userId: user.id,
      metadata: data,
    });

    return sampleItem;
  }

  /**
   * Create inventory entry
   */
  static async createInventory(data: CreateInventoryInput) {
    const user = getCurrentUser();
    const inventory = await db.sampleInventory.create({
      data,
      include: {
        sampleItem: {
          include: {
            productionItem: true,
          },
        },
      },
    });

    // Audit
    await AuditService.createEvent({
      entityType: "SampleInventory",
      entityId: inventory.id,
      action: "CREATED",
      userId: user.id,
      metadata: { quantity: inventory.quantity, location: inventory.location },
    });

    return inventory;
  }

  /**
   * Update inventory entry
   */
  static async updateInventory(id: string, data: UpdateInventoryInput) {
    const user = getCurrentUser();
    const inventory = await db.sampleInventory.update({
      where: { id },
      data,
      include: {
        sampleItem: {
          include: {
            productionItem: true,
          },
        },
      },
    });

    // Audit
    await AuditService.createEvent({
      entityType: "SampleInventory",
      entityId: inventory.id,
      action: "UPDATED",
      userId: user.id,
      metadata: data,
    });

    return inventory;
  }
}


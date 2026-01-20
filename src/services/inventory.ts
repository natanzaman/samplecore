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
    stage?: string; // Comma-separated stages
    color?: string; // Comma-separated colors
    size?: string; // Comma-separated sizes
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 12;
    const skip = (page - 1) * limit;
    
    const whereClause: any = {};
    
    // Search filter - search in name and description
    if (filters?.search) {
      whereClause.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }
    
    // Parse arrays from comma-separated strings
    const stageArray = filters?.stage
      ? filters.stage.split(",").filter(Boolean)
      : [];
    const colorArray = filters?.color
      ? filters.color.split(",").filter(Boolean)
      : [];
    const sizeArray = filters?.size
      ? filters.size.split(",").filter(Boolean)
      : [];
    
    // Build filter for sample items
    const sampleItemFilters: any = {};
    if (stageArray.length > 0) {
      sampleItemFilters.stage = { in: stageArray as any[] };
    }
    if (colorArray.length > 0) {
      sampleItemFilters.color = { in: colorArray };
    }
    if (sizeArray.length > 0) {
      sampleItemFilters.size = { in: sizeArray };
    }
    
    if (Object.keys(sampleItemFilters).length > 0) {
      whereClause.sampleItems = {
        some: sampleItemFilters,
      };
    }

    const [items, total] = await Promise.all([
      db.productionItem.findMany({
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
        skip,
        take: limit,
      }),
      db.productionItem.count({ where: whereClause }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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
            requests: {
              include: {
                team: true,
              },
              orderBy: { createdAt: "desc" },
            },
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

        // Create individual inventory records (one record per item)
        if (initialQuantity > 0) {
          await db.sampleInventory.createMany({
            data: Array.from({ length: initialQuantity }, () => ({
              sampleItemId: sampleItem.id,
              location: location || null,
              status: "AVAILABLE" as const,
            })),
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
      metadata: { location: inventory.location, status: inventory.status },
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

  /**
   * Add inventory entry (alias for createInventory)
   */
  static async addInventory(data: CreateInventoryInput) {
    return this.createInventory(data);
  }
}


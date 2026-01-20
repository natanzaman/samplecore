import { db } from "@/lib/db";
import type {
  CreateSampleRequestInput,
  UpdateSampleRequestInput,
} from "@/lib/validations";
import { AuditService } from "./audit";
import { getCurrentUser } from "@/lib/auth";

/**
 * Requests service - handles sample request lifecycle
 */
export class RequestsService {
  /**
   * Get all requests with filters and pagination
   */
  static async getRequests(filters?: {
    status?: string; // Comma-separated statuses
    teamId?: string; // Comma-separated team IDs
    sampleItemId?: string;
    productName?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;
    
    // Build date range filter
    const dateFilter: any = {};
    if (filters?.dateFrom) {
      const startDate = new Date(filters.dateFrom);
      startDate.setHours(0, 0, 0, 0);
      dateFilter.gte = startDate;
    }
    if (filters?.dateTo) {
      // Set to end of day to include the entire end date
      const endDate = new Date(filters.dateTo);
      endDate.setHours(23, 59, 59, 999);
      dateFilter.lte = endDate;
    }

    // Parse status array from comma-separated string
    const statusArray = filters?.status
      ? filters.status.split(",").filter(Boolean)
      : [];

    // Parse team array from comma-separated string
    const teamArray = filters?.teamId
      ? filters.teamId.split(",").filter(Boolean)
      : [];

    const whereClause: any = {
      ...(statusArray.length > 0 && { status: { in: statusArray as any[] } }),
      ...(teamArray.length > 0 && { teamId: { in: teamArray } }),
      ...(filters?.sampleItemId && { sampleItemId: filters.sampleItemId }),
      ...(Object.keys(dateFilter).length > 0 && { requestedAt: dateFilter }),
      ...(filters?.productName && filters.productName.trim() && {
        sampleItem: {
          productionItem: {
            name: {
              contains: filters.productName.trim(),
              mode: "insensitive" as const,
            },
          },
        },
      }),
    };

    const [items, total] = await Promise.all([
      db.sampleRequest.findMany({
        where: whereClause,
        include: {
          sampleItem: {
            include: {
              productionItem: true,
            },
          },
          team: true,
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
        },
        orderBy: {
          requestedAt: "desc",
        },
        skip,
        take: limit,
      }),
      db.sampleRequest.count({ where: whereClause }),
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
   * Get request by ID
   */
  static async getRequestById(id: string) {
    return db.sampleRequest.findUnique({
      where: { id },
      include: {
        sampleItem: {
          include: {
            productionItem: true,
            inventory: true,
          },
        },
        team: true,
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
      },
    });
  }

  /**
   * Create a new request
   */
  static async createRequest(data: CreateSampleRequestInput) {
    const user = getCurrentUser();
    const request = await db.sampleRequest.create({
      data,
      include: {
        sampleItem: {
          include: {
            productionItem: true,
          },
        },
        team: true,
      },
    });

    // Audit
    await AuditService.createEvent({
      entityType: "SampleRequest",
      entityId: request.id,
      action: "CREATED",
      userId: user.id,
      metadata: {
        status: request.status,
        quantity: request.quantity,
        teamId: request.teamId,
      },
    });

    return request;
  }

  /**
   * Update request (primarily for status changes)
   */
  static async updateRequest(id: string, data: UpdateSampleRequestInput) {
    const user = getCurrentUser();
    const existing = await db.sampleRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error("Request not found");
    }

    const request = await db.sampleRequest.update({
      where: { id },
      data,
      include: {
        sampleItem: {
          include: {
            productionItem: true,
            inventory: true,
          },
        },
        team: true,
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
      },
    });

    // Audit status changes
    if (data.status && data.status !== existing.status) {
      await AuditService.createEvent({
        entityType: "SampleRequest",
        entityId: request.id,
        action: "STATUS_CHANGED",
        userId: user.id,
        metadata: {
          from: existing.status,
          to: data.status,
        },
      });
    } else {
      await AuditService.createEvent({
        entityType: "SampleRequest",
        entityId: request.id,
        action: "UPDATED",
        userId: user.id,
        metadata: data,
      });
    }

    return request;
  }

  /**
   * Get request statistics
   */
  static async getRequestStats() {
    const [total, byStatus] = await Promise.all([
      db.sampleRequest.count(),
      db.sampleRequest.groupBy({
        by: ["status"],
        _count: true,
      }),
    ]);

    return {
      total,
      byStatus: byStatus.reduce(
        (acc, item) => {
          acc[item.status] = item._count;
          return acc;
        },
        {} as Record<string, number>
      ),
    };
  }
}


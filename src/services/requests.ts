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
   * Get all requests with filters
   */
  static async getRequests(filters?: {
    status?: string;
    teamId?: string;
    sampleItemId?: string;
  }) {
    return db.sampleRequest.findMany({
      where: {
        ...(filters?.status && { status: filters.status as any }),
        ...(filters?.teamId && { teamId: filters.teamId }),
        ...(filters?.sampleItemId && { sampleItemId: filters.sampleItemId }),
      },
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
    });
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


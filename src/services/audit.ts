import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

/**
 * Audit service - creates append-only log entries for important actions
 */
export class AuditService {
  /**
   * Create an audit event
   */
  static async createEvent(data: {
    entityType: string;
    entityId: string;
    action: string;
    userId: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    return db.auditEvent.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        userId: data.userId,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  }

  /**
   * Get audit events for an entity
   */
  static async getEventsForEntity(entityType: string, entityId: string) {
    return db.auditEvent.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}


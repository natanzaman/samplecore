import { db } from "@/lib/db";
import type { CreateTeamInput, UpdateTeamInput } from "@/lib/validations";
import { AuditService } from "./audit";
import { getCurrentUser } from "@/lib/auth";

/**
 * Teams service - handles team CRUD operations
 */
export class TeamsService {
  /**
   * Get all teams
   */
  static async getTeams(filters?: { isInternal?: boolean; search?: string }) {
    const whereClause: any = {};
    
    if (filters?.isInternal !== undefined) {
      whereClause.isInternal = filters.isInternal;
    }
    
    // Search filter - search in name, email, and phone
    if (filters?.search) {
      whereClause.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { contactEmail: { contains: filters.search, mode: "insensitive" } },
        { contactPhone: { contains: filters.search, mode: "insensitive" } },
      ];
    }
    
    return db.team.findMany({
      where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
      include: {
        _count: {
          select: {
            requests: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  /**
   * Get team by ID
   */
  static async getTeamById(id: string) {
    return db.team.findUnique({
      where: { id },
      include: {
        requests: {
          include: {
            sampleItem: {
              include: {
                productionItem: true,
              },
            },
          },
          orderBy: {
            requestedAt: "desc",
          },
        },
        _count: {
          select: {
            requests: true,
          },
        },
      },
    });
  }

  /**
   * Create a new team
   */
  static async createTeam(data: CreateTeamInput) {
    const user = getCurrentUser();
    try {
      const team = await db.team.create({
        data,
      });

      // Audit
      await AuditService.createEvent({
        entityType: "Team",
        entityId: team.id,
        action: "CREATED",
        userId: user.id,
        metadata: { name: team.name, isInternal: team.isInternal },
      });

      return team;
    } catch (error) {
      const { handleUniqueConstraintError } = await import("@/lib/errors");
      const errorMessage = await handleUniqueConstraintError(error, "Team", data);
      throw new Error(errorMessage);
    }
  }

  /**
   * Update a team
   */
  static async updateTeam(id: string, data: UpdateTeamInput) {
    const user = getCurrentUser();
    const team = await db.team.update({
      where: { id },
      data,
    });

    // Audit
    await AuditService.createEvent({
      entityType: "Team",
      entityId: team.id,
      action: "UPDATED",
      userId: user.id,
      metadata: data,
    });

    return team;
  }

  /**
   * Delete a team (only if no requests exist)
   */
  static async deleteTeam(id: string) {
    const user = getCurrentUser();
    const team = await db.team.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            requests: true,
          },
        },
      },
    });

    if (!team) {
      throw new Error("Team not found");
    }

    if (team._count.requests > 0) {
      throw new Error("Cannot delete team with existing requests");
    }

    await db.team.delete({
      where: { id },
    });

    // Audit
    await AuditService.createEvent({
      entityType: "Team",
      entityId: id,
      action: "DELETED",
      userId: user.id,
      metadata: { name: team.name },
    });

    return { success: true };
  }
}


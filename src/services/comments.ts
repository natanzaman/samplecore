import { db } from "@/lib/db";
import type { CreateCommentInput, UpdateCommentInput } from "@/lib/validations";
import { AuditService } from "./audit";
import { getCurrentUser } from "@/lib/auth";

/**
 * Comments service - handles comments on sample items and requests
 */
export class CommentsService {
  /**
   * Create a comment
   */
  static async createComment(data: CreateCommentInput) {
    const user = getCurrentUser();
    
    // If this is a reply, we need to get the parent comment's entity IDs
    let entityData: any = {};
    if (data.parentCommentId) {
      const parentComment = await db.comment.findUnique({
        where: { id: data.parentCommentId },
        select: {
          productionItemId: true,
          sampleItemId: true,
          requestId: true,
        },
      });
      if (parentComment) {
        entityData = {
          productionItemId: parentComment.productionItemId,
          sampleItemId: parentComment.sampleItemId,
          requestId: parentComment.requestId,
        };
      }
    } else {
      entityData = {
        productionItemId: data.productionItemId,
        sampleItemId: data.sampleItemId,
        requestId: data.requestId,
      };
    }
    
    const comment = await db.comment.create({
      data: {
        ...entityData,
        parentCommentId: data.parentCommentId,
        content: data.content,
        authorId: user.id,
      },
      include: {
        parent: true,
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            replies: {
              orderBy: { createdAt: "asc" },
            },
          },
        },
        productionItem: true,
        sampleItem: {
          include: {
            productionItem: true,
          },
        },
        request: {
          include: {
            sampleItem: true,
            team: true,
          },
        },
      },
    });

    // Audit
    await AuditService.createEvent({
      entityType: "Comment",
      entityId: comment.id,
      action: "CREATED",
      userId: user.id,
      metadata: {
        productionItemId: comment.productionItemId,
        sampleItemId: comment.sampleItemId,
        requestId: comment.requestId,
      },
    });

    return comment;
  }

  /**
   * Update a comment
   */
  static async updateComment(id: string, data: UpdateCommentInput) {
    const user = getCurrentUser();
    const comment = await db.comment.update({
      where: { id },
      data,
    });

    // Audit
    await AuditService.createEvent({
      entityType: "Comment",
      entityId: comment.id,
      action: "UPDATED",
      userId: user.id,
    });

    return comment;
  }

  /**
   * Delete a comment
   */
  static async deleteComment(id: string) {
    const user = getCurrentUser();
    const comment = await db.comment.delete({
      where: { id },
    });

    // Audit
    await AuditService.createEvent({
      entityType: "Comment",
      entityId: id,
      action: "DELETED",
      userId: user.id,
    });

    return { success: true };
  }
}


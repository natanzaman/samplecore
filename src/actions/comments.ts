"use server";

import { revalidatePath } from "next/cache";
import { CommentsService } from "@/services/comments";

export async function createComment(data: {
  content: string;
  productionItemId?: string;
  sampleItemId?: string;
  requestId?: string;
  parentCommentId?: string;
}) {
  try {
    const result = await CommentsService.createComment(data);
    
    // Revalidate relevant paths
    if (data.productionItemId) {
      revalidatePath(`/inventory`);
    }
    if (data.sampleItemId) {
      revalidatePath(`/inventory/sample/${data.sampleItemId}`);
    }
    if (data.requestId) {
      revalidatePath(`/requests/request/${data.requestId}`);
    }
    revalidatePath("/requests");
    revalidatePath("/inventory");
    
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to create comment:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create comment" 
    };
  }
}

export async function updateComment(commentId: string, content: string) {
  try {
    const result = await CommentsService.updateComment(commentId, content);
    revalidatePath("/requests");
    revalidatePath("/inventory");
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to update comment:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update comment" 
    };
  }
}

export async function deleteComment(commentId: string) {
  try {
    await CommentsService.deleteComment(commentId);
    revalidatePath("/requests");
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete comment:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete comment" 
    };
  }
}

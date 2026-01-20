"use server";

import { revalidatePath } from "next/cache";
import { RequestsService } from "@/services/requests";
import { UpdateSampleRequestSchema } from "@/lib/validations";
import type { RequestStatus } from "@prisma/client";

export async function updateRequestStatus(requestId: string, status: RequestStatus) {
  try {
    const result = await RequestsService.updateRequest(requestId, { status });
    revalidatePath("/requests");
    revalidatePath(`/requests/${requestId}`);
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to update request status:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update status" 
    };
  }
}

export async function updateRequest(
  requestId: string,
  data: {
    status?: RequestStatus;
    quantity?: number;
    shippingMethod?: string | null;
    shippingAddress?: string | null;
    notes?: string | null;
  }
) {
  try {
    const validated = UpdateSampleRequestSchema.parse(data);
    const result = await RequestsService.updateRequest(requestId, validated);
    revalidatePath("/requests");
    revalidatePath(`/requests/${requestId}`);
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to update request:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update request" 
    };
  }
}

export async function createRequest(data: {
  sampleItemId: string;
  teamId: string;
  quantity: number;
  notes?: string;
  shippingMethod?: string;
  shippingAddress?: string;
}) {
  try {
    const result = await RequestsService.createRequest(data);
    revalidatePath("/requests");
    revalidatePath("/inventory");
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to create request:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create request" 
    };
  }
}

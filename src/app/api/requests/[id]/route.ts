import { NextRequest, NextResponse } from "next/server";
import { RequestsService } from "@/services/requests";
import { UpdateSampleRequestSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestData = await RequestsService.getRequestById(params.id);
    if (!requestData) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }
    return NextResponse.json(requestData);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Get existing request to check current status and timestamps
    const existing = await RequestsService.getRequestById(params.id);
    if (!existing) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }

    // Clean up body - convert empty strings to undefined
    const cleanedBody = { ...body };
    if (cleanedBody.shippingMethod === "") cleanedBody.shippingMethod = undefined;
    if (cleanedBody.notes === "") cleanedBody.notes = undefined;

    // Parse and validate the update data
    const validated = UpdateSampleRequestSchema.parse(cleanedBody);

    // Handle status-specific timestamps
    const updateData: any = {};
    
    // Only include fields that are actually being updated
    if (validated.status !== undefined) updateData.status = validated.status;
    if (validated.quantity !== undefined) updateData.quantity = validated.quantity;
    if (validated.shippingMethod !== undefined) updateData.shippingMethod = validated.shippingMethod;
    if (validated.notes !== undefined) updateData.notes = validated.notes;
    
    // Only set timestamps if status is changing to that status and timestamp doesn't already exist
    if (validated.status && validated.status !== existing.status) {
      const now = new Date();
      if (validated.status === "APPROVED" && !existing.approvedAt) {
        updateData.approvedAt = now;
      }
      if (validated.status === "SHIPPED" && !existing.shippedAt) {
        updateData.shippedAt = now;
      }
      if (validated.status === "HANDED_OFF" && !existing.handedOffAt) {
        updateData.handedOffAt = now;
      }
      if (validated.status === "RETURNED" && !existing.returnedAt) {
        updateData.returnedAt = now;
      }
      if (validated.status === "CLOSED" && !existing.closedAt) {
        updateData.closedAt = now;
      }
    }

    // Handle explicit date fields from the request (if provided)
    const dateFields = ["approvedAt", "shippedAt", "handedOffAt", "returnedAt", "closedAt"];
    for (const field of dateFields) {
      if (validated[field as keyof typeof validated] !== undefined) {
        const dateValue = validated[field as keyof typeof validated];
        if (dateValue instanceof Date) {
          updateData[field] = dateValue;
        } else if (typeof dateValue === "string") {
          updateData[field] = new Date(dateValue);
        }
      }
    }

    const updatedRequest = await RequestsService.updateRequest(params.id, updateData);

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Error updating request:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}


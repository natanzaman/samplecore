import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Standard API response helpers
 */

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function createdResponse<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ message }, { status });
}

export function notFoundResponse(message = "Resource not found") {
  return NextResponse.json({ message }, { status: 404 });
}

export function serverErrorResponse(message = "Internal server error") {
  return NextResponse.json({ message }, { status: 500 });
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown) {
  console.error("API Error:", error);

  if (error instanceof ZodError) {
    const message = error.errors.map((e) => e.message).join(", ");
    return errorResponse(message, 400);
  }

  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes("not found")) {
      return notFoundResponse(error.message);
    }
    return errorResponse(error.message, 400);
  }

  return serverErrorResponse();
}

/**
 * Wrap an API handler with consistent error handling
 */
export function withErrorHandling<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | { message: string }>> {
  return handler().catch(handleApiError);
}

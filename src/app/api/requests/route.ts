import { NextRequest, NextResponse } from "next/server";
import { RequestsService } from "@/services/requests";
import { CreateSampleRequestSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateSampleRequestSchema.parse(body);

    const newRequest = await RequestsService.createRequest(validated);

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
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


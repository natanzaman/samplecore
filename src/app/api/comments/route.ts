import { NextRequest, NextResponse } from "next/server";
import { CommentsService } from "@/services/comments";
import { CreateCommentSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateCommentSchema.parse(body);

    const newComment = await CommentsService.createComment(validated);

    return NextResponse.json(newComment, { status: 201 });
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


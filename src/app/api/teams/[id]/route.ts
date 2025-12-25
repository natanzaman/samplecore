import { NextRequest, NextResponse } from "next/server";
import { TeamsService } from "@/services/teams";
import { UpdateTeamSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const team = await TeamsService.getTeamById(params.id);
    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }
    return NextResponse.json(team);
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
    const validated = UpdateTeamSchema.parse(body);

    const updatedTeam = await TeamsService.updateTeam(params.id, validated);

    return NextResponse.json(updatedTeam);
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await TeamsService.deleteTeam(params.id);

    return NextResponse.json({ success: true });
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


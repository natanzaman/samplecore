import { NextRequest, NextResponse } from "next/server";
import { TeamsService } from "@/services/teams";
import { CreateTeamSchema } from "@/lib/validations";

export async function GET() {
  try {
    const teams = await TeamsService.getTeams();
    return NextResponse.json(teams);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateTeamSchema.parse(body);

    const newTeam = await TeamsService.createTeam(validated);

    return NextResponse.json(newTeam, { status: 201 });
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

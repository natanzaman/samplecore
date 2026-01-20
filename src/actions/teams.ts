"use server";

import { revalidatePath } from "next/cache";
import { TeamsService } from "@/services/teams";

export async function createTeam(data: {
  name: string;
  type: "INTERNAL" | "EXTERNAL";
  contactEmail?: string;
  contactPhone?: string;
}) {
  try {
    const result = await TeamsService.createTeam(data);
    revalidatePath("/teams");
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to create team:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create team" 
    };
  }
}

export async function updateTeam(
  teamId: string,
  data: {
    name?: string;
    type?: "INTERNAL" | "EXTERNAL";
    contactEmail?: string | null;
    contactPhone?: string | null;
  }
) {
  try {
    const result = await TeamsService.updateTeam(teamId, data);
    revalidatePath("/teams");
    revalidatePath(`/teams/${teamId}`);
    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to update team:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update team" 
    };
  }
}

export async function deleteTeam(teamId: string) {
  try {
    await TeamsService.deleteTeam(teamId);
    revalidatePath("/teams");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete team:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete team" 
    };
  }
}

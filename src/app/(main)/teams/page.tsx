import { TeamsService } from "@/services/teams";
import { TeamsList } from "@/components/teams/teams-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function TeamsPage() {
  const teams = await TeamsService.getTeams();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground">
            Manage teams that request samples
          </p>
        </div>
        <Link href="/teams/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Team
          </Button>
        </Link>
      </div>

      <TeamsList teams={teams} />
    </div>
  );
}


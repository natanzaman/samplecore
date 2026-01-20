import { Suspense } from "react";
import { TeamsService } from "@/services/teams";
import { TeamsList } from "@/components/teams/teams-list";
import { TeamsSearch } from "@/components/teams/teams-search";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

type SearchParams = {
  search?: string;
};

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const teams = await TeamsService.getTeams({
    search: searchParams.search,
  });

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

      <div className="mb-6">
        <Suspense fallback={<div className="h-10 flex-1 max-w-sm bg-muted animate-pulse rounded-md" />}>
          <TeamsSearch />
        </Suspense>
      </div>

      {searchParams.search && (
        <p className="mb-4 text-sm text-muted-foreground">
          {teams.length} result{teams.length !== 1 ? "s" : ""} for &quot;{searchParams.search}&quot;
        </p>
      )}

      <TeamsList teams={teams} />
    </div>
  );
}


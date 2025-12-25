import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TeamDetailContent } from "./team-detail-content";
import type { Prisma } from "@prisma/client";

type TeamWithRelations = Prisma.TeamGetPayload<{
  include: {
    requests: {
      include: {
        sampleItem: {
          include: {
            productionItem: true;
          };
        };
      };
      orderBy: {
        requestedAt: "desc";
      };
    };
    _count: {
      select: {
        requests: true;
      };
    };
  };
}>;

export function TeamDetailPage({
  team,
}: {
  team: TeamWithRelations;
}) {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <Link href="/teams">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Teams
          </Button>
        </Link>
      </div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{team.name}</h1>
        <p className="text-muted-foreground">Team details and management</p>
      </div>
      <TeamDetailContent team={team} />
    </div>
  );
}


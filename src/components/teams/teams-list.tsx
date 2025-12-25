import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Team } from "@prisma/client";

type TeamWithCount = Team & {
  _count: {
    requests: number;
  };
};

export function TeamsList({ teams }: { teams: TeamWithCount[] }) {
  if (teams.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No teams found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
        <Link key={team.id} href={`/teams/team/${team.id}`} scroll={false}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{team.name}</CardTitle>
                <Badge variant={team.isInternal ? "default" : "secondary"}>
                  {team.isInternal ? "Internal" : "External"}
                </Badge>
              </div>
              <CardDescription>
                {team._count.requests} request{team._count.requests !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                {team.contactEmail && (
                  <p className="text-muted-foreground">{team.contactEmail}</p>
                )}
                {team.contactPhone && (
                  <p className="text-muted-foreground">{team.contactPhone}</p>
                )}
                {team.address && (
                  <p className="text-muted-foreground line-clamp-2">
                    {team.address}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}


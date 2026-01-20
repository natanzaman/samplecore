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
    <div className="space-y-4">
      {teams.map((team) => (
        <Link
          key={team.id}
          href={`/teams/team/${team.id}`}
          className="block"
          scroll={false}
        >
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  <CardDescription>
                    {team._count.requests} request{team._count.requests !== 1 ? "s" : ""}
                  </CardDescription>
                </div>
                <Badge variant={team.isInternal ? "default" : "secondary"}>
                  {team.isInternal ? "Internal" : "External"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {team.contactEmail && (
                  <div className="flex gap-4">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{team.contactEmail}</span>
                  </div>
                )}
                {team.contactPhone && (
                  <div className="flex gap-4">
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{team.contactPhone}</span>
                  </div>
                )}
                {team.shippingAddress && (
                  <div className="flex gap-4">
                    <span className="text-muted-foreground">Shipping Address:</span>
                    <span className="text-muted-foreground">{team.shippingAddress}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}


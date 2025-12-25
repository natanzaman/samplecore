"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    };
    _count: {
      select: {
        requests: true;
      };
    };
  };
}>;

export function TeamDetailModal({
  team,
}: {
  team: TeamWithRelations;
}) {
  const router = useRouter();

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{team.name}</DialogTitle>
          <DialogDescription>
            Team details and management
          </DialogDescription>
        </DialogHeader>
        <TeamDetailContent
          team={team}
          onViewFullPage={() => {
            window.location.href = `/teams/team/${team.id}`;
          }}
        />
      </DialogContent>
    </Dialog>
  );
}


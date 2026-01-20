"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TeamDetailContent } from "./team-detail-content";
import type { TeamWithRequests } from "@/lib/types";

export function TeamDetailModal({
  team,
}: {
  team: TeamWithRequests;
}) {
  const router = useRouter();

  const handleViewFullPage = () => {
    window.location.href = `/teams/team/${team.id}`;
  };

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pr-12">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{team.name}</DialogTitle>
              <DialogDescription>
                Team details and management
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewFullPage}
            >
              View Full Page
            </Button>
          </div>
        </DialogHeader>
        <TeamDetailContent team={team} />
      </DialogContent>
    </Dialog>
  );
}


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
import { RequestDetailContent } from "./request-detail-content";
import type { RequestWithRelations } from "@/lib/types";

export function RequestDetailModal({
  request,
}: {
  request: RequestWithRelations;
}) {
  const router = useRouter();

  const handleViewFullPage = () => {
    window.location.href = `/requests/request/${request.id}`;
  };

  const handleClose = () => {
    // Navigate to base requests page instead of going back
    // This prevents opening another modal if there are multiple modal routes in history
    // Use replace to replace the current modal route
    router.replace("/requests");
  };

  return (
    <Dialog open onOpenChange={(open) => {
      if (!open) {
        handleClose();
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pr-12">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                Request: {request.sampleItem.productionItem.name}
              </DialogTitle>
              <DialogDescription>
                Request details and management
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
        <RequestDetailContent request={request} />
      </DialogContent>
    </Dialog>
  );
}


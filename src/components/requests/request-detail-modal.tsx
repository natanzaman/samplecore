"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RequestDetailContent } from "./request-detail-content";
import type { Prisma } from "@prisma/client";

type RequestWithRelations = Prisma.SampleRequestGetPayload<{
  include: {
    sampleItem: {
      include: {
        productionItem: true;
        inventory: true;
      };
    };
    team: true;
    comments: true;
  };
}>;

export function RequestDetailModal({
  request,
}: {
  request: RequestWithRelations;
}) {
  const router = useRouter();

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Request: {request.sampleItem.productionItem.name}
          </DialogTitle>
          <DialogDescription>
            Request details and management
          </DialogDescription>
        </DialogHeader>
        <RequestDetailContent
          request={request}
          onViewFullPage={() => {
            window.location.href = `/requests/request/${request.id}`;
          }}
        />
      </DialogContent>
    </Dialog>
  );
}


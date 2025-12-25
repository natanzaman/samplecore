"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SampleDetailContent } from "./sample-detail-content";
import type { Prisma } from "@prisma/client";

type SampleItemWithRelations = Prisma.SampleItemGetPayload<{
  include: {
    productionItem: true;
    inventory: true;
    comments: true;
    requests: {
      include: {
        team: true;
      };
    };
  };
}>;

type ProductionItemWithSamples = Prisma.ProductionItemGetPayload<{
  include: {
    comments: true;
    sampleItems: {
      include: {
        inventory: true;
        _count: {
          select: {
            requests: true;
            comments: true;
          };
        };
      };
    };
  };
}>;

export function SampleDetailModal({
  sampleItem,
  productionItem,
}: {
  sampleItem: SampleItemWithRelations;
  productionItem: ProductionItemWithSamples;
}) {
  const router = useRouter();

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{sampleItem.productionItem.name}</DialogTitle>
          <DialogDescription>
            Sample details and management
          </DialogDescription>
        </DialogHeader>
        <SampleDetailContent
          sampleItem={sampleItem}
          productionItem={productionItem}
          onViewFullPage={() => {
            window.location.href = `/inventory/sample/${sampleItem.id}`;
          }}
        />
      </DialogContent>
    </Dialog>
  );
}


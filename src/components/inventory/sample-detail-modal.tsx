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
import { SampleDetailContent } from "./sample-detail-content";
import type { SampleItemWithRelations, ProductionItemWithSamples } from "@/lib/types";

export function SampleDetailModal({
  sampleItem,
  productionItem,
  viewMode = "sample",
}: {
  sampleItem: SampleItemWithRelations;
  productionItem: ProductionItemWithSamples;
  viewMode?: "product" | "sample";
}) {
  const router = useRouter();

  const handleViewFullPage = () => {
    window.location.href = `/inventory/sample/${sampleItem.id}${viewMode === "product" ? "?view=product" : ""}`;
  };

  const handleClose = () => {
    // Navigate to base inventory page instead of going back
    // This prevents opening another modal if there are multiple modal routes in history
    // Use replace to replace the current modal route
    router.replace("/inventory");
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
              <DialogTitle>{sampleItem.productionItem.name}</DialogTitle>
              <DialogDescription>
                Sample details and management
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
        <SampleDetailContent
          sampleItem={sampleItem}
          productionItem={productionItem}
          viewMode={viewMode}
        />
      </DialogContent>
    </Dialog>
  );
}


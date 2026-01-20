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
import { ProductDetailContent } from "./product-detail-content";
import type { ProductionItemWithSamples } from "@/lib/types";

type ProductDetailModalProps = {
  productionItem: ProductionItemWithSamples;
};

export function ProductDetailModal({ productionItem }: ProductDetailModalProps) {
  const router = useRouter();

  const handleClose = () => {
    // Navigate to base inventory page instead of going back
    // This prevents opening another modal if there are multiple modal routes in history
    // Use replace to replace the current modal route
    router.replace("/inventory");
  };

  const handleViewFullPage = () => {
    window.location.href = `/inventory/product/${productionItem.id}`;
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
              <DialogTitle>{productionItem.name}</DialogTitle>
              <DialogDescription>
                Product details and sample management
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
        <ProductDetailContent 
          productionItem={productionItem} 
          isModal 
          onClose={handleClose}
        />
      </DialogContent>
    </Dialog>
  );
}

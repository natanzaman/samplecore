"use client";

import { useModal } from "@/contexts/modal-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X } from "lucide-react";
import { SampleDetailContent } from "./sample-detail-content";
import { ProductDetailContent } from "./product-detail-content";
import { RequestDetailContent } from "../requests/request-detail-content";
import { InventoryService } from "@/services/inventory";
import { useState, useEffect } from "react";

export function UnifiedModal() {
  const { isOpen, modalState, closeModal, goBack, canGoBack } = useModal();
  const [loading, setLoading] = useState(false);

  if (!isOpen || !modalState) {
    return null;
  }

  const handleViewFullPage = () => {
    if (modalState.type === "sample" && modalState.sampleItem) {
      window.location.href = `/inventory/sample/${modalState.sampleItem.id}${modalState.viewMode === "product" ? "?view=product" : ""}`;
    } else if (modalState.type === "product" && modalState.productionItem) {
      window.location.href = `/inventory/product/${modalState.productionItem.id}`;
    } else if (modalState.type === "request" && modalState.request) {
      window.location.href = `/requests/request/${modalState.request.id}`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        closeModal();
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pr-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {canGoBack && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBack}
                  className="h-8 w-8 p-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <DialogTitle>
                  {modalState.type === "sample" && modalState.sampleItem
                    ? modalState.sampleItem.productionItem.name
                    : modalState.type === "product" && modalState.productionItem
                    ? modalState.productionItem.name
                    : modalState.type === "request" && modalState.request
                    ? `Request: ${modalState.request.sampleItem.productionItem.name}`
                    : ""}
                </DialogTitle>
                <DialogDescription>
                  {modalState.type === "sample"
                    ? "Sample details and management"
                    : modalState.type === "product"
                    ? "Product details and sample management"
                    : "Request details and management"}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewFullPage}
              >
                View Full Page
              </Button>
            </div>
          </div>
        </DialogHeader>
        {modalState.type === "sample" && modalState.sampleItem && modalState.productionItem && (
          <SampleDetailContent
            sampleItem={modalState.sampleItem}
            productionItem={modalState.productionItem}
            viewMode={modalState.viewMode || "sample"}
            isModal={true}
          />
        )}
        {modalState.type === "product" && modalState.productionItem && (
          <ProductDetailContent
            productionItem={modalState.productionItem}
            isModal
            onClose={closeModal}
          />
        )}
        {modalState.type === "request" && modalState.request && (
          <RequestDetailContent request={modalState.request} />
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useModal } from "@/contexts/modal-context";
import { InventoryCard } from "./inventory-card";
import { useState } from "react";
import type { ProductionItem } from "@prisma/client";

type InventoryCardClientProps = {
  productionItem: ProductionItem & {
    sampleItems: Array<{
      id: string;
      stage: string;
      color: string | null;
      size: string | null;
      inventory: Array<{ status: string }>;
    }>;
  };
};

export function InventoryCardClient({ productionItem }: InventoryCardClientProps) {
  const { openSampleModal, openProductModal } = useModal();
  const [loading, setLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return;
    
    setLoading(true);
    try {
      const latestSample = productionItem.sampleItems[0];
      
      if (latestSample) {
        // Fetch full sample item data
        const sampleRes = await fetch(`/api/inventory/samples/${latestSample.id}`);
        if (sampleRes.ok) {
          const sampleItem = await sampleRes.json();
          const productionRes = await fetch(`/api/inventory/production-items/${sampleItem.productionItemId}`);
          if (productionRes.ok) {
            const productionItemFull = await productionRes.json();
            openSampleModal(sampleItem, productionItemFull, "product");
          }
        }
      } else {
        // Fetch full production item data
        const productionRes = await fetch(`/api/inventory/production-items/${productionItem.id}`);
        if (productionRes.ok) {
          const productionItemFull = await productionRes.json();
          openProductModal(productionItemFull);
        }
      }
    } catch (error) {
      console.error("Error opening modal:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div onClick={handleClick} className={loading ? "opacity-50 pointer-events-none" : ""}>
      <InventoryCard productionItem={productionItem} />
    </div>
  );
}

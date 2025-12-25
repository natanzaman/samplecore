import { Suspense } from "react";
import { InventoryService } from "@/services/inventory";
import { InventoryCard } from "@/components/inventory/inventory-card";
import { CreateSampleItemButton } from "@/components/inventory/create-sample-item-button";
import { InventoryFilters } from "@/components/inventory/inventory-filters";

type SearchParams = {
  stage?: string;
  color?: string;
  size?: string;
};

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const productionItems = await InventoryService.getProductionItemsWithSamples({
    stage: searchParams.stage,
    color: searchParams.color,
    size: searchParams.size,
  });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground">
            Browse production items and their sample variations
          </p>
        </div>
        <CreateSampleItemButton />
      </div>

      <div className="mb-6">
        <Suspense fallback={<div className="h-10 w-full bg-muted animate-pulse rounded-md" />}>
          <InventoryFilters />
        </Suspense>
      </div>

      {productionItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No production items found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {productionItems.map((item) => (
            <InventoryCard key={item.id} productionItem={item} />
          ))}
        </div>
      )}
    </div>
  );
}


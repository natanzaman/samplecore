import { Suspense } from "react";
import { InventoryService } from "@/services/inventory";
import { InventoryCardClient } from "@/components/inventory/inventory-card-client";
import { CreateSampleItemButton } from "@/components/inventory/create-sample-item-button";
import { InventoryFilters } from "@/components/inventory/inventory-filters";
import { InventorySearch } from "@/components/inventory/inventory-search";
import { Pagination } from "@/components/ui/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { InventoryGridSkeleton } from "@/components/skeletons/inventory-skeleton";

type SearchParams = {
  stage?: string;
  color?: string;
  size?: string;
  search?: string;
  page?: string;
};

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const page = parseInt(searchParams.page || "1", 10);
  
  const { items: productionItems, total, totalPages } = 
    await InventoryService.getProductionItemsWithSamples({
      stage: searchParams.stage,
      color: searchParams.color,
      size: searchParams.size,
      search: searchParams.search,
      page,
      limit: 12,
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

      <div className="mb-6 space-y-4">
        <Suspense fallback={<div className="h-10 flex-1 max-w-sm bg-muted animate-pulse rounded-md" />}>
          <InventorySearch />
        </Suspense>
        <Suspense fallback={<Card><CardContent className="pt-6"><div className="h-32 bg-muted animate-pulse rounded-md" /></CardContent></Card>}>
          <InventoryFilters />
        </Suspense>
      </div>

      {/* Filter summary */}
      {(searchParams.search || searchParams.stage || searchParams.color || searchParams.size) && (
        <p className="mb-4 text-sm text-muted-foreground">
          Showing {total} result{total !== 1 ? "s" : ""}
          {searchParams.search && ` for "${searchParams.search}"`}
          {searchParams.stage && ` • ${searchParams.stage.split(",").length} stage${searchParams.stage.split(",").length !== 1 ? "s" : ""} selected`}
          {searchParams.color && ` • ${searchParams.color.split(",").length} color${searchParams.color.split(",").length !== 1 ? "s" : ""} selected`}
          {searchParams.size && ` • ${searchParams.size.split(",").length} size${searchParams.size.split(",").length !== 1 ? "s" : ""} selected`}
        </p>
      )}

      {productionItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchParams.search 
              ? "No products found matching your search" 
              : "No production items found"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productionItems.map((item) => (
              <InventoryCardClient key={item.id} productionItem={item} />
            ))}
          </div>
          
          <Suspense fallback={null}>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              itemsPerPage={12}
              basePath="/inventory"
            />
          </Suspense>
        </>
      )}
    </div>
  );
}

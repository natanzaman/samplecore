import { notFound } from "next/navigation";
import { InventoryService } from "@/services/inventory";
import { SampleDetailPage } from "@/components/inventory/sample-detail-page";

export default async function SampleDetailPageRoute({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { view?: string };
}) {
  const sampleItem = await InventoryService.getSampleItemById(params.id);

  if (!sampleItem) {
    notFound();
  }

  // Get production item with all sample items for filtering
  const productionItem = await InventoryService.getProductionItemById(
    sampleItem.productionItemId
  );

  if (!productionItem) {
    notFound();
  }

  const viewMode = searchParams.view === "product" ? "product" : "sample";

  return (
    <SampleDetailPage
      sampleItem={sampleItem}
      productionItem={productionItem}
      viewMode={viewMode}
    />
  );
}


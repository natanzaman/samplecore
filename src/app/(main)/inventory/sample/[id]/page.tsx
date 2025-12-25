import { notFound } from "next/navigation";
import { InventoryService } from "@/services/inventory";
import { SampleDetailPage } from "@/components/inventory/sample-detail-page";

export default async function SampleDetailPageRoute({
  params,
}: {
  params: { id: string };
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

  return (
    <SampleDetailPage
      sampleItem={sampleItem}
      productionItem={productionItem}
    />
  );
}


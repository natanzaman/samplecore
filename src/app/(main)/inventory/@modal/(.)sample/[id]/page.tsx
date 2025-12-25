import { notFound } from "next/navigation";
import { InventoryService } from "@/services/inventory";
import { SampleDetailModal } from "@/components/inventory/sample-detail-modal";

export default async function SampleModalPage({
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
    <SampleDetailModal
      sampleItem={sampleItem}
      productionItem={productionItem}
    />
  );
}


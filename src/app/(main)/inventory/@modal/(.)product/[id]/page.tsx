import { notFound } from "next/navigation";
import { InventoryService } from "@/services/inventory";
import { ProductDetailModal } from "@/components/inventory/product-detail-modal";

export default async function ProductModalPage({
  params,
}: {
  params: { id: string };
}) {
  const productionItem = await InventoryService.getProductionItemById(params.id);

  if (!productionItem) {
    notFound();
  }

  // If product has samples, redirect to sample modal view
  if (productionItem.sampleItems.length > 0) {
    const firstSample = productionItem.sampleItems[0];
    return (
      <meta httpEquiv="refresh" content={`0;url=/inventory/sample/${firstSample.id}?view=product`} />
    );
  }

  return <ProductDetailModal productionItem={productionItem} />;
}

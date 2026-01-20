import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { InventoryService } from "@/services/inventory";
import { ProductDetailContent } from "@/components/inventory/product-detail-content";
import { Button } from "@/components/ui/button";

type ProductPageProps = {
  params: { id: string };
};

export default async function ProductPage({ params }: ProductPageProps) {
  const productionItem = await InventoryService.getProductionItemById(params.id);

  if (!productionItem) {
    notFound();
  }

  // If product has samples, redirect to sample view
  if (productionItem.sampleItems.length > 0) {
    const firstSample = productionItem.sampleItems[0];
    return (
      <meta httpEquiv="refresh" content={`0;url=/inventory/sample/${firstSample.id}?view=product`} />
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <Link href="/inventory">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Button>
        </Link>
      </div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{productionItem.name}</h1>
        {productionItem.description && (
          <p className="text-muted-foreground">{productionItem.description}</p>
        )}
      </div>
      <ProductDetailContent productionItem={productionItem} isModal={false} />
    </div>
  );
}

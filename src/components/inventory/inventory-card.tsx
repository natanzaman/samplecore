import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatColor } from "@/lib/color-utils";
import { formatSize } from "@/lib/size-utils";
import type { ProductionItem } from "@prisma/client";

type InventoryCardProps = {
  productionItem: ProductionItem & {
    sampleItems: Array<{
      id: string;
      stage: string;
      color: string | null;
      size: string | null;
      inventory: Array<{ quantity: number; status: string }>;
    }>;
  };
};

export function InventoryCard({ productionItem }: InventoryCardProps) {
  const latestSample = productionItem.sampleItems[0];
  const availableQuantity = latestSample?.inventory.reduce(
    (sum, inv) => sum + (inv.status === "AVAILABLE" ? inv.quantity : 0),
    0
  ) ?? 0;

  return (
    <Link href={`/inventory/sample/${latestSample?.id || ""}`} scroll={false}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle className="text-lg">{productionItem.name}</CardTitle>
          <CardDescription className="line-clamp-2">
            {productionItem.description || "No description"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {latestSample && (
                <>
                  <div className="flex gap-2">
                    <Badge variant="outline">{latestSample.stage}</Badge>
                    {latestSample.color && (
                      <Badge variant="secondary">{formatColor(latestSample.color)}</Badge>
                    )}
                    {latestSample.size && (
                      <Badge variant="secondary">{formatSize(latestSample.size)}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Available: {availableQuantity}
                  </p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}


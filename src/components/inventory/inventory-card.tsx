import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatColor, formatSize, formatStage, getStageVariant } from "@/lib";
import type { ProductionItem } from "@prisma/client";

type InventoryCardProps = {
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

export function InventoryCard({ productionItem }: InventoryCardProps) {
  const latestSample = productionItem.sampleItems[0];
  const availableCount = latestSample?.inventory.filter(
    inv => inv.status === "AVAILABLE"
  ).length ?? 0;

  // If there are no samples, still make it clickable but show different content
  if (!latestSample) {
    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">{productionItem.name}</CardTitle>
          <CardDescription className="line-clamp-2">
            {productionItem.description || "No description"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">
            No sample items yet — click to add samples
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
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
            <div className="flex gap-2">
              <Badge variant={getStageVariant(latestSample.stage)}>{formatStage(latestSample.stage)}</Badge>
              {latestSample.color && (
                <Badge variant="secondary">{formatColor(latestSample.color)}</Badge>
              )}
              {latestSample.size && (
                <Badge variant="secondary">{formatSize(latestSample.size)}</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Available: {availableCount}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


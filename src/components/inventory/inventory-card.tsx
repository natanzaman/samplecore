"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatColor, formatSize, formatStage, getStageVariant } from "@/lib";
import { useValidImages } from "@/hooks/use-valid-images";
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
  const [isHovered, setIsHovered] = useState(false);
  const latestSample = productionItem.sampleItems[0];
  const availableCount = latestSample?.inventory.filter(
    inv => inv.status === "AVAILABLE"
  ).length ?? 0;

  const defaultImage = "/images/default-product.svg";
  const validImages = useValidImages(productionItem.imageUrls || [], defaultImage);
  const displayImage = validImages[0] || defaultImage;
  const hasImages = validImages.length > 0 && validImages[0] !== defaultImage;

  return (
    <Card 
      className="hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section - Always show, use default if no images */}
      <div className="relative w-full h-64 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
        <Image
          src={displayImage}
          alt={productionItem.name}
          fill
          className={`object-contain transition-all duration-500 ${
            isHovered ? "scale-110 brightness-110" : "scale-100 brightness-100"
          } ${!hasImages ? "opacity-40" : ""}`}
          priority={false}
        />
        {hasImages && validImages.length > 1 && (
          <div className="absolute top-2 right-2 bg-background/90 px-2 py-1 rounded text-xs font-medium shadow-lg">
            {validImages.length} images
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {/* Hover overlay with info */}
        {latestSample && (
          <div className={`absolute bottom-0 left-0 right-0 p-3 transition-transform duration-300 ${
            isHovered ? "translate-y-0" : "translate-y-full"
          }`}>
            <div className="flex gap-2 flex-wrap">
              <Badge variant={getStageVariant(latestSample.stage)} className="text-xs">
                {formatStage(latestSample.stage)}
              </Badge>
              {latestSample.color && (
                <Badge variant="secondary" className="text-xs">
                  {formatColor(latestSample.color)}
                </Badge>
              )}
              {latestSample.size && (
                <Badge variant="secondary" className="text-xs">
                  {formatSize(latestSample.size)}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-1">{productionItem.name}</CardTitle>
        <CardDescription className="line-clamp-2 text-sm">
          {productionItem.description || "No description"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">
              {latestSample ? (
                <>
                  {availableCount} {availableCount === 1 ? "item" : "items"} available
                </>
              ) : (
                "No samples yet"
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


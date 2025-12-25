import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SampleDetailContent } from "./sample-detail-content";
import type { Prisma } from "@prisma/client";

type SampleItemWithRelations = Prisma.SampleItemGetPayload<{
  include: {
    productionItem: true;
    inventory: true;
    comments: true;
    requests: {
      include: {
        team: true;
      };
    };
  };
}>;

type ProductionItemWithSamples = Prisma.ProductionItemGetPayload<{
  include: {
    comments: true;
    sampleItems: {
      include: {
        inventory: true;
        _count: {
          select: {
            requests: true;
            comments: true;
          };
        };
      };
    };
  };
}>;

export function SampleDetailPage({
  sampleItem,
  productionItem,
}: {
  sampleItem: SampleItemWithRelations;
  productionItem: ProductionItemWithSamples;
}) {
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
        <h1 className="text-3xl font-bold">{sampleItem.productionItem.name}</h1>
        <p className="text-muted-foreground">
          {sampleItem.productionItem.description}
        </p>
      </div>
      <SampleDetailContent
        sampleItem={sampleItem}
        productionItem={productionItem}
      />
    </div>
  );
}


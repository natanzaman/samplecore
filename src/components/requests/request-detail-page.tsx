import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { RequestDetailContent } from "./request-detail-content";
import type { RequestWithRelations } from "@/lib/types";

export function RequestDetailPage({
  request,
}: {
  request: RequestWithRelations;
}) {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <Link href="/requests">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Requests
          </Button>
        </Link>
      </div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Request: {request.sampleItem.productionItem.name}
        </h1>
        <p className="text-muted-foreground">
          {request.team.name} • Quantity: {request.quantity}
        </p>
      </div>
      <RequestDetailContent request={request} />
    </div>
  );
}


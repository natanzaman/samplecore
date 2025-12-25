"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

type RequestWithRelations = Prisma.SampleRequestGetPayload<{
  include: {
    sampleItem: {
      include: {
        productionItem: true;
      };
    };
    team: true;
  };
}>;

export function RequestsList({ requests }: { requests: RequestWithRelations[] }) {
  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Link
          key={request.id}
          href={`/requests/request/${request.id}`}
          className="block"
          scroll={false}
        >
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">
                  {request.sampleItem.productionItem.name}
                </CardTitle>
                <CardDescription>
                  {request.team.name} • Qty: {request.quantity}
                </CardDescription>
              </div>
              <Badge>{request.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex gap-4">
                <span className="text-muted-foreground">Requested:</span>
                <span>{formatDate(request.requestedAt)}</span>
              </div>
              {request.shippingMethod && (
                <div className="flex gap-4">
                  <span className="text-muted-foreground">Method:</span>
                  <span>{request.shippingMethod}</span>
                </div>
              )}
              {request.notes && (
                <p className="text-muted-foreground">{request.notes}</p>
              )}
            </div>
          </CardContent>
        </Card>
        </Link>
      ))}
    </div>
  );
}


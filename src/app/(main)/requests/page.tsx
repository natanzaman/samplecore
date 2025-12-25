import { Suspense } from "react";
import { RequestsService } from "@/services/requests";
import { RequestsList } from "@/components/requests/requests-list";
import { CreateRequestButton } from "@/components/requests/create-request-button";
import { RequestStatusFilter } from "@/components/requests/request-status-filter";
import { Card, CardContent } from "@/components/ui/card";

type SearchParams = {
  status?: string;
  teamId?: string;
  requestId?: string;
};

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const requests = await RequestsService.getRequests({
    status: searchParams.status,
    teamId: searchParams.teamId,
    sampleItemId: searchParams.requestId ? undefined : undefined,
  });

  // Filter by requestId if provided (for deep linking)
  const filteredRequests = searchParams.requestId
    ? requests.filter((r) => r.id === searchParams.requestId)
    : requests;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sample Requests</h1>
          <p className="text-muted-foreground">
            Manage sample requests and track their lifecycle
          </p>
        </div>
        <CreateRequestButton />
      </div>

      <div className="mb-6">
        <Suspense fallback={<div className="h-10 w-[180px] bg-muted animate-pulse rounded-md" />}>
          <RequestStatusFilter />
        </Suspense>
      </div>

      {filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No requests found</p>
          </CardContent>
        </Card>
      ) : (
        <RequestsList requests={filteredRequests} />
      )}
    </div>
  );
}


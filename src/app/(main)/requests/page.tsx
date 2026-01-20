import { Suspense } from "react";
import { RequestsService } from "@/services/requests";
import { RequestsList } from "@/components/requests/requests-list";
import { CreateRequestButton } from "@/components/requests/create-request-button";
import { RequestsFilters } from "@/components/requests/requests-filters";
import { Pagination } from "@/components/ui/pagination";
import { Card, CardContent } from "@/components/ui/card";

type SearchParams = {
  status?: string;
  teamId?: string;
  productName?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: string;
};

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const page = parseInt(searchParams.page || "1", 10);
  
  const { items: requests, total, totalPages } = await RequestsService.getRequests({
    status: searchParams.status,
    teamId: searchParams.teamId,
    productName: searchParams.productName,
    dateFrom: searchParams.dateFrom,
    dateTo: searchParams.dateTo,
    page,
    limit: 10,
  });

  // Build filter summary text
  const activeFilters: string[] = [];
  if (searchParams.status) {
    const statusCount = searchParams.status.split(",").length;
    activeFilters.push(`${statusCount} status${statusCount !== 1 ? "es" : ""} selected`);
  }
  if (searchParams.teamId) {
    const teamCount = searchParams.teamId.split(",").length;
    activeFilters.push(`${teamCount} team${teamCount !== 1 ? "s" : ""} selected`);
  }
  if (searchParams.productName) {
    activeFilters.push(`Product: "${searchParams.productName}"`);
  }
  if (searchParams.dateFrom || searchParams.dateTo) {
    const dateRange = [
      searchParams.dateFrom,
      searchParams.dateTo,
    ].filter(Boolean).join(" to ");
    activeFilters.push(`Date: ${dateRange}`);
  }

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
        <Suspense fallback={<Card><CardContent className="pt-6"><div className="h-32 bg-muted animate-pulse rounded-md" /></CardContent></Card>}>
          <RequestsFilters />
        </Suspense>
      </div>

      {activeFilters.length > 0 && (
        <p className="mb-4 text-sm text-muted-foreground">
          Showing {total} request{total !== 1 ? "s" : ""} • {activeFilters.join(" • ")}
        </p>
      )}

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No requests found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <RequestsList requests={requests} />
          
          <Suspense fallback={null}>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              itemsPerPage={10}
              basePath="/requests"
            />
          </Suspense>
        </>
      )}
    </div>
  );
}

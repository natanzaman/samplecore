import { notFound } from "next/navigation";
import { RequestsService } from "@/services/requests";
import { RequestDetailPage } from "@/components/requests/request-detail-page";

export default async function RequestDetailPageRoute({
  params,
}: {
  params: { id: string };
}) {
  const request = await RequestsService.getRequestById(params.id);

  if (!request) {
    notFound();
  }

  return <RequestDetailPage request={request} />;
}


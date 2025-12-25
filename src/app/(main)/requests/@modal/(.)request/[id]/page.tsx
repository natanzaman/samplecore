import { notFound } from "next/navigation";
import { RequestsService } from "@/services/requests";
import { RequestDetailModal } from "@/components/requests/request-detail-modal";

export default async function RequestModalPage({
  params,
}: {
  params: { id: string };
}) {
  const request = await RequestsService.getRequestById(params.id);

  if (!request) {
    notFound();
  }

  return <RequestDetailModal request={request} />;
}


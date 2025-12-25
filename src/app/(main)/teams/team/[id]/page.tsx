import { notFound } from "next/navigation";
import { TeamsService } from "@/services/teams";
import { TeamDetailPage } from "@/components/teams/team-detail-page";

export default async function TeamDetailPageRoute({
  params,
}: {
  params: { id: string };
}) {
  const team = await TeamsService.getTeamById(params.id);

  if (!team) {
    notFound();
  }

  return <TeamDetailPage team={team} />;
}


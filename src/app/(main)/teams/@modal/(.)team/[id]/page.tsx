import { notFound } from "next/navigation";
import { TeamsService } from "@/services/teams";
import { TeamDetailModal } from "@/components/teams/team-detail-modal";

export default async function TeamModalPage({
  params,
}: {
  params: { id: string };
}) {
  const team = await TeamsService.getTeamById(params.id);

  if (!team) {
    notFound();
  }

  return <TeamDetailModal team={team} />;
}


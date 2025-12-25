import { TeamForm } from "@/components/teams/team-form";

export default function NewTeamPage() {
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">New Team</h1>
        <p className="text-muted-foreground">Create a new team</p>
      </div>
      <TeamForm />
    </div>
  );
}


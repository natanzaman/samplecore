"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamForm } from "./team-form";
import { FileText, Edit2, X } from "lucide-react";
import Link from "next/link";
import type { Prisma } from "@prisma/client";

type TeamWithRelations = Prisma.TeamGetPayload<{
  include: {
    requests: {
      include: {
        sampleItem: {
          include: {
            productionItem: true;
          };
        };
      };
      orderBy: {
        requestedAt: "desc";
      };
    };
    _count: {
      select: {
        requests: true;
      };
    };
  };
}>;

export function TeamDetailContent({
  team: initialTeam,
  onViewFullPage,
}: {
  team: TeamWithRelations;
  onViewFullPage?: () => void;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [team, setTeam] = useState(initialTeam);

  const handleSave = async () => {
    // Refresh to get updated data
    await router.refresh();
    // Re-fetch team data
    const response = await fetch(`/api/teams/${team.id}`);
    if (response.ok) {
      const updatedTeam = await response.json();
      setTeam(updatedTeam);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Edit Team</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
        <TeamForm
          team={team}
          onSuccess={handleSave}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Info Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Badge variant={team.isInternal ? "default" : "secondary"}>
              {team.isInternal ? "Internal" : "External"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {team._count.requests} request{team._count.requests !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {onViewFullPage && (
            <Button variant="outline" onClick={onViewFullPage}>
              View Full Page
            </Button>
          )}
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Team Details */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {team.contactEmail && (
            <div className="flex justify-between">
              <span className="text-sm font-medium">Email:</span>
              <span className="text-sm">{team.contactEmail}</span>
            </div>
          )}
          {team.contactPhone && (
            <div className="flex justify-between">
              <span className="text-sm font-medium">Phone:</span>
              <span className="text-sm">{team.contactPhone}</span>
            </div>
          )}
          {team.address && (
            <div>
              <span className="text-sm font-medium">Address:</span>
              <p className="text-sm text-muted-foreground mt-1">{team.address}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Requests ({team.requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {team.requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No requests yet</p>
          ) : (
            <div className="space-y-3">
              {team.requests.map((request) => (
                <Link
                  key={request.id}
                  href={`/requests/request/${request.id}`}
                  className="block"
                >
                  <div className="border rounded-lg p-3 hover:bg-accent transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">
                          {request.sampleItem.productionItem.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {request.quantity} • {request.shippingMethod || "No method"}
                        </p>
                      </div>
                      <Badge>{request.status}</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


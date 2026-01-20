"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CreateTeamSchema, UpdateTeamSchema } from "@/lib/validations";
import type { CreateTeamInput, UpdateTeamInput } from "@/lib/validations";
import type { Team } from "@prisma/client";

type TeamFormProps = {
  team?: Team;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function TeamForm({ team, onSuccess, onCancel }: TeamFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!team;
  const schema = isEditing ? UpdateTeamSchema : CreateTeamSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateTeamInput | UpdateTeamInput>({
    resolver: zodResolver(schema),
    defaultValues: team
      ? {
          name: team.name,
          shippingAddress: team.shippingAddress || "",
          contactEmail: team.contactEmail || "",
          contactPhone: team.contactPhone || "",
          isInternal: team.isInternal,
        }
      : {
          isInternal: true,
        },
  });

  const onSubmit = async (data: CreateTeamInput | UpdateTeamInput) => {
    setLoading(true);
    setError(null);

    try {
      const url = isEditing ? `/api/teams/${team.id}` : "/api/teams";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save team");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/teams");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="e.g., Marketing, Runway, E-commerce"
        />
        {errors.name && (
          <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="contactEmail">Contact Email</Label>
        <Input
          id="contactEmail"
          type="email"
          {...register("contactEmail")}
          placeholder="team@company.com"
        />
        {errors.contactEmail && (
          <p className="text-sm text-destructive mt-1">
            {errors.contactEmail.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="contactPhone">Contact Phone</Label>
        <Input
          id="contactPhone"
          type="tel"
          {...register("contactPhone")}
          placeholder="+1-555-0100"
        />
        {errors.contactPhone && (
          <p className="text-sm text-destructive mt-1">
            {errors.contactPhone.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="shippingAddress">Shipping Address</Label>
        <Textarea
          id="shippingAddress"
          {...register("shippingAddress")}
          placeholder="123 Street, City, State ZIP"
        />
        {errors.shippingAddress && (
          <p className="text-sm text-destructive mt-1">
            {errors.shippingAddress.message}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isInternal"
          checked={watch("isInternal")}
          onChange={(e) => setValue("isInternal", e.target.checked)}
          className="rounded border-gray-300"
        />
        <Label htmlFor="isInternal" className="font-normal cursor-pointer">
          Internal team
        </Label>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : (
          <Link href="/teams">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : isEditing ? "Update Team" : "Create Team"}
        </Button>
      </div>
    </form>
  );
}


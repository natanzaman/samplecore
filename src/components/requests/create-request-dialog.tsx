"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CreateSampleRequestSchema } from "@/lib/validations";
import type { CreateSampleRequestInput } from "@/lib/validations";
import type { Team, ProductionItem, SampleItem } from "@prisma/client";

type CreateRequestDialogProps = {
  sampleItemId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

type ProductionItemWithSamples = ProductionItem & {
  sampleItems: Array<{
    id: string;
    stage: string;
    color: string | null;
    size: string | null;
    revision: string;
  }>;
};

export function CreateRequestDialog({
  sampleItemId,
  open,
  onOpenChange,
  onSuccess,
}: CreateRequestDialogProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [productionItems, setProductionItems] = useState<ProductionItemWithSamples[]>([]);
  const [sampleItems, setSampleItems] = useState<SampleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateSampleRequestInput>({
    resolver: zodResolver(CreateSampleRequestSchema),
    defaultValues: {
      sampleItemId: sampleItemId || "",
      quantity: 1,
    },
  });

  const selectedProductionItemId = watch("productionItemId" as any);
  const selectedSampleItemId = watch("sampleItemId");

  // Load teams and production items when dialog opens
  useEffect(() => {
    if (open) {
      Promise.all([
        fetch("/api/teams").then((res) => res.json()),
        fetch("/api/inventory/production-items").then((res) => res.json()),
      ])
        .then(([teamsData, itemsData]) => {
          setTeams(teamsData);
          setProductionItems(itemsData);
          // If sampleItemId is provided, find and set the production item
          if (sampleItemId) {
            itemsData.forEach((item: ProductionItemWithSamples) => {
              if (item.sampleItems.some((s) => s.id === sampleItemId)) {
                setValue("productionItemId" as any, item.id);
                // Load all sample items for this production item
                fetch(`/api/inventory/production-items/${item.id}/samples`)
                  .then((res) => res.json())
                  .then((samples) => {
                    setSampleItems(samples);
                    setValue("sampleItemId", sampleItemId);
                  })
                  .catch(() => setError("Failed to load sample items"));
                return; // Exit early once found
              }
            });
          }
        })
        .catch(() => setError("Failed to load data"));
    } else {
      // Reset when dialog closes
      reset();
      setSampleItems([]);
      setValue("productionItemId" as any, "");
      setError(null);
    }
  }, [open, sampleItemId, setValue, reset]);

  // Load sample items when production item is selected
  useEffect(() => {
    const loadSampleItems = async (productionItemId: string) => {
      try {
        const response = await fetch(`/api/inventory/production-items/${productionItemId}/samples`);
        const items = await response.json();
        setSampleItems(items);
        // Reset sample item selection when production item changes (unless it's the pre-selected one)
        if (!sampleItemId) {
          setValue("sampleItemId", "");
        }
      } catch (err) {
        setError("Failed to load sample items");
      }
    };

    if (selectedProductionItemId && open) {
      loadSampleItems(selectedProductionItemId);
    } else if (!selectedProductionItemId) {
      setSampleItems([]);
    }
  }, [selectedProductionItemId, open, sampleItemId, setValue]);

  const onSubmit = async (data: CreateSampleRequestInput) => {
    // Ensure sampleItemId is set
    if (!data.sampleItemId) {
      setError("Please select a sample item");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create request");
      }

      reset();
      setSampleItems([]);
      setValue("productionItemId" as any, "");
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Sample Request</DialogTitle>
          <DialogDescription>
            Request a sample item for a team
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="productionItemId">Production Item</Label>
            <Select
              onValueChange={(value) => {
                setValue("productionItemId" as any, value);
                setValue("sampleItemId", "");
              }}
              value={selectedProductionItemId || ""}
              disabled={!!sampleItemId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a production item" />
              </SelectTrigger>
              <SelectContent>
                {productionItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProductionItemId && sampleItems.length > 0 && (
            <div>
              <Label htmlFor="sampleItemId">Sample (Color/Size)</Label>
              <Select
                onValueChange={(value) => setValue("sampleItemId", value)}
                value={selectedSampleItemId || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select color/size" />
                </SelectTrigger>
                <SelectContent>
                  {sampleItems.map((item) => {
                    const label = [
                      item.stage,
                      item.color,
                      item.size,
                      `Rev: ${item.revision}`,
                    ]
                      .filter(Boolean)
                      .join(" • ");
                    return (
                      <SelectItem key={item.id} value={item.id}>
                        {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.sampleItemId && (
                <p className="text-sm text-destructive mt-1">
                  {errors.sampleItemId.message}
                </p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="teamId">Team</Label>
            <Select
              onValueChange={(value) => setValue("teamId", value)}
              value={watch("teamId")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name} {team.isInternal ? "(Internal)" : "(External)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.teamId && (
              <p className="text-sm text-destructive mt-1">
                {errors.teamId.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              {...register("quantity", { valueAsNumber: true })}
            />
            {errors.quantity && (
              <p className="text-sm text-destructive mt-1">
                {errors.quantity.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional information..."
              {...register("notes")}
            />
            {errors.notes && (
              <p className="text-sm text-destructive mt-1">
                {errors.notes.message}
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedSampleItemId}>
              {loading ? "Creating..." : "Create Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


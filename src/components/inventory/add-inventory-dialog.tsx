"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateInventorySchema } from "@/lib/validations";
import type { CreateInventoryInput } from "@/lib/validations";
import { z } from "zod";
import { addInventory } from "@/actions/inventory";
import { toast } from "@/components/ui/toast";
import { LOCATION_OPTIONS, INVENTORY_STATUS_OPTIONS } from "@/lib";
import { Loader2 } from "lucide-react";

type AddInventoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sampleItemId: string;
  onSuccess?: () => void;
};

export function AddInventoryDialog({
  open,
  onOpenChange,
  sampleItemId,
  onSuccess,
}: AddInventoryDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateInventoryInput & { itemCount: number }>({
    resolver: zodResolver(CreateInventorySchema.extend({
      itemCount: z.number().int().min(1).default(1),
    })),
    defaultValues: {
      sampleItemId,
      itemCount: 1,
      status: "AVAILABLE",
      location: undefined,
    },
  });

  const location = watch("location");

  const onSubmit = async (data: CreateInventoryInput & { itemCount: number }) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Create multiple inventory records (one per item)
      const results = await Promise.all(
        Array.from({ length: data.itemCount }, () =>
          addInventory({
            sampleItemId: data.sampleItemId,
            location: data.location as any,
            status: data.status,
            notes: data.notes,
          })
        )
      );

      const failed = results.find((r) => !r.success);
      if (failed) {
        throw new Error(failed.error || "Failed to add some inventory items");
      }

      toast.success(`Added ${data.itemCount} inventory item${data.itemCount !== 1 ? "s" : ""} successfully`);
      reset();
      onOpenChange(false);
      router.refresh();
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add inventory";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Inventory</DialogTitle>
          <DialogDescription>
            Add a new inventory record for this sample item
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="itemCount">Number of Items to Add *</Label>
            <Input
              id="itemCount"
              type="number"
              min="1"
              {...register("itemCount", { valueAsNumber: true })}
              disabled={isSubmitting}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Each item will be tracked individually
            </p>
            {errors.itemCount && (
              <p className="text-sm text-destructive mt-1">{errors.itemCount.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Select
              value={location || ""}
              onValueChange={(value) => setValue("location", value as any)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="location">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {LOCATION_OPTIONS.map((loc) => (
                  <SelectItem key={loc.value} value={loc.value}>
                    {loc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.location && (
              <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={watch("status")}
              onValueChange={(value) => setValue("status", value as any)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INVENTORY_STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-destructive mt-1">{errors.status.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Optional notes about this inventory"
              rows={3}
              disabled={isSubmitting}
              className="resize-none"
            />
            {errors.notes && (
              <p className="text-sm text-destructive mt-1">{errors.notes.message}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Inventory"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


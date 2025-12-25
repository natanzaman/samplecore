"use client";

import { useState } from "react";
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
import { CreateInventorySchema, InventoryLocationSchema } from "@/lib/validations";
import type { CreateInventoryInput } from "@/lib/validations";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreateInventoryInput>({
    resolver: zodResolver(CreateInventorySchema),
    defaultValues: {
      sampleItemId,
      quantity: 0,
      status: "AVAILABLE",
      location: undefined,
    },
  });

  const location = watch("location");

  const onSubmit = async (data: CreateInventoryInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add inventory");
      }

      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add inventory");
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
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              {...register("quantity", { valueAsNumber: true })}
              disabled={isSubmitting}
            />
            {errors.quantity && (
              <p className="text-sm text-destructive mt-1">{errors.quantity.message}</p>
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
                <SelectItem value="STUDIO_A">Studio A</SelectItem>
                <SelectItem value="STUDIO_B">Studio B</SelectItem>
                <SelectItem value="WAREHOUSE_A">Warehouse A</SelectItem>
                <SelectItem value="WAREHOUSE_B">Warehouse B</SelectItem>
                <SelectItem value="WAREHOUSE_C">Warehouse C</SelectItem>
                <SelectItem value="SHOWROOM">Showroom</SelectItem>
                <SelectItem value="PHOTO_STUDIO">Photo Studio</SelectItem>
                <SelectItem value="OFFICE">Office</SelectItem>
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
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="IN_USE">In Use</SelectItem>
                <SelectItem value="RESERVED">Reserved</SelectItem>
                <SelectItem value="DAMAGED">Damaged</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
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


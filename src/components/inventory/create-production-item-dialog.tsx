"use client";

import { useState, useTransition } from "react";
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
import { CreateProductionItemSchema } from "@/lib/validations";
import type { CreateProductionItemInput } from "@/lib/validations";
import { createProductionItem } from "@/actions/inventory";
import { toast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";

type CreateProductionItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (productionItem: { id: string; name: string }) => void;
};

export function CreateProductionItemDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateProductionItemDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateProductionItemInput>({
    resolver: zodResolver(CreateProductionItemSchema),
  });

  const onSubmit = async (data: CreateProductionItemInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createProductionItem(data);
      
      // Handle undefined result (shouldn't happen, but safety check)
      if (!result) {
        throw new Error("No response from server");
      }
      
      if (!result.success) {
        throw new Error(result.error || "Failed to create production item");
      }
      
      reset();
      toast.success(`Product "${result.data?.name || data.name}" created successfully`);
      onSuccess(result.data || { id: "", name: data.name });
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create production item";
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
          <DialogTitle>Create New Product</DialogTitle>
          <DialogDescription>
            Add a new production item to the inventory
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., Summer Collection T-Shirt"
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Optional description of the product"
              rows={3}
              disabled={isSubmitting}
              className="resize-none"
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
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
                  Creating...
                </>
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


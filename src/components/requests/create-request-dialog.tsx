"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { CreateSampleRequestSchema } from "@/lib/validations";
import type { CreateSampleRequestInput } from "@/lib/validations";
import type { Team, ProductionItem, SampleItem } from "@prisma/client";
import { createRequest } from "@/actions/requests";
import { toast } from "@/components/ui/toast";
import { formatStage, formatColor, formatSize, getStageVariant } from "@/lib";
import { Loader2, Lock, Package } from "lucide-react";

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

// Extended Team type with shipping fields
type TeamWithShipping = Team & {
  shippingMethod?: string | null;
  shippingAddress?: string | null;
};

// Shipping method options
const SHIPPING_METHODS = [
  { value: "none", label: "None" },
  { value: "Internal Hand-off", label: "Internal Hand-off" },
  { value: "FedEx Overnight", label: "FedEx Overnight" },
  { value: "FedEx 2-Day", label: "FedEx 2-Day" },
  { value: "UPS Ground", label: "UPS Ground" },
  { value: "Courier", label: "Courier" },
  { value: "Pickup", label: "Pickup" },
];

export function CreateRequestDialog({
  sampleItemId,
  open,
  onOpenChange,
  onSuccess,
}: CreateRequestDialogProps) {
  const router = useRouter();
  const [teams, setTeams] = useState<TeamWithShipping[]>([]);
  const [productionItems, setProductionItems] = useState<ProductionItemWithSamples[]>([]);
  const [sampleItems, setSampleItems] = useState<SampleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useTeamShippingMethod, setUseTeamShippingMethod] = useState(true);
  const [useTeamAddress, setUseTeamAddress] = useState(true);

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
      shippingMethod: "none",
    },
  });

  const selectedProductionItemId = watch("productionItemId" as any);
  const selectedSampleItemId = watch("sampleItemId");
  const selectedTeamId = watch("teamId");
  const selectedShippingMethod = watch("shippingMethod");
  const shippingAddress = watch("shippingAddress");

  // Get the selected team
  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  // Load teams and production items when dialog opens
  useEffect(() => {
    if (open) {
      Promise.all([
        fetch("/api/teams").then((res) => res.json()),
        fetch("/api/inventory/production-items").then((res) => res.json()),
      ])
        .then(([teamsData, itemsData]) => {
          setTeams(teamsData);
          // Handle both array and paginated response
          const items = Array.isArray(itemsData) ? itemsData : itemsData.items || [];
          setProductionItems(items);
          // If sampleItemId is provided, find and set the production item
          if (sampleItemId) {
            items.forEach((item: ProductionItemWithSamples) => {
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
      setUseTeamShippingMethod(true);
      setUseTeamAddress(true);
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

  // Update shipping method when "use team default" checkbox is toggled
  useEffect(() => {
    if (useTeamShippingMethod && selectedTeam) {
      setValue("shippingMethod", selectedTeam.shippingMethod || "none");
    }
  }, [useTeamShippingMethod, selectedTeam, setValue]);

  // Update shipping address when "use team address" checkbox is toggled
  useEffect(() => {
    if (useTeamAddress && selectedTeam) {
      setValue("shippingAddress", selectedTeam.shippingAddress || "");
    }
  }, [useTeamAddress, selectedTeam, setValue]);

  const onSubmit = async (data: CreateSampleRequestInput) => {
    // Ensure sampleItemId is set
    if (!data.sampleItemId) {
      setError("Please select a sample item");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Convert "none" to undefined for storage
      const shippingMethod = data.shippingMethod === "none" ? undefined : data.shippingMethod;

      const result = await createRequest({
        sampleItemId: data.sampleItemId,
        teamId: data.teamId,
        quantity: data.quantity,
        notes: data.notes,
        shippingMethod,
        shippingAddress: data.shippingAddress,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to create request");
      }

      toast.success("Request created successfully");
      reset();
      setSampleItems([]);
      setValue("productionItemId" as any, "");
      setUseTeamShippingMethod(true);
      setUseTeamAddress(true);
      router.refresh();
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Get the current selected sample item details for display
  const selectedSampleDetails = sampleItems.find((s) => s.id === selectedSampleItemId);
  const selectedProductionItem = productionItems.find((p) => p.id === selectedProductionItemId);

  // Determine if we're in locked mode (creating from a sample page)
  const isLockedMode = !!sampleItemId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Sample Request</DialogTitle>
          <DialogDescription>
            Request a sample item for a team
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Sample Item Section - Always visible */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Sample Item</Label>
              {isLockedMode && (
                <Badge variant="secondary" className="text-xs">
                  <Lock className="h-3 w-3 mr-1" />
                  Pre-selected
                </Badge>
              )}
            </div>

            {/* When locked, show a read-only card with sample details */}
            {isLockedMode && selectedSampleDetails && selectedProductionItem ? (
              <Card className="bg-muted/50">
                <CardContent className="p-3 space-y-2">
                  <div className="font-medium">{selectedProductionItem.name}</div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={getStageVariant(selectedSampleDetails.stage)}>
                      {formatStage(selectedSampleDetails.stage)}
                    </Badge>
                    {selectedSampleDetails.color && (
                      <Badge variant="secondary">{formatColor(selectedSampleDetails.color)}</Badge>
                    )}
                    {selectedSampleDetails.size && (
                      <Badge variant="outline">{formatSize(selectedSampleDetails.size)}</Badge>
                    )}
                    <Badge variant="outline">Rev: {selectedSampleDetails.revision}</Badge>
                  </div>
                  {selectedProductionItem.description && (
                    <p className="text-sm text-muted-foreground">{selectedProductionItem.description}</p>
                  )}
                </CardContent>
              </Card>
            ) : (
              /* When not locked, show dropdowns for selection */
              <>
                <div>
                  <Label htmlFor="productionItemId" className="text-xs text-muted-foreground">Production Item</Label>
                  <Select
                    onValueChange={(value) => {
                      setValue("productionItemId" as any, value);
                      setValue("sampleItemId", "");
                    }}
                    value={selectedProductionItemId || ""}
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

                {selectedProductionItemId && (
                  <div>
                    <Label htmlFor="sampleItemId" className="text-xs text-muted-foreground">Sample Variant (Stage/Color/Size)</Label>
                    {sampleItems.length > 0 ? (
                      <Select
                        onValueChange={(value) => setValue("sampleItemId", value)}
                        value={selectedSampleItemId || ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a sample variant" />
                        </SelectTrigger>
                        <SelectContent>
                          {sampleItems.map((item) => {
                            const label = [
                              formatStage(item.stage),
                              item.color ? formatColor(item.color) : null,
                              item.size ? formatSize(item.size) : null,
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
                    ) : (
                      <div className="flex items-center justify-center p-3 border rounded-md bg-muted/50">
                        <p className="text-sm text-muted-foreground italic">
                          No samples available for this product
                        </p>
                      </div>
                    )}
                    {errors.sampleItemId && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.sampleItemId.message}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <hr className="border-border" />

          {/* Request Details Section */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Request Details</Label>

            <div>
              <Label htmlFor="teamId" className="text-xs text-muted-foreground">Requesting Team *</Label>
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

            {/* Show these fields only after a team is selected */}
            {selectedTeam && (
              <>
                <div>
                  <Label htmlFor="quantity" className="text-xs text-muted-foreground">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    className="w-24"
                    {...register("quantity", { valueAsNumber: true })}
                  />
                  {errors.quantity && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.quantity.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingMethod" className="text-xs text-muted-foreground">Shipping Method</Label>
                  
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useTeamShippingMethod}
                      onChange={(e) => {
                        setUseTeamShippingMethod(e.target.checked);
                        if (e.target.checked && selectedTeam) {
                          setValue("shippingMethod", selectedTeam.shippingMethod || "none");
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span>Use team default</span>
                  </label>

                  <Select
                    onValueChange={(value) => setValue("shippingMethod", value)}
                    value={selectedShippingMethod || "none"}
                    disabled={useTeamShippingMethod}
                  >
                    <SelectTrigger className={useTeamShippingMethod ? "opacity-50" : ""}>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {SHIPPING_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingAddress" className="text-xs text-muted-foreground">Shipping Address</Label>
                  
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useTeamAddress}
                      onChange={(e) => {
                        setUseTeamAddress(e.target.checked);
                        if (e.target.checked && selectedTeam) {
                          setValue("shippingAddress", selectedTeam.shippingAddress || "");
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span>
                      Use team address
                      {!selectedTeam.shippingAddress && (
                        <span className="text-muted-foreground ml-1">(None on file)</span>
                      )}
                    </span>
                  </label>

                  <Textarea
                    id="shippingAddress"
                    placeholder={selectedTeam.shippingAddress || "Enter shipping address..."}
                    rows={2}
                    disabled={useTeamAddress}
                    className={useTeamAddress ? "opacity-50" : ""}
                    {...register("shippingAddress")}
                  />
                  {errors.shippingAddress && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.shippingAddress.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="notes" className="text-xs text-muted-foreground">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Purpose of request, special instructions, etc..."
                    rows={2}
                    {...register("notes")}
                  />
                  {errors.notes && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.notes.message}
                    </p>
                  )}
                </div>
              </>
            )}

            {!selectedTeam && (
              <p className="text-sm text-muted-foreground italic">
                Select a team to continue...
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedSampleItemId}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Request"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


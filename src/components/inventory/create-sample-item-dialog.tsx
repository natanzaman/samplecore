"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { CreateProductionItemDialog } from "./create-production-item-dialog";
import { Loader2, Plus, Trash2 } from "lucide-react";

type ProductionItem = {
  id: string;
  name: string;
  description?: string | null;
};

type SampleVariation = {
  stage: string;
  color: string;
  size: string;
  revision: string;
  quantity: number;
  location: string | null;
};

type CreateSampleItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialValues?: {
    productionItemId?: string;
    stage?: string;
    color?: string;
    size?: string;
    revision?: string;
  };
};

export function CreateSampleItemDialog({
  open,
  onOpenChange,
  onSuccess,
  initialValues,
}: CreateSampleItemDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productionItems, setProductionItems] = useState<ProductionItem[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [showCreateProductDialog, setShowCreateProductDialog] = useState(false);
  const [selectedProductionItemId, setSelectedProductionItemId] = useState<string>("");
  const [variations, setVariations] = useState<SampleVariation[]>([
    {
      stage: initialValues?.stage || "PROTOTYPE",
      color: initialValues?.color || "",
      size: initialValues?.size || "",
      revision: initialValues?.revision || "A",
      quantity: 0,
      location: null,
    },
  ]);

  // Fetch production items when dialog opens
  useEffect(() => {
    if (open) {
      fetchProductionItems();
      if (initialValues?.productionItemId) {
        setSelectedProductionItemId(initialValues.productionItemId);
      } else {
        setSelectedProductionItemId("");
      }
      // Reset variations when dialog opens
      setVariations([
        {
          stage: initialValues?.stage || "PROTOTYPE",
          color: initialValues?.color || "",
          size: initialValues?.size || "",
          revision: initialValues?.revision || "A",
          quantity: 0,
          location: "",
        },
      ]);
    } else {
      setSelectedProductionItemId("");
    }
  }, [open, initialValues]);

  const fetchProductionItems = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await fetch("/api/inventory/production-items");
      if (response.ok) {
        const data = await response.json();
        setProductionItems(data);
      }
    } catch (err) {
      console.error("Failed to fetch production items:", err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleProductionItemCreated = (newProduct: { id: string; name: string }) => {
    setProductionItems((prev) => [...prev, newProduct]);
    setSelectedProductionItemId(newProduct.id);
    setShowCreateProductDialog(false);
  };

  const addVariation = () => {
    setVariations([
      ...variations,
      {
        stage: "PROTOTYPE",
        color: "",
        size: "",
        revision: "A",
        quantity: 0,
        location: null,
      },
    ]);
  };

  const removeVariation = (index: number) => {
    setVariations(variations.filter((_, i) => i !== index));
  };

  const updateVariation = (index: number, field: keyof SampleVariation, value: string | number | null) => {
    const updated = [...variations];
    updated[index] = { ...updated[index], [field]: value };
    setVariations(updated);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProductionItemId) {
      setError("Please select a product");
      return;
    }

    if (variations.length === 0) {
      setError("Please add at least one sample variation");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/inventory/samples/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productionItemId: selectedProductionItemId,
          variations: variations.map((v) => ({
            stage: v.stage,
            color: v.color || null,
            size: v.size || null,
            revision: v.revision,
            notes: null,
            initialQuantity: v.quantity,
            location: v.location || null,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create sample items");
      }

      setVariations([
        {
          stage: "PROTOTYPE",
          color: "",
          size: "",
          revision: "A",
          quantity: 0,
          location: null,
        },
      ]);
      setSelectedProductionItemId("");
      onOpenChange(false);
      router.refresh();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create sample items");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Inventory Items</DialogTitle>
            <DialogDescription>
              Create sample items with initial inventory quantities
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <Label htmlFor="productionItemId">Product *</Label>
              <div className="flex gap-2">
                <Select
                  value={selectedProductionItemId}
                  onValueChange={setSelectedProductionItemId}
                  disabled={isSubmitting || isLoadingProducts}
                >
                  <SelectTrigger id="productionItemId" className="flex-1">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {productionItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateProductDialog(true)}
                  disabled={isSubmitting}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Product
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Sample Variations</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariation}
                  disabled={isSubmitting}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variation
                </Button>
              </div>

              <div className="space-y-4 border rounded-lg p-4">
                {variations.map((variation, index) => (
                  <div key={index} className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-semibold">
                        Variation {index + 1}
                      </Label>
                      {variations.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariation(index)}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor={`stage-${index}`}>Stage *</Label>
                        <Select
                          value={variation.stage}
                          onValueChange={(value) => updateVariation(index, "stage", value)}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger id={`stage-${index}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PROTOTYPE">Prototype</SelectItem>
                            <SelectItem value="DEVELOPMENT">Development</SelectItem>
                            <SelectItem value="PRODUCTION">Production</SelectItem>
                            <SelectItem value="ARCHIVED">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor={`color-${index}`}>Color</Label>
                        <Input
                          id={`color-${index}`}
                          value={variation.color}
                          onChange={(e) => updateVariation(index, "color", e.target.value)}
                          placeholder="e.g., Navy Blue"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`size-${index}`}>Size</Label>
                        <Input
                          id={`size-${index}`}
                          value={variation.size}
                          onChange={(e) => updateVariation(index, "size", e.target.value)}
                          placeholder="e.g., M, L, XL"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`revision-${index}`}>Revision</Label>
                        <Input
                          id={`revision-${index}`}
                          value={variation.revision}
                          onChange={(e) => updateVariation(index, "revision", e.target.value)}
                          placeholder="e.g., A, B, C"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`quantity-${index}`}>Initial Quantity *</Label>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          min="0"
                          value={variation.quantity}
                          onChange={(e) =>
                            updateVariation(index, "quantity", parseInt(e.target.value) || 0)
                          }
                          placeholder="0"
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <Label htmlFor={`location-${index}`}>Location</Label>
                        <Select
                          value={variation.location || ""}
                          onValueChange={(value) => updateVariation(index, "location", value || null)}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger id={`location-${index}`}>
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setVariations([
                    {
                      stage: "PROTOTYPE",
                      color: "",
                      size: "",
                      revision: "A",
                      quantity: 0,
                      location: null,
                    },
                  ]);
                  setSelectedProductionItemId("");
                  onOpenChange(false);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !selectedProductionItemId}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  `Create ${variations.length} Sample Item${variations.length !== 1 ? "s" : ""}`
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <CreateProductionItemDialog
        open={showCreateProductDialog}
        onOpenChange={setShowCreateProductDialog}
        onSuccess={handleProductionItemCreated}
      />
    </>
  );
}

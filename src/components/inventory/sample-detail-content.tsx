"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CreateRequestDialog } from "@/components/requests/create-request-dialog";
import { CreateSampleItemDialog } from "@/components/inventory/create-sample-item-dialog";
import { AddInventoryDialog } from "@/components/inventory/add-inventory-dialog";
import { CommentForm } from "@/components/comments/comment-form";
import { CommentThread } from "@/components/comments/comment-thread";
import { formatDate } from "@/lib/utils";
import { MessageSquare, Package, FileText, ChevronDown, ChevronUp, Plus } from "lucide-react";
import type { Prisma } from "@prisma/client";

type SampleItemWithRelations = Prisma.SampleItemGetPayload<{
  include: {
    productionItem: true;
    inventory: true;
    comments: true;
    requests: {
      include: {
        team: true;
      };
    };
  };
}>;

type ProductionItemWithSamples = Prisma.ProductionItemGetPayload<{
  include: {
    comments: true;
    sampleItems: {
      include: {
        inventory: true;
        _count: {
          select: {
            requests: true;
            comments: true;
          };
        };
      };
    };
  };
}>;

export function SampleDetailContent({
  sampleItem: initialSampleItem,
  productionItem,
  onViewFullPage,
}: {
  sampleItem: SampleItemWithRelations;
  productionItem?: ProductionItemWithSamples;
  onViewFullPage?: () => void;
}) {
  const router = useRouter();
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [showCreateSampleItem, setShowCreateSampleItem] = useState(false);
  const [showAddInventory, setShowAddInventory] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string>(initialSampleItem.stage);
  const [inventoryLocationCollapsed, setInventoryLocationCollapsed] = useState<Map<string, boolean>>(new Map());
  const [selectedColor, setSelectedColor] = useState<string>(initialSampleItem.color || "all");
  const [selectedSize, setSelectedSize] = useState<string>(initialSampleItem.size || "all");
  const [currentSampleItem, setCurrentSampleItem] = useState<SampleItemWithRelations>(initialSampleItem);
  const [currentProductionItem, setCurrentProductionItem] = useState<ProductionItemWithSamples | undefined>(productionItem);
  const [isLoading, setIsLoading] = useState(false);
  const [showProductionCommentForm, setShowProductionCommentForm] = useState(false);
  const [showSampleCommentForm, setShowSampleCommentForm] = useState(false);
  const [isProductionCommentsOpen, setIsProductionCommentsOpen] = useState(true);
  const [isSampleCommentsOpen, setIsSampleCommentsOpen] = useState(true);
  const [productionCommentCollapsed, setProductionCommentCollapsed] = useState<Map<string, boolean>>(new Map());
  const [sampleCommentCollapsed, setSampleCommentCollapsed] = useState<Map<string, boolean>>(new Map());
  const isInitialMount = useRef(true);
  const hasNavigated = useRef(false);

  // Get available options filtered by selected stage
  const availableOptions = useMemo(() => {
    if (!productionItem) return { stages: [], colors: [], sizes: [] };

    const stages = new Set<string>();
    const colors = new Set<string>();
    const sizes = new Set<string>();

    // Filter sample items by selected stage
    const stageFilteredItems = productionItem.sampleItems.filter(
      (item) => item.stage === selectedStage
    );

    productionItem.sampleItems.forEach((item) => {
      if (item.stage) stages.add(item.stage);
    });

    // Only include colors and sizes available for the selected stage
    stageFilteredItems.forEach((item) => {
      if (item.color) colors.add(item.color);
      if (item.size) sizes.add(item.size);
    });

    return {
      stages: Array.from(stages).sort(),
      colors: Array.from(colors).sort(),
      sizes: Array.from(sizes).sort(),
    };
  }, [productionItem, selectedStage]);

  // Find the selected sample item based on filters
  const selectedSampleItem = useMemo(() => {
    if (!productionItem) return initialSampleItem;

    // First try exact match
    let filtered = productionItem.sampleItems.find(
      (item) =>
        item.stage === selectedStage &&
        (selectedColor === "all" || item.color === selectedColor) &&
        (selectedSize === "all" || item.size === selectedSize)
    );

    // If no exact match, try stage + color
    if (!filtered && selectedColor !== "all") {
      filtered = productionItem.sampleItems.find(
        (item) => item.stage === selectedStage && item.color === selectedColor
      );
    }

    // If still no match, try just stage
    if (!filtered) {
      filtered = productionItem.sampleItems.find((item) => item.stage === selectedStage);
    }

    return filtered || initialSampleItem;
  }, [productionItem, selectedStage, selectedColor, selectedSize, initialSampleItem]);

  // Mark initial mount as complete after first render
  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  // Update current sample item and production item when props change (e.g., from navigation)
  useEffect(() => {
    setCurrentSampleItem(initialSampleItem);
    setCurrentProductionItem(productionItem);
    setSelectedStage(initialSampleItem.stage);
    setSelectedColor(initialSampleItem.color || "all");
    setSelectedSize(initialSampleItem.size || "all");
  }, [initialSampleItem.id, productionItem?.id]);

  // Auto-select first color and size when stage changes
  useEffect(() => {
    if (!productionItem || isInitialMount.current) return;
    
    // Only auto-select if stage actually changed from initial
    if (selectedStage === initialSampleItem.stage) return;

    const stageFilteredItems = productionItem.sampleItems.filter(
      (item) => item.stage === selectedStage
    );

    if (stageFilteredItems.length > 0) {
      const firstItem = stageFilteredItems[0];
      const newColor = firstItem.color || "all";
      const newSize = firstItem.size || "all";
      
      setSelectedColor(newColor);
      setSelectedSize(newSize);
    }
  }, [selectedStage, productionItem, initialSampleItem.stage]);

  // Fetch and update sample data when selected sample changes (without navigation)
  useEffect(() => {
    if (!productionItem || isInitialMount.current) return;
    
    // Only fetch if the selected sample is different from the current one
    if (selectedSampleItem.id !== currentSampleItem.id && !hasNavigated.current) {
      hasNavigated.current = true;
      setIsLoading(true);
      
      // Fetch the new sample item data
      fetch(`/api/inventory/samples/${selectedSampleItem.id}`)
        .then((res) => res.json())
        .then((data) => {
          setCurrentSampleItem(data);
          setIsLoading(false);
          // Update URL silently without triggering navigation/re-render
          // This works for both modal and full page views
          window.history.replaceState(null, '', `/inventory/sample/${selectedSampleItem.id}`);
        })
        .catch((error) => {
          console.error("Failed to fetch sample item:", error);
          setIsLoading(false);
        });
    }
  }, [selectedSampleItem.id, currentSampleItem.id, onViewFullPage, router, productionItem]);

  // Reset navigation flag when filters change
  useEffect(() => {
    hasNavigated.current = false;
  }, [selectedStage, selectedColor, selectedSize]);

  // Use the current sample item (from state, falls back to initial)
  const sampleItem = currentSampleItem;

  // Handlers for toggling comment collapse state
  const handleProductionCommentToggle = (commentId: string) => {
    setProductionCommentCollapsed((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(commentId) ?? true;
      newMap.set(commentId, !current);
      return newMap;
    });
  };

  const handleSampleCommentToggle = (commentId: string) => {
    setSampleCommentCollapsed((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(commentId) ?? true;
      newMap.set(commentId, !current);
      return newMap;
    });
  };

  const availableQuantity = sampleItem.inventory.reduce(
    (sum, inv) => sum + (inv.status === "AVAILABLE" ? inv.quantity : 0),
    0
  );

  // Group inventory by location
  const inventoryByLocation = useMemo(() => {
    const grouped = new Map<string | null, typeof sampleItem.inventory>();
    for (const inv of sampleItem.inventory) {
      const location = inv.location || "No Location";
      if (!grouped.has(location)) {
        grouped.set(location, []);
      }
      grouped.get(location)!.push(inv);
    }
    return grouped;
  }, [sampleItem.inventory]);

  // Convert enum location to readable format
  const formatLocation = (location: string | null): string => {
    if (!location) return "No Location";
    return location
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const toggleLocationCollapse = (location: string | null) => {
    const key = location || "No Location";
    setInventoryLocationCollapsed((prev) => {
      const next = new Map(prev);
      next.set(key, !next.get(key));
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      {productionItem && productionItem.sampleItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Filter Sample Variations</CardTitle>
            <CardDescription>
              Select stage, color, and size to view different sample variations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="stage-filter">Stage</Label>
                <Select
                  value={selectedStage}
                  onValueChange={(value) => {
                    setSelectedStage(value);
                    // Color and size will be auto-selected by useEffect
                  }}
                >
                  <SelectTrigger id="stage-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOptions.stages.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="color-filter">Color</Label>
                <Select
                  value={selectedColor}
                  onValueChange={(value) => {
                    setSelectedColor(value);
                    // If color changes, try to keep size if it's still valid, otherwise reset
                    const stageFilteredItems = productionItem?.sampleItems.filter(
                      (item) => item.stage === selectedStage && (value === "all" || item.color === value)
                    ) || [];
                    const validSizes = new Set(stageFilteredItems.map(item => item.size).filter(Boolean));
                    if (selectedSize !== "all" && !validSizes.has(selectedSize)) {
                      const firstItem = stageFilteredItems.find(item => item.size) || stageFilteredItems[0];
                      setSelectedSize(firstItem?.size || "all");
                    }
                  }}
                >
                  <SelectTrigger id="color-filter">
                    <SelectValue placeholder="All Colors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Colors</SelectItem>
                    {availableOptions.colors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="size-filter">Size</Label>
                <Select
                  value={selectedSize}
                  onValueChange={(value) => {
                    setSelectedSize(value);
                  }}
                >
                  <SelectTrigger id="size-filter">
                    <SelectValue placeholder="All Sizes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sizes</SelectItem>
                    {availableOptions.sizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sample Info */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          {isLoading && (
            <p className="text-sm text-muted-foreground">Loading sample data...</p>
          )}
          <div className="flex gap-2 flex-wrap">
            <Badge>{sampleItem.stage}</Badge>
            {sampleItem.color && <Badge variant="secondary">{sampleItem.color}</Badge>}
            {sampleItem.size && <Badge variant="secondary">{sampleItem.size}</Badge>}
            <Badge variant="outline">Rev: {sampleItem.revision}</Badge>
          </div>
          {sampleItem.notes && (
            <p className="text-sm text-muted-foreground">{sampleItem.notes}</p>
          )}
        </div>
        <div className="flex gap-2">
          {onViewFullPage && (
            <Button variant="outline" onClick={onViewFullPage}>
              View Full Page
            </Button>
          )}
          <Button variant="outline" onClick={() => setShowCreateSampleItem(true)}>
            Add Sample Variation
          </Button>
          <Button onClick={() => setShowCreateRequest(true)}>
            Create Request
          </Button>
        </div>
      </div>

      {/* Inventory */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddInventory(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Inventory
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Available Quantity:</span>
              <span className="text-sm">{availableQuantity}</span>
            </div>
            {sampleItem.inventory.length > 0 && (
              <div className="mt-4 space-y-3">
                {Array.from(inventoryByLocation.entries()).map(([location, items]) => {
                  const locationKey = location || "No Location";
                  const isCollapsed = inventoryLocationCollapsed.get(locationKey) ?? false;
                  const totalQuantity = items.reduce((sum, inv) => sum + inv.quantity, 0);
                  
                  return (
                    <div key={locationKey} className="border rounded-lg">
                      <div className="flex items-center justify-between p-3 bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLocationCollapse(location)}
                            className="h-6 w-6 p-0"
                          >
                            {isCollapsed ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronUp className="h-4 w-4" />
                            )}
                          </Button>
                          <span className="font-medium">{formatLocation(location)}</span>
                          <span className="text-sm text-muted-foreground">
                            ({items.length} record{items.length !== 1 ? "s" : ""}, {totalQuantity} total)
                          </span>
                        </div>
                      </div>
                      {!isCollapsed && (
                        <div className="p-3 space-y-2">
                          {items.map((inv) => (
                            <div
                              key={inv.id}
                              className="flex justify-between items-center text-sm border-b pb-2 last:border-0"
                            >
                              <div>
                                <span className="font-medium">{inv.quantity}</span>
                                {inv.notes && (
                                  <span className="text-muted-foreground ml-2">- {inv.notes}</span>
                                )}
                              </div>
                              <Badge variant="outline">{inv.status}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {sampleItem.inventory.length === 0 && (
              <p className="text-sm text-muted-foreground mt-4">No inventory records yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Production Item Comments */}
      {currentProductionItem && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Product Comments ({currentProductionItem.comments?.length || 0})
            </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsProductionCommentsOpen(!isProductionCommentsOpen)}
                className="h-8 w-8 p-0"
              >
                {isProductionCommentsOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          {isProductionCommentsOpen && (
            <CardContent className="space-y-4">
            {currentProductionItem.comments && currentProductionItem.comments.length > 0 ? (
              <div className="space-y-4">
                {currentProductionItem.comments.map((comment) => (
                  <div key={comment.id} className="border-b pb-4 last:border-0">
                    <CommentThread
                      comment={comment as any}
                      onCommentAdded={() => {
                        // Refresh the production item data to get new comments with replies
                        if (currentProductionItem) {
                          fetch(`/api/inventory/production-items/${currentProductionItem.id}`)
                            .then((res) => res.json())
                            .then((data) => {
                              setCurrentProductionItem(data);
                              router.refresh();
                            });
                        }
                      }}
                      collapsedState={productionCommentCollapsed}
                      onToggleCollapse={handleProductionCommentToggle}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No product comments yet</p>
            )}
            {showProductionCommentForm ? (
              <CommentForm
                productionItemId={currentProductionItem.id}
                onSuccess={() => {
                  setShowProductionCommentForm(false);
                  // Refresh the production item data
                  fetch(`/api/inventory/production-items/${currentProductionItem.id}`)
                    .then((res) => res.json())
                    .then((data) => {
                      setCurrentProductionItem(data);
                      router.refresh();
                    });
                }}
                onCancel={() => setShowProductionCommentForm(false)}
              />
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProductionCommentForm(true)}
              >
                Add Product Comment
              </Button>
            )}
            </CardContent>
          )}
        </Card>
      )}

      {/* Sample Item Comments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Sample Comments ({currentSampleItem.comments.length})
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSampleCommentsOpen(!isSampleCommentsOpen)}
              className="h-8 w-8 p-0"
            >
              {isSampleCommentsOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
          {isSampleCommentsOpen && (
          <CardContent className="space-y-4">
          {currentSampleItem.comments.length > 0 ? (
            <div className="space-y-4">
              {currentSampleItem.comments.map((comment) => (
                <div key={comment.id} className="border-b pb-4 last:border-0">
                  <CommentThread
                    comment={comment as any}
                    onCommentAdded={() => {
                      // Refresh the sample item data to get new comments with replies
                      fetch(`/api/inventory/samples/${currentSampleItem.id}`)
                        .then((res) => res.json())
                        .then((data) => {
                          setCurrentSampleItem(data);
                          router.refresh();
                        });
                    }}
                    collapsedState={sampleCommentCollapsed}
                    onToggleCollapse={handleSampleCommentToggle}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No sample comments yet</p>
          )}
          {showSampleCommentForm ? (
            <CommentForm
              sampleItemId={currentSampleItem.id}
              onSuccess={() => {
                setShowSampleCommentForm(false);
                // Refresh the sample item data
                fetch(`/api/inventory/samples/${currentSampleItem.id}`)
                  .then((res) => res.json())
                  .then((data) => {
                    setCurrentSampleItem(data);
                    router.refresh();
                  });
              }}
              onCancel={() => setShowSampleCommentForm(false)}
            />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSampleCommentForm(true)}
            >
              Add Sample Comment
            </Button>
          )}
          </CardContent>
        )}
      </Card>

      {/* Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Requests ({sampleItem.requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sampleItem.requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No requests yet</p>
          ) : (
            <div className="space-y-3">
              {sampleItem.requests.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-3 hover:bg-accent cursor-pointer"
                  onClick={() => router.push(`/requests/request/${request.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">{request.team.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {request.quantity} • {request.shippingMethod || "No method"}
                      </p>
                    </div>
                    <Badge>{request.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showCreateRequest && (
        <CreateRequestDialog
          sampleItemId={sampleItem.id}
          open={showCreateRequest}
          onOpenChange={setShowCreateRequest}
          onSuccess={() => {
            setShowCreateRequest(false);
            router.refresh();
          }}
        />
      )}

      {showCreateSampleItem && (
        <CreateSampleItemDialog
          open={showCreateSampleItem}
          onOpenChange={setShowCreateSampleItem}
          onSuccess={() => {
            setShowCreateSampleItem(false);
            router.refresh();
          }}
          initialValues={{
            productionItemId: sampleItem.productionItemId,
            stage: sampleItem.stage,
            color: sampleItem.color || undefined,
            size: sampleItem.size || undefined,
            revision: sampleItem.revision,
          }}
        />
      )}

      {showAddInventory && (
        <AddInventoryDialog
          open={showAddInventory}
          onOpenChange={setShowAddInventory}
          sampleItemId={sampleItem.id}
          onSuccess={() => {
            setShowAddInventory(false);
            // Refresh the sample item data
            fetch(`/api/inventory/samples/${currentSampleItem.id}`)
              .then((res) => res.json())
              .then((data) => {
                setCurrentSampleItem(data);
                router.refresh();
              });
          }}
        />
      )}
    </div>
  );
}


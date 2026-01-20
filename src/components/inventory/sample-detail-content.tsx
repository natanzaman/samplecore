"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useModal } from "@/contexts/modal-context";
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
import { CommentForm } from "@/components/comments/comment-form";
import { CommentThread } from "@/components/comments/comment-thread";
import { formatDate } from "@/lib/utils";
import { formatColor } from "@/lib/color-utils";
import { formatSize } from "@/lib/size-utils";
import { formatLocation } from "@/lib/location-utils";
import { MessageSquare, Package, FileText, ChevronDown, ChevronUp, Plus } from "lucide-react";
import type { SampleItemWithRelations, ProductionItemWithSamples } from "@/lib/types";

export function SampleDetailContent({
  sampleItem: initialSampleItem,
  productionItem,
  viewMode = "sample", // "product" or "sample"
  isModal = false,
}: {
  sampleItem: SampleItemWithRelations;
  productionItem?: ProductionItemWithSamples;
  viewMode?: "product" | "sample";
  isModal?: boolean;
}) {
  const router = useRouter();
  // Modal context is always available (provided at root level)
  // We only use it when isModal is true
  const modal = useModal();
  const [showCreateRequest, setShowCreateRequest] = useState(false);
  const [showCreateSampleItem, setShowCreateSampleItem] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string>(initialSampleItem.stage);
  const [inventoryLocationCollapsed, setInventoryLocationCollapsed] = useState<Map<string, boolean>>(new Map());
  const [allInventoryCollapsed, setAllInventoryCollapsed] = useState(true);
  const [sampleItemGroupCollapsed, setSampleItemGroupCollapsed] = useState<Map<string, boolean>>(new Map());
  const [sizeGroupCollapsed, setSizeGroupCollapsed] = useState<Map<string, boolean>>(new Map());
  const [colorGroupCollapsed, setColorGroupCollapsed] = useState<Map<string, boolean>>(new Map());
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
  }, [selectedSampleItem.id, currentSampleItem.id, router, productionItem]);

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

  // Collect inventory based on view mode
  const allInventory = useMemo(() => {
    if (viewMode === "sample") {
      // Sample view: only show current sample's inventory
      return currentSampleItem.inventory.map((inv) => ({
        ...inv,
        sampleItem: {
          id: currentSampleItem.id,
          stage: currentSampleItem.stage,
          color: currentSampleItem.color,
          size: currentSampleItem.size,
          revision: currentSampleItem.revision,
        },
      }));
    } else {
      // Product view: show all inventory from all sample items
      if (!currentProductionItem) return [];
      const inventory: Array<{
        id: string;
        location: string | null;
        status: string;
        notes: string | null;
        sampleItem: {
          id: string;
          stage: string;
          color: string | null;
          size: string | null;
          revision: string;
        };
      }> = [];
      for (const si of currentProductionItem.sampleItems) {
        for (const inv of si.inventory) {
          inventory.push({
            ...inv,
            sampleItem: {
              id: si.id,
              stage: si.stage,
              color: si.color,
              size: si.size,
              revision: si.revision,
            },
          });
        }
      }
      return inventory;
    }
  }, [viewMode, currentProductionItem, currentSampleItem]);

  const totalAllInventoryCount = allInventory.length;

  const availableCount = useMemo(() => {
    if (viewMode === "sample") {
      return currentSampleItem.inventory.filter(inv => inv.status === "AVAILABLE").length;
    } else {
      return allInventory.filter(inv => inv.status === "AVAILABLE").length;
    }
  }, [viewMode, currentSampleItem.inventory, allInventory]);

  // Collect requests based on view mode
  const allRequests = useMemo(() => {
    if (viewMode === "sample") {
      // Sample view: only show current sample's requests
      return currentSampleItem.requests.map((req) => ({
        ...req,
        sampleItem: {
          id: currentSampleItem.id,
          stage: currentSampleItem.stage,
          color: currentSampleItem.color,
          size: currentSampleItem.size,
          revision: currentSampleItem.revision,
        },
      }));
    } else {
      // Product view: show all requests from all sample items
      if (!currentProductionItem) return [];
      const requests: Array<{
        id: string;
        quantity: number;
        status: string;
        shippingMethod: string | null;
        requestedAt: Date;
        team: {
          id: string;
          name: string;
        };
        sampleItem: {
          id: string;
          stage: string;
          color: string | null;
          size: string | null;
          revision: string;
        };
      }> = [];
      for (const si of currentProductionItem.sampleItems) {
        for (const req of si.requests) {
          requests.push({
            ...req,
            sampleItem: {
              id: si.id,
              stage: si.stage,
              color: si.color,
              size: si.size,
              revision: si.revision,
            },
          });
        }
      }
      return requests.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
    }
  }, [viewMode, currentProductionItem, currentSampleItem]);

  // Group all inventory by location
  const inventoryByLocation = useMemo(() => {
    const grouped = new Map<string | null, typeof allInventory>();
    for (const inv of allInventory) {
      const location = inv.location || "No Location";
      if (!grouped.has(location)) {
        grouped.set(location, []);
      }
      grouped.get(location)!.push(inv);
    }
    return grouped;
  }, [allInventory]);

  // Group inventory by size, then color, then sampleItem
  const getInventoryBySizeColorSampleItem = (items: typeof allInventory) => {
    // First group by size
    const bySize = new Map<string, typeof allInventory>();
    for (const inv of items) {
      const size = inv.sampleItem.size || "NO_SIZE";
      if (!bySize.has(size)) {
        bySize.set(size, []);
      }
      bySize.get(size)!.push(inv);
    }
    
    // Then group by color within each size
    const bySizeAndColor = new Map<string, Map<string, typeof allInventory>>();
    for (const [size, sizeItems] of bySize.entries()) {
      const byColor = new Map<string, typeof allInventory>();
      for (const inv of sizeItems) {
        const color = inv.sampleItem.color || "NO_COLOR";
        if (!byColor.has(color)) {
          byColor.set(color, []);
        }
        byColor.get(color)!.push(inv);
      }
      bySizeAndColor.set(size, byColor);
    }
    
    // Then group by sampleItem within each color
    const result = new Map<string, Map<string, Map<string, typeof allInventory>>>();
    for (const [size, colorMap] of bySizeAndColor.entries()) {
      const sizeMap = new Map<string, Map<string, typeof allInventory>>();
      for (const [color, colorItems] of colorMap.entries()) {
        const bySampleItem = new Map<string, typeof allInventory>();
        for (const inv of colorItems) {
          const sampleItemId = inv.sampleItem.id;
          if (!bySampleItem.has(sampleItemId)) {
            bySampleItem.set(sampleItemId, []);
          }
          bySampleItem.get(sampleItemId)!.push(inv);
        }
        sizeMap.set(color, bySampleItem);
      }
      result.set(size, sizeMap);
    }
    
    return result;
  };

  // Group inventory by sampleItem.id (for backward compatibility if needed)
  const getInventoryBySampleItem = (items: typeof allInventory) => {
    const grouped = new Map<string, typeof allInventory>();
    for (const inv of items) {
      const sampleItemId = inv.sampleItem.id;
      if (!grouped.has(sampleItemId)) {
        grouped.set(sampleItemId, []);
      }
      grouped.get(sampleItemId)!.push(inv);
    }
    return grouped;
  };

  const toggleSampleItemGroupCollapse = (sampleItemId: string) => {
    setSampleItemGroupCollapsed((prev) => {
      const next = new Map(prev);
      const current = next.get(sampleItemId) ?? true; // Default to collapsed (true)
      next.set(sampleItemId, !current);
      return next;
    });
  };

  const toggleSizeGroupCollapse = (sizeKey: string) => {
    setSizeGroupCollapsed((prev) => {
      const next = new Map(prev);
      const current = next.get(sizeKey) ?? true;
      next.set(sizeKey, !current);
      return next;
    });
  };

  const toggleColorGroupCollapse = (colorKey: string) => {
    setColorGroupCollapsed((prev) => {
      const next = new Map(prev);
      const current = next.get(colorKey) ?? true;
      next.set(colorKey, !current);
      return next;
    });
  };

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
      const current = next.get(key) ?? true; // Default to collapsed (true)
      next.set(key, !current);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Filter Controls - Only show in product view */}
      {viewMode === "product" && productionItem && productionItem.sampleItems.length > 0 && (
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
                        {formatColor(color)}
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
                        {formatSize(size)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Mode Toggle and Sample Info */}
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          {isLoading && (
            <p className="text-sm text-muted-foreground">Loading sample data...</p>
          )}
          <div className="flex items-center gap-2">
            {viewMode === "sample" && currentProductionItem && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isModal && modal && currentProductionItem) {
                    // Use modal context to navigate
                    modal.openSampleModal(currentSampleItem, currentProductionItem, "product");
                  } else {
                    // Use router for full page navigation
                    router.replace(`/inventory/sample/${currentSampleItem.id}?view=product`);
                  }
                }}
              >
                View Product
              </Button>
            )}
            {viewMode === "product" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isModal && modal && currentProductionItem) {
                    // Use modal context to navigate
                    modal.openSampleModal(currentSampleItem, currentProductionItem, "sample");
                  } else {
                    // Use router for full page navigation
                    router.replace(`/inventory/sample/${currentSampleItem.id}`);
                  }
                }}
              >
                View Sample
              </Button>
            )}
            {viewMode === "product" && (
              <Badge variant="secondary" className="mr-2">Product View</Badge>
            )}
            {viewMode === "sample" && (
              <Badge variant="secondary" className="mr-2">Sample View</Badge>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge>{sampleItem.stage}</Badge>
            {sampleItem.color && <Badge variant="secondary">{formatColor(sampleItem.color)}</Badge>}
            {sampleItem.size && <Badge variant="secondary">{formatSize(sampleItem.size)}</Badge>}
            <Badge variant="outline">Rev: {sampleItem.revision}</Badge>
          </div>
          {sampleItem.notes && (
            <p className="text-sm text-muted-foreground">{sampleItem.notes}</p>
          )}
        </div>
        <div className="flex gap-2">
          {viewMode === "product" && (
            <Button variant="outline" onClick={() => setShowCreateSampleItem(true)}>
              Add Sample Variation
            </Button>
          )}
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Available Items:</span>
              <span className="text-sm">{availableCount}</span>
            </div>
            {allInventory.length > 0 && (
              <div className="mt-4 space-y-3">
                {/* All Inventory Section */}
                <div className="border rounded-lg">
                  <div className="flex items-center justify-between p-3 bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAllInventoryCollapsed(!allInventoryCollapsed)}
                        className="h-6 w-6 p-0"
                      >
                        {allInventoryCollapsed ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronUp className="h-4 w-4" />
                        )}
                      </Button>
                      <span className="font-medium">All Inventory</span>
                      <span className="text-sm text-muted-foreground">
                        ({allInventory.length} item{allInventory.length !== 1 ? "s" : ""})
                      </span>
                    </div>
                  </div>
                  {!allInventoryCollapsed && (
                    <div className="p-3 space-y-3">
                      {Array.from(getInventoryBySizeColorSampleItem(allInventory).entries()).map(([size, colorMap]) => {
                        const sizeKey = `all-${size}`;
                        const isSizeCollapsed = sizeGroupCollapsed.get(sizeKey) ?? true;
                        const sizeItems = Array.from(colorMap.values()).flatMap(c => Array.from(c.values()).flat());
                        const availableInSize = sizeItems.filter(inv => inv.status === "AVAILABLE").length;
                        
                        return (
                          <div key={sizeKey} className="border rounded-lg bg-card">
                            <div 
                              className="flex items-center justify-between p-3 bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                              onClick={() => toggleSizeGroupCollapse(sizeKey)}
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSizeGroupCollapse(sizeKey);
                                  }}
                                  className="h-6 w-6 p-0"
                                >
                                  {isSizeCollapsed ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronUp className="h-4 w-4" />
                                  )}
                                </Button>
                                <Badge variant="outline">Size: {size === "NO_SIZE" ? "No Size" : formatSize(size)}</Badge>
                                <span className="text-sm text-muted-foreground ml-auto">
                                  ({sizeItems.length} item{sizeItems.length !== 1 ? "s" : ""}, {availableInSize} available)
                                </span>
                              </div>
                            </div>
                            {!isSizeCollapsed && (
                              <div className="p-3 space-y-2 border-t">
                                {Array.from(colorMap.entries()).map(([color, sampleItemMap]) => {
                                  const colorKey = `all-${size}-${color}`;
                                  const isColorCollapsed = colorGroupCollapsed.get(colorKey) ?? true;
                                  const colorItems = Array.from(sampleItemMap.values()).flat();
                                  const availableInColor = colorItems.filter(inv => inv.status === "AVAILABLE").length;
                                  
                                  return (
                                    <div key={colorKey} className="border rounded-lg bg-muted/20">
                                      <div 
                                        className="flex items-center justify-between p-2 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                                        onClick={() => toggleColorGroupCollapse(colorKey)}
                                      >
                                        <div className="flex items-center gap-2 flex-1">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleColorGroupCollapse(colorKey);
                                            }}
                                            className="h-5 w-5 p-0"
                                          >
                                            {isColorCollapsed ? (
                                              <ChevronDown className="h-3 w-3" />
                                            ) : (
                                              <ChevronUp className="h-3 w-3" />
                                            )}
                                          </Button>
                                          <Badge variant="secondary">Color: {color === "NO_COLOR" ? "No Color" : formatColor(color)}</Badge>
                                          <span className="text-xs text-muted-foreground ml-auto">
                                            ({colorItems.length} item{colorItems.length !== 1 ? "s" : ""}, {availableInColor} available)
                                          </span>
                                        </div>
                                      </div>
                                      {!isColorCollapsed && (
                                        <div className="p-2 space-y-2 border-t">
                                          {Array.from(sampleItemMap.entries()).map(([sampleItemId, items]) => {
                                            const isSampleCollapsed = sampleItemGroupCollapsed.get(sampleItemId) ?? true;
                                            const availableInSample = items.filter(inv => inv.status === "AVAILABLE").length;
                                            const firstItem = items[0];
                                            
                                            return (
                                              <div key={sampleItemId} className="border rounded bg-background">
                                                <div 
                                                  className="flex items-center justify-between p-2 bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors"
                                                  onClick={() => toggleSampleItemGroupCollapse(sampleItemId)}
                                                >
                                                  <div className="flex items-center gap-2 flex-1">
                                                    <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleSampleItemGroupCollapse(sampleItemId);
                                                      }}
                                                      className="h-5 w-5 p-0"
                                                    >
                                                      {isSampleCollapsed ? (
                                                        <ChevronDown className="h-3 w-3" />
                                                      ) : (
                                                        <ChevronUp className="h-3 w-3" />
                                                      )}
                                                    </Button>
                                                    <div className="flex gap-2 items-center">
                                                      <Badge variant="outline" className="text-xs">{firstItem.sampleItem.stage}</Badge>
                                                      <Badge variant="outline" className="text-xs">Rev: {firstItem.sampleItem.revision}</Badge>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground ml-auto">
                                                      ({items.length} item{items.length !== 1 ? "s" : ""}, {availableInSample} available)
                                                    </span>
                                                  </div>
                                                </div>
                                                {!isSampleCollapsed && (
                                                  <div className="p-2 space-y-1 border-t">
                                                    {items.map((inv, index) => (
                                                      <div
                                                        key={inv.id}
                                                        onClick={async () => {
                                                          // Allow clicking in both product and sample view modes
                                                          if (viewMode === "product" || viewMode === "sample") {
                                                            // Only navigate if clicking on a different sample item
                                                            if (inv.sampleItem.id !== currentSampleItem.id) {
                                                              if (isModal && modal) {
                                                                // Fetch and open in modal - show sample view of the selected item
                                                                try {
                                                                  const sampleRes = await fetch(`/api/inventory/samples/${inv.sampleItem.id}`);
                                                                  if (sampleRes.ok) {
                                                                    const sampleItem = await sampleRes.json();
                                                                    const productionRes = await fetch(`/api/inventory/production-items/${sampleItem.productionItemId}`);
                                                                    if (productionRes.ok) {
                                                                      const productionItemFull = await productionRes.json();
                                                                      modal.openSampleModal(sampleItem, productionItemFull, "sample");
                                                                    }
                                                                  }
                                                                } catch (error) {
                                                                  console.error("Error opening modal:", error);
                                                                }
                                                              } else {
                                                                // Use router for full page navigation
                                                                router.replace(`/inventory/sample/${inv.sampleItem.id}`);
                                                              }
                                                            }
                                                          }
                                                        }}
                                                        className={`flex justify-between items-center text-sm border-b pb-1 last:border-0 p-1.5 rounded transition-colors ${
                                                          (viewMode === "product" || viewMode === "sample") && inv.sampleItem.id !== currentSampleItem.id
                                                            ? "hover:bg-accent/50 cursor-pointer" 
                                                            : ""
                                                        }`}
                                                      >
                                                        <div className="flex-1">
                                                          <div className="text-muted-foreground text-xs">
                                                            Item #{index + 1}
                                                            {inv.notes && (
                                                              <span className="ml-2">- {inv.notes}</span>
                                                            )}
                                                          </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 ml-2">
                                                          <Badge variant="outline" className="text-xs">{inv.status}</Badge>
                                                          <Badge variant="secondary" className="text-xs">{formatLocation(inv.location)}</Badge>
                                                        </div>
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Inventory by Location */}
                {Array.from(inventoryByLocation.entries()).map(([location, items]) => {
                  const locationKey = location || "No Location";
                  const isCollapsed = inventoryLocationCollapsed.get(locationKey) ?? true;
                  const totalCount = items.length;
                  
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
                            ({items.length} item{items.length !== 1 ? "s" : ""})
                          </span>
                        </div>
                      </div>
                      {!isCollapsed && (
                        <div className="p-3 space-y-3">
                          {Array.from(getInventoryBySizeColorSampleItem(items).entries()).map(([size, colorMap]) => {
                            const sizeKey = `${locationKey}-${size}`;
                            const isSizeCollapsed = sizeGroupCollapsed.get(sizeKey) ?? true;
                            const sizeItems = Array.from(colorMap.values()).flatMap(c => Array.from(c.values()).flat());
                            const availableInSize = sizeItems.filter(inv => inv.status === "AVAILABLE").length;
                            
                            return (
                              <div key={sizeKey} className="border rounded-lg bg-card">
                                <div 
                                  className="flex items-center justify-between p-3 bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                                  onClick={() => toggleSizeGroupCollapse(sizeKey)}
                                >
                                  <div className="flex items-center gap-2 flex-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSizeGroupCollapse(sizeKey);
                                      }}
                                      className="h-6 w-6 p-0"
                                    >
                                      {isSizeCollapsed ? (
                                        <ChevronDown className="h-4 w-4" />
                                      ) : (
                                        <ChevronUp className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <Badge variant="outline">Size: {size === "NO_SIZE" ? "No Size" : formatSize(size)}</Badge>
                                    <span className="text-sm text-muted-foreground ml-auto">
                                      ({sizeItems.length} item{sizeItems.length !== 1 ? "s" : ""}, {availableInSize} available)
                                    </span>
                                  </div>
                                </div>
                                {!isSizeCollapsed && (
                                  <div className="p-3 space-y-2 border-t">
                                    {Array.from(colorMap.entries()).map(([color, sampleItemMap]) => {
                                      const colorKey = `${locationKey}-${size}-${color}`;
                                      const isColorCollapsed = colorGroupCollapsed.get(colorKey) ?? true;
                                      const colorItems = Array.from(sampleItemMap.values()).flat();
                                      const availableInColor = colorItems.filter(inv => inv.status === "AVAILABLE").length;
                                      
                                      return (
                                        <div key={colorKey} className="border rounded-lg bg-muted/20">
                                          <div 
                                            className="flex items-center justify-between p-2 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                                            onClick={() => toggleColorGroupCollapse(colorKey)}
                                          >
                                            <div className="flex items-center gap-2 flex-1">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  toggleColorGroupCollapse(colorKey);
                                                }}
                                                className="h-5 w-5 p-0"
                                              >
                                                {isColorCollapsed ? (
                                                  <ChevronDown className="h-3 w-3" />
                                                ) : (
                                                  <ChevronUp className="h-3 w-3" />
                                                )}
                                              </Button>
                                              <Badge variant="secondary">Color: {color === "NO_COLOR" ? "No Color" : formatColor(color)}</Badge>
                                              <span className="text-xs text-muted-foreground ml-auto">
                                                ({colorItems.length} item{colorItems.length !== 1 ? "s" : ""}, {availableInColor} available)
                                              </span>
                                            </div>
                                          </div>
                                          {!isColorCollapsed && (
                                            <div className="p-2 space-y-2 border-t">
                                              {Array.from(sampleItemMap.entries()).map(([sampleItemId, sampleItems]) => {
                                                const isSampleCollapsed = sampleItemGroupCollapsed.get(sampleItemId) ?? true;
                                                const availableInSample = sampleItems.filter(inv => inv.status === "AVAILABLE").length;
                                                const firstItem = sampleItems[0];
                                                
                                                return (
                                                  <div key={sampleItemId} className="border rounded bg-background">
                                                    <div 
                                                      className="flex items-center justify-between p-2 bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors"
                                                      onClick={() => toggleSampleItemGroupCollapse(sampleItemId)}
                                                    >
                                                      <div className="flex items-center gap-2 flex-1">
                                                        <Button
                                                          variant="ghost"
                                                          size="sm"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleSampleItemGroupCollapse(sampleItemId);
                                                          }}
                                                          className="h-5 w-5 p-0"
                                                        >
                                                          {isSampleCollapsed ? (
                                                            <ChevronDown className="h-3 w-3" />
                                                          ) : (
                                                            <ChevronUp className="h-3 w-3" />
                                                          )}
                                                        </Button>
                                                        <div className="flex gap-2 items-center">
                                                          <Badge variant="outline" className="text-xs">{firstItem.sampleItem.stage}</Badge>
                                                          <Badge variant="outline" className="text-xs">Rev: {firstItem.sampleItem.revision}</Badge>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground ml-auto">
                                                          ({sampleItems.length} item{sampleItems.length !== 1 ? "s" : ""}, {availableInSample} available)
                                                        </span>
                                                      </div>
                                                    </div>
                                                    {!isSampleCollapsed && (
                                                      <div className="p-2 space-y-1 border-t">
                                                        {sampleItems.map((inv, index) => (
                                                          <div
                                                            key={inv.id}
                                                            onClick={async () => {
                                                              // Allow clicking in both product and sample view modes
                                                              if (viewMode === "product" || viewMode === "sample") {
                                                                // Only navigate if clicking on a different sample item
                                                                if (inv.sampleItem.id !== currentSampleItem.id) {
                                                                  if (isModal && modal) {
                                                                    // Fetch and open in modal - show sample view of the selected item
                                                                    try {
                                                                      const sampleRes = await fetch(`/api/inventory/samples/${inv.sampleItem.id}`);
                                                                      if (sampleRes.ok) {
                                                                        const sampleItem = await sampleRes.json();
                                                                        const productionRes = await fetch(`/api/inventory/production-items/${sampleItem.productionItemId}`);
                                                                        if (productionRes.ok) {
                                                                          const productionItemFull = await productionRes.json();
                                                                          modal.openSampleModal(sampleItem, productionItemFull, "sample");
                                                                        }
                                                                      }
                                                                    } catch (error) {
                                                                      console.error("Error opening modal:", error);
                                                                    }
                                                                  } else {
                                                                    // Use router for full page navigation
                                                                    router.push(`/inventory/sample/${inv.sampleItem.id}`);
                                                                  }
                                                                }
                                                              }
                                                            }}
                                                            className={`flex justify-between items-center text-sm border-b pb-1 last:border-0 p-1.5 rounded transition-colors ${
                                                              (viewMode === "product" || viewMode === "sample") && inv.sampleItem.id !== currentSampleItem.id
                                                                ? "hover:bg-accent/50 cursor-pointer" 
                                                                : ""
                                                            }`}
                                                          >
                                                            <div>
                                                              <span className="font-medium text-xs">Item #{index + 1}</span>
                                                              {inv.notes && (
                                                                <span className="ml-2 text-xs text-muted-foreground">- {inv.notes}</span>
                                                              )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                              <Badge variant="outline" className="text-xs">{inv.status}</Badge>
                                                              <Badge variant="secondary" className="text-xs">{formatLocation(inv.location)}</Badge>
                                                            </div>
                                                          </div>
                                                        ))}
                                                      </div>
                                                    )}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {allInventory.length === 0 && (
              <p className="text-sm text-muted-foreground mt-4">No inventory records yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Production Item Comments - Only show in product view */}
      {viewMode === "product" && currentProductionItem && (
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

      {/* Sample Comments - Only show in sample view */}
      {viewMode === "sample" && (
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
      )}

      {/* Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Requests ({allRequests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No requests yet</p>
          ) : (
            <div className="space-y-3">
              {allRequests.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-3 hover:bg-accent cursor-pointer"
                  onClick={() => router.push(`/requests/request/${request.id}`)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {viewMode === "product" && (
                        <div className="flex gap-2 mb-1">
                          <Badge variant="outline">{request.sampleItem.stage}</Badge>
                          {request.sampleItem.color && (
                            <Badge variant="secondary">{formatColor(request.sampleItem.color)}</Badge>
                          )}
                          {request.sampleItem.size && (
                            <Badge variant="secondary">{formatSize(request.sampleItem.size)}</Badge>
                          )}
                          <Badge variant="outline">Rev: {request.sampleItem.revision}</Badge>
                        </div>
                      )}
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

    </div>
  );
}


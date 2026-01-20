"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MultiSelect } from "@/components/ui/multi-select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, ChevronDown, ChevronUp } from "lucide-react";

const STAGES = [
  { value: "PROTOTYPE", label: "Prototype" },
  { value: "DEVELOPMENT", label: "Development" },
  { value: "PRODUCTION", label: "Production" },
  { value: "ARCHIVED", label: "Archived" },
] as const;

const SIZE_OPTIONS = [
  { value: "XS", label: "XS" },
  { value: "S", label: "S" },
  { value: "M", label: "M" },
  { value: "L", label: "L" },
  { value: "XL", label: "XL" },
  { value: "XXL", label: "XXL" },
  { value: "XXXL", label: "XXXL" },
  { value: "ONE_SIZE", label: "One Size" },
  { value: "SMALL", label: "Small" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LARGE", label: "Large" },
  { value: "EXTRA_LARGE", label: "Extra Large" },
  { value: "PETITE", label: "Petite" },
  { value: "TALL", label: "Tall" },
  { value: "REGULAR", label: "Regular" },
] as const;

const COLOR_OPTIONS = [
  { value: "BLACK", label: "Black" },
  { value: "WHITE", label: "White" },
  { value: "NAVY", label: "Navy" },
  { value: "GRAY", label: "Gray" },
  { value: "CHARCOAL", label: "Charcoal" },
  { value: "BEIGE", label: "Beige" },
  { value: "CAMEL", label: "Camel" },
  { value: "IVORY", label: "Ivory" },
  { value: "ROSE", label: "Rose" },
  { value: "SAGE", label: "Sage" },
  { value: "LIGHT_BLUE", label: "Light Blue" },
  { value: "RED", label: "Red" },
  { value: "BLUE", label: "Blue" },
  { value: "GREEN", label: "Green" },
  { value: "YELLOW", label: "Yellow" },
  { value: "ORANGE", label: "Orange" },
  { value: "PURPLE", label: "Purple" },
  { value: "PINK", label: "Pink" },
  { value: "BROWN", label: "Brown" },
  { value: "TAN", label: "Tan" },
  { value: "CREAM", label: "Cream" },
  { value: "OLIVE", label: "Olive" },
  { value: "BURGUNDY", label: "Burgundy" },
  { value: "MAROON", label: "Maroon" },
  { value: "TEAL", label: "Teal" },
  { value: "CORAL", label: "Coral" },
  { value: "LAVENDER", label: "Lavender" },
  { value: "MINT", label: "Mint" },
  { value: "KHAKI", label: "Khaki" },
  { value: "DENIM", label: "Denim" },
] as const;

export function InventoryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const stageParam = searchParams.get("stage");
  const colorParam = searchParams.get("color");
  const sizeParam = searchParams.get("size");

  // Parse arrays from URL (comma-separated)
  const getSelectedStages = (param: string | null) => {
    if (!param) return STAGES.map((s) => s.value); // Default: all selected
    return param.split(",").filter(Boolean);
  };

  const getSelectedColors = (param: string | null) => {
    if (!param) return COLOR_OPTIONS.map((c) => c.value); // Default: all selected
    return param.split(",").filter(Boolean);
  };

  const getSelectedSizes = (param: string | null) => {
    if (!param) return SIZE_OPTIONS.map((s) => s.value); // Default: all selected
    return param.split(",").filter(Boolean);
  };

  const [selectedStages, setSelectedStages] = useState<string[]>(() => getSelectedStages(stageParam));
  const [selectedColors, setSelectedColors] = useState<string[]>(() => getSelectedColors(colorParam));
  const [selectedSizes, setSelectedSizes] = useState<string[]>(() => getSelectedSizes(sizeParam));
  const [isCollapsed, setIsCollapsed] = useState(true);
  const isInternalUpdate = useRef(false);

  // Sync selected values with URL params when URL changes (but not from our own updates)
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    const newStages = getSelectedStages(stageParam);
    setSelectedStages(newStages);
  }, [stageParam]);

  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    const newColors = getSelectedColors(colorParam);
    setSelectedColors(newColors);
  }, [colorParam]);

  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    const newSizes = getSelectedSizes(sizeParam);
    setSelectedSizes(newSizes);
  }, [sizeParam]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    // Handle stage - only set if not all selected
    const allStagesSelected = selectedStages.length === STAGES.length;
    const currentStageParam = params.get("stage");
    const newStageValue = allStagesSelected ? null : (selectedStages.length > 0 ? selectedStages.join(",") : null);
    
    if (newStageValue === null && currentStageParam === null) {
      // Already correct, do nothing
    } else if (newStageValue !== currentStageParam) {
      if (newStageValue === null) {
        params.delete("stage");
      } else {
        params.set("stage", newStageValue);
      }
    }

    // Handle color - only set if not all selected
    const allColorsSelected = selectedColors.length === COLOR_OPTIONS.length;
    const currentColorParam = params.get("color");
    const newColorValue = allColorsSelected ? null : (selectedColors.length > 0 ? selectedColors.join(",") : null);
    
    if (newColorValue === null && currentColorParam === null) {
      // Already correct, do nothing
    } else if (newColorValue !== currentColorParam) {
      if (newColorValue === null) {
        params.delete("color");
      } else {
        params.set("color", newColorValue);
      }
    }

    // Handle size - only set if not all selected
    const allSizesSelected = selectedSizes.length === SIZE_OPTIONS.length;
    const currentSizeParam = params.get("size");
    const newSizeValue = allSizesSelected ? null : (selectedSizes.length > 0 ? selectedSizes.join(",") : null);
    
    if (newSizeValue === null && currentSizeParam === null) {
      // Already correct, do nothing
    } else if (newSizeValue !== currentSizeParam) {
      if (newSizeValue === null) {
        params.delete("size");
      } else {
        params.set("size", newSizeValue);
      }
    }

    // Only update URL if something actually changed
    const newParamsString = params.toString();
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.delete("page");
    const currentParamsString = currentParams.toString();
    
    if (newParamsString !== currentParamsString) {
      isInternalUpdate.current = true;
      router.replace(`/inventory?${newParamsString}`);
    }
  }, [selectedStages, selectedColors, selectedSizes, router, searchParams]);

  const handleClearFilters = () => {
    setSelectedStages(STAGES.map((s) => s.value));
    setSelectedColors(COLOR_OPTIONS.map((c) => c.value));
    setSelectedSizes(SIZE_OPTIONS.map((s) => s.value));
    router.push("/inventory");
  };

  const allStagesSelected = selectedStages.length === STAGES.length;
  const allColorsSelected = selectedColors.length === COLOR_OPTIONS.length;
  const allSizesSelected = selectedSizes.length === SIZE_OPTIONS.length;

  const hasActiveFilters = !allStagesSelected || !allColorsSelected || !allSizesSelected;

  return (
    <Card>
      <CardContent className="p-0">
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="flex items-center gap-2">
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            )}
            <h3 className="text-sm font-semibold">Filters</h3>
            {hasActiveFilters && (
              <span className="text-xs text-muted-foreground">
                (Active filters applied)
              </span>
            )}
          </div>
          {hasActiveFilters && !isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleClearFilters();
              }}
              className="h-8"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        {!isCollapsed && (
          <div className="px-4 pb-4 space-y-4 border-t">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="stage-filter" className="text-sm">
                  Stage
                </Label>
                <MultiSelect
                  options={STAGES}
                  selected={selectedStages}
                  onChange={setSelectedStages}
                  placeholder="Select stages..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color-filter" className="text-sm">
                  Color
                </Label>
                <MultiSelect
                  options={COLOR_OPTIONS}
                  selected={selectedColors}
                  onChange={setSelectedColors}
                  placeholder="Select colors..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="size-filter" className="text-sm">
                  Size
                </Label>
                <MultiSelect
                  options={SIZE_OPTIONS}
                  selected={selectedSizes}
                  onChange={setSelectedSizes}
                  placeholder="Select sizes..."
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

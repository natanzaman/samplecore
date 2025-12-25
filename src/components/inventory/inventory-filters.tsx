"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const STAGES = [
  { value: "all", label: "All Stages" },
  { value: "PROTOTYPE", label: "Prototype" },
  { value: "DEVELOPMENT", label: "Development" },
  { value: "PRODUCTION", label: "Production" },
  { value: "ARCHIVED", label: "Archived" },
] as const;

export function InventoryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStage = searchParams.get("stage") || "all";
  const currentColor = searchParams.get("color") || "all";
  const currentSize = searchParams.get("size") || "all";

  const SIZE_OPTIONS = [
    { value: "all", label: "All Sizes" },
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
    { value: "all", label: "All Colors" },
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

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    router.push(`/inventory?${params.toString()}`);
  };


  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <Label htmlFor="stage-filter" className="text-sm font-medium whitespace-nowrap">
          Stage:
        </Label>
        <Select value={currentStage} onValueChange={(value) => handleFilterChange("stage", value)}>
          <SelectTrigger id="stage-filter" className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STAGES.map((stage) => (
              <SelectItem key={stage.value} value={stage.value}>
                {stage.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="color-filter" className="text-sm font-medium whitespace-nowrap">
          Color:
        </Label>
        <Select
          value={currentColor}
          onValueChange={(value) => handleFilterChange("color", value)}
        >
          <SelectTrigger id="color-filter" className="w-[150px]">
            <SelectValue placeholder="All Colors" />
          </SelectTrigger>
          <SelectContent>
            {COLOR_OPTIONS.map((color) => (
              <SelectItem key={color.value} value={color.value}>
                {color.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="size-filter" className="text-sm font-medium whitespace-nowrap">
          Size:
        </Label>
        <Select
          value={currentSize}
          onValueChange={(value) => handleFilterChange("size", value)}
        >
          <SelectTrigger id="size-filter" className="w-[150px]">
            <SelectValue placeholder="All Sizes" />
          </SelectTrigger>
          <SelectContent>
            {SIZE_OPTIONS.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                {size.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}


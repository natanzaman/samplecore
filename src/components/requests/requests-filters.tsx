"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MultiSelect } from "@/components/ui/multi-select";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

const REQUEST_STATUSES = [
  { value: "REQUESTED", label: "Requested" },
  { value: "APPROVED", label: "Approved" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "HANDED_OFF", label: "Handed Off" },
  { value: "IN_USE", label: "In Use" },
  { value: "RETURNED", label: "Returned" },
  { value: "CLOSED", label: "Closed" },
] as const;

type Team = {
  id: string;
  name: string;
};

export function RequestsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get current filter values from URL
  const statusParam = searchParams.get("status");
  const teamParam = searchParams.get("teamId");
  const currentProductName = searchParams.get("productName") || "";
  const currentDateFrom = searchParams.get("dateFrom") || "";
  const currentDateTo = searchParams.get("dateTo") || "";

  // Parse status and team arrays from URL (comma-separated)
  const getSelectedStatuses = () => {
    if (!statusParam) return REQUEST_STATUSES.map((s) => s.value); // Default: all selected
    return statusParam.split(",").filter(Boolean);
  };

  const getSelectedTeams = () => {
    if (!teamParam) return []; // Will be set to all teams after teams load
    return teamParam.split(",").filter(Boolean);
  };

  // Local state for inputs
  const [productName, setProductName] = useState(currentProductName);
  const [dateFrom, setDateFrom] = useState(currentDateFrom);
  const [dateTo, setDateTo] = useState(currentDateTo);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(getSelectedStatuses());
  const [selectedTeams, setSelectedTeams] = useState<string[]>(getSelectedTeams());
  const [isCollapsed, setIsCollapsed] = useState(true);
  const isInternalUpdate = useRef(false);

  // Debounce product name search
  const debouncedProductName = useDebounce(productName, 500);

  // Load teams on mount
  useEffect(() => {
    fetch("/api/teams")
      .then((res) => res.json())
      .then((data) => {
        setTeams(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Sync selected values with URL params when URL changes (but not from our own updates)
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    const newStatuses = getSelectedStatuses();
    setSelectedStatuses(newStatuses);
  }, [statusParam]);

  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    if (teams.length > 0) {
      const newTeams = getSelectedTeams();
      // If no teams in URL and we have teams loaded, default to all
      if (!teamParam && newTeams.length === 0) {
        setSelectedTeams(teams.map((t) => t.id));
      } else {
        setSelectedTeams(newTeams);
      }
    }
  }, [teamParam, teams.length]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Reset page when filters change
    params.delete("page");

    // Handle status - only set if not all selected
    const allStatusesSelected = selectedStatuses.length === REQUEST_STATUSES.length;
    if (allStatusesSelected) {
      params.delete("status");
    } else if (selectedStatuses.length > 0) {
      params.set("status", selectedStatuses.join(","));
    } else {
      params.delete("status");
    }

    // Handle team - only set if not all selected
    const allTeamsSelected = teams.length > 0 && selectedTeams.length === teams.length;
    if (allTeamsSelected || selectedTeams.length === 0) {
      params.delete("teamId");
    } else if (selectedTeams.length > 0) {
      params.set("teamId", selectedTeams.join(","));
    }

    // Handle product name
    if (debouncedProductName.trim()) {
      params.set("productName", debouncedProductName.trim());
    } else {
      params.delete("productName");
    }

    // Handle date from
    if (dateFrom) {
      params.set("dateFrom", dateFrom);
    } else {
      params.delete("dateFrom");
    }

    // Handle date to
    if (dateTo) {
      params.set("dateTo", dateTo);
    } else {
      params.delete("dateTo");
    }

    // Only update URL if something actually changed
    const newParamsString = params.toString();
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.delete("page");
    const currentParamsString = currentParams.toString();
    
    if (newParamsString !== currentParamsString) {
      isInternalUpdate.current = true;
      router.replace(`/requests?${newParamsString}`);
    }
  }, [selectedStatuses, selectedTeams, debouncedProductName, dateFrom, dateTo, router, searchParams, teams.length]);


  const handleClearFilters = () => {
    setProductName("");
    setDateFrom("");
    setDateTo("");
    setSelectedStatuses(REQUEST_STATUSES.map((s) => s.value));
    // Teams will be reset when component re-renders after navigation
    router.push("/requests");
  };

  const allStatusesSelected = selectedStatuses.length === REQUEST_STATUSES.length;
  const allTeamsSelected = teams.length > 0 && selectedTeams.length === teams.length;
  
  const hasActiveFilters = 
    !allStatusesSelected ||
    !allTeamsSelected ||
    currentProductName !== "" ||
    currentDateFrom !== "" ||
    currentDateTo !== "";

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status-filter" className="text-sm">
                Status
              </Label>
              <MultiSelect
                options={REQUEST_STATUSES as unknown as { value: string; label: string }[]}
                selected={selectedStatuses}
                onChange={setSelectedStatuses}
                placeholder="Select statuses..."
              />
            </div>

            {/* Team Filter */}
            <div className="space-y-2">
              <Label htmlFor="team-filter" className="text-sm">
                Team
              </Label>
              <MultiSelect
                options={teams.map((team) => ({ value: team.id, label: team.name }))}
                selected={selectedTeams}
                onChange={setSelectedTeams}
                placeholder={loading ? "Loading..." : "Select teams..."}
                disabled={loading}
              />
            </div>

            {/* Product Name Search */}
            <div className="space-y-2">
              <Label htmlFor="product-name-filter" className="text-sm">
                Product Name
              </Label>
              <Input
                id="product-name-filter"
                type="text"
                placeholder="Search products..."
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>

            {/* Date From */}
            <div className="space-y-2">
              <Label htmlFor="date-from-filter" className="text-sm">
                Date From
              </Label>
              <Input
                id="date-from-filter"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <Label htmlFor="date-to-filter" className="text-sm">
                Date To
              </Label>
              <Input
                id="date-to-filter"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                min={dateFrom || undefined}
              />
            </div>
          </div>
        </div>
        )}
      </CardContent>
    </Card>
  );
}

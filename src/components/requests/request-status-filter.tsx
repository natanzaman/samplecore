"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const REQUEST_STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "REQUESTED", label: "Requested" },
  { value: "APPROVED", label: "Approved" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "HANDED_OFF", label: "Handed Off" },
  { value: "IN_USE", label: "In Use" },
  { value: "RETURNED", label: "Returned" },
  { value: "CLOSED", label: "Closed" },
] as const;

export function RequestStatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") || "all";

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === "all") {
      params.delete("status");
    } else {
      params.set("status", value);
    }

    router.push(`/requests?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="status-filter" className="text-sm font-medium">
        Filter by Status:
      </Label>
      <Select value={currentStatus} onValueChange={handleStatusChange}>
        <SelectTrigger id="status-filter" className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {REQUEST_STATUSES.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}


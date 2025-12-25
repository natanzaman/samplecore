"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateSampleItemDialog } from "./create-sample-item-dialog";

export function CreateSampleItemButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Inventory Item
      </Button>
      <CreateSampleItemDialog
        open={open}
        onOpenChange={setOpen}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </>
  );
}


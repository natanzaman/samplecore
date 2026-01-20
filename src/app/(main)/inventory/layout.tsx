import { UnifiedModal } from "@/components/inventory/unified-modal";

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <UnifiedModal />
    </>
  );
}


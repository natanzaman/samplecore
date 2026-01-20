"use client";

import { ToastProvider } from "@/components/ui/toast";
import { ModalProvider } from "@/contexts/modal-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ModalProvider>
      <ToastProvider>{children}</ToastProvider>
    </ModalProvider>
  );
}

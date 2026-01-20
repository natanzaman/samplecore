"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import type { SampleItemWithRelations, ProductionItemWithSamples, RequestWithRelations } from "@/lib/types";

type ModalType = "sample" | "product" | "request" | null;

type ModalState = {
  type: ModalType;
  sampleItem?: SampleItemWithRelations;
  productionItem?: ProductionItemWithSamples;
  request?: RequestWithRelations;
  viewMode?: "product" | "sample";
  history: Array<{
    type: ModalType;
    sampleItemId?: string;
    productionItemId?: string;
    requestId?: string;
    viewMode?: "product" | "sample";
  }>;
};

type ModalContextType = {
  isOpen: boolean;
  modalState: ModalState | null;
  openSampleModal: (sampleItem: SampleItemWithRelations, productionItem: ProductionItemWithSamples, viewMode?: "product" | "sample") => void;
  openProductModal: (productionItem: ProductionItemWithSamples) => void;
  openRequestModal: (request: RequestWithRelations) => void;
  closeModal: () => void;
  goBack: () => void;
  canGoBack: boolean;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalState, setModalState] = useState<ModalState | null>(null);
  const dataCache = useRef<Map<string, any>>(new Map());

  const openSampleModal = useCallback((
    sampleItem: SampleItemWithRelations,
    productionItem: ProductionItemWithSamples,
    viewMode: "product" | "sample" = "sample"
  ) => {
    const currentState = modalState ? {
      type: modalState.type,
      sampleItemId: modalState.sampleItem?.id,
      productionItemId: modalState.productionItem?.id,
      requestId: modalState.request?.id,
      viewMode: modalState.viewMode,
    } : null;

    setModalState({
      type: "sample",
      sampleItem,
      productionItem,
      viewMode,
      history: currentState ? [...(modalState?.history || []), currentState] : [],
    });
    setIsOpen(true);
    
    // Cache the data
    dataCache.current.set(`sample-${sampleItem.id}`, sampleItem);
    dataCache.current.set(`production-${productionItem.id}`, productionItem);
  }, [modalState]);

  const openProductModal = useCallback((productionItem: ProductionItemWithSamples) => {
    const currentState = modalState ? {
      type: modalState.type,
      sampleItemId: modalState.sampleItem?.id,
      productionItemId: modalState.productionItem?.id,
      requestId: modalState.request?.id,
      viewMode: modalState.viewMode,
    } : null;

    setModalState({
      type: "product",
      productionItem,
      history: currentState ? [...(modalState?.history || []), currentState] : [],
    });
    setIsOpen(true);
    
    // Cache the data
    dataCache.current.set(`production-${productionItem.id}`, productionItem);
  }, [modalState]);

  const openRequestModal = useCallback((request: RequestWithRelations) => {
    const currentState = modalState ? {
      type: modalState.type,
      sampleItemId: modalState.sampleItem?.id,
      productionItemId: modalState.productionItem?.id,
      requestId: modalState.request?.id,
      viewMode: modalState.viewMode,
    } : null;

    setModalState({
      type: "request",
      request,
      history: currentState ? [...(modalState?.history || []), currentState] : [],
    });
    setIsOpen(true);
    
    // Cache the data
    dataCache.current.set(`request-${request.id}`, request);
  }, [modalState]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setModalState(null);
  }, []);

  const goBack = useCallback(() => {
    if (!modalState || modalState.history.length === 0) {
      closeModal();
      return;
    }

    const previousState = modalState.history[modalState.history.length - 1];
    const newHistory = modalState.history.slice(0, -1);

    // Restore from cache or history
    if (previousState.type === "sample" && previousState.sampleItemId) {
      const cachedSample = dataCache.current.get(`sample-${previousState.sampleItemId}`);
      const cachedProduction = previousState.productionItemId 
        ? dataCache.current.get(`production-${previousState.productionItemId}`)
        : undefined;
      
      if (cachedSample && cachedProduction) {
        setModalState({
          type: "sample",
          sampleItem: cachedSample,
          productionItem: cachedProduction,
          viewMode: previousState.viewMode || "sample",
          history: newHistory,
        });
        return;
      }
    } else if (previousState.type === "product" && previousState.productionItemId) {
      const cachedProduction = dataCache.current.get(`production-${previousState.productionItemId}`);
      if (cachedProduction) {
        setModalState({
          type: "product",
          productionItem: cachedProduction,
          history: newHistory,
        });
        return;
      }
    } else if (previousState.type === "request" && previousState.requestId) {
      const cachedRequest = dataCache.current.get(`request-${previousState.requestId}`);
      if (cachedRequest) {
        setModalState({
          type: "request",
          request: cachedRequest,
          history: newHistory,
        });
        return;
      }
    }

    // If we can't restore from cache, just close
    closeModal();
  }, [modalState, closeModal]);

  const canGoBack = modalState ? modalState.history.length > 0 : false;

  return (
    <ModalContext.Provider
      value={{
        isOpen,
        modalState,
        openSampleModal,
        openProductModal,
        openRequestModal,
        closeModal,
        goBack,
        canGoBack,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}

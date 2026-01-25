"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useValidImages } from "@/hooks/use-valid-images";

type ImageGalleryProps = {
  images: Array<{
    url: string;
    alt: string;
  }>;
  className?: string;
};

export function ImageGallery({ images, className }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const defaultImage = {
    url: "/images/default-product.svg",
    alt: "Default product image",
  };

  // Filter out invalid images
  const imageUrls = images?.map(img => img.url) || [];
  const validImageUrls = useValidImages(imageUrls, defaultImage.url);
  
  // Map back to image objects with alt text, preserving original alt text where possible
  const validImages = validImageUrls.map(url => {
    const originalImage = images?.find(img => img.url === url);
    return {
      url,
      alt: originalImage?.alt || defaultImage.alt,
    };
  });

  // Use default image if no valid images
  const displayImages = validImages.length > 0 && validImages[0].url !== defaultImage.url 
    ? validImages 
    : [defaultImage];
  
  // Reset selected index if it's out of bounds
  useEffect(() => {
    if (selectedIndex >= displayImages.length) {
      setSelectedIndex(0);
    }
  }, [displayImages.length, selectedIndex]);

  const currentImage = displayImages[selectedIndex];
  const hasMultiple = displayImages.length > 1;

  const nextImage = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % displayImages.length);
    setZoom(1);
  }, [displayImages.length]);

  const prevImage = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    setZoom(1);
  }, [displayImages.length]);

  const handleImageClick = () => {
    setIsLightboxOpen(true);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
        setZoom(1);
      } else if (e.key === "ArrowLeft" && hasMultiple) {
        e.preventDefault();
        prevImage();
      } else if (e.key === "ArrowRight" && hasMultiple) {
        e.preventDefault();
        nextImage();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        setZoom((z) => Math.min(z + 0.25, 3));
      } else if (e.key === "-") {
        e.preventDefault();
        setZoom((z) => Math.max(z - 0.25, 0.5));
      } else if (e.key === "0") {
        e.preventDefault();
        setZoom(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, hasMultiple, nextImage, prevImage]);

  // Swipe gestures for mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !hasMultiple) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
  };

  return (
    <>
      <div className={cn("space-y-4", className)}>
        {/* Main Image */}
        <div className="relative group">
          <div 
            className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-gradient-to-br from-muted to-muted/50 border cursor-zoom-in"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onClick={handleImageClick}
          >
            {currentImage && (
              <Image
                src={currentImage.url}
                alt={currentImage.alt}
                fill
                className="object-contain transition-transform duration-300 hover:scale-105 pointer-events-none"
                priority
              />
            )}
            {/* Overlay gradient - pointer-events-none so it doesn't block clicks */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            {/* Navigation arrows - always visible if multiple images, more prominent on hover */}
            {hasMultiple && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 opacity-70 group-hover:opacity-100 transition-all bg-background/90 hover:bg-background shadow-lg hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-70 group-hover:opacity-100 transition-all bg-background/90 hover:bg-background shadow-lg hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
            
            {/* Image counter - always visible if multiple */}
            {hasMultiple && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/90 px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
                {selectedIndex + 1} / {displayImages.length}
              </div>
            )}
            
            {/* Click to view fullscreen hint */}
            <div className="absolute top-2 right-2 bg-background/90 px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Click to expand
            </div>
          </div>
        </div>

        {/* Thumbnail Strip */}
        {hasMultiple && displayImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {displayImages.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedIndex(index);
                  setZoom(1);
                }}
                className={cn(
                  "relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all",
                  index === selectedIndex
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover:border-muted-foreground/50"
                )}
              >
                <Image
                  src={image.url}
                  alt={`${image.alt} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
          onClick={() => {
            setIsLightboxOpen(false);
            setZoom(1);
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-background/80 hover:bg-background"
              onClick={() => {
                setIsLightboxOpen(false);
                setZoom(1);
              }}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Main image in lightbox */}
            {currentImage && (
              <div
                className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <div className="relative w-full h-full transition-transform duration-200">
                  <Image
                    src={currentImage.url}
                    alt={currentImage.alt}
                    fill
                    className="object-contain"
                    style={{ transform: `scale(${zoom})` }}
                  />
                </div>

                {/* Zoom controls */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-background/90 rounded-lg p-2 shadow-lg border">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
                    disabled={zoom >= 3}
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium px-3 flex items-center min-w-[60px] justify-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                    disabled={zoom <= 0.5}
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setZoom(1)}
                    className="ml-2"
                    aria-label="Reset zoom"
                  >
                    <span className="text-xs">Reset</span>
                  </Button>
                </div>
                
                {/* Keyboard hints */}
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-background/80 px-3 py-1.5 rounded text-xs text-muted-foreground opacity-0 hover:opacity-100 transition-opacity">
                  Use ← → arrows to navigate, +/- to zoom, ESC to close
                </div>
              </div>
            )}

            {/* Navigation in lightbox */}
            {hasMultiple && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background h-12 w-12"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background h-12 w-12"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Image counter in lightbox */}
            {hasMultiple && (
              <div className="absolute bottom-4 right-4 bg-background/80 px-4 py-2 rounded-lg text-sm font-medium">
                {selectedIndex + 1} / {displayImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

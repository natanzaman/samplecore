"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Hook to filter out images that fail to load
 * Returns only images that successfully load, or default image if all fail
 */
export function useValidImages(
  imageUrls: string[],
  defaultImage: string = "/images/default-product.svg"
): string[] {
  const [validImages, setValidImages] = useState<string[]>([]);
  const failedImagesRef = useRef<Set<string>>(new Set());
  const checkedImagesRef = useRef<Set<string>>(new Set());
  const imageUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    // Reset when imageUrls change
    const urlsChanged = JSON.stringify(imageUrlsRef.current) !== JSON.stringify(imageUrls);
    
    if (urlsChanged) {
      imageUrlsRef.current = imageUrls;
      failedImagesRef.current = new Set();
      checkedImagesRef.current = new Set();

      if (!imageUrls || imageUrls.length === 0) {
        setValidImages([defaultImage]);
        return;
      }

      // Check each image
      imageUrls.forEach((url) => {
        const img = new window.Image();
        img.onload = () => {
          checkedImagesRef.current.add(url);
          failedImagesRef.current.delete(url);
          
          // Update valid images when all checks complete
          if (checkedImagesRef.current.size === imageUrls.length) {
            const valid = imageUrls.filter((url) => !failedImagesRef.current.has(url));
            setValidImages(valid.length === 0 ? [defaultImage] : valid);
          } else {
            // Partially checked - show valid ones so far
            const valid = imageUrls.filter((url) => 
              checkedImagesRef.current.has(url) && !failedImagesRef.current.has(url)
            );
            if (valid.length > 0) {
              setValidImages(valid);
            }
          }
        };
        img.onerror = () => {
          checkedImagesRef.current.add(url);
          failedImagesRef.current.add(url);
          
          // Update valid images when all checks complete
          if (checkedImagesRef.current.size === imageUrls.length) {
            const valid = imageUrls.filter((url) => !failedImagesRef.current.has(url));
            setValidImages(valid.length === 0 ? [defaultImage] : valid);
          }
        };
        img.src = url;
      });
    }
  }, [imageUrls, defaultImage]);

  // Return valid images or default
  if (validImages.length > 0) {
    return validImages;
  }

  // While checking or if no images, return default or original
  if (imageUrls.length > 0) {
    return imageUrls; // Still checking, will update once validation completes
  }

  return [defaultImage];
}

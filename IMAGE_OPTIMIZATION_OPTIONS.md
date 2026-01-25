# Image Validation Optimization Options

## Current Implementation Issues

**Current Hook (`useValidImages`):**
- Creates `Image` objects for EVERY image URL on component mount
- Makes network requests to validate images before displaying
- Causes multiple re-renders as each image validates
- No caching - re-validates on every component mount
- JSON.stringify comparison on every render (expensive)

**Performance Impact:**
- If you have 20 products × 8 images each = 160 image validations on page load
- Each validation = 1 network request
- Multiple state updates = multiple re-renders
- Slower initial page load, especially on slower connections

---

## Cloud Storage Considerations

**Important:** If you're storing images in cloud storage (e.g., AWS S3, Cloudinary, Google Cloud Storage), the validation approach changes:

- **Local files:** Use file system checks (`existsSync`) - very fast, no network overhead
- **Cloud storage:** Use HTTP HEAD requests - validates existence without downloading the image
- **Hybrid:** Can support both - check if URL is local or remote, use appropriate method

All optimization options below still apply, but the implementation details differ:
- **Option 1:** Replace file system checks with HTTP HEAD requests for cloud URLs
- **Option 2:** Works the same - client-side caching is independent of storage location
- **Option 3:** Works the same - lazy loading works with any URL
- **Option 4:** Works the same - hybrid approach benefits from both server and client caching

**Cloud Storage Benefits:**
- ✅ Better scalability - no local storage limits
- ✅ CDN integration - faster global delivery
- ✅ Automatic backups and redundancy
- ✅ Cost-effective for large image libraries

**Cloud Storage Considerations:**
- ⚠️ HTTP validation adds latency (HEAD requests take ~50-200ms each)
- ⚠️ Need to handle rate limits and timeouts
- ⚠️ Should cache validation results to avoid repeated HEAD requests
- ⚠️ Consider using cloud provider SDKs for more efficient checks (e.g., S3 `headObject`)

---

## Option 1: Server-Side Validation (RECOMMENDED)

### How It Works
Validate image existence on the server before sending data to the client. Only send valid image URLs.

### When Does It Run?

**Option 1 can run in TWO places:**

1. **During Seeding (One-time setup):**
   - When you run `npm run db:seed`
   - Validates images before storing URLs in database
   - Database only contains valid image URLs
   - **Benefit:** Clean data from the start
   - **Note:** We will NOT implement this - we want to test broken links/images

2. **During Page Load (Every request):**
   - When `InventoryService.getProductionItemsWithSamples()` is called
   - Validates images when fetching from database
   - Filters out any invalid URLs before sending to client
   - **Benefit:** Safety check if files are deleted after seeding
   - **This is what we'll implement**

**Our Implementation Strategy:**
- ❌ **Skip validation during seeding** - allows testing broken links/images
- ✅ **Validate during service calls** - filters invalid images on every page load

### Implementation Approach

**A. During Seeding (Seed File):**
```typescript
// prisma/seed.ts
// NOTE: We will NOT validate here - we want to test broken links/images
// Store all URLs as-is, even if files don't exist

const productionItems = await Promise.all([
  prisma.productionItem.create({
    data: {
      name: "Leather Jacket Classic",
      imageUrls: [
        "/images/leather-jacket-classic-front-1.svg",
        "/images/leather-jacket-classic-back-2.svg",
        // ... store all URLs, even if files don't exist
      ],
    },
  }),
]);
```

**B. During Service Calls (Every Page Load) - THIS IS WHAT WE'LL IMPLEMENT:**
```typescript
// services/inventory.ts
import { validateImageUrls } from '@/lib/image-validation';

static async getProductionItemsWithSamples(filters?: {...}) {
  const items = await db.productionItem.findMany({...});
  
  // Validate images for each item
  const itemsWithValidImages = await Promise.all(
    items.map(async (item) => ({
      ...item,
      imageUrls: await validateImageUrls(item.imageUrls)
    }))
  );
  
  return { items: itemsWithValidImages, ... };
}
```

**C. API Route Approach (Alternative):**
```typescript
// app/api/inventory/validate-images/route.ts
export async function POST(request: Request) {
  const { imageUrls } = await request.json();
  const validUrls = await Promise.all(
    imageUrls.map(async (url: string) => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}${url}`, {
          method: 'HEAD' // Only check if file exists, don't download
        });
        return response.ok ? url : null;
      } catch {
        return null;
      }
    })
  );
  return Response.json({ validUrls: validUrls.filter(Boolean) });
}
```

**B. Local File System Check (for local images):**
```typescript
// lib/image-validation.ts
import { existsSync } from 'fs';
import { join } from 'path';

export async function validateImageUrls(imageUrls: string[]): Promise<string[]> {
  const publicDir = join(process.cwd(), 'public');
  return imageUrls.filter(url => {
    // Only check local files (relative paths)
    if (!url.startsWith('/') && !url.startsWith('./')) {
      return true; // Assume cloud URLs are valid, or validate separately
    }
    const filePath = join(publicDir, url);
    return existsSync(filePath);
  });
}
```

**B. Cloud Storage Check (for S3/cloud images):**
```typescript
// lib/image-validation.ts
export async function validateImageUrls(imageUrls: string[]): Promise<string[]> {
  const validationCache = new Map<string, boolean>();
  
  const results = await Promise.all(
    imageUrls.map(async (url) => {
      // Check cache first
      if (validationCache.has(url)) {
        return validationCache.get(url) ? url : null;
      }
      
      // Check if local or cloud URL
      const isCloudUrl = url.startsWith('http://') || url.startsWith('https://');
      
      if (isCloudUrl) {
        // Use HTTP HEAD request for cloud storage
        try {
          const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(2000) });
          const isValid = response.ok;
          validationCache.set(url, isValid);
          return isValid ? url : null;
        } catch (error) {
          validationCache.set(url, false);
          return null;
        }
      } else {
        // Local file check (existing logic)
        const filePath = join(process.cwd(), 'public', url);
        const isValid = existsSync(filePath);
        validationCache.set(url, isValid);
        return isValid ? url : null;
      }
    })
  );
  
  return results.filter((url): url is string => url !== null);
}
```

**Alternative: Using AWS S3 SDK (more efficient):**
```typescript
// lib/image-validation.ts (S3-specific)
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({ region: 'us-east-1' });

export async function validateImageUrls(imageUrls: string[]): Promise<string[]> {
  const results = await Promise.all(
    imageUrls.map(async (url) => {
      try {
        // Parse S3 URL to bucket and key
        const urlObj = new URL(url);
        const bucket = urlObj.hostname.split('.')[0];
        const key = urlObj.pathname.slice(1);
        
        await s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
        return url; // Image exists
      } catch (error) {
        return null; // Image doesn't exist or error
      }
    })
  );
  
  return results.filter((url): url is string => url !== null);
}
```

**C. Pre-compute at Seed Time:**
~~Validate images when seeding database, store only valid URLs.~~ **We will NOT do this - we want to test broken links/images.**

### Pros
✅ **Zero client-side overhead** - validation happens once on server
✅ **Faster page loads** - client only receives valid URLs
✅ **Better SEO** - search engines see valid images
✅ **Scalable** - can cache validation results
✅ **No network overhead** - uses file system checks (fast for local files)
✅ **Works with cloud storage** - HTTP HEAD requests or cloud SDKs validate remote images

### Cons
❌ Requires server-side code changes
❌ Need to handle file system access (if using local FS checks)
❌ **Cloud storage adds latency** - HTTP HEAD requests take ~50-200ms each (mitigated by caching)
❌ More complex initial setup
❌ Need to handle timeouts and rate limits for cloud storage

### Performance Gain
- **Before:** 160 network requests on page load
- **After:** 0 client-side requests, server-side validation (cached)
- **Speed improvement:** ~90-95% faster

**Cloud Storage Note:**
- HTTP HEAD requests add ~50-200ms per image (first check)
- **Critical:** Implement caching to avoid repeated HEAD requests
- With caching: First page load validates, subsequent loads use cache (near-instant)
- Consider using cloud provider SDKs (e.g., S3 `headObject`) for faster validation than HTTP HEAD

---

## Option 2: Client-Side Caching with IndexedDB

### How It Works
Cache validation results in browser's IndexedDB. Check cache first, only validate new/missing images.

### Implementation Approach
```typescript
// hooks/use-valid-images-cached.ts
import { useState, useEffect } from 'react';
import { openDB, DBSchema } from 'idb';

interface ImageCacheDB extends DBSchema {
  'image-validation': {
    key: string; // image URL
    value: { isValid: boolean; timestamp: number };
  };
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function useValidImagesCached(imageUrls: string[], defaultImage: string) {
  const [validImages, setValidImages] = useState<string[]>([]);
  const [db, setDb] = useState<IDBPDatabase<ImageCacheDB> | null>(null);

  useEffect(() => {
    // Initialize IndexedDB
    openDB<ImageCacheDB>('image-cache', 1, {
      upgrade(db) {
        db.createObjectStore('image-validation');
      }
    }).then(setDb);
  }, []);

  useEffect(() => {
    if (!db || !imageUrls.length) return;

    const validateImages = async () => {
      const results = await Promise.all(
        imageUrls.map(async (url) => {
          // Check cache first
          const cached = await db.get('image-validation', url);
          if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.isValid ? url : null;
          }

          // Validate if not cached
          return new Promise<string | null>((resolve) => {
            const img = new Image();
            img.onload = () => {
              db.put('image-validation', { isValid: true, timestamp: Date.now() }, url);
              resolve(url);
            };
            img.onerror = () => {
              db.put('image-validation', { isValid: false, timestamp: Date.now() }, url);
              resolve(null);
            };
            img.src = url;
          });
        })
      );

      const valid = results.filter(Boolean) as string[];
      setValidImages(valid.length ? valid : [defaultImage]);
    };

    validateImages();
  }, [db, imageUrls, defaultImage]);

  return validImages.length ? validImages : [defaultImage];
}
```

### Pros
✅ **Reuses validation** - same images validated once per browser
✅ **Faster subsequent loads** - cache hits are instant
✅ **Works offline** - uses cached results
✅ **No server changes needed**

### Cons
❌ Still validates on first visit
❌ Requires IndexedDB library (idb)
❌ Cache can become stale
❌ More complex code

### Performance Gain
- **First visit:** Same as current (160 requests)
- **Subsequent visits:** ~0-5 requests (only new images)
- **Speed improvement:** 95%+ faster on repeat visits

---

## Option 3: Lazy Validation (On-Demand)

### How It Works
Only validate images when they're about to be displayed. Use Image component's `onError` handler.

### Implementation Approach
```typescript
// components/inventory/inventory-card.tsx
export function InventoryCard({ productionItem }: InventoryCardProps) {
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const imageUrls = productionItem.imageUrls || [];
  const validImages = imageUrls.filter(url => !failedImages.has(url));
  const displayImage = validImages[currentImageIndex] || defaultImage;

  const handleImageError = () => {
    setFailedImages(prev => new Set(prev).add(displayImage));
    // Try next image
    if (currentImageIndex < validImages.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  return (
    <Image
      src={displayImage}
      onError={handleImageError}
      // ... other props
    />
  );
}
```

### Pros
✅ **Simplest implementation** - uses built-in Image error handling
✅ **No pre-validation** - only checks when displaying
✅ **No extra libraries** - pure React
✅ **Progressive enhancement** - works as images load

### Cons
❌ Shows broken image briefly before switching
❌ Still makes failed network requests
❌ Less precise - relies on browser error handling

### Performance Gain
- **Network requests:** Same number, but only for visible images
- **Initial load:** Faster (no pre-validation)
- **Speed improvement:** ~50% faster initial load

---

## Option 4: Hybrid Approach (BEST FOR SCALE)

### How It Works
Combine server-side validation + client-side caching + lazy loading.

### Implementation Strategy

1. **Server validates on data fetch:**
```typescript
// app/api/inventory/production-items/route.ts
export async function GET() {
  const items = await db.productionItem.findMany();
  
  // Validate images server-side
  const itemsWithValidImages = await Promise.all(
    items.map(async (item) => ({
      ...item,
      imageUrls: await validateImageUrls(item.imageUrls)
    }))
  );
  
  return Response.json(itemsWithValidImages);
}
```

2. **Client caches results:**
```typescript
// lib/image-cache.ts
import { openDB, DBSchema } from 'idb';

interface ImageCacheDB extends DBSchema {
  'validated-images': {
    key: string; // production item ID
    value: {
      imageUrls: string[];
      timestamp: number;
    };
  };
}

const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function getCachedValidImages(itemId: string): Promise<string[] | null> {
  try {
    const db = await openDB<ImageCacheDB>('image-cache', 1, {
      upgrade(db) {
        db.createObjectStore('validated-images');
      }
    });

    const cached = await db.get('validated-images', itemId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.imageUrls;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setCachedValidImages(itemId: string, imageUrls: string[]): Promise<void> {
  try {
    const db = await openDB<ImageCacheDB>('image-cache', 1, {
      upgrade(db) {
        db.createObjectStore('validated-images');
      }
    });

    await db.put('validated-images', {
      imageUrls,
      timestamp: Date.now(),
    }, itemId);
  } catch (error) {
    console.error('Failed to cache images:', error);
  }
}

// Usage in component:
// hooks/use-cached-production-item.ts
export function useCachedProductionItem(itemId: string, serverValidatedImages: string[]) {
  const [cachedImages, setCachedImages] = useState<string[] | null>(null);

  useEffect(() => {
    // Check cache first
    getCachedValidImages(itemId).then(cached => {
      if (cached) {
        setCachedImages(cached);
      } else {
        // Use server-validated images and cache them
        setCachedImages(serverValidatedImages);
        setCachedValidImages(itemId, serverValidatedImages);
      }
    });
  }, [itemId, serverValidatedImages]);

  return cachedImages || serverValidatedImages;
}
```

3. **Lazy load images:**
```typescript
// hooks/use-lazy-image.ts
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export function useLazyImage(src: string, defaultImage: string) {
  const [imageSrc, setImageSrc] = useState<string>(defaultImage);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01,
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isInView && src) {
      // Preload image
      const img = new window.Image();
      img.onload = () => setImageSrc(src);
      img.onerror = () => setImageSrc(defaultImage);
      img.src = src;
    }
  }, [isInView, src, defaultImage]);

  return { imageSrc, imgRef };
}

// Usage in component:
// components/inventory/inventory-card.tsx
export function InventoryCard({ productionItem }: InventoryCardProps) {
  const validImages = useCachedProductionItem(
    productionItem.id,
    productionItem.imageUrls // Already validated server-side
  );
  const { imageSrc, imgRef } = useLazyImage(
    validImages[0] || '',
    '/images/default-product.svg'
  );

  return (
    <Card>
      <div ref={imgRef} className="relative w-full h-64">
        <Image
          src={imageSrc}
          alt={productionItem.name}
          fill
          className="object-contain"
          loading="lazy" // Additional browser-level lazy loading
        />
      </div>
      {/* ... rest of card */}
    </Card>
  );
}
```

### Pros
✅ **Best of all worlds** - fast, cached, scalable
✅ **Optimal performance** - minimal network requests
✅ **Great UX** - no broken images, fast loads
✅ **Progressive loading** - images load as user scrolls

### Cons
❌ Most complex to implement
❌ Requires multiple systems working together
❌ Requires IndexedDB library (idb)
❌ More code to maintain

### Performance Gain
- **First visit:** 1 API call (server validates all), images load as needed
- **Subsequent visits:** 0 validation requests (cached), instant image display
- **Speed improvement:** ~98% faster overall

---

## Recommendation for Your Use Case

**Given you'll have many images per product:**

1. **Short-term (Quick Win):** Use **Option 3 (Lazy Validation)** - easiest to implement, immediate improvement
2. **Medium-term:** Implement **Option 1 (Server-Side)** - best performance, clean architecture
3. **Long-term:** Build **Option 4 (Hybrid)** - optimal for scale

**My recommendation:** Start with **Option 1 (Server-Side)** because:
- You're using Next.js (server-side is natural)
- You control the image files (can validate easily)
- Best performance for many images
- Clean separation of concerns
- **Works with cloud storage** - use HTTP HEAD requests or cloud SDKs (e.g., S3 `headObject`) to validate remote images efficiently

**Implementation Decision:**
- ✅ **Validate during service calls** (every page load) - filters invalid images before sending to client
- ❌ **Skip validation during seeding** - allows testing broken links/images in the database

This approach lets you:
- Test error handling with broken image URLs in the database
- Still get performance benefits (validation happens server-side)
- See how the UI handles missing images gracefully

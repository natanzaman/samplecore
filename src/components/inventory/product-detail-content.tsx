"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, MessageSquare, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateSampleItemDialog } from "./create-sample-item-dialog";
import { CommentThread } from "@/components/comments/comment-thread";
import { CommentForm } from "@/components/comments/comment-form";
import { ImageGallery } from "./image-gallery";
import type { ProductionItemWithSamples } from "@/lib/types";

type ProductDetailContentProps = {
  productionItem: ProductionItemWithSamples;
  isModal?: boolean;
  onClose?: () => void;
};

export function ProductDetailContent({
  productionItem,
  isModal = false,
  onClose,
}: ProductDetailContentProps) {
  const router = useRouter();
  const [showCreateSampleItem, setShowCreateSampleItem] = useState(false);
  const [commentsExpanded, setCommentsExpanded] = useState(true);

  const handleSampleCreated = () => {
    setShowCreateSampleItem(false);
    router.refresh();
  };

  // Collect all images for the gallery
  const images = [];
  // Add production item images
  if (productionItem.imageUrls && productionItem.imageUrls.length > 0) {
    productionItem.imageUrls.forEach((url, index) => {
      images.push({
        url,
        alt: `${productionItem.name} - View ${index + 1}`,
      });
    });
  }
  // Add sample-specific images if available
  productionItem.sampleItems?.forEach((sample) => {
    if (sample.imageUrls && sample.imageUrls.length > 0) {
      sample.imageUrls.forEach((url, index) => {
        if (!images.find((img) => img.url === url)) {
          images.push({
            url,
            alt: `${productionItem.name} - ${sample.stage} ${sample.color || ""} ${sample.size || ""} - View ${index + 1}`.trim(),
          });
        }
      });
    }
  });

  return (
    <div className="space-y-6">
      {/* Image Gallery */}
      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Images
            </CardTitle>
            <CardDescription>
              {images.length} {images.length === 1 ? "image" : "images"} available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageGallery images={images} />
          </CardContent>
        </Card>
      )}

      {/* No Samples Warning */}
      <Card className="border-dashed border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-amber-800 dark:text-amber-200">No Sample Variations</CardTitle>
          </div>
          <CardDescription>
            This product doesn&apos;t have any sample variations yet. Create a sample to start tracking inventory and requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Sample variations allow you to track different production stages, colors, sizes, and revisions of this product.
              </p>
            </div>
            <Button onClick={() => setShowCreateSampleItem(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Sample
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filter Section - Show as disabled with message */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Sample Variations</CardTitle>
          <CardDescription>
            Select stage, color, and size to view different sample variations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6 border rounded-md bg-muted/30 border-dashed">
            <div className="text-center space-y-2">
              <Package className="h-8 w-8 mx-auto text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No samples available — create a sample to enable filtering
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Details
            </CardTitle>
            <Badge variant="secondary">Product View</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium">Created:</span>
              <p className="text-sm text-muted-foreground">
                {new Date(productionItem.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium">Last Updated:</span>
              <p className="text-sm text-muted-foreground">
                {new Date(productionItem.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              disabled
              className="opacity-50"
            >
              View Sample
            </Button>
            <Badge variant="secondary" className="self-center">
              No samples to view
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Product Comments */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => setCommentsExpanded(!commentsExpanded)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Product Comments ({productionItem.comments.length})
            </CardTitle>
            <Button variant="ghost" size="icon">
              {commentsExpanded ? "−" : "+"}
            </Button>
          </div>
        </CardHeader>
        {commentsExpanded && (
          <CardContent>
            {productionItem.comments.length > 0 ? (
              <div className="space-y-4">
                {productionItem.comments.map((comment) => (
                  <div key={comment.id} className="border-b pb-4 last:border-0">
                    <CommentThread
                      comment={comment as any}
                      onCommentAdded={() => router.refresh()}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No product comments yet</p>
            )}
            <div className="mt-4">
              <CommentForm
                productionItemId={productionItem.id}
                onCommentAdded={() => router.refresh()}
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Create Sample Dialog */}
      <CreateSampleItemDialog
        open={showCreateSampleItem}
        onOpenChange={setShowCreateSampleItem}
        onSuccess={handleSampleCreated}
        initialValues={{ productionItemId: productionItem.id }}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CommentForm } from "@/components/comments/comment-form";
import { CommentThread } from "@/components/comments/comment-thread";
import { formatDate } from "@/lib/utils";
import { MessageSquare, Package, FileText, Edit2, Save, X, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import type { Prisma } from "@prisma/client";

type RequestWithRelations = Prisma.SampleRequestGetPayload<{
  include: {
    sampleItem: {
      include: {
        productionItem: true;
        inventory: true;
      };
    };
    team: true;
    comments: true;
  };
}>;

export function RequestDetailContent({
  request: initialRequest,
  onViewFullPage,
}: {
  request: RequestWithRelations;
  onViewFullPage?: () => void;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [request, setRequest] = useState(initialRequest);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(true);
  const [commentCollapsed, setCommentCollapsed] = useState<Map<string, boolean>>(new Map());
  const [formData, setFormData] = useState({
    status: request.status,
    quantity: request.quantity,
    shippingMethod: request.shippingMethod || "",
    notes: request.notes || "",
  });

  // Handler for toggling comment collapse state
  const handleCommentToggle = (commentId: string) => {
    setCommentCollapsed((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(commentId) ?? true;
      newMap.set(commentId, !current);
      return newMap;
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      // Prepare payload - only include fields that have changed or are being set
      const payload: any = {};
      if (formData.status !== request.status) {
        payload.status = formData.status;
      }
      if (formData.quantity !== request.quantity) {
        payload.quantity = formData.quantity;
      }
      if (formData.shippingMethod !== (request.shippingMethod || "")) {
        payload.shippingMethod = formData.shippingMethod || undefined;
      }
      if (formData.notes !== (request.notes || "")) {
        payload.notes = formData.notes || undefined;
      }

      const response = await fetch(`/api/requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || "Failed to update request");
      }

      const updated = await response.json();
      setRequest(updated);
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      console.error("Error saving request:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      status: request.status,
      quantity: request.quantity,
      shippingMethod: request.shippingMethod || "",
      notes: request.notes || "",
    });
    setIsEditing(false);
    setError(null);
  };

  const statusOptions = [
    "REQUESTED",
    "APPROVED",
    "SHIPPED",
    "HANDED_OFF",
    "IN_USE",
    "RETURNED",
    "CLOSED",
  ];

  return (
    <div className="space-y-6">
      {/* Request Info Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-lg px-3 py-1">
              {request.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Requested: {formatDate(request.requestedAt)}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              {request.sampleItem.productionItem.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              Team: {request.team.name} • Quantity: {request.quantity}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {onViewFullPage && (
            <Button variant="outline" onClick={onViewFullPage}>
              View Full Page
            </Button>
          )}
          {!isEditing ? (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={loading}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Saving..." : "Save"}
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive p-3 text-sm">
          {error}
        </div>
      )}

      {/* Request Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Request Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: parseInt(e.target.value) || 1,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="shippingMethod">Shipping Method</Label>
                <Input
                  id="shippingMethod"
                  value={formData.shippingMethod}
                  onChange={(e) =>
                    setFormData({ ...formData, shippingMethod: e.target.value })
                  }
                  placeholder="e.g., Internal Hand-off, FedEx Overnight"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Additional information..."
                  rows={4}
                />
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge>{request.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Quantity:</span>
                <span className="text-sm">{request.quantity}</span>
              </div>
              {request.shippingMethod && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Shipping Method:</span>
                  <span className="text-sm">{request.shippingMethod}</span>
                </div>
              )}
              {request.notes && (
                <div>
                  <span className="text-sm font-medium">Notes:</span>
                  <p className="text-sm text-muted-foreground mt-1">
                    {request.notes}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                {request.approvedAt && (
                  <div>
                    <span className="text-xs text-muted-foreground">Approved:</span>
                    <p className="text-sm">{formatDate(request.approvedAt)}</p>
                  </div>
                )}
                {request.shippedAt && (
                  <div>
                    <span className="text-xs text-muted-foreground">Shipped:</span>
                    <p className="text-sm">{formatDate(request.shippedAt)}</p>
                  </div>
                )}
                {request.handedOffAt && (
                  <div>
                    <span className="text-xs text-muted-foreground">Handed Off:</span>
                    <p className="text-sm">{formatDate(request.handedOffAt)}</p>
                  </div>
                )}
                {request.returnedAt && (
                  <div>
                    <span className="text-xs text-muted-foreground">Returned:</span>
                    <p className="text-sm">{formatDate(request.returnedAt)}</p>
                  </div>
                )}
                {request.closedAt && (
                  <div>
                    <span className="text-xs text-muted-foreground">Closed:</span>
                    <p className="text-sm">{formatDate(request.closedAt)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sample Item Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Sample Item
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium">
                {request.sampleItem.productionItem.name}
              </span>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline">{request.sampleItem.stage}</Badge>
              {request.sampleItem.color && (
                <Badge variant="secondary">{request.sampleItem.color}</Badge>
              )}
              {request.sampleItem.size && (
                <Badge variant="secondary">{request.sampleItem.size}</Badge>
              )}
            </div>
            <Link
              href={`/inventory/sample/${request.sampleItem.id}`}
              className="text-sm text-primary hover:underline"
            >
              View sample details →
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comments ({request.comments.length})
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCommentsOpen(!isCommentsOpen)}
              className="h-8 w-8 p-0"
            >
              {isCommentsOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        {isCommentsOpen && (
          <CardContent className="space-y-4">
            {request.comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments yet</p>
            ) : (
              <div className="space-y-4">
                {request.comments.map((comment) => (
                  <div key={comment.id} className="border-b pb-4 last:border-0">
                    <CommentThread
                      comment={comment as any}
                      onCommentAdded={() => {
                        // Fetch updated request data to get new comments
                        fetch(`/api/requests/${request.id}`)
                          .then((res) => res.json())
                          .then((data) => {
                            setRequest(data);
                            router.refresh();
                          });
                      }}
                      collapsedState={commentCollapsed}
                      onToggleCollapse={handleCommentToggle}
                    />
                  </div>
                ))}
              </div>
            )}
            {showCommentForm ? (
              <CommentForm
                requestId={request.id}
                onSuccess={() => {
                  setShowCommentForm(false);
                  // Fetch updated request data to get new comments
                  fetch(`/api/requests/${request.id}`)
                    .then((res) => res.json())
                    .then((data) => {
                      setRequest(data);
                      router.refresh();
                    });
                }}
                onCancel={() => setShowCommentForm(false)}
              />
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCommentForm(true)}
              >
                Add Comment
              </Button>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}


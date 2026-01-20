"use client";

import { useState, useOptimistic, useTransition } from "react";
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
import { useToast } from "@/components/ui/toast";
import { updateRequestStatus, updateRequest } from "@/actions/requests";
import { formatDate } from "@/lib/utils";
import { MessageSquare, Package, FileText, Edit2, Save, X, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import Link from "next/link";
import type { RequestStatus } from "@prisma/client";
import type { RequestWithRelations } from "@/lib/types";
import { STATUS_OPTIONS } from "@/lib/status-utils";

export function RequestDetailContent({
  request: initialRequest,
}: {
  request: RequestWithRelations;
}) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
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

  // Optimistic status state
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(
    request.status,
    (_, newStatus: RequestStatus) => newStatus
  );

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
      // Prepare payload - only include fields that have changed
      const payload: {
        status?: RequestStatus;
        quantity?: number;
        shippingMethod?: string | null;
        notes?: string | null;
      } = {};
      
      if (formData.status !== request.status) {
        payload.status = formData.status as RequestStatus;
      }
      if (formData.quantity !== request.quantity) {
        payload.quantity = formData.quantity;
      }
      if (formData.shippingMethod !== (request.shippingMethod || "")) {
        payload.shippingMethod = formData.shippingMethod || null;
      }
      if (formData.notes !== (request.notes || "")) {
        payload.notes = formData.notes || null;
      }

      const result = await updateRequest(request.id, payload);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      setRequest(result.data as RequestWithRelations);
      setIsEditing(false);
      toast.success("Request updated successfully");
    } catch (err) {
      console.error("Error saving request:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error(err instanceof Error ? err.message : "Failed to update request");
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

  // Optimistic status change handler
  const handleStatusChange = (newStatus: string) => {
    if (newStatus === optimisticStatus) return;
    
    const previousStatus = request.status;
    setError(null);

    startTransition(async () => {
      // Optimistically update the UI immediately
      setOptimisticStatus(newStatus as RequestStatus);

      const result = await updateRequestStatus(request.id, newStatus as RequestStatus);
      
      if (!result.success) {
        // Revert on failure
        setOptimisticStatus(previousStatus);
        setError(result.error || "Failed to update status");
        toast.error(result.error || "Failed to update status");
      } else {
        // Update local state with server response
        setRequest(result.data as RequestWithRelations);
        setFormData((prev) => ({ ...prev, status: newStatus }));
        toast.success(`Status updated to ${newStatus.replace(/_/g, " ")}`);
      }
    });
  };

  const statusOptions = STATUS_OPTIONS;

  return (
    <div className="space-y-6">
      {/* Request Info Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Select
              value={optimisticStatus}
              onValueChange={handleStatusChange}
              disabled={isPending}
            >
              <SelectTrigger className="w-[180px]">
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  <SelectValue />
                )}
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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


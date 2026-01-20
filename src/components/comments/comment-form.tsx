"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createComment } from "@/actions/comments";
import { toast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";

type CommentFormProps = {
  productionItemId?: string;
  sampleItemId?: string;
  requestId?: string;
  parentCommentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function CommentForm({
  productionItemId,
  sampleItemId,
  requestId,
  parentCommentId,
  onSuccess,
  onCancel,
}: CommentFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createComment({
        productionItemId,
        sampleItemId,
        requestId,
        parentCommentId,
        content: content.trim(),
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to create comment");
      }

      toast.success("Comment posted");
      setContent("");
      router.refresh();
      onSuccess?.();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create comment";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setError(null);
          }}
          placeholder="Add a comment..."
          rows={3}
          disabled={isSubmitting}
          className="resize-none"
        />
        {error && (
          <p className="text-sm text-destructive mt-1">{error}</p>
        )}
      </div>
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || !content.trim()}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting...
            </>
          ) : (
            "Post Comment"
          )}
        </Button>
      </div>
    </form>
  );
}


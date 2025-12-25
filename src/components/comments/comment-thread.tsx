"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CommentForm } from "./comment-form";
import { formatDate } from "@/lib/utils";
import { ChevronDown, ChevronUp, Reply } from "lucide-react";
import type { Prisma } from "@prisma/client";

type CommentWithReplies = Prisma.CommentGetPayload<{
  include: {
    replies: {
      include: {
        replies: {
          include: {
            replies: true;
          };
        };
      };
    };
  };
}>;

type CommentThreadProps = {
  comment: CommentWithReplies;
  onCommentAdded?: () => void;
  depth?: number;
  collapsedState?: Map<string, boolean>;
  onToggleCollapse?: (commentId: string) => void;
};

export function CommentThread({ 
  comment, 
  onCommentAdded, 
  depth = 0,
  collapsedState,
  onToggleCollapse,
}: CommentThreadProps) {
  const router = useRouter();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const maxDepth = 3; // Limit nesting depth

  // Use shared collapsed state if provided, otherwise default to true
  const isRepliesOpen = collapsedState?.get(comment.id) ?? true;
  const hasReplies = comment.replies && comment.replies.length > 0;

  const handleToggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse(comment.id);
    }
  };

  return (
    <div className={depth > 0 ? "ml-6 mt-4 border-l-2 pl-4 border-muted" : ""}>
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">{comment.authorId}</span>
              <span className="text-xs text-muted-foreground">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <p className="text-sm">{comment.content}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {depth < maxDepth && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="h-7 text-xs"
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
          )}
          {hasReplies && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleCollapse}
              className="h-7 text-xs"
            >
              {isRepliesOpen ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Hide {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
                </>
              )}
            </Button>
          )}
        </div>

        {showReplyForm && (
          <div className="mt-2">
            <CommentForm
              parentCommentId={comment.id}
              onSuccess={() => {
                setShowReplyForm(false);
                router.refresh();
                onCommentAdded?.();
              }}
              onCancel={() => setShowReplyForm(false)}
            />
          </div>
        )}
      </div>

      {hasReplies && isRepliesOpen && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply as CommentWithReplies}
              onCommentAdded={onCommentAdded}
              depth={depth + 1}
              collapsedState={collapsedState}
              onToggleCollapse={onToggleCollapse}
            />
          ))}
        </div>
      )}
    </div>
  );
}


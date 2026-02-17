"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Button } from "@asym/ui/components/shadcn/button";
import { Input } from "@asym/ui/components/shadcn/input";
import { Spinner } from "@asym/ui/components/shadcn/spinner";
import { ScrollArea } from "@asym/ui/components/shadcn/scroll-area";
import { useAuth } from "@asym/auth/use-auth";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

interface CommentsDialogProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Read-only demo: server comments + client-only new comments (demo profile, reset on refresh). */
export function CommentsDialog({
  postId,
  open,
  onOpenChange,
}: CommentsDialogProps) {
  const [content, setContent] = useState("");
  const [clientComments, setClientComments] = useState<Comment[]>([]);
  const { profile } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: async () => {
      const res = await fetch(`/api/posts/${postId}/comments`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      return res.json();
    },
    enabled: open,
    staleTime: 30000,
  });

  const serverComments: Comment[] = data?.comments ?? [];
  const allComments = [...serverComments, ...clientComments];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setClientComments((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        content: content.trim(),
        created_at: new Date().toISOString(),
        user: {
          id: profile?.id ?? "",
          first_name: profile?.first_name ?? "Jordan",
          last_name: profile?.last_name ?? "Hale",
          avatar_url: profile?.avatar_url ?? null,
        },
      },
    ]);
    setContent("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner className="size-6" />
            </div>
          ) : allComments.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-4">
              {allComments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="size-8">
                    {comment.user.avatar_url && (
                      <AvatarImage src={comment.user.avatar_url} />
                    )}
                    <AvatarFallback>
                      {comment.user.first_name[0]}
                      {comment.user.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">
                        {comment.user.first_name} {comment.user.last_name}
                      </span>{" "}
                      {comment.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <form onSubmit={handleSubmit} className="flex gap-2 border-t pt-4">
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment (demo only)..."
            aria-label="Comment text"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!content.trim()}
            aria-label="Send comment"
          >
            <Send className="size-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

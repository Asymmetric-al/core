"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@asym/ui/components/shadcn/dialog";
import { Button } from "@asym/ui/components/shadcn/button";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { Spinner } from "@asym/ui/components/shadcn/spinner";
import type { MediaItem } from "@asym/database/types";

interface NewPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewPostDialog({ open, onOpenChange }: NewPostDialogProps) {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const createPost = useMutation({
    mutationFn: async (data: { content: string; media: MediaItem[] }) => {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create post");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      handleClose();
    },
  });

  const handleClose = () => {
    setContent("");
    setMedia([]);
    setPreviews([]);
    onOpenChange(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const isVideo = file.type.startsWith("video/");
      const url = URL.createObjectURL(file);

      setPreviews((prev) => [...prev, url]);
      setMedia((prev) => [...prev, { url, type: isVideo ? "video" : "image" }]);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeMedia = (index: number) => {
    const preview = previews[index];
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    createPost.mutate({ content: content.trim(), media });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share an update with your supporters..."
            rows={4}
            aria-label="Post content"
          />

          {previews.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {previews.map((preview, index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-lg"
                >
                  {media[index]?.type === "video" ? (
                    <video
                      src={preview}
                      className="size-full object-cover"
                      aria-label={`Video preview ${index + 1}`}
                    />
                  ) : (
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  )}
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    className="absolute right-1 top-1"
                    onClick={() => removeMedia(index)}
                    aria-label={`Remove media ${index + 1}`}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
              aria-label="Upload media"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="mr-2 size-4" />
              Add Media
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || createPost.isPending}
          >
            {createPost.isPending && <Spinner className="mr-2 size-4" />}
            Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

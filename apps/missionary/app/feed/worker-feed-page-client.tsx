"use client";
"use no memo";

import { TimeAgo, useLocaleFormat } from "@asym/lib/hooks";
import { fetchResult } from "@asym/lib/http/fetch-result";
import { motion, AnimatePresence, LayoutGroup } from "@asym/lib/motion";
import { ReactionBar } from "@asym/ui/components/ministry-update";
import { PageHeader } from "@asym/ui/components/page-header";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { Card, CardContent, CardHeader } from "@asym/ui/components/shadcn/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@asym/ui/components/shadcn/carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@asym/ui/components/shadcn/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { Label } from "@asym/ui/components/shadcn/label";
import {
  isPostContentEmpty,
  PostContent,
} from "@asym/ui/components/shadcn/rich-text-editor";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { Switch } from "@asym/ui/components/shadcn/switch";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@asym/ui/components/shadcn/tabs";
import { cn } from "@asym/ui/lib/utils";
import {
  MoreHorizontal,
  Loader2,
  Globe,
  ChevronDown,
  X,
  Lock,
  Users,
  Check,
  ShieldCheck,
  Settings,
  Pin,
  Trash2,
  Save,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import React, { useId, useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";

import { buildSecurityDialogState, SECURITY_OPTIONS } from "./feed-model";
import {
  EmptyState,
  LastSyncedDisplay,
  PublishedFeedPane,
} from "./feed-support-ui";
import { useWorkerFeedPageView } from "./use-worker-feed-page-view";

import type {
  FollowerRequest,
  Post,
  PostStatus,
  SecurityDialogState,
  SecurityLevel,
  Visibility,
} from "./feed-model";
import type { MediaItem } from "@asym/database/types";

const RichTextEditor = dynamic(
  () =>
    import("@asym/ui/components/primitives/RichTextEditor").then(
      (mod) => mod.RichTextEditor,
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-62.5 w-full" />,
  },
);

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

const smoothTransition = {
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

const MotionCard = motion.create(Card);

function FollowerRequestItem({
  request,
  onResolve,
  index,
}: {
  request: FollowerRequest;
  onResolve: (id: string, approved: boolean) => void;
  index: number;
}) {
  const [status, setStatus] = useState<
    "pending" | "processing" | "approved" | "ignored" | "collapsing"
  >("pending");
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleAction = async (action: "approve" | "ignore") => {
    setStatus("processing");

    const result = await fetchResult(`/api/follower-requests/${request.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: action === "approve" ? "approved" : "rejected",
      }),
    });

    if (!result.ok) {
      console.error(
        "Error resolving request:",
        new Error("Failed to update request", { cause: result.error }),
      );
      setStatus("pending");
      toast.error("Failed to update request");
      return;
    }

    setStatus(action === "approve" ? "approved" : "ignored");

    setTimeout(() => {
      if (!mountedRef.current) return;
      setStatus("collapsing");
      setTimeout(() => {
        if (!mountedRef.current) return;
        onResolve(request.id, action === "approve");
      }, 400);
    }, 1500);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      // The list renders inside <AnimatePresence mode="popLayout">, so the
      // exiting row is removed from layout and siblings reflow via `layout`.
      exit={{ opacity: 0, x: -20 }}
      transition={{ ...smoothTransition, delay: index * 0.05 }}
      className={cn(
        "px-4 py-3 overflow-hidden",
        status === "approved" || status === "ignored" ? "bg-muted/30" : "",
      )}
    >
      <div className="flex items-start gap-3">
        <motion.div whileHover={{ scale: 1.02 }} transition={springTransition}>
          <Avatar className="size-9 shrink-0">
            <AvatarImage src={request.avatar_url || undefined} />
            <AvatarFallback>{request.initials}</AvatarFallback>
          </Avatar>
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0 flex-1">
              <p
                className="text-sm font-semibold text-foreground truncate leading-tight"
                title={request.name}
              >
                {request.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {request.is_donor && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1 }}
                    transition={springTransition}
                  >
                    <Badge variant="success">Donor</Badge>
                  </motion.div>
                )}
                <TimeAgo
                  date={request.created_at}
                  className="text-xs text-muted-foreground"
                />
              </div>
            </div>
          </div>

          <div className="h-8 relative mt-2">
            <AnimatePresence mode="wait">
              {status === "pending" && (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-2 absolute inset-0"
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button
                      size="sm"
                      variant="default"
                      className="w-full"
                      onClick={() => handleAction("approve")}
                    >
                      Accept
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleAction("ignore")}
                    >
                      Ignore
                    </Button>
                  </motion.div>
                </motion.div>
              )}

              {status === "processing" && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-full absolute inset-0"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Loader2 className="size-4 text-muted-foreground" />
                  </motion.div>
                </motion.div>
              )}

              {status === "approved" && (
                <motion.div
                  key="approved"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={springTransition}
                  className="flex items-center gap-1.5 h-full absolute inset-0 text-success"
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ ...springTransition, delay: 0.1 }}
                    className="bg-success/10 rounded-full p-0.5"
                  >
                    <Check className="size-3" />
                  </motion.div>
                  <span className="text-sm font-medium">Accepted</span>
                </motion.div>
              )}

              {status === "ignored" && (
                <motion.div
                  key="ignored"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={springTransition}
                  className="flex items-center gap-1.5 h-full absolute inset-0 text-muted-foreground"
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ ...springTransition, delay: 0.1 }}
                    className="bg-muted rounded-full p-0.5"
                  >
                    <X className="size-3" />
                  </motion.div>
                  <span className="text-sm font-medium">Removed</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PostCard({
  post,
  onEdit,
  onDelete,
  index,
}: {
  post: Post;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}) {
  const { formatDate } = useLocaleFormat();
  const authorName = post.author
    ? `${post.author.first_name} ${post.author.last_name}`
    : "Marcus Miller";
  const authorAvatar =
    post.author?.avatar_url ||
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80";
  const singleMedia = post.media?.at(0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ ...smoothTransition, delay: index * 0.08 }}
    >
      <MotionCard
        whileHover={{ y: -2 }}
        transition={springTransition}
        className="group overflow-hidden"
      >
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="flex gap-3 sm:gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={springTransition}
            >
              <Avatar className="size-10 sm:size-12">
                <AvatarImage src={authorAvatar} />
                <AvatarFallback>
                  {post.author?.first_name?.[0] || "M"}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h3 className="font-semibold text-foreground text-base sm:text-lg tracking-tight">
                  {authorName}
                </h3>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Badge variant="secondary">{post.post_type}</Badge>
                </motion.div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {formatDate(post.created_at)}
                </span>
                <span className="text-border">•</span>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {post.visibility === "public" ? (
                    <Globe className="size-3" />
                  ) : post.visibility === "partners" ? (
                    <Users className="size-3" />
                  ) : (
                    <Lock className="size-3" />
                  )}
                  <span className="hidden sm:inline">{post.visibility}</span>
                </span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Post actions">
                  <MoreHorizontal />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Pin className="size-3.5 text-muted-foreground" /> Pin to Top
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Settings className="size-3.5 text-muted-foreground" /> Edit
                Post
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} variant="destructive">
                <Trash2 className="size-3.5" /> Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-4 pb-4"
          >
            <PostContent
              value={post.content}
              richTextClassName="leading-relaxed"
              htmlClassName="prose prose-sm sm:prose-base max-w-none leading-relaxed
                        prose-headings:font-semibold prose-headings:tracking-tight
                        prose-strong:font-semibold
                        prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                        prose-blockquote:italic"
            />
            {post.media && post.media.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="overflow-hidden rounded-xl border border-border"
              >
                {post.media.length === 1 && singleMedia ? (
                  <div className="relative w-full h-auto min-h-50 max-h-100 sm:max-h-150">
                    <Image
                      src={singleMedia.url}
                      alt="Update"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 700px"
                    />
                  </div>
                ) : (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {post.media.map((item, idx: number) => (
                        <CarouselItem key={`${item.type}-${item.url}`}>
                          <div className="relative w-full h-auto min-h-50 max-h-100 sm:max-h-150">
                            <Image
                              src={item.url}
                              alt={`Update ${idx + 1}`}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 700px"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious placement="inside" />
                    <CarouselNext placement="inside" />
                  </Carousel>
                )}
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="border-t border-border pt-4"
          >
            <ReactionBar update={post} appearance="chip" comments="dialog" />
          </motion.div>
        </CardContent>
      </MotionCard>
    </motion.div>
  );
}

function SecurityAccessDialog({
  securityLevel,
  setSecurityLevel,
}: {
  securityLevel: SecurityLevel;
  setSecurityLevel: (level: SecurityLevel) => void;
}) {
  const pendingActionLabelId = useId();

  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogState, setDialogState] = useState<SecurityDialogState>(() =>
    buildSecurityDialogState("medium"),
  );
  const { level: localLevel, publicMirror, autoApproval } = dialogState;
  const settingsId = React.useId();

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setDialogState(buildSecurityDialogState(securityLevel));
      }
      setIsOpen(open);
    },
    [securityLevel],
  );

  const handleLevelChange = (level: SecurityLevel) => {
    setDialogState(buildSecurityDialogState(level));
  };

  const handlePublicMirrorChange = (checked: boolean) => {
    setDialogState((previous) => {
      if (checked) {
        return { level: "low", publicMirror: true, autoApproval: true };
      }
      if (previous.level === "low") {
        return { level: "medium", publicMirror: false, autoApproval: true };
      }
      return { ...previous, publicMirror: false };
    });
  };

  const handleAutoApprovalChange = (checked: boolean) => {
    setDialogState((previous) => {
      if (!checked) {
        return { level: "high", publicMirror: false, autoApproval: false };
      }
      if (previous.level === "high") {
        return { level: "medium", publicMirror: false, autoApproval: true };
      }
      return { ...previous, autoApproval: true };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSecurityLevel(localLevel);
    setIsSaving(false);
    setIsOpen(false);
    toast.success("Security settings saved");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <ShieldCheck className="size-4" />
            <span className="hidden sm:inline">Security & Access</span>
            <span className="sm:hidden">Security</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-130" scrollable>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="size-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Security & Access</DialogTitle>
              <DialogDescription>
                Control who can see your feed and updates
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <SecurityAccessOptions
            localLevel={localLevel}
            handleLevelChange={handleLevelChange}
          />

          <SecurityAccessNotes
            settingsId={settingsId}
            publicMirror={publicMirror}
            handlePublicMirrorChange={handlePublicMirrorChange}
            autoApproval={autoApproval}
            handleAutoApprovalChange={handleAutoApprovalChange}
          />
        </div>

        <DialogFooter>
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="flex-1"
            >
              <Button
                aria-labelledby={`${pendingActionLabelId}-27`}
                focusableWhenDisabled={isSaving}
                onClick={handleSave}
                disabled={isSaving}
                className="w-full"
              >
                <span id={`${pendingActionLabelId}-27`} className="sr-only">
                  {isSaving ? "Saving…" : "Save Changes"}
                </span>
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </motion.div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type PostComposerCardProps = {
  postType: string;
  postContent: string;
  selectedMedia: MediaItem[];
  lastSaved: Date | null;
  editingPostId: string | null;
  isUploading: boolean;
  isSaving: boolean;
  postPrivacy: Visibility;
  setPostType: (value: React.SetStateAction<string>) => void;
  setPostContent: (value: React.SetStateAction<string>) => void;
  setSelectedMedia: (value: React.SetStateAction<MediaItem[]>) => void;
  setEditingPostId: (value: React.SetStateAction<string | null>) => void;
  setPostPrivacy: (value: React.SetStateAction<Visibility>) => void;
  simulateUpload: () => Promise<void>;
  onPost: (status?: PostStatus) => Promise<void>;
};

type PostComposerActionsProps = {
  selectedMedia: MediaItem[];
  lastSaved: Date | null;
  isUploading: boolean;
  isSaving: boolean;
  postPrivacy: Visibility;
  postActionDisabled: boolean;
  setSelectedMedia: (value: React.SetStateAction<MediaItem[]>) => void;
  setPostPrivacy: (value: React.SetStateAction<Visibility>) => void;
  simulateUpload: () => Promise<void>;
  handlePost: (status?: PostStatus) => Promise<void>;
};

export function PostComposerActions({
  selectedMedia,
  lastSaved,
  isUploading,
  isSaving,
  postPrivacy,
  postActionDisabled,
  setSelectedMedia,
  setPostPrivacy,
  simulateUpload,
  handlePost: onPost,
}: PostComposerActionsProps) {
  const publishLabelId = useId();
  const [pendingAction, setPendingAction] = useState<PostStatus | null>(null);
  const pendingActionRef = useRef<PostStatus | null>(null);
  const draftPending = pendingAction === "draft";
  const publishPending = pendingAction === "published";
  const actionsDisabled =
    postActionDisabled || isSaving || pendingAction !== null;

  const runPostAction = async (status: PostStatus) => {
    if (postActionDisabled || isSaving || pendingActionRef.current) return;
    pendingActionRef.current = status;
    setPendingAction(status);
    try {
      await onPost(status);
    } finally {
      pendingActionRef.current = null;
      setPendingAction(null);
    }
  };

  const { formatTime } = useLocaleFormat();
  return (
    <div className="flex flex-col gap-3 w-full">
      <AnimatePresence mode="popLayout">
        {selectedMedia.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex gap-2 sm:gap-3 overflow-x-auto pb-2"
          >
            {selectedMedia.map((item, idx) => (
              <motion.div
                key={`${item.type}-${item.url}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={springTransition}
                className="relative group/img shrink-0"
              >
                <Image
                  src={item.url}
                  alt={`Attached media ${idx + 1}`}
                  width={64}
                  height={64}
                  unoptimized
                  className="size-14 sm:h-16 sm:w-16 object-cover rounded-lg border border-border shadow-sm"
                />
                <div className="absolute -top-1.5 -right-1.5">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    aria-label="Remove attached media"
                    onClick={() =>
                      setSelectedMedia((prev) =>
                        prev.filter((_, i) => i !== idx),
                      )
                    }
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-wrap items-center gap-2 w-full">
        <AnimatePresence>
          {lastSaved && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-muted-foreground hidden md:inline-block"
            >
              Saved{" "}
              {formatTime(lastSaved, { hour: "2-digit", minute: "2-digit" })}
            </motion.span>
          )}
        </AnimatePresence>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            aria-label={isUploading ? "Uploading media" : "Add media"}
            focusableWhenDisabled={isUploading}
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={simulateUpload}
          >
            {isUploading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Loader2 className="size-3" />
              </motion.div>
            ) : (
              <ImageIcon className="size-3" />
            )}
            <span className="hidden sm:inline">Media</span>
          </Button>
        </motion.div>

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Post visibility: ${postPrivacy}`}
            render={
              <Button variant="outline" size="sm">
                {postPrivacy === "public" ? (
                  <Globe className="size-3" />
                ) : postPrivacy === "partners" ? (
                  <Users className="size-3" />
                ) : (
                  <Lock className="size-3" />
                )}
                <span className="hidden sm:inline capitalize">
                  {postPrivacy === "partners" ? "Partners" : postPrivacy}
                </span>
                <ChevronDown className="size-2.5 opacity-40" />
              </Button>
            }
          />
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setPostPrivacy("public")}>
              <Globe className="size-3.5 text-muted-foreground" />
              Public
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPostPrivacy("partners")}>
              <Users className="size-3.5 text-muted-foreground" />
              Partners Only
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setPostPrivacy("private")}>
              <Lock className="size-3.5 text-muted-foreground" />
              Private
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1" />

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => void runPostAction("draft")}
            aria-label="Save draft"
            variant="outline"
            size="sm"
            disabled={actionsDisabled}
            focusableWhenDisabled={draftPending}
          >
            {draftPending ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Loader2 className="size-3" />
              </motion.div>
            ) : (
              <Save className="size-3 sm:mr-1.5" />
            )}
            <span className="hidden sm:inline">Draft</span>
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => void runPostAction("published")}
            aria-labelledby={publishLabelId}
            variant="default"
            size="sm"
            disabled={actionsDisabled}
            focusableWhenDisabled={publishPending}
          >
            <span id={publishLabelId} className="sr-only">
              {publishPending ? "Publishing update" : "Publish"}
            </span>
            {publishPending ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Loader2 className="size-3" />
              </motion.div>
            ) : (
              "Publish"
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

function PostComposerCard({
  postType,
  postContent,
  selectedMedia,
  lastSaved,
  editingPostId,
  isUploading,
  isSaving,
  postPrivacy,
  setPostType,
  setPostContent,
  setSelectedMedia,
  setEditingPostId,
  setPostPrivacy,
  simulateUpload,
  onPost,
}: PostComposerCardProps) {
  const isComposerEmpty = isPostContentEmpty(postContent);
  const postActionDisabled =
    isSaving || isUploading || (isComposerEmpty && selectedMedia.length === 0);

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...smoothTransition, delay: 0.15 }}
      className="overflow-hidden"
    >
      <CardContent>
        <div className="flex gap-2 sm:gap-3 flex-wrap items-center mb-4 sm:mb-6">
          {["Update", "Prayer Request", "Story", "Newsletter"].map(
            (type, index) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={postType === type ? "default" : "outline"}
                  onClick={() => setPostType(type)}
                  size="sm"
                >
                  {type}
                </Button>
              </motion.div>
            ),
          )}
          <AnimatePresence>
            {editingPostId && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingPostId(null);
                    setPostContent("");
                  }}
                  className="ml-auto"
                >
                  Cancel Edit
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-3 sm:gap-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="hidden sm:flex"
          >
            <Avatar className="size-9 shrink-0 sm:size-11">
              <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80" />
              <AvatarFallback>MF</AvatarFallback>
            </Avatar>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-1 min-w-0"
          >
            <RichTextEditor
              aria-label="Ministry post content"
              value={postContent}
              onChange={setPostContent}
              placeholder={`What's happening? Share a ${postType.toLowerCase()}…`}
              contentClassName="py-3 sm:py-4 px-3 sm:px-4 text-sm sm:text-base text-foreground placeholder:text-muted-foreground min-h-25 sm:min-h-35 leading-relaxed"
              toolbarPosition="bottom"
              proseInvert={false}
              actions={
                <PostComposerActions
                  selectedMedia={selectedMedia}
                  lastSaved={lastSaved}
                  isUploading={isUploading}
                  isSaving={isSaving}
                  postPrivacy={postPrivacy}
                  postActionDisabled={postActionDisabled}
                  setSelectedMedia={setSelectedMedia}
                  setPostPrivacy={setPostPrivacy}
                  simulateUpload={simulateUpload}
                  handlePost={onPost}
                />
              }
            />
          </motion.div>
        </div>
      </CardContent>
    </MotionCard>
  );
}

type FeedPostsTabsSectionProps = {
  activeTab: PostStatus;
  drafts: Post[];
  posts: Post[];
  feedError: string | null;
  isLoading: boolean;
  reloadPosts: () => Promise<void>;
  setActiveTab: (value: React.SetStateAction<PostStatus>) => void;
  onEditDraft: (draft: Post) => void;
  onDeletePost: (postId: string) => Promise<void>;
};

function FeedPostsTabsSection({
  activeTab,
  drafts,
  posts,
  feedError,
  isLoading,
  reloadPosts,
  setActiveTab,
  onEditDraft,
  onDeletePost,
}: FeedPostsTabsSectionProps) {
  const { formatDate } = useLocaleFormat();
  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      <Tabs
        defaultValue="published"
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as PostStatus)}
        className="w-full"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0"
        >
          <TabsList>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="draft">
              Drafts
              <AnimatePresence>
                {drafts.length > 0 && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={springTransition}
                  >
                    <Badge variant="secondary">{drafts.length}</Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsTrigger>
          </TabsList>

          <LastSyncedDisplay />
        </motion.div>

        <TabsContent value="published" className="mt-0">
          <LayoutGroup>
            <motion.div layout className="space-y-6 sm:space-y-8 lg:space-y-10">
              <AnimatePresence mode="popLayout">
                <PublishedFeedPane
                  feedError={feedError}
                  hasPosts={posts.length > 0}
                  isLoading={isLoading}
                  onRetry={() => {
                    void reloadPosts();
                  }}
                >
                  {posts.map((post, index) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      index={index}
                      onEdit={() => onEditDraft(post)}
                      onDelete={() => onDeletePost(post.id)}
                    />
                  ))}
                </PublishedFeedPane>
              </AnimatePresence>
            </motion.div>
          </LayoutGroup>
        </TabsContent>

        <TabsContent value="draft" className="mt-0">
          <LayoutGroup>
            <motion.div layout className="space-y-4 sm:space-y-6 lg:space-y-8">
              <AnimatePresence mode="popLayout">
                {drafts.length > 0 ? (
                  drafts.map((draft, index) => (
                    <motion.div
                      key={draft.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ ...smoothTransition, delay: index * 0.05 }}
                      className="group"
                    >
                      <MotionCard
                        whileHover={{ y: -2 }}
                        transition={springTransition}
                        className="overflow-hidden"
                      >
                        <CardContent className="flex flex-col items-start justify-between gap-4 sm:flex-row">
                          <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                              <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                              >
                                <Badge variant="secondary">
                                  Draft • {draft.post_type}
                                </Badge>
                              </motion.div>
                              <span className="text-xs text-muted-foreground font-medium">
                                Saved {formatDate(draft.created_at)}
                              </span>
                            </div>
                            <PostContent
                              value={draft.content}
                              richTextClassName="line-clamp-3 text-sm"
                              htmlClassName="prose prose-sm sm:prose-base max-w-none line-clamp-3"
                            />
                          </div>
                          <div className="flex flex-row sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex-1 sm:flex-none"
                            >
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => onEditDraft(draft)}
                                className="w-full"
                              >
                                <ExternalLink className="size-3.5 mr-2" />
                                <span className="hidden sm:inline">
                                  Edit & Publish
                                </span>
                                <span className="sm:hidden">Edit</span>
                              </Button>
                            </motion.div>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex-1 sm:flex-none"
                            >
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => onDeletePost(draft.id)}
                                className="w-full"
                              >
                                <Trash2 className="size-3.5 mr-2" />
                                Delete
                              </Button>
                            </motion.div>
                          </div>
                        </CardContent>
                      </MotionCard>
                    </motion.div>
                  ))
                ) : (
                  <EmptyState
                    icon={Save}
                    title="No drafts yet"
                    description="Drafts allow you to perfect your updates before sharing."
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </LayoutGroup>
        </TabsContent>
      </Tabs>
    </div>
  );
}

type FollowerRequestsCardProps = {
  pendingRequests: FollowerRequest[];
  isLoadingRequests: boolean;
  onResolveRequest: (id: string, approved: boolean) => void;
};

function FollowerRequestsCard({
  pendingRequests,
  isLoadingRequests,
  onResolveRequest,
}: FollowerRequestsCardProps) {
  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="overflow-hidden"
    >
      <CardHeader className="flex flex-row items-center justify-between">
        <h3 className="font-semibold text-base text-foreground">
          Follow Requests
        </h3>
        <AnimatePresence>
          {pendingRequests.length > 0 && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={springTransition}
            >
              <Badge variant="secondary">{pendingRequests.length}</Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>

      <div className="border-t border-border">
        {isLoadingRequests ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Loader2 className="size-5 text-muted-foreground" />
            </motion.div>
          </motion.div>
        ) : pendingRequests.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="divide-y divide-border/50"
          >
            <AnimatePresence mode="popLayout">
              {pendingRequests.map((req, index) => (
                <FollowerRequestItem
                  key={req.id}
                  request={req}
                  onResolve={onResolveRequest}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={smoothTransition}
            className="text-center py-10 px-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={springTransition}
              className="size-10 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-success/20"
            >
              <Check className="size-5 text-success" />
            </motion.div>
            <p className="text-sm text-muted-foreground">All caught up!</p>
          </motion.div>
        )}
      </div>
    </MotionCard>
  );
}

function WorkerFeedPageView() {
  const vm = useWorkerFeedPageView();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-375 mx-auto pb-20"
    >
      <PageHeader
        title="Ministry Updates"
        description="Share updates with your supporters and stay connected."
      >
        <SecurityAccessDialog
          securityLevel={vm.securityLevel}
          setSecurityLevel={vm.setSecurityLevel}
        />
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...smoothTransition, delay: 0.1 }}
          className="lg:col-span-9 space-y-6 sm:space-y-8 lg:space-y-10"
        >
          <PostComposerCard
            postType={vm.postType}
            postContent={vm.postContent}
            selectedMedia={vm.selectedMedia}
            lastSaved={vm.lastSaved}
            editingPostId={vm.editingPostId}
            isUploading={vm.isUploading}
            isSaving={vm.isSaving}
            postPrivacy={vm.postPrivacy}
            setPostType={vm.setPostType}
            setPostContent={vm.setPostContent}
            setSelectedMedia={vm.setSelectedMedia}
            setEditingPostId={vm.setEditingPostId}
            setPostPrivacy={vm.setPostPrivacy}
            simulateUpload={vm.simulateUpload}
            onPost={vm.handlePost}
          />

          <FeedPostsTabsSection
            activeTab={vm.activeTab}
            drafts={vm.drafts}
            posts={vm.posts}
            feedError={vm.feedError}
            isLoading={vm.isLoading}
            reloadPosts={vm.reloadPosts}
            setActiveTab={vm.setActiveTab}
            onEditDraft={vm.handleEditDraft}
            onDeletePost={vm.handleDeletePost}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...smoothTransition, delay: 0.2 }}
          className="lg:col-span-3 space-y-6 sm:space-y-8 lg:space-y-10"
        >
          <FollowerRequestsCard
            pendingRequests={vm.pendingRequests}
            isLoadingRequests={vm.isLoadingRequests}
            onResolveRequest={vm.handleResolveRequest}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function WorkerFeed() {
  return <WorkerFeedPageView />;
}

function SecurityAccessOptions({
  localLevel,
  handleLevelChange,
}: {
  localLevel: SecurityLevel;
  handleLevelChange: (level: SecurityLevel) => void;
}) {
  return (
    <div className="space-y-3">
      <Label>Security Level</Label>
      <div className="space-y-3">
        {SECURITY_OPTIONS.map(
          ({
            level,
            icon: Icon,
            title,
            description,
            features,
            color,
            bgColor,
            borderColor,
            ringColor,
          }) => {
            const isSelected = localLevel === level;
            return (
              <motion.button
                key={level}
                type="button"
                onClick={() => handleLevelChange(level)}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
                className={cn(
                  "w-full rounded-xl border-2 p-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isSelected
                    ? cn(borderColor, bgColor, "ring-2", ringColor)
                    : "border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/30",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "size-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                      isSelected
                        ? cn(bgColor, color)
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          "font-semibold text-sm",
                          isSelected ? color : "text-foreground",
                        )}
                      >
                        {title}
                      </span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1 }}
                          transition={springTransition}
                        >
                          <Badge variant="secondary">Active</Badge>
                        </motion.div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                      {description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {features.map((feature) => (
                        <span
                          key={feature}
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            isSelected
                              ? cn(bgColor, color)
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div
                    className={cn(
                      "size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                      isSelected ? cn(borderColor, bgColor) : "border-border",
                    )}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1 }}
                        transition={springTransition}
                      >
                        <Check className={cn("size-3", color)} />
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          },
        )}
      </div>
    </div>
  );
}

function SecurityAccessNotes({
  settingsId,
  publicMirror,
  handlePublicMirrorChange,
  autoApproval,
  handleAutoApprovalChange,
}: {
  settingsId: string;
  publicMirror: boolean;
  handlePublicMirrorChange: (checked: boolean) => void;
  autoApproval: boolean;
  handleAutoApprovalChange: (checked: boolean) => void;
}) {
  return (
    <div className="space-y-4 pt-4 border-t border-border">
      <Label>Quick Settings</Label>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Globe className="size-4 text-primary" />
            </div>
            <div>
              <Label htmlFor={`${settingsId}-mirror`}>Public Mirror</Label>
              <p className="text-xs text-muted-foreground">
                Sync updates to your giving page
              </p>
            </div>
          </div>
          <Switch
            id={`${settingsId}-mirror`}
            aria-label="Public Mirror"
            checked={publicMirror}
            onCheckedChange={handlePublicMirrorChange}
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-info/10 flex items-center justify-center">
              <Users className="size-4 text-info" />
            </div>
            <div>
              <Label htmlFor={`${settingsId}-approval`}>
                Auto-Approve Donors
              </Label>
              <p className="text-xs text-muted-foreground">
                Instantly accept donor follow requests
              </p>
            </div>
          </div>
          <Switch
            id={`${settingsId}-approval`}
            aria-label="Auto-Approve Donors"
            checked={autoApproval}
            onCheckedChange={handleAutoApprovalChange}
          />
        </div>
      </div>
    </div>
  );
}

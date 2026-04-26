"use client";

import { TimeAgo } from "@asym/lib/hooks";
import { motion, AnimatePresence, LayoutGroup } from "@asym/lib/motion";
import { BrandAvatar } from "@asym/ui/components/brand-logo";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@asym/ui/components/shadcn/alert-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { Card, CardContent, CardHeader } from "@asym/ui/components/shadcn/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@asym/ui/components/shadcn/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import { PostContent } from "@asym/ui/components/shadcn/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { Separator } from "@asym/ui/components/shadcn/separator";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@asym/ui/components/shadcn/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@asym/ui/components/shadcn/tooltip";
import { cn } from "@asym/ui/lib/utils";
import {
  Search,
  Filter,
  MoreHorizontal,
  MessageCircle,
  Loader2,
  Globe,
  Lock,
  Users,
  Check,
  ShieldAlert,
  ShieldCheck,
  Pin,
  Trash2,
  Eye,
  EyeOff,
  Flag,
  AlertTriangle,
  UserX,
  Edit3,
  Clock,
  Activity,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  ArrowUpDown,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import Image from "next/image";
import React, { useState, useMemo } from "react";

import type {
  Comment,
  ContentModerationUiAction,
  ModerationAction,
  ModerationStats,
  ModerationTab,
  Post,
  PostTypeFilter,
  SortOption,
  VisibilityFilter,
} from "./feed-model";

const smoothTransition = {
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};
const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

const MotionCard = motion.create(Card);

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  variant: _variant = "default",
  index = 0,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  variant?: "default" | "warning" | "danger" | "success";
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...smoothTransition, delay: index * 0.05 }}
    >
      <MotionCard
        whileHover={{ y: -2, scale: 1.01 }}
        transition={springTransition}
        className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow duration-[var(--duration-micro)] ease-[var(--ease-out-soft)]"
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
              <motion.p
                key={value}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-xl sm:text-2xl font-bold tracking-tight text-foreground"
              >
                {value}
              </motion.p>
              {trend !== undefined && (
                <p
                  className={cn(
                    "text-[9px] sm:text-[10px] font-medium flex items-center gap-1",
                    trend > 0
                      ? "text-emerald-600"
                      : trend < 0
                        ? "text-rose-600"
                        : "text-muted-foreground",
                  )}
                >
                  <TrendingUp
                    className={cn("h-3 w-3", trend < 0 && "rotate-180")}
                  />
                  {trend > 0 ? "+" : ""}
                  {trend}% {trendLabel}
                </p>
              )}
            </div>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={springTransition}
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center bg-zinc-100 text-zinc-600"
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </motion.div>
          </div>
        </CardContent>
      </MotionCard>
    </motion.div>
  );
}

function ModerationQueueDialogs({
  actionDialogOpen,
  onActionDialogOpenChange,
  pendingAction,
  actionReason,
  onActionReasonChange,
  onConfirmAction,
  selectedPost,
  onSelectedPostChange,
  onActionClick,
}: {
  actionDialogOpen: boolean;
  onActionDialogOpenChange: (open: boolean) => void;
  pendingAction: { postId: string; action: ModerationAction } | null;
  actionReason: string;
  onActionReasonChange: (value: string) => void;
  onConfirmAction: () => void;
  selectedPost: Post | null;
  onSelectedPostChange: (post: Post | null) => void;
  onActionClick: (postId: string, action: ModerationAction) => void;
}) {
  return (
    <>
      <AlertDialog
        open={actionDialogOpen}
        onOpenChange={onActionDialogOpenChange}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.action === "delete"
                ? "Delete Post?"
                : "Hide Post?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.action === "delete"
                ? "This action cannot be undone. The post will be permanently removed."
                : "This post will be hidden from all feeds. You can restore it later."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Reason (optional)
            </Label>
            <Input
              value={actionReason}
              onChange={(e) => onActionReasonChange(e.target.value)}
              placeholder="Add a reason for this action..."
              className="mt-2 rounded-xl"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmAction}
              className={cn(
                "rounded-xl",
                pendingAction?.action === "delete" &&
                  "bg-destructive hover:bg-destructive/90",
              )}
            >
              {pendingAction?.action === "delete" ? "Delete" : "Hide"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!selectedPost}
        onOpenChange={() => {
          onSelectedPostChange(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
            <DialogDescription>Review and manage this post</DialogDescription>
          </DialogHeader>
          {selectedPost && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-2 border-background shadow-md">
                  <AvatarImage src={selectedPost.author.avatar_url} />
                  <AvatarFallback className="font-bold">
                    {selectedPost.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-foreground">
                    {selectedPost.author.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedPost.author.location}
                  </p>
                </div>
              </div>

              <PostContent
                value={selectedPost.content}
                richTextClassName="prose prose-sm max-w-none"
                htmlClassName="prose prose-sm max-w-none"
              />

              {selectedPost.media && selectedPost.media.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {selectedPost.media.map((item) => (
                    <div
                      key={`${selectedPost.id}-${item.type}-${item.url}`}
                      className="relative aspect-video rounded-xl overflow-hidden"
                    >
                      <Image
                        src={item.url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="300px"
                      />
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-4 gap-3 sm:gap-4 text-center">
                {[
                  { value: selectedPost.likes_count, label: "Likes" },
                  { value: selectedPost.prayers_count, label: "Prayers" },
                  { value: selectedPost.fires_count, label: "Fires" },
                  { value: selectedPost.comments_count, label: "Comments" },
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-3 bg-muted/50 rounded-xl"
                  >
                    <p className="text-xl sm:text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => onSelectedPostChange(null)}
              className="rounded-xl"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                if (selectedPost) {
                  onActionClick(selectedPost.id, "approve");
                }
                onSelectedPostChange(null);
              }}
              className="rounded-xl"
            >
              <Check className="h-4 w-4 mr-2" /> Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ModerationQueue({
  posts,
  onAction,
  isLoading,
}: {
  posts: Post[];
  onAction: (postId: string, action: ModerationAction, reason?: string) => void;
  isLoading: boolean;
}) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    postId: string;
    action: ModerationAction;
  } | null>(null);
  const [actionReason, setActionReason] = useState("");

  const handleActionClick = (postId: string, action: ModerationAction) => {
    if (action === "delete" || action === "hide") {
      setPendingAction({ postId, action });
      setActionDialogOpen(true);
    } else {
      onAction(postId, action);
    }
  };

  const confirmAction = () => {
    if (pendingAction) {
      onAction(pendingAction.postId, pendingAction.action, actionReason);
      setPendingAction(null);
      setActionReason("");
    }
    setActionDialogOpen(false);
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-10 w-10 text-muted-foreground/30" />
        </motion.div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">
          Loading queue...
        </p>
      </motion.div>
    );
  }

  if (posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={smoothTransition}
        className="text-center py-20 sm:py-24 bg-muted/20 rounded-2xl sm:rounded-3xl border-2 border-dashed"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={springTransition}
          className="w-16 h-16 sm:w-20 sm:h-20 bg-card rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-md border"
        >
          <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-500" />
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-bold text-lg sm:text-xl text-foreground tracking-tight"
        >
          All Clear!
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-muted-foreground font-medium mt-2 text-sm"
        >
          No items require moderation at this time.
        </motion.p>
      </motion.div>
    );
  }

  return (
    <>
      <LayoutGroup>
        <motion.div layout className="space-y-4 sm:space-y-6">
          <AnimatePresence mode="popLayout">
            {posts.map((post, index) => (
              <ModerationQueuePostCard
                key={post.id}
                post={post}
                index={index}
                onActionClick={handleActionClick}
                onSelectPost={setSelectedPost}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      <ModerationQueueDialogs
        actionDialogOpen={actionDialogOpen}
        onActionDialogOpenChange={setActionDialogOpen}
        pendingAction={pendingAction}
        actionReason={actionReason}
        onActionReasonChange={setActionReason}
        onConfirmAction={confirmAction}
        selectedPost={selectedPost}
        onSelectedPostChange={setSelectedPost}
        onActionClick={handleActionClick}
      />
    </>
  );
}

function AllPostsFeedPostCard({
  post,
  index,
  onAction,
}: {
  post: Post;
  index: number;
  onAction: (postId: string, action: ModerationAction) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ ...smoothTransition, delay: index * 0.03 }}
    >
      <MotionCard
        whileHover={{ y: -2 }}
        transition={springTransition}
        className={cn(
          "rounded-2xl sm:rounded-3xl border shadow-sm hover:shadow-lg transition-[box-shadow,border-color,opacity] duration-[var(--duration-micro)] ease-[var(--ease-out-soft)] overflow-hidden",
          post.status === "hidden" && "opacity-60",
          post.isFlagged && "border-amber-200",
        )}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex gap-3 sm:gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={springTransition}
            >
              {post.author.role === "organization" ? (
                <BrandAvatar size="md" />
              ) : (
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 border-2 border-background shadow-md ring-1 ring-border">
                  <AvatarImage src={post.author.avatar_url} />
                  <AvatarFallback className="text-xs font-bold bg-muted text-muted-foreground">
                    {post.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
            </motion.div>

            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm sm:text-base text-foreground truncate">
                      {post.author.name}
                    </span>
                    {post.author.role === "organization" && (
                      <Badge className="text-[8px] sm:text-[9px] h-5 px-2 bg-primary/10 text-primary shrink-0 rounded-full font-semibold uppercase tracking-wider border-0">
                        Official
                      </Badge>
                    )}
                    <Badge
                      variant="secondary"
                      className="text-[8px] sm:text-[9px] h-5 px-2 shrink-0 rounded-full font-semibold uppercase tracking-wider"
                    >
                      {post.post_type}
                    </Badge>
                    {post.status === "hidden" && (
                      <Badge
                        variant="outline"
                        className="text-[8px] sm:text-[9px] h-5 px-2 gap-1 shrink-0 rounded-full font-semibold uppercase tracking-wider"
                      >
                        <EyeOff className="h-2.5 w-2.5" /> Hidden
                      </Badge>
                    )}
                    {post.isFlagged && (
                      <Badge
                        variant="destructive"
                        className="text-[8px] sm:text-[9px] h-5 px-2 gap-1 shrink-0 rounded-full font-semibold uppercase tracking-wider"
                      >
                        <Flag className="h-2.5 w-2.5" /> Flagged
                      </Badge>
                    )}
                    {post.isPinned && (
                      <Badge
                        variant="outline"
                        className="text-[8px] sm:text-[9px] h-5 px-2 gap-1 shrink-0 rounded-full font-semibold uppercase tracking-wider"
                      >
                        <Pin className="h-2.5 w-2.5" /> Pinned
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground font-medium">
                      <TimeAgo date={post.created_at} shortFormat />
                    </span>
                    {post.author.location && (
                      <>
                        <span className="text-border">•</span>
                        <span className="text-[10px] text-muted-foreground font-medium hidden xs:inline">
                          {post.author.location}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-xl"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-52 rounded-xl p-1.5"
                  >
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground px-2">
                      Quick Actions
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onAction(post.id, "edit")}
                      className="rounded-lg py-2.5 cursor-pointer gap-2.5"
                    >
                      <Edit3 className="h-4 w-4 text-muted-foreground" /> Edit
                      Post
                    </DropdownMenuItem>
                    {post.isPinned ? (
                      <DropdownMenuItem className="rounded-lg py-2.5 cursor-pointer gap-2.5">
                        <Pin className="h-4 w-4 text-muted-foreground" /> Unpin
                        Post
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem className="rounded-lg py-2.5 cursor-pointer gap-2.5">
                        <Pin className="h-4 w-4 text-muted-foreground" /> Pin to
                        Top
                      </DropdownMenuItem>
                    )}
                    {post.status === "hidden" ? (
                      <DropdownMenuItem
                        onClick={() => onAction(post.id, "approve")}
                        className="rounded-lg py-2.5 cursor-pointer gap-2.5"
                      >
                        <Eye className="h-4 w-4 text-muted-foreground" />{" "}
                        Restore Post
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => onAction(post.id, "hide")}
                        className="rounded-lg py-2.5 cursor-pointer gap-2.5"
                      >
                        <EyeOff className="h-4 w-4 text-muted-foreground" />{" "}
                        Hide Post
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="rounded-lg py-2.5 cursor-pointer gap-2.5">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />{" "}
                      View Public Post
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg py-2.5 cursor-pointer gap-2.5">
                      <UserX className="h-4 w-4 text-muted-foreground" /> View
                      Author
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive rounded-lg py-2.5 cursor-pointer gap-2.5"
                      onClick={() => onAction(post.id, "delete")}
                    >
                      <Trash2 className="h-4 w-4" /> Delete Post
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <PostContent
                value={post.content}
                richTextClassName="prose prose-sm max-w-none text-sm text-foreground/80 line-clamp-3"
                htmlClassName="prose prose-sm max-w-none text-sm text-foreground/80 line-clamp-3"
              />

              {post.media && post.media.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex gap-2"
                >
                  {post.media.slice(0, 4).map((item) => (
                    <motion.div
                      key={`${post.id}-${item.type}-${item.url}`}
                      whileHover={{ scale: 1.05 }}
                      className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden border shadow-sm"
                    >
                      <Image
                        src={item.url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              <div className="flex items-center gap-4 sm:gap-6 pt-1 text-xs text-muted-foreground font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-base">❤️</span>{" "}
                  {post.likes_count}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-base">🙏</span>{" "}
                  {post.prayers_count}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-base">🔥</span>{" "}
                  {post.fires_count}
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5" />{" "}
                  {post.comments_count}
                </span>
                <span className="ml-auto flex items-center gap-1.5">
                  {post.visibility === "public" ? (
                    <Globe className="h-3.5 w-3.5" />
                  ) : post.visibility === "partners" ? (
                    <Users className="h-3.5 w-3.5" />
                  ) : (
                    <Lock className="h-3.5 w-3.5" />
                  )}
                  <span className="capitalize hidden xs:inline">
                    {post.visibility}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </MotionCard>
    </motion.div>
  );
}

function AllPostsFeed({
  posts,
  searchQuery,
  filterVisibility,
  filterType,
  sortBy,
  onAction,
}: {
  posts: Post[];
  searchQuery: string;
  filterVisibility: string;
  filterType: string;
  sortBy: string;
  onAction: (postId: string, action: ModerationAction) => void;
}) {
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.content.toLowerCase().includes(query) ||
          p.author.name.toLowerCase().includes(query),
      );
    }

    if (filterVisibility !== "all") {
      result = result.filter((p) => p.visibility === filterVisibility);
    }

    if (filterType !== "all") {
      result = result.filter(
        (p) => p.post_type.toLowerCase() === filterType.toLowerCase(),
      );
    }

    if (sortBy === "engagement") {
      result.sort(
        (a, b) =>
          b.likes_count +
          b.prayers_count +
          b.fires_count -
          (a.likes_count + a.prayers_count + a.fires_count),
      );
    } else if (sortBy === "oldest") {
      result.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
    } else {
      result.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }

    return result;
  }, [posts, searchQuery, filterVisibility, filterType, sortBy]);

  if (filteredPosts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={smoothTransition}
        className="text-center py-20 sm:py-24 bg-muted/20 rounded-2xl sm:rounded-3xl border-2 border-dashed"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={springTransition}
          className="w-16 h-16 sm:w-20 sm:h-20 bg-card rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-md border"
        >
          <Search className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/30" />
        </motion.div>
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-bold text-lg sm:text-xl text-foreground tracking-tight"
        >
          No posts found
        </motion.h3>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-muted-foreground font-medium mt-2 text-sm"
        >
          Try adjusting your filters or search query.
        </motion.p>
      </motion.div>
    );
  }

  return (
    <LayoutGroup>
      <motion.div layout className="space-y-4 sm:space-y-6">
        <AnimatePresence mode="popLayout">
          {filteredPosts.map((post, index) => (
            <AllPostsFeedPostCard
              key={post.id}
              post={post}
              index={index}
              onAction={onAction}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  );
}

function FlaggedCommentsPanel({
  comments,
  onAction,
}: {
  comments: Comment[];
  onAction: (commentId: string, action: "approve" | "delete") => void;
}) {
  if (comments.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-10 bg-muted/20 rounded-xl border-2 border-dashed"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={springTransition}
        >
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
        </motion.div>
        <h3 className="font-bold text-foreground">No flagged comments</h3>
        <p className="text-xs text-muted-foreground mt-1">
          All comments are approved.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {comments.map((comment, index) => (
          <motion.div
            key={comment.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ ...smoothTransition, delay: index * 0.05 }}
          >
            <Card className="rounded-xl border-amber-200 hover:shadow-md transition-shadow duration-[var(--duration-micro)] ease-[var(--ease-out-soft)]">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={springTransition}
                  >
                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 border border-background shadow-sm">
                      <AvatarFallback className="text-[10px] font-bold bg-muted">
                        {comment.author.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground">
                        {comment.author.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        <TimeAgo date={comment.created_at} shortFormat />
                      </span>
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed">
                      {comment.content}
                    </p>
                    <div className="flex items-center gap-2">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-3 text-[10px] text-emerald-600 hover:bg-emerald-100 rounded-lg font-semibold uppercase tracking-wider"
                          onClick={() => onAction(comment.id, "approve")}
                        >
                          <Check className="h-3 w-3 mr-1.5" /> Approve
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-3 text-[10px] text-rose-600 hover:bg-rose-100 rounded-lg font-semibold uppercase tracking-wider"
                          onClick={() => onAction(comment.id, "delete")}
                        >
                          <Trash2 className="h-3 w-3 mr-1.5" /> Delete
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function RecentActivityPanel() {
  const activities = [
    {
      action: "Approved post",
      actor: "Admin User",
      time: "5m ago",
      icon: Check,
      variant: "success" as const,
    },
    {
      action: "Flagged comment",
      actor: "System",
      time: "12m ago",
      icon: Flag,
      variant: "warning" as const,
    },
    {
      action: "Hidden post",
      actor: "Admin User",
      time: "1h ago",
      icon: EyeOff,
      variant: "default" as const,
    },
    {
      action: "Deleted comment",
      actor: "Admin User",
      time: "2h ago",
      icon: Trash2,
      variant: "danger" as const,
    },
  ];

  const variantStyles = {
    default: "bg-muted text-muted-foreground",
    warning: "bg-amber-100 text-amber-600",
    danger: "bg-rose-100 text-rose-600",
    success: "bg-emerald-100 text-emerald-600",
  };

  return (
    <div className="space-y-2">
      {activities.map((item, idx) => (
        <motion.div
          key={`${item.action}-${item.time}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...smoothTransition, delay: idx * 0.08 }}
          whileHover={{ x: 4 }}
          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-all cursor-pointer"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={springTransition}
            className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center",
              variantStyles[item.variant],
            )}
          >
            <item.icon className="h-4 w-4" />
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-xs text-foreground truncate">
              {item.action}
            </p>
            <p className="text-[10px] text-muted-foreground">{item.actor}</p>
          </div>
          <span className="text-[10px] text-muted-foreground font-medium shrink-0">
            {item.time}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

export function ContentModerationStatsSection({
  stats,
}: {
  stats: ModerationStats;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
      <StatCard
        label="Total Posts"
        value={stats.totalPosts}
        icon={Activity}
        index={0}
      />
      <StatCard
        label="Flagged"
        value={stats.flaggedPosts}
        icon={Flag}
        variant="warning"
        index={1}
      />
      <StatCard
        label="Hidden"
        value={stats.hiddenPosts}
        icon={EyeOff}
        index={2}
      />
      <StatCard
        label="Pending"
        value={stats.pendingReview}
        icon={Clock}
        variant="warning"
        index={3}
      />
      <StatCard
        label="Comments"
        value={stats.totalComments}
        icon={MessageCircle}
        index={4}
      />
      <StatCard
        label="Flagged Comments"
        value={stats.flaggedComments}
        icon={AlertTriangle}
        variant={stats.flaggedComments > 0 ? "danger" : "default"}
        index={5}
      />
      <StatCard
        label="Actions Today"
        value={stats.actionsToday}
        icon={ShieldCheck}
        variant="success"
        index={6}
      />
    </div>
  );
}

export function ContentModerationTabsSection({
  activeTab,
  searchQuery,
  filterVisibility,
  filterType,
  sortBy,
  flaggedPosts,
  posts,
  isLoading,
  dispatchUi,
  onPostAction,
}: {
  activeTab: ModerationTab;
  searchQuery: string;
  filterVisibility: VisibilityFilter;
  filterType: PostTypeFilter;
  sortBy: SortOption;
  flaggedPosts: Post[];
  posts: Post[];
  isLoading: boolean;
  dispatchUi: React.Dispatch<ContentModerationUiAction>;
  onPostAction: (
    postId: string,
    action: ModerationAction,
    reason?: string,
  ) => void;
}) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        if (value === "moderation" || value === "all") {
          dispatchUi({ type: "set_active_tab", value });
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6"
      >
        <TabsList className="bg-muted/50 p-1 rounded-xl h-auto border backdrop-blur-sm">
          <TabsTrigger
            value="moderation"
            className="rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 font-semibold text-[9px] sm:text-[10px] uppercase tracking-wider data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all"
          >
            <ShieldAlert className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            Queue
            <AnimatePresence>
              {flaggedPosts.length > 0 && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={springTransition}
                >
                  <Badge className="ml-2 h-4 sm:h-5 px-1.5 sm:px-2 text-[8px] sm:text-[9px] bg-amber-500 text-white rounded-full font-semibold border-0">
                    {flaggedPosts.length}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 font-semibold text-[9px] sm:text-[10px] uppercase tracking-wider data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all"
          >
            <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            All Posts
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {activeTab === "all" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) =>
                    dispatchUi({
                      type: "set_search_query",
                      value: e.target.value,
                    })
                  }
                  className="pl-9 h-9 sm:h-10 w-full sm:w-56 lg:w-64 rounded-xl"
                />
                {searchQuery && (
                  <motion.button
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={() =>
                      dispatchUi({ type: "set_search_query", value: "" })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </motion.button>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 sm:h-10 gap-2 rounded-xl"
                    >
                      <Filter className="h-4 w-4" />
                      <span className="hidden sm:inline">Filter</span>
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 rounded-xl p-1.5"
                >
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-wider font-semibold px-2">
                    Visibility
                  </DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={filterVisibility === "all"}
                    onCheckedChange={() =>
                      dispatchUi({
                        type: "set_filter_visibility",
                        value: "all",
                      })
                    }
                    className="rounded-lg"
                  >
                    All
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterVisibility === "public"}
                    onCheckedChange={() =>
                      dispatchUi({
                        type: "set_filter_visibility",
                        value: "public",
                      })
                    }
                    className="rounded-lg"
                  >
                    Public
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterVisibility === "partners"}
                    onCheckedChange={() =>
                      dispatchUi({
                        type: "set_filter_visibility",
                        value: "partners",
                      })
                    }
                    className="rounded-lg"
                  >
                    Partners
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterVisibility === "private"}
                    onCheckedChange={() =>
                      dispatchUi({
                        type: "set_filter_visibility",
                        value: "private",
                      })
                    }
                    className="rounded-lg"
                  >
                    Private
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-wider font-semibold px-2">
                    Type
                  </DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={filterType === "all"}
                    onCheckedChange={() =>
                      dispatchUi({
                        type: "set_filter_type",
                        value: "all",
                      })
                    }
                    className="rounded-lg"
                  >
                    All Types
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterType === "update"}
                    onCheckedChange={() =>
                      dispatchUi({
                        type: "set_filter_type",
                        value: "update",
                      })
                    }
                    className="rounded-lg"
                  >
                    Updates
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterType === "prayer request"}
                    onCheckedChange={() =>
                      dispatchUi({
                        type: "set_filter_type",
                        value: "prayer request",
                      })
                    }
                    className="rounded-lg"
                  >
                    Prayer Requests
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterType === "story"}
                    onCheckedChange={() =>
                      dispatchUi({
                        type: "set_filter_type",
                        value: "story",
                      })
                    }
                    className="rounded-lg"
                  >
                    Stories
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterType === "announcement"}
                    onCheckedChange={() =>
                      dispatchUi({
                        type: "set_filter_type",
                        value: "announcement",
                      })
                    }
                    className="rounded-lg"
                  >
                    Announcements
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Select
                value={sortBy}
                onValueChange={(value) =>
                  dispatchUi({
                    type: "set_sort_by",
                    value: value as SortOption,
                  })
                }
              >
                <SelectTrigger className="h-9 sm:h-10 w-28 sm:w-36 rounded-xl">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="newest" className="rounded-lg">
                    Newest
                  </SelectItem>
                  <SelectItem value="oldest" className="rounded-lg">
                    Oldest
                  </SelectItem>
                  <SelectItem value="engagement" className="rounded-lg">
                    Engagement
                  </SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <TabsContent value="moderation" className="mt-0">
        <ModerationQueue
          posts={flaggedPosts}
          onAction={onPostAction}
          isLoading={isLoading}
        />
      </TabsContent>

      <TabsContent value="all" className="mt-0">
        <AllPostsFeed
          posts={posts}
          searchQuery={searchQuery}
          filterVisibility={filterVisibility}
          filterType={filterType}
          sortBy={sortBy}
          onAction={onPostAction}
        />
      </TabsContent>
    </Tabs>
  );
}

export function ContentModerationSidebarSection({
  flaggedComments,
  onCommentAction,
}: {
  flaggedComments: Comment[];
  onCommentAction: (commentId: string, action: "approve" | "delete") => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="xl:col-span-4 space-y-6"
    >
      <MotionCard
        whileHover={{ y: -2 }}
        transition={springTransition}
        className="rounded-2xl border shadow-sm"
      >
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={springTransition}
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-amber-100 flex items-center justify-center"
            >
              <MessageCircle className="h-5 w-5 text-amber-600" />
            </motion.div>
            <div>
              <h3 className="font-bold text-sm text-foreground">
                Flagged Comments
              </h3>
              <p className="text-xs text-muted-foreground">
                {flaggedComments.length} need review
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FlaggedCommentsPanel
            comments={flaggedComments}
            onAction={onCommentAction}
          />
        </CardContent>
      </MotionCard>

      <MotionCard
        whileHover={{ y: -2 }}
        transition={springTransition}
        className="rounded-2xl border shadow-sm"
      >
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={springTransition}
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-muted flex items-center justify-center"
            >
              <Clock className="h-5 w-5 text-muted-foreground" />
            </motion.div>
            <div>
              <h3 className="font-bold text-sm text-foreground">
                Recent Activity
              </h3>
              <p className="text-xs text-muted-foreground">
                Moderation actions
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RecentActivityPanel />
        </CardContent>
      </MotionCard>

      <MotionCard
        whileHover={{ y: -2, scale: 1.01 }}
        transition={springTransition}
        className="rounded-2xl border shadow-sm bg-gradient-to-br from-primary/5 to-primary/10"
      >
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              transition={springTransition}
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
            >
              <Sparkles className="h-5 w-5 text-primary" />
            </motion.div>
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-foreground">
                AI Moderation
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Automatic flagging is enabled. Content with potential policy
                violations will be queued for review.
              </p>
              <motion.div whileHover={{ x: 4 }}>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs font-semibold"
                >
                  Configure Settings <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </MotionCard>
    </motion.div>
  );
}

function ModerationQueuePostCard({
  post,
  index,
  onActionClick,
  onSelectPost,
}: {
  post: Post;
  index: number;
  onActionClick: (postId: string, action: ModerationAction) => void;
  onSelectPost: (post: Post) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, scale: 0.95 }}
      transition={{ ...smoothTransition, delay: index * 0.05 }}
    >
      <MotionCard
        whileHover={{ y: -2 }}
        transition={springTransition}
        className={cn(
          "rounded-2xl sm:rounded-3xl border shadow-sm hover:shadow-lg transition-[box-shadow,border-color] duration-[var(--duration-micro)] ease-[var(--ease-out-soft)] overflow-hidden",
          post.isFlagged && "border-amber-200",
        )}
      >
        <CardContent className="p-4 sm:p-6">
          <div className="flex gap-3 sm:gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={springTransition}
            >
              {post.author.role === "organization" ? (
                <BrandAvatar size="md" />
              ) : (
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 border-2 border-background shadow-md ring-1 ring-border">
                  <AvatarImage src={post.author.avatar_url} />
                  <AvatarFallback className="text-xs font-bold bg-muted text-muted-foreground">
                    {post.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
            </motion.div>

            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm sm:text-base text-foreground truncate">
                      {post.author.name}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[8px] sm:text-[9px] h-5 px-2 rounded-full shrink-0 font-semibold uppercase tracking-wider"
                    >
                      {post.post_type}
                    </Badge>
                    {post.isFlagged && (
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={springTransition}
                      >
                        <Badge
                          variant="destructive"
                          className="text-[8px] sm:text-[9px] h-5 px-2 gap-1 rounded-full shrink-0 font-semibold uppercase tracking-wider"
                        >
                          <Flag className="h-2.5 w-2.5" /> Flagged
                        </Badge>
                      </motion.div>
                    )}
                    {post.isPinned && (
                      <Badge
                        variant="outline"
                        className="text-[8px] sm:text-[9px] h-5 px-2 gap-1 rounded-full shrink-0 font-semibold uppercase tracking-wider"
                      >
                        <Pin className="h-2.5 w-2.5" /> Pinned
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground font-medium">
                      <TimeAgo date={post.created_at} shortFormat />
                    </span>
                    <span className="text-border">•</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                      {post.visibility === "public" ? (
                        <Globe className="h-3 w-3" />
                      ) : post.visibility === "partners" ? (
                        <Users className="h-3 w-3" />
                      ) : (
                        <Lock className="h-3 w-3" />
                      )}
                      <span className="capitalize hidden xs:inline">
                        {post.visibility}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-9 sm:w-9 text-emerald-600 hover:bg-emerald-100 rounded-xl"
                            onClick={() => onActionClick(post.id, "approve")}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent className="rounded-lg">
                        Approve
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-9 sm:w-9 text-amber-600 hover:bg-amber-100 rounded-xl"
                            onClick={() => onActionClick(post.id, "hide")}
                          >
                            <EyeOff className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent className="rounded-lg">
                        Hide Post
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-9 sm:w-9 text-rose-600 hover:bg-rose-100 rounded-xl"
                            onClick={() => onActionClick(post.id, "delete")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent className="rounded-lg">
                        Delete Post
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 rounded-xl p-1.5"
                    >
                      <DropdownMenuItem
                        onClick={() => onSelectPost(post)}
                        className="rounded-lg py-2.5 cursor-pointer gap-2.5"
                      >
                        <Eye className="h-4 w-4 text-muted-foreground" /> View
                        Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-lg py-2.5 cursor-pointer gap-2.5">
                        <Edit3 className="h-4 w-4 text-muted-foreground" /> Edit
                        Post
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="rounded-lg py-2.5 cursor-pointer gap-2.5">
                        <UserX className="h-4 w-4 text-muted-foreground" /> View
                        Author
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-amber-600 rounded-lg py-2.5 cursor-pointer gap-2.5">
                        <AlertTriangle className="h-4 w-4" /> Warn Author
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <AnimatePresence>
                {post.flagReason && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 rounded-xl text-amber-800 border border-amber-200"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-medium">
                      {post.flagReason}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <PostContent
                value={post.content}
                richTextClassName="prose prose-sm max-w-none text-sm text-foreground/80 line-clamp-2"
                htmlClassName="prose prose-sm max-w-none text-sm text-foreground/80 line-clamp-2"
              />

              {post.media && post.media.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex gap-2"
                >
                  {post.media.slice(0, 3).map((item) => (
                    <motion.div
                      key={`${post.id}-${item.type}-${item.url}`}
                      whileHover={{ scale: 1.05 }}
                      className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-xl overflow-hidden border shadow-sm"
                    >
                      <Image
                        src={item.url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </motion.div>
                  ))}
                  {post.media.length > 3 && (
                    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                      +{post.media.length - 3}
                    </div>
                  )}
                </motion.div>
              )}

              <div className="flex items-center gap-4 sm:gap-6 pt-1 text-xs text-muted-foreground font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-base">❤️</span>{" "}
                  {post.likes_count}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-base">🙏</span>{" "}
                  {post.prayers_count}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-base">🔥</span>{" "}
                  {post.fires_count}
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageCircle className="h-3.5 w-3.5" />{" "}
                  {post.comments_count}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </MotionCard>
    </motion.div>
  );
}

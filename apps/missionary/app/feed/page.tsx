"use client";
"use no memo";

import type { MediaItem } from "@asym/database/types";
import { SafeHtml } from "@asym/lib/components/safe-html";
import { TimeAgo, useLastSynced } from "@asym/lib/hooks";
import { AnimatePresence, LayoutGroup, motion } from "@asym/lib/motion";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@asym/ui/components/shadcn/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import { Switch } from "@asym/ui/components/shadcn/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@asym/ui/components/shadcn/tabs";
import { cn } from "@asym/ui/lib/utils";
import {
  Check,
  ChevronDown,
  Clock,
  CornerDownRight,
  ExternalLink,
  Globe,
  Image as ImageIcon,
  Loader2,
  Lock,
  MessageCircle,
  MoreHorizontal,
  Pin,
  Save,
  Send,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldHalf,
  Trash2,
  Users,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";

const RichTextEditor = dynamic(
  () =>
    import("@asym/ui/components/shadcn/RichTextEditor").then(
      (mod) => mod.RichTextEditor
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[250px] w-full animate-pulse rounded-2xl bg-muted" />
    ),
  }
);

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

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

type Visibility = "public" | "partners" | "private";
type SecurityLevel = "high" | "medium" | "low";
type AccessLevel = "view" | "comment";
type PostStatus = "published" | "draft";

type SecurityDialogState = {
  level: SecurityLevel;
  publicMirror: boolean;
  autoApproval: boolean;
};

type SecurityOption = {
  level: SecurityLevel;
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
  color: string;
  bgColor: string;
  borderColor: string;
  ringColor: string;
};

type WorkerFeedUiState = {
  postType: string;
  postContent: string;
  activeTab: PostStatus;
  isLoading: boolean;
  isSaving: boolean;
  editingPostId: string | null;
  lastSaved: Date | null;
  expandedComments: string | null;
  postPrivacy: Visibility;
  selectedMedia: MediaItem[];
  isUploading: boolean;
  securityLevel: SecurityLevel;
  isLoadingRequests: boolean;
};

const buildSecurityDialogState = (
  level: SecurityLevel
): SecurityDialogState => ({
  level,
  publicMirror: level === "low",
  autoApproval: level !== "high",
});

const SECURITY_OPTIONS: SecurityOption[] = [
  {
    level: "high",
    icon: ShieldAlert,
    title: "High Security",
    description:
      "Manual approval required for all followers. Full control over who sees your updates.",
    features: [
      "Manual follower approval",
      "Granular permissions",
      "Activity logging",
    ],
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    ringColor: "ring-rose-500/20",
  },
  {
    level: "medium",
    icon: ShieldHalf,
    title: "Balanced",
    description:
      "Auto-approve donors while maintaining control over non-donor followers.",
    features: [
      "Auto-approve donors",
      "Review non-donors",
      "Partner visibility",
    ],
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    ringColor: "ring-amber-500/20",
  },
  {
    level: "low",
    icon: Shield,
    title: "Open Access",
    description:
      "Public feed visible on your giving page. Maximum reach for your updates.",
    features: ["Public visibility", "Auto-sync to page", "Maximum engagement"],
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    ringColor: "ring-emerald-500/20",
  },
];

interface FollowerRequest {
  access_level: AccessLevel;
  avatar_url: string | null;
  created_at: string;
  donor_id: string;
  id: string;
  initials: string;
  is_donor: boolean;
  name: string;
  status: "pending" | "approved" | "rejected";
}

interface Post {
  author?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
  comments?: FeedComment[];
  content: string;
  created_at: string;
  fires_count?: number;
  id: string;
  isPinned?: boolean;
  likes_count?: number;
  media?: MediaItem[];
  post_type: string;
  prayers_count?: number;
  status: PostStatus;
  user_fired?: boolean;
  user_liked?: boolean;
  user_prayed?: boolean;
  visibility: Visibility;
}

interface FeedCommentAuthor {
  avatar_url?: string | null;
  full_name?: string;
}

interface FeedComment {
  author?: FeedCommentAuthor;
  avatar?: string | null;
  content: string;
  created_at: string;
  id: string;
  isWorker?: boolean;
  replies?: FeedComment[];
}

function createLocalCommentId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function appendCommentToThread(
  comments: FeedComment[],
  nextComment: FeedComment,
  parentId?: string
): FeedComment[] {
  if (!parentId) {
    return [...comments, nextComment];
  }

  return comments.map((comment) =>
    comment.id === parentId
      ? { ...comment, replies: [...(comment.replies || []), nextComment] }
      : comment
  );
}

function removeCommentFromThread(
  comments: FeedComment[],
  commentId: string,
  parentId?: string
): FeedComment[] {
  if (parentId) {
    return comments.map((comment) =>
      comment.id === parentId
        ? {
            ...comment,
            replies: (comment.replies || []).filter(
              (reply) => reply.id !== commentId
            ),
          }
        : comment
    );
  }

  return comments
    .filter((comment) => comment.id !== commentId)
    .map((comment) => ({
      ...comment,
      replies: (comment.replies || []).filter(
        (reply) => reply.id !== commentId
      ),
    }));
}

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

  const handleAction = async (action: "approve" | "ignore") => {
    setStatus("processing");

    try {
      const res = await fetch(`/api/follower-requests/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: action === "approve" ? "approved" : "rejected",
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update request");
      }

      setStatus(action === "approve" ? "approved" : "ignored");

      setTimeout(() => {
        setStatus("collapsing");
        setTimeout(() => {
          onResolve(request.id, action === "approve");
        }, 400);
      }, 1500);
    } catch (error) {
      console.error("Error resolving request:", error);
      setStatus("pending");
      toast.error("Failed to update request");
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "overflow-hidden px-4 py-3",
        status === "approved" || status === "ignored" ? "bg-muted/30" : ""
      )}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      initial={{ opacity: 0, x: -20 }}
      layout
      transition={{ ...smoothTransition, delay: index * 0.05 }}
    >
      <div className="flex items-start gap-3">
        <motion.div transition={springTransition} whileHover={{ scale: 1.05 }}>
          <Avatar className="h-9 w-9 shrink-0 border border-border/50 shadow-sm">
            <AvatarImage src={request.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-muted to-muted/50 font-bold text-[10px] text-muted-foreground">
              {request.initials}
            </AvatarFallback>
          </Avatar>
        </motion.div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p
                className="truncate font-semibold text-foreground text-sm leading-tight"
                title={request.name}
              >
                {request.name}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                {request.is_donor && (
                  <motion.div
                    animate={{ scale: 1 }}
                    initial={{ scale: 0.95, opacity: 0 }}
                    transition={springTransition}
                  >
                    <Badge
                      className="h-3.5 border-none bg-emerald-50 px-1 font-bold text-[7px] text-emerald-600 uppercase tracking-wider"
                      variant="secondary"
                    >
                      Donor
                    </Badge>
                  </motion.div>
                )}
                <TimeAgo
                  className="text-[9px] text-muted-foreground"
                  date={request.created_at}
                />
              </div>
            </div>
          </div>

          <div className="relative mt-2 h-8">
            <AnimatePresence mode="wait">
              {status === "pending" && (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute inset-0 flex gap-2"
                  exit={{ opacity: 0, y: -10 }}
                  initial={{ opacity: 0, y: 10 }}
                  key="pending"
                >
                  <motion.div
                    className="flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      className="h-8 w-full rounded-lg font-bold text-[9px] uppercase tracking-wider"
                      onClick={() => handleAction("approve")}
                      size="sm"
                      variant="maia"
                    >
                      Accept
                    </Button>
                  </motion.div>
                  <motion.div
                    className="flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      className="h-8 w-full rounded-lg font-bold text-[9px] uppercase tracking-wider"
                      onClick={() => handleAction("ignore")}
                      size="sm"
                      variant="maia-outline"
                    >
                      Ignore
                    </Button>
                  </motion.div>
                </motion.div>
              )}

              {status === "processing" && (
                <motion.div
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex h-full items-center justify-center"
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  key="processing"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  >
                    <Loader2 className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                </motion.div>
              )}

              {status === "approved" && (
                <motion.div
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex h-full items-center gap-1.5 text-emerald-600"
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  key="approved"
                  transition={springTransition}
                >
                  <motion.div
                    animate={{ scale: 1 }}
                    className="rounded-full bg-emerald-100 p-0.5"
                    initial={{ scale: 0.95, opacity: 0 }}
                    transition={{ ...springTransition, delay: 0.1 }}
                  >
                    <Check className="h-3 w-3" />
                  </motion.div>
                  <span className="font-bold text-[9px] uppercase tracking-wider">
                    Accepted
                  </span>
                </motion.div>
              )}

              {status === "ignored" && (
                <motion.div
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex h-full items-center gap-1.5 text-muted-foreground"
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  key="ignored"
                  transition={springTransition}
                >
                  <motion.div
                    animate={{ scale: 1 }}
                    className="rounded-full bg-muted p-0.5"
                    initial={{ scale: 0.95, opacity: 0 }}
                    transition={{ ...springTransition, delay: 0.1 }}
                  >
                    <X className="h-3 w-3" />
                  </motion.div>
                  <span className="font-bold text-[9px] uppercase tracking-wider">
                    Removed
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FloatingEmoji({
  emoji,
  offsetX,
  offsetRotate,
}: {
  emoji: string;
  offsetX: number;
  offsetRotate: number;
}) {
  return (
    <motion.div
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0, 1.8, 1.2, 0.8],
        y: [-20, -120],
        x: offsetX,
        rotate: offsetRotate,
      }}
      className="pointer-events-none absolute z-50 text-2xl drop-shadow-md filter"
      initial={{ opacity: 0, scale: 0.95, y: 0, x: 0 }}
      transition={{
        duration: 1.2,
        ease: "easeOut",
        times: [0, 0.2, 0.8, 1],
      }}
    >
      {emoji}
    </motion.div>
  );
}

function ReactionButton({
  isActive,
  count,
  type,
  label,
  onClick,
}: {
  isActive: boolean;
  count: number;
  type: "heart" | "fire" | "prayer";
  label: string;
  onClick: () => void;
}) {
  const [particles, setParticles] = useState<
    { id: number; emoji: string; offsetX: number; offsetRotate: number }[]
  >([]);

  const config = {
    heart: {
      emoji: "❤️",
      activeColor: "text-rose-600",
      bg: "bg-rose-50",
      hoverBg: "hover:bg-rose-50",
    },
    fire: {
      emoji: "🔥",
      activeColor: "text-amber-600",
      bg: "bg-amber-50",
      hoverBg: "hover:bg-amber-50",
    },
    prayer: {
      emoji: "🙏",
      activeColor: "text-indigo-600",
      bg: "bg-indigo-50",
      hoverBg: "hover:bg-indigo-50",
    },
  };

  const { emoji, activeColor, bg, hoverBg } = config[type];

  const handleClick = () => {
    if (!isActive) {
      const newParticles = Array.from({ length: 8 }).map((_, i) => ({
        id: Date.now() + i,
        emoji,
        offsetX: (Math.random() - 0.5) * 80,
        offsetRotate: (Math.random() - 0.5) * 90,
      }));
      setParticles((prev) => [...prev, ...newParticles]);
      setTimeout(() => {
        setParticles((prev) =>
          prev.filter((p) => !newParticles.find((np) => np.id === p.id))
        );
      }, 1500);
    }
    onClick();
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {particles.map((p) => (
          <FloatingEmoji
            emoji={p.emoji}
            key={p.id}
            offsetRotate={p.offsetRotate}
            offsetX={p.offsetX}
          />
        ))}
      </AnimatePresence>
      <motion.button
        className={cn(
          "relative flex items-center gap-1.5 overflow-hidden rounded-xl px-3 py-2 font-bold text-[11px] uppercase tracking-wide transition-all duration-300 sm:gap-2 sm:px-4 sm:text-xs",
          isActive
            ? cn(bg, activeColor, "shadow-sm ring-1 ring-black/5")
            : "border border-border bg-card text-muted-foreground",
          !isActive && hoverBg
        )}
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.92 }}
      >
        <motion.div
          animate={
            isActive
              ? {
                  scale: [1, 1.4, 1],
                  rotate: [0, 15, -15, 0],
                }
              : {}
          }
          className="relative z-10 select-none text-base sm:text-lg"
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {emoji}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.span
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 min-w-[1ch] tabular-nums"
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: 10 }}
            key={count}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {count > 0 ? count : label}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

function CommentSection({
  comments,
  onAddComment,
  onDeleteComment,
  canManageComments,
}: {
  comments: FeedComment[];
  onAddComment: (text: string, parentId?: string) => void;
  onDeleteComment: (commentId: string, parentId?: string) => void;
  canManageComments: boolean;
}) {
  const [text, setText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const submitReply = (parentId: string) => {
    if (replyText.trim()) {
      onAddComment(replyText, parentId);
      setReplyText("");
      setReplyingTo(null);
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="space-y-4 rounded-b-2xl border-border border-t bg-muted/30 p-4 sm:space-y-6 sm:p-6"
      initial={{ opacity: 0 }}
      transition={smoothTransition}
    >
      {comments.length > 0 ? (
        <motion.div
          animate="animate"
          className="space-y-4 sm:space-y-6"
          initial="initial"
          variants={staggerContainer}
        >
          {comments.map((comment, index) => (
            <motion.div
              className="group"
              key={comment.id}
              transition={{ delay: index * 0.05 }}
              variants={fadeInUp}
            >
              <div className="flex gap-3 text-sm sm:gap-4">
                <motion.div
                  transition={springTransition}
                  whileHover={{ scale: 1.05 }}
                >
                  <Avatar className="mt-1 h-8 w-8 border border-border bg-card shadow-sm sm:h-9 sm:w-9">
                    <AvatarFallback className="font-bold text-[10px] text-muted-foreground">
                      {comment.avatar || "U"}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <div className="flex-1 space-y-2">
                  <motion.div
                    className="relative inline-block min-w-[200px] rounded-2xl rounded-tl-none border border-border bg-card p-3 shadow-sm sm:min-w-[240px] sm:p-4"
                    whileHover={{ y: -1 }}
                  >
                    <div className="mb-1 flex items-center justify-between gap-2 sm:gap-4">
                      <span className="font-bold text-foreground text-xs">
                        {comment.author?.full_name || "Anonymous"}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[10px] text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                        {canManageComments && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="text-muted-foreground/50 transition-colors hover:text-destructive">
                                <MoreHorizontal className="h-3 w-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="rounded-xl border-border p-1 shadow-lg"
                            >
                              <DropdownMenuItem
                                className="rounded-lg font-bold text-[10px] text-destructive uppercase tracking-wider"
                                onClick={() => onDeleteComment(comment.id)}
                              >
                                <Trash2 className="mr-2 h-3 w-3" /> Delete
                                Comment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {comment.content}
                    </p>
                  </motion.div>
                  <div className="flex items-center gap-4 pl-3">
                    <motion.button
                      className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider transition-colors hover:text-foreground"
                      onClick={() =>
                        setReplyingTo(
                          replyingTo === comment.id ? null : comment.id
                        )
                      }
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Reply
                    </motion.button>
                    <motion.button
                      className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider transition-colors hover:text-rose-600"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Like
                    </motion.button>
                  </div>
                </div>
              </div>

              {comment.replies && comment.replies.length > 0 && (
                <motion.div
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 ml-8 space-y-4 border-border border-l-2 pl-4 sm:ml-10"
                  initial={{ opacity: 0, height: 0 }}
                >
                  {comment.replies.map((reply, replyIndex: number) => (
                    <motion.div
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3 text-sm sm:gap-4"
                      initial={{ opacity: 0, x: -10 }}
                      key={reply.id}
                      transition={{ delay: replyIndex * 0.05 }}
                    >
                      <Avatar className="mt-1 h-6 w-6 border border-border bg-card shadow-sm sm:h-7 sm:w-7">
                        <AvatarFallback className="font-bold text-[9px] text-muted-foreground">
                          {reply.author?.avatar_url || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div
                          className={cn(
                            "inline-block rounded-2xl rounded-tl-none p-3 shadow-sm",
                            reply.isWorker
                              ? "border border-blue-100 bg-blue-50 text-blue-900"
                              : "border border-border bg-card"
                          )}
                        >
                          <div className="mb-0.5 flex items-center justify-between gap-2 sm:gap-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[11px]">
                                {reply.author?.full_name || "Anonymous"}
                              </span>
                              {reply.isWorker && (
                                <Badge
                                  className="h-3.5 border-none bg-blue-100 px-1.5 font-bold text-[8px] text-blue-700 uppercase tracking-wider"
                                  variant="secondary"
                                >
                                  Author
                                </Badge>
                              )}
                            </div>
                            {canManageComments && (
                              <button
                                className="text-muted-foreground/50 opacity-0 transition-colors hover:text-destructive group-hover:opacity-100"
                                onClick={() =>
                                  onDeleteComment(reply.id, comment.id)
                                }
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed opacity-90">
                            {reply.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 pl-2">
                          <span className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                            {new Date(reply.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              <AnimatePresence>
                {replyingTo === comment.id && (
                  <motion.div
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 ml-10 flex gap-3 overflow-hidden sm:ml-14"
                    exit={{ opacity: 0, height: 0 }}
                    initial={{ opacity: 0, height: 0 }}
                  >
                    <div className="relative flex-1">
                      <Input
                        className="h-10 rounded-xl border-border bg-card pr-10 text-sm shadow-sm"
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && submitReply(comment.id)
                        }
                        placeholder={`Reply to ${comment.author?.full_name || "user"}...`}
                        value={replyText}
                      />
                      <motion.button
                        className="absolute top-2 right-2 rounded-lg p-1.5 text-primary transition-all hover:bg-muted disabled:opacity-50"
                        disabled={!replyText}
                        onClick={() => submitReply(comment.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <CornerDownRight className="h-4 w-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.p
          animate={{ opacity: 1 }}
          className="py-4 text-center font-medium text-muted-foreground text-xs uppercase tracking-wider"
          initial={{ opacity: 0 }}
        >
          No comments yet
        </motion.p>
      )}

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="relative pt-2"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.2 }}
      >
        <Input
          className="h-11 rounded-xl border-border bg-card pr-12 shadow-sm transition-all focus:border-ring sm:h-12"
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && text && (onAddComment(text), setText(""))
          }
          placeholder="Write a comment..."
          value={text}
        />
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            className="absolute top-1.5 right-1.5 h-8 w-8 rounded-lg bg-primary shadow-sm transition-all hover:bg-primary/90 sm:h-9 sm:w-9"
            onClick={() => {
              if (text) {
                onAddComment(text);
                setText("");
              }
            }}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function PostCard({
  post,
  onEdit,
  onDelete,
  onReaction,
  onAddComment,
  onDeleteComment,
  expandedComments,
  setExpandedComments,
  index,
}: {
  post: Post;
  onEdit: () => void;
  onDelete: () => void;
  onReaction: (type: "heart" | "fire" | "prayer") => void;
  onAddComment: (postId: string, text: string, parentId?: string) => void;
  onDeleteComment: (
    postId: string,
    commentId: string,
    parentId?: string
  ) => void;
  expandedComments: string | null;
  setExpandedComments: (id: string | null) => void;
  index: number;
}) {
  const authorName = post.author
    ? `${post.author.first_name} ${post.author.last_name}`
    : "Marcus Miller";
  const authorAvatar =
    post.author?.avatar_url ||
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80";
  const singleMedia = post.media?.at(0);

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      initial={{ opacity: 0, y: 30 }}
      layout
      transition={{ ...smoothTransition, delay: index * 0.08 }}
    >
      <MotionCard
        className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-500 hover:shadow-lg sm:rounded-3xl"
        transition={springTransition}
        whileHover={{ y: -2 }}
      >
        <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4 pb-3 sm:p-6 sm:pb-4">
          <div className="flex gap-3 sm:gap-4">
            <motion.div
              transition={springTransition}
              whileHover={{ scale: 1.05 }}
            >
              <Avatar className="h-10 w-10 border-2 border-background shadow-md ring-1 ring-border sm:h-12 sm:w-12">
                <AvatarImage src={authorAvatar} />
                <AvatarFallback>
                  {post.author?.first_name?.[0] || "M"}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h3 className="font-bold text-base text-foreground tracking-tight sm:text-lg">
                  {authorName}
                </h3>
                <motion.div
                  animate={{ scale: 1, opacity: 1 }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Badge className="rounded-full border-none bg-muted px-2 py-0.5 font-bold text-[9px] text-muted-foreground uppercase tracking-wider">
                    {post.post_type}
                  </Badge>
                </motion.div>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
                <span className="text-border">•</span>
                <span className="flex items-center gap-1.5 font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
                  {post.visibility === "public" ? (
                    <Globe className="h-3 w-3" />
                  ) : post.visibility === "partners" ? (
                    <Users className="h-3 w-3" />
                  ) : (
                    <Lock className="h-3 w-3" />
                  )}
                  <span className="xs:inline hidden">{post.visibility}</span>
                </span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  className="h-9 w-9 rounded-xl text-muted-foreground transition-all hover:text-foreground sm:h-10 sm:w-10"
                  size="icon"
                  variant="ghost"
                >
                  <MoreHorizontal className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="min-w-[160px] rounded-xl border-border p-2 shadow-lg sm:min-w-[180px]"
            >
              <DropdownMenuItem className="cursor-pointer gap-2.5 rounded-lg py-2.5 font-bold text-[10px] uppercase tracking-wider sm:gap-3 sm:py-3">
                <Pin className="h-3.5 w-3.5 text-muted-foreground" /> Pin to Top
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-2.5 rounded-lg py-2.5 font-bold text-[10px] uppercase tracking-wider sm:gap-3 sm:py-3"
                onClick={onEdit}
              >
                <Settings className="h-3.5 w-3.5 text-muted-foreground" /> Edit
                Post
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                className="cursor-pointer gap-2.5 rounded-lg py-2.5 font-bold text-[10px] text-destructive uppercase tracking-wider focus:bg-destructive/10 focus:text-destructive sm:gap-3 sm:py-3"
                onClick={onDelete}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="p-0">
          <motion.div
            animate={{ opacity: 1 }}
            className="space-y-4 px-4 pb-4 sm:space-y-6 sm:px-6 sm:pb-6"
            initial={{ opacity: 0 }}
            transition={{ delay: 0.1 }}
          >
            <SafeHtml
              className="prose prose-sm sm:prose-base max-w-none prose-blockquote:border-border prose-blockquote:border-l-4 prose-a:font-bold prose-headings:font-bold prose-strong:font-bold prose-a:text-primary prose-blockquote:text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground text-foreground/80 prose-blockquote:italic leading-relaxed prose-headings:tracking-tight prose-a:no-underline hover:prose-a:underline"
              html={post.content}
            />
            {post.media && post.media.length > 0 && (
              <motion.div
                animate={{ opacity: 1, scale: 1 }}
                className="overflow-hidden rounded-xl border border-border shadow-md transition-all duration-500 group-hover:shadow-lg sm:rounded-2xl"
                initial={{ opacity: 0, scale: 0.98 }}
                transition={{ delay: 0.15 }}
              >
                {post.media.length === 1 && singleMedia ? (
                  <div className="relative h-auto max-h-[400px] min-h-[200px] w-full sm:max-h-[600px]">
                    <Image
                      alt="Update"
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 100vw, 700px"
                      src={singleMedia.url}
                    />
                  </div>
                ) : (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {post.media.map((item, idx: number) => (
                        <CarouselItem key={`${item.type}-${item.url}`}>
                          <div className="relative h-auto max-h-[400px] min-h-[200px] w-full sm:max-h-[600px]">
                            <Image
                              alt={`Update ${idx + 1}`}
                              className="object-cover"
                              fill
                              sizes="(max-width: 768px) 100vw, 700px"
                              src={item.url}
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2 border-none bg-background/80 shadow-md transition-all hover:bg-background sm:left-4" />
                    <CarouselNext className="right-2 border-none bg-background/80 shadow-md transition-all hover:bg-background sm:right-4" />
                  </Carousel>
                )}
              </motion.div>
            )}
          </motion.div>

          <motion.div
            animate={{ opacity: 1 }}
            className="flex flex-col items-start justify-between gap-3 border-border border-t bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:gap-0 sm:px-6 sm:py-4"
            initial={{ opacity: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <ReactionButton
                count={post.likes_count || 0}
                isActive={post.user_liked}
                label="Love"
                onClick={() => onReaction("heart")}
                type="heart"
              />
              <ReactionButton
                count={post.fires_count || 0}
                isActive={post.user_fired}
                label="Hot"
                onClick={() => onReaction("fire")}
                type="fire"
              />
              <ReactionButton
                count={post.prayers_count || 0}
                isActive={post.user_prayed}
                label="Pray"
                onClick={() => onReaction("prayer")}
                type="prayer"
              />
            </div>
            <motion.button
              className="group/comm flex items-center gap-2 font-bold text-[11px] text-muted-foreground uppercase tracking-wider transition-all hover:text-foreground sm:gap-3 sm:text-xs"
              onClick={() =>
                setExpandedComments(
                  expandedComments === post.id ? null : post.id
                )
              }
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                animate={{ rotate: expandedComments === post.id ? 180 : 0 }}
                transition={springTransition}
              >
                <MessageCircle className="h-4 w-4 text-muted-foreground/50 sm:h-5 sm:w-5" />
              </motion.div>
              {(post.comments || []).length} comments
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {expandedComments === post.id && (
              <motion.div
                animate={{ height: "auto", opacity: 1 }}
                className="overflow-hidden"
                exit={{ height: 0, opacity: 0 }}
                initial={{ height: 0, opacity: 0 }}
                transition={smoothTransition}
              >
                <CommentSection
                  canManageComments={true}
                  comments={post.comments || []}
                  onAddComment={(text, parentId) =>
                    onAddComment(post.id, text, parentId)
                  }
                  onDeleteComment={(commentId, parentId) =>
                    onDeleteComment(post.id, commentId, parentId)
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </MotionCard>
    </motion.div>
  );
}

function LastSyncedDisplay() {
  const lastSynced = useLastSynced();
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="flex items-center gap-2 font-medium text-[10px] text-muted-foreground uppercase tracking-wider"
      initial={{ opacity: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Clock className="h-3.5 w-3.5" />
      {lastSynced ? `Last synced: ${lastSynced}` : "Syncing..."}
    </motion.div>
  );
}

function LoadingState() {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-4 py-16 sm:py-24"
      initial={{ opacity: 0 }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        <Loader2 className="h-10 w-10 text-muted-foreground/30 sm:h-12 sm:w-12" />
      </motion.div>
      <motion.p
        animate={{ opacity: 1, y: 0 }}
        className="font-bold text-muted-foreground/50 text-xs uppercase tracking-wider"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.2 }}
      >
        Loading Ministry Updates...
      </motion.p>
    </motion.div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border-2 border-border border-dashed bg-muted/20 py-20 text-center sm:rounded-3xl sm:py-32"
      initial={{ opacity: 0, scale: 0.95 }}
      transition={smoothTransition}
    >
      <motion.div
        animate={{ scale: 1 }}
        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-card shadow-md sm:mb-6 sm:h-20 sm:w-20"
        initial={{ scale: 0.8 }}
        transition={springTransition}
      >
        <Icon className="h-6 w-6 text-muted-foreground/30 sm:h-8 sm:w-8" />
      </motion.div>
      <motion.h3
        animate={{ opacity: 1, y: 0 }}
        className="font-bold text-foreground text-lg tracking-tight sm:text-2xl"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.1 }}
      >
        {title}
      </motion.h3>
      <motion.p
        animate={{ opacity: 1, y: 0 }}
        className="mt-2 font-medium text-muted-foreground text-sm sm:text-base"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.15 }}
      >
        {description}
      </motion.p>
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
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogState, setDialogState] = useState<SecurityDialogState>(() =>
    buildSecurityDialogState("medium")
  );
  const { level: localLevel, publicMirror, autoApproval } = dialogState;

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setDialogState(buildSecurityDialogState(securityLevel));
      }
      setIsOpen(open);
    },
    [securityLevel]
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
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            className="h-9 gap-2 px-4 font-medium text-xs"
            size="sm"
            variant="outline"
          >
            <ShieldCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Security & Access</span>
            <span className="sm:hidden">Security</span>
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="gap-0 overflow-hidden rounded-2xl border-border p-0 sm:max-w-[520px]">
        <DialogHeader className="border-border border-b bg-muted/30 px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="font-bold text-lg tracking-tight">
                Security & Access
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Control who can see your feed and updates
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-6 overflow-y-auto p-6">
          <div className="space-y-3">
            <Label className="font-black text-[10px] text-muted-foreground uppercase tracking-widest">
              Security Level
            </Label>
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
                      className={cn(
                        "w-full rounded-xl border-2 p-4 text-left transition-all duration-200",
                        isSelected
                          ? cn(borderColor, bgColor, "ring-2", ringColor)
                          : "border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/30"
                      )}
                      key={level}
                      onClick={() => handleLevelChange(level)}
                      type="button"
                      whileHover={{ scale: 1.005 }}
                      whileTap={{ scale: 0.995 }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                            isSelected
                              ? cn(bgColor, color)
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <span
                              className={cn(
                                "font-bold text-sm",
                                isSelected ? color : "text-foreground"
                              )}
                            >
                              {title}
                            </span>
                            {isSelected && (
                              <motion.div
                                animate={{ scale: 1 }}
                                initial={{ scale: 0.95, opacity: 0 }}
                                transition={springTransition}
                              >
                                <Badge
                                  className={cn(
                                    "h-5 border-0 px-1.5 font-black text-[8px] uppercase tracking-wider",
                                    bgColor,
                                    color
                                  )}
                                >
                                  Active
                                </Badge>
                              </motion.div>
                            )}
                          </div>
                          <p className="mb-2 text-muted-foreground text-xs leading-relaxed">
                            {description}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {features.map((feature) => (
                              <span
                                className={cn(
                                  "rounded-full px-2 py-0.5 font-bold text-[9px] uppercase tracking-wider",
                                  isSelected
                                    ? cn(bgColor, color)
                                    : "bg-muted text-muted-foreground"
                                )}
                                key={feature}
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                            isSelected
                              ? cn(borderColor, bgColor)
                              : "border-border"
                          )}
                        >
                          {isSelected && (
                            <motion.div
                              animate={{ scale: 1 }}
                              initial={{ scale: 0.95, opacity: 0 }}
                              transition={springTransition}
                            >
                              <Check className={cn("h-3 w-3", color)} />
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                }
              )}
            </div>
          </div>

          <div className="space-y-4 border-border border-t pt-4">
            <Label className="font-black text-[10px] text-muted-foreground uppercase tracking-widest">
              Quick Settings
            </Label>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                    <Globe className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <Label className="cursor-pointer font-bold text-xs">
                      Public Mirror
                    </Label>
                    <p className="text-[10px] text-muted-foreground">
                      Sync updates to your giving page
                    </p>
                  </div>
                </div>
                <Switch
                  checked={publicMirror}
                  onCheckedChange={handlePublicMirrorChange}
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <Label className="cursor-pointer font-bold text-xs">
                      Auto-Approve Donors
                    </Label>
                    <p className="text-[10px] text-muted-foreground">
                      Instantly accept donor follow requests
                    </p>
                  </div>
                </div>
                <Switch
                  checked={autoApproval}
                  onCheckedChange={handleAutoApprovalChange}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-border border-t bg-muted/20 px-6 py-4">
          <div className="flex w-full items-center gap-3">
            <Button
              className="h-10 flex-1 rounded-xl font-bold text-xs"
              onClick={() => setIsOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <motion.div
              className="flex-1"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Button
                className="h-10 w-full rounded-xl font-bold text-xs"
                disabled={isSaving}
                onClick={handleSave}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
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
  handlePost: (status?: PostStatus) => Promise<void>;
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

function PostComposerActions({
  selectedMedia,
  lastSaved,
  isUploading,
  isSaving,
  postPrivacy,
  postActionDisabled,
  setSelectedMedia,
  setPostPrivacy,
  simulateUpload,
  handlePost,
}: PostComposerActionsProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      <AnimatePresence>
        {selectedMedia.length > 0 && (
          <motion.div
            animate={{ opacity: 1, height: "auto" }}
            className="no-scrollbar flex gap-2 overflow-x-auto pb-2 sm:gap-3"
            exit={{ opacity: 0, height: 0 }}
            initial={{ opacity: 0, height: 0 }}
          >
            {selectedMedia.map((item, idx) => (
              <motion.div
                animate={{ opacity: 1, scale: 1 }}
                className="group/img relative shrink-0"
                exit={{ opacity: 0, scale: 0.8 }}
                initial={{ opacity: 0, scale: 0.8 }}
                key={`${item.type}-${item.url}`}
                transition={springTransition}
              >
                <Image
                  alt={`Attached media ${idx + 1}`}
                  className="h-14 w-14 rounded-lg border border-border object-cover shadow-sm sm:h-16 sm:w-16"
                  height={64}
                  src={item.url}
                  unoptimized
                  width={64}
                />
                <motion.button
                  className="absolute -top-1.5 -right-1.5 rounded-full bg-destructive p-0.5 text-destructive-foreground opacity-0 shadow-sm transition-opacity group-hover/img:opacity-100"
                  onClick={() =>
                    setSelectedMedia((prev) => prev.filter((_, i) => i !== idx))
                  }
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-3 w-3" />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex w-full flex-wrap items-center gap-2">
        <AnimatePresence>
          {lastSaved && (
            <motion.span
              animate={{ opacity: 1, x: 0 }}
              className="hidden font-medium text-[9px] text-muted-foreground uppercase tracking-wider md:inline-block"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0, x: -10 }}
            >
              Saved{" "}
              {lastSaved.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </motion.span>
          )}
        </AnimatePresence>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            className="h-8 gap-1.5 rounded-lg border border-border px-2.5 font-bold text-[9px] text-muted-foreground uppercase tracking-wider transition-all hover:bg-muted"
            disabled={isUploading}
            onClick={simulateUpload}
            size="sm"
            variant="ghost"
          >
            {isUploading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <Loader2 className="h-3 w-3" />
              </motion.div>
            ) : (
              <ImageIcon className="h-3 w-3" />
            )}
            <span className="hidden sm:inline">Media</span>
          </Button>
        </motion.div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="h-8 gap-1.5 rounded-lg border border-border px-2.5 font-bold text-[9px] text-muted-foreground uppercase tracking-wider transition-all hover:bg-muted"
                size="sm"
                variant="ghost"
              >
                {postPrivacy === "public" ? (
                  <Globe className="h-3 w-3" />
                ) : postPrivacy === "partners" ? (
                  <Users className="h-3 w-3" />
                ) : (
                  <Lock className="h-3 w-3" />
                )}
                <span className="hidden capitalize sm:inline">
                  {postPrivacy === "partners" ? "Partners" : postPrivacy}
                </span>
                <ChevronDown className="h-2.5 w-2.5 opacity-40" />
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="min-w-[160px] rounded-xl border-border p-1.5 shadow-lg"
          >
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg py-2 font-bold text-[9px] uppercase tracking-wider"
              onClick={() => setPostPrivacy("public")}
            >
              <Globe className="h-3.5 w-3.5 text-muted-foreground" />
              Public
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg py-2 font-bold text-[9px] uppercase tracking-wider"
              onClick={() => setPostPrivacy("partners")}
            >
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              Partners Only
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer gap-2 rounded-lg py-2 font-bold text-[9px] uppercase tracking-wider"
              onClick={() => setPostPrivacy("private")}
            >
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              Private
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1" />

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            className="h-8 rounded-lg px-2.5 text-[9px] uppercase tracking-wider sm:px-4"
            disabled={postActionDisabled}
            onClick={() => handlePost("draft")}
            size="sm"
            variant="maia-outline"
          >
            {isSaving ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <Loader2 className="h-3 w-3" />
              </motion.div>
            ) : (
              <Save className="h-3 w-3 sm:mr-1.5" />
            )}
            <span className="hidden sm:inline">Draft</span>
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            className="h-8 rounded-lg px-3 text-[9px] uppercase tracking-wider shadow-sm sm:px-5"
            disabled={postActionDisabled}
            onClick={() => handlePost("published")}
            size="sm"
            variant="maia"
          >
            {isSaving ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              >
                <Loader2 className="h-3 w-3" />
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
  handlePost,
}: PostComposerCardProps) {
  const isComposerEmpty =
    !postContent || postContent === "<p></p>" || postContent === "<p><br></p>";
  const postActionDisabled =
    isSaving || isUploading || (isComposerEmpty && selectedMedia.length === 0);

  return (
    <MotionCard
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-md sm:rounded-3xl"
      initial={{ opacity: 0, y: 20 }}
      transition={{ ...smoothTransition, delay: 0.15 }}
    >
      <div className="p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-6 sm:gap-3">
          {["Update", "Prayer Request", "Story", "Newsletter"].map(
            (type, index) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 10 }}
                key={type}
                transition={{ delay: 0.2 + index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className={cn(
                    "h-8 px-3 py-2 font-bold text-[9px] uppercase tracking-wider sm:h-9 sm:px-5 sm:text-[10px]",
                    postType === type && "shadow-md"
                  )}
                  onClick={() => setPostType(type)}
                  variant={postType === type ? "maia" : "maia-outline"}
                >
                  {type}
                </Button>
              </motion.div>
            )
          )}
          <AnimatePresence>
            {editingPostId && (
              <motion.div
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className="ml-auto rounded-xl font-bold text-[10px] text-destructive uppercase tracking-wider hover:bg-destructive/10"
                  onClick={() => {
                    setEditingPostId(null);
                    setPostContent("");
                  }}
                  size="sm"
                  variant="ghost"
                >
                  Cancel Edit
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex gap-3 sm:gap-4">
          <motion.div
            animate={{ scale: 1, opacity: 1 }}
            className="hidden sm:flex"
            initial={{ scale: 0.8, opacity: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Avatar className="h-9 w-9 shrink-0 border-2 border-border shadow-sm sm:h-11 sm:w-11">
              <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80" />
              <AvatarFallback className="font-bold text-sm">MF</AvatarFallback>
            </Avatar>
          </motion.div>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="min-w-0 flex-1 overflow-hidden rounded-xl border border-border transition-all focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20 sm:rounded-2xl"
            initial={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.3 }}
          >
            <RichTextEditor
              actions={
                <PostComposerActions
                  handlePost={handlePost}
                  isSaving={isSaving}
                  isUploading={isUploading}
                  lastSaved={lastSaved}
                  postActionDisabled={postActionDisabled}
                  postPrivacy={postPrivacy}
                  selectedMedia={selectedMedia}
                  setPostPrivacy={setPostPrivacy}
                  setSelectedMedia={setSelectedMedia}
                  simulateUpload={simulateUpload}
                />
              }
              className=""
              contentClassName="py-3 sm:py-4 px-3 sm:px-4 text-sm sm:text-base text-foreground placeholder:text-muted-foreground min-h-[100px] sm:min-h-[140px] leading-relaxed"
              onChange={setPostContent}
              placeholder={`What's happening? Share a ${postType.toLowerCase()}...`}
              proseInvert={false}
              toolbarPosition="bottom"
              value={postContent}
            />
          </motion.div>
        </div>
      </div>
    </MotionCard>
  );
}

type FeedPostsTabsSectionProps = {
  activeTab: PostStatus;
  drafts: Post[];
  posts: Post[];
  isLoading: boolean;
  expandedComments: string | null;
  setActiveTab: (value: React.SetStateAction<PostStatus>) => void;
  setExpandedComments: (value: React.SetStateAction<string | null>) => void;
  handleEditDraft: (draft: Post) => void;
  handleDeletePost: (postId: string) => Promise<void>;
  handleReaction: (
    postId: string,
    type: "heart" | "fire" | "prayer"
  ) => Promise<void>;
  handleAddComment: (postId: string, text: string, parentId?: string) => void;
  handleDeleteComment: (
    postId: string,
    commentId: string,
    parentId?: string
  ) => void;
};

function FeedPostsTabsSection({
  activeTab,
  drafts,
  posts,
  isLoading,
  expandedComments,
  setActiveTab,
  setExpandedComments,
  handleEditDraft,
  handleDeletePost,
  handleReaction,
  handleAddComment,
  handleDeleteComment,
}: FeedPostsTabsSectionProps) {
  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      <Tabs
        className="w-full"
        defaultValue="published"
        onValueChange={(v) => setActiveTab(v as PostStatus)}
        value={activeTab}
      >
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex flex-col items-start justify-between gap-3 sm:mb-6 sm:flex-row sm:items-center sm:gap-0"
          initial={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.35 }}
        >
          <TabsList className="h-auto rounded-xl border border-border bg-muted/50 p-1 backdrop-blur-sm">
            <TabsTrigger
              className="rounded-lg px-4 py-2 font-bold text-[10px] text-muted-foreground uppercase tracking-wider transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:px-6"
              value="published"
            >
              Published
            </TabsTrigger>
            <TabsTrigger
              className="flex items-center gap-2 rounded-lg px-4 py-2 font-bold text-[10px] text-muted-foreground uppercase tracking-wider transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:px-6"
              value="draft"
            >
              Drafts
              <AnimatePresence>
                {drafts.length > 0 && (
                  <motion.div
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    initial={{ scale: 0.95, opacity: 0 }}
                    transition={springTransition}
                  >
                    <Badge className="h-4 border-none bg-primary px-1 font-bold text-[8px] text-primary-foreground">
                      {drafts.length}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsTrigger>
          </TabsList>

          <LastSyncedDisplay />
        </motion.div>

        <TabsContent className="mt-0" value="published">
          <LayoutGroup>
            <motion.div className="space-y-6 sm:space-y-8 lg:space-y-10" layout>
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <LoadingState />
                ) : posts.length > 0 ? (
                  posts.map((post, index) => (
                    <PostCard
                      expandedComments={expandedComments}
                      index={index}
                      key={post.id}
                      onAddComment={handleAddComment}
                      onDelete={() => handleDeletePost(post.id)}
                      onDeleteComment={handleDeleteComment}
                      onEdit={() => handleEditDraft(post)}
                      onReaction={(type: "heart" | "fire" | "prayer") =>
                        handleReaction(post.id, type)
                      }
                      post={post}
                      setExpandedComments={setExpandedComments}
                    />
                  ))
                ) : (
                  <EmptyState
                    description="Start sharing your journey with your partners."
                    icon={Globe}
                    title="Your feed is empty"
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </LayoutGroup>
        </TabsContent>

        <TabsContent className="mt-0" value="draft">
          <LayoutGroup>
            <motion.div className="space-y-4 sm:space-y-6 lg:space-y-8" layout>
              <AnimatePresence mode="popLayout">
                {drafts.length > 0 ? (
                  drafts.map((draft, index) => (
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      className="group"
                      exit={{ opacity: 0, scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      key={draft.id}
                      layout
                      transition={{ ...smoothTransition, delay: index * 0.05 }}
                    >
                      <MotionCard
                        className="overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-500 hover:border-muted-foreground/30 hover:shadow-lg sm:rounded-3xl sm:p-6 lg:p-8"
                        transition={springTransition}
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:gap-6 lg:gap-8">
                          <div className="min-w-0 flex-1 space-y-3 sm:space-y-4">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                              <motion.div
                                animate={{ scale: 1, opacity: 1 }}
                                initial={{ scale: 0.9, opacity: 0 }}
                                transition={{ delay: 0.1 }}
                              >
                                <Badge className="rounded-full border-none bg-muted px-2 py-0.5 font-bold text-[8px] text-muted-foreground uppercase tracking-wider">
                                  Draft • {draft.post_type}
                                </Badge>
                              </motion.div>
                              <span className="font-medium text-[10px] text-muted-foreground">
                                Saved{" "}
                                {new Date(
                                  draft.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <SafeHtml
                              className="prose prose-sm sm:prose-base line-clamp-3 max-w-none text-foreground opacity-60"
                              html={draft.content}
                            />
                          </div>
                          <div className="flex w-full shrink-0 flex-row gap-2 sm:w-auto sm:flex-col">
                            <motion.div
                              className="flex-1 sm:flex-none"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button
                                className="h-9 w-full rounded-xl px-4 text-[10px] uppercase tracking-wider sm:h-10 sm:px-6"
                                onClick={() => handleEditDraft(draft)}
                                size="sm"
                                variant="maia"
                              >
                                <ExternalLink className="mr-2 h-3.5 w-3.5" />
                                <span className="hidden sm:inline">
                                  Edit & Publish
                                </span>
                                <span className="sm:hidden">Edit</span>
                              </Button>
                            </motion.div>
                            <motion.div
                              className="flex-1 sm:flex-none"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button
                                className="h-9 w-full rounded-xl font-bold text-[10px] text-destructive uppercase tracking-wider hover:bg-destructive/10 sm:h-10"
                                onClick={() => handleDeletePost(draft.id)}
                                size="sm"
                                variant="ghost"
                              >
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                Delete
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </MotionCard>
                    </motion.div>
                  ))
                ) : (
                  <EmptyState
                    description="Drafts allow you to perfect your updates before sharing."
                    icon={Save}
                    title="No drafts yet"
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
  handleResolveRequest: (id: string, approved: boolean) => void;
};

function FollowerRequestsCard({
  pendingRequests,
  isLoadingRequests,
  handleResolveRequest,
}: FollowerRequestsCardProps) {
  return (
    <MotionCard
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:rounded-3xl"
      initial={{ opacity: 0, y: 20 }}
      transition={{ delay: 0.25 }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="font-bold text-[11px] text-foreground uppercase tracking-wider">
          Follow Requests
        </h3>
        <AnimatePresence>
          {pendingRequests.length > 0 && (
            <motion.div
              animate={{ scale: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              initial={{ scale: 0.95, opacity: 0 }}
              transition={springTransition}
            >
              <Badge className="flex h-5 min-w-5 items-center justify-center rounded-full border-none bg-primary px-1.5 font-bold text-[10px] text-primary-foreground">
                {pendingRequests.length}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-border border-t">
        {isLoadingRequests ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-12"
            initial={{ opacity: 0 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            >
              <Loader2 className="h-5 w-5 text-muted-foreground" />
            </motion.div>
          </motion.div>
        ) : pendingRequests.length > 0 ? (
          <motion.div
            animate="animate"
            className="divide-y divide-border/50"
            initial="initial"
            variants={staggerContainer}
          >
            <AnimatePresence mode="popLayout">
              {pendingRequests.map((req, index) => (
                <FollowerRequestItem
                  index={index}
                  key={req.id}
                  onResolve={handleResolveRequest}
                  request={req}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="px-4 py-10 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            transition={smoothTransition}
          >
            <motion.div
              animate={{ scale: 1 }}
              className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50"
              initial={{ scale: 0.8 }}
              transition={springTransition}
            >
              <Check className="h-5 w-5 text-emerald-500" />
            </motion.div>
            <p className="font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
              All caught up!
            </p>
          </motion.div>
        )}
      </div>
    </MotionCard>
  );
}

function useWorkerFeedPageView() {
  const [uiState, setUiState] = useState<WorkerFeedUiState>({
    postType: "Update",
    postContent: "",
    activeTab: "published",
    isLoading: true,
    isSaving: false,
    editingPostId: null,
    lastSaved: null,
    expandedComments: null,
    postPrivacy: "public",
    selectedMedia: [],
    isUploading: false,
    securityLevel: "medium",
    isLoadingRequests: true,
  });
  const {
    postType,
    postContent,
    activeTab,
    isLoading,
    isSaving,
    editingPostId,
    lastSaved,
    expandedComments,
    postPrivacy,
    selectedMedia,
    isUploading,
    securityLevel,
    isLoadingRequests,
  } = uiState;

  const setUiField = useCallback(
    <K extends keyof WorkerFeedUiState>(
      key: K,
      value: React.SetStateAction<WorkerFeedUiState[K]>
    ) => {
      setUiState((prev) => ({
        ...prev,
        [key]:
          typeof value === "function"
            ? (
                value as (
                  prevValue: WorkerFeedUiState[K]
                ) => WorkerFeedUiState[K]
              )(prev[key])
            : value,
      }));
    },
    []
  );

  const setPostType = useCallback(
    (value: React.SetStateAction<string>) => setUiField("postType", value),
    [setUiField]
  );
  const setPostContent = useCallback(
    (value: React.SetStateAction<string>) => setUiField("postContent", value),
    [setUiField]
  );
  const setActiveTab = useCallback(
    (value: React.SetStateAction<PostStatus>) => setUiField("activeTab", value),
    [setUiField]
  );
  const setIsLoading = useCallback(
    (value: React.SetStateAction<boolean>) => setUiField("isLoading", value),
    [setUiField]
  );
  const setIsSaving = useCallback(
    (value: React.SetStateAction<boolean>) => setUiField("isSaving", value),
    [setUiField]
  );
  const setEditingPostId = useCallback(
    (value: React.SetStateAction<string | null>) =>
      setUiField("editingPostId", value),
    [setUiField]
  );
  const setLastSaved = useCallback(
    (value: React.SetStateAction<Date | null>) =>
      setUiField("lastSaved", value),
    [setUiField]
  );
  const setExpandedComments = useCallback(
    (value: React.SetStateAction<string | null>) =>
      setUiField("expandedComments", value),
    [setUiField]
  );
  const setPostPrivacy = useCallback(
    (value: React.SetStateAction<Visibility>) =>
      setUiField("postPrivacy", value),
    [setUiField]
  );
  const setSelectedMedia = useCallback(
    (value: React.SetStateAction<MediaItem[]>) =>
      setUiField("selectedMedia", value),
    [setUiField]
  );
  const setIsUploading = useCallback(
    (value: React.SetStateAction<boolean>) => setUiField("isUploading", value),
    [setUiField]
  );
  const setSecurityLevel = useCallback(
    (value: React.SetStateAction<SecurityLevel>) =>
      setUiField("securityLevel", value),
    [setUiField]
  );
  const setIsLoadingRequests = useCallback(
    (value: React.SetStateAction<boolean>) =>
      setUiField("isLoadingRequests", value),
    [setUiField]
  );

  const [posts, setPosts] = useState<Post[]>([]);
  const [drafts, setDrafts] = useState<Post[]>([]);
  const [followerRequests, setFollowerRequests] = useState<FollowerRequest[]>(
    []
  );

  const pendingRequests = useMemo(
    () => followerRequests.filter((f) => f.status === "pending"),
    [followerRequests]
  );

  const simulateUpload = async () => {
    setIsUploading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const demoImages = [
      "https://images.unsplash.com/photo-1541252260730-0412e8e2108e?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=1200",
    ];
    const randomImage =
      demoImages[Math.floor(Math.random() * demoImages.length)];
    if (!randomImage) {
      setIsUploading(false);
      toast.error("Failed to upload image");
      return;
    }
    setSelectedMedia((prev) => [...prev, { url: randomImage, type: "image" }]);
    setIsUploading(false);
    toast.success("Image uploaded successfully!");
  };

  const fetchPosts = useCallback(
    async (status: PostStatus = "published") => {
      try {
        const res = await fetch(`/api/posts?status=${status}`);
        const data = await res.json();
        if (status === "published") {
          setPosts(data.posts || []);
        } else {
          setDrafts(data.posts || []);
        }
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        toast.error("Could not load feed");
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading]
  );

  const fetchFollowerRequests = useCallback(async () => {
    try {
      setIsLoadingRequests(true);
      const res = await fetch("/api/follower-requests?status=pending");
      const data = await res.json();
      setFollowerRequests(data.requests || []);
    } catch (err) {
      console.error("Failed to fetch follower requests:", err);
    } finally {
      setIsLoadingRequests(false);
    }
  }, [setIsLoadingRequests]);

  useEffect(() => {
    fetchPosts("published");
    fetchPosts("draft");
    fetchFollowerRequests();
  }, [fetchPosts, fetchFollowerRequests]);

  const handlePost = useCallback(
    async (status: PostStatus = "published") => {
      const plainText = postContent.replace(/<[^>]*>?/gm, "").trim();
      if (!(plainText || postContent.includes("<img"))) {
        return;
      }

      setIsSaving(true);
      try {
        const method = editingPostId ? "PATCH" : "POST";
        const url = editingPostId
          ? `/api/posts/${editingPostId}`
          : "/api/posts";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: postContent,
            post_type: postType,
            visibility: postPrivacy,
            status,
            media: selectedMedia,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to save post");
        }

        const { post } = await res.json();

        if (status === "published") {
          if (editingPostId && activeTab === "draft") {
            setDrafts((prev) => prev.filter((d) => d.id !== editingPostId));
            setPosts((prev) => [post, ...prev]);
          } else {
            setPosts((prev) =>
              editingPostId
                ? prev.map((p) => (p.id === editingPostId ? post : p))
                : [post, ...prev]
            );
          }
          toast.success(
            editingPostId ? "Update updated!" : "Update published!"
          );
        } else {
          setDrafts((prev) =>
            editingPostId
              ? prev.map((p) => (p.id === editingPostId ? post : p))
              : [post, ...prev]
          );
          setLastSaved(new Date());
          toast.success("Draft saved!");
        }

        setPostContent("");
        setEditingPostId(null);
        setPostType("Update");
        setSelectedMedia([]);
      } catch (_err) {
        toast.error("Failed to save");
      } finally {
        setIsSaving(false);
      }
    },
    [
      activeTab,
      editingPostId,
      postContent,
      postPrivacy,
      postType,
      selectedMedia,
      setEditingPostId,
      setIsSaving,
      setLastSaved,
      setPostContent,
      setPostType,
      setSelectedMedia,
    ]
  );

  useEffect(() => {
    if (
      !postContent ||
      postContent === "<p></p>" ||
      postContent === "<p><br></p>" ||
      isSaving ||
      (activeTab === "published" && !editingPostId)
    ) {
      return;
    }

    const timer = setTimeout(() => {
      handlePost("draft");
    }, 30_000);

    return () => clearTimeout(timer);
  }, [activeTab, editingPostId, handlePost, isSaving, postContent]);

  const handleEditDraft = (draft: Post) => {
    setPostContent(draft.content);
    setPostType(draft.post_type);
    setPostPrivacy(draft.visibility);
    setEditingPostId(draft.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.info("Editing draft...");
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this?")) {
      return;
    }

    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setDrafts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("Post deleted");
    } catch (_err) {
      toast.error("Failed to delete");
    }
  };

  const handleResolveRequest = (id: string, approved: boolean) => {
    setFollowerRequests((prev) => prev.filter((f) => f.id !== id));
    toast.success(approved ? "Follower accepted" : "Request removed");
  };

  const handleAddComment = useCallback(
    (postId: string, text: string, parentId?: string) => {
      const trimmedText = text.trim();
      if (!trimmedText) {
        return;
      }

      const nextComment: FeedComment = {
        id: createLocalCommentId(),
        content: trimmedText,
        created_at: new Date().toISOString(),
        author: { full_name: "You" },
        isWorker: true,
        replies: [],
      };

      const updatePostCollection = (collection: Post[]) =>
        collection.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: appendCommentToThread(
                  post.comments || [],
                  nextComment,
                  parentId
                ),
              }
            : post
        );

      setPosts(updatePostCollection);
      setDrafts(updatePostCollection);
      toast.success("Comment published");
    },
    []
  );

  const handleDeleteComment = useCallback(
    (postId: string, commentId: string, parentId?: string) => {
      const updatePostCollection = (collection: Post[]) =>
        collection.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: removeCommentFromThread(
                  post.comments || [],
                  commentId,
                  parentId
                ),
              }
            : post
        );

      setPosts(updatePostCollection);
      setDrafts(updatePostCollection);
      toast.success("Comment deleted");
    },
    []
  );

  const handleReaction = async (
    postId: string,
    type: "heart" | "fire" | "prayer"
  ) => {
    const post = [...posts, ...drafts].find((p) => p.id === postId);
    if (!post) {
      return;
    }

    const endpointMap = { heart: "like", fire: "fire", prayer: "prayer" };
    const statusKeyMap = {
      heart: "user_liked",
      fire: "user_fired",
      prayer: "user_prayed",
    };
    const countKeyMap = {
      heart: "likes_count",
      fire: "fires_count",
      prayer: "prayers_count",
    };

    const endpoint = endpointMap[type];
    const statusKey = statusKeyMap[type] as keyof Post;
    const countKey = countKeyMap[type] as keyof Post;

    const isActive = post[statusKey];
    const method = isActive ? "DELETE" : "POST";

    const updatePosts = (prev: Post[]) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            [statusKey]: !isActive,
            [countKey]: Math.max(
              0,
              (Number(p[countKey]) || 0) + (isActive ? -1 : 1)
            ),
          };
        }
        return p;
      });

    setPosts(updatePosts);
    setDrafts(updatePosts);

    try {
      const res = await fetch(`/api/posts/${postId}/${endpoint}`, { method });
      if (!res.ok) {
        throw new Error("Failed to update reaction");
      }
    } catch (_err) {
      fetchPosts("published");
      fetchPosts("draft");
      toast.error("Failed to update reaction");
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="mx-auto max-w-[1500px] pb-20"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        description="Share updates with your supporters and stay connected."
        title="Ministry Updates"
      >
        <SecurityAccessDialog
          securityLevel={securityLevel}
          setSecurityLevel={setSecurityLevel}
        />
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12 lg:gap-10">
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6 sm:space-y-8 lg:col-span-9 lg:space-y-10"
          initial={{ opacity: 0, x: -20 }}
          transition={{ ...smoothTransition, delay: 0.1 }}
        >
          <PostComposerCard
            editingPostId={editingPostId}
            handlePost={handlePost}
            isSaving={isSaving}
            isUploading={isUploading}
            lastSaved={lastSaved}
            postContent={postContent}
            postPrivacy={postPrivacy}
            postType={postType}
            selectedMedia={selectedMedia}
            setEditingPostId={setEditingPostId}
            setPostContent={setPostContent}
            setPostPrivacy={setPostPrivacy}
            setPostType={setPostType}
            setSelectedMedia={setSelectedMedia}
            simulateUpload={simulateUpload}
          />

          <FeedPostsTabsSection
            activeTab={activeTab}
            drafts={drafts}
            expandedComments={expandedComments}
            handleAddComment={handleAddComment}
            handleDeleteComment={handleDeleteComment}
            handleDeletePost={handleDeletePost}
            handleEditDraft={handleEditDraft}
            handleReaction={handleReaction}
            isLoading={isLoading}
            posts={posts}
            setActiveTab={setActiveTab}
            setExpandedComments={setExpandedComments}
          />
        </motion.div>

        <motion.div
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6 sm:space-y-8 lg:col-span-3 lg:space-y-10"
          initial={{ opacity: 0, x: 20 }}
          transition={{ ...smoothTransition, delay: 0.2 }}
        >
          <FollowerRequestsCard
            handleResolveRequest={handleResolveRequest}
            isLoadingRequests={isLoadingRequests}
            pendingRequests={pendingRequests}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

function WorkerFeedPageView() {
  return useWorkerFeedPageView();
}

export default function WorkerFeed() {
  return <WorkerFeedPageView />;
}

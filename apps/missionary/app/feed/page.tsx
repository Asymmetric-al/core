"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@asym/ui/components/shadcn/carousel";
import {
  Send,
  MoreHorizontal,
  MessageCircle,
  Loader2,
  Globe,
  ChevronDown,
  X,
  Lock,
  Users,
  Check,
  CornerDownRight,
  ShieldCheck,
  ShieldAlert,
  ShieldHalf,
  Shield,
  Settings,
  Pin,
  Trash2,
  Save,
  Clock,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { Card, CardContent, CardHeader } from "@asym/ui/components/shadcn/card";
import { Button } from "@asym/ui/components/shadcn/button";
import { Avatar, AvatarFallback, AvatarImage } from "@asym/ui/components/shadcn/avatar";
import { Input } from "@asym/ui/components/shadcn/input";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Switch } from "@asym/ui/components/shadcn/switch";
import { Label } from "@asym/ui/components/shadcn/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@asym/ui/components/shadcn/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@asym/ui/components/shadcn/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@asym/ui/components/shadcn/dialog";
import { cn } from "@asym/lib/utils";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/page-header";
import { TimeAgo, useLastSynced, formatDate } from "@/hooks";
import { BrandAvatar, brandConfig } from "@/components/brand-logo";

const RichTextEditor = dynamic(
  () =>
    import("@asym/ui/components/shadcn/RichTextEditor").then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-[250px] w-full bg-muted rounded-2xl animate-pulse" />
    ),
  },
);

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
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

interface FollowerRequest {
  id: string;
  donor_id: string;
  name: string;
  avatar_url: string | null;
  is_donor: boolean;
  access_level: AccessLevel;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  initials: string;
}

interface Post {
  id: string;
  post_type: string;
  content: string;
  created_at: string;
  likes_count?: number;
  prayers_count?: number;
  fires_count?: number;
  comments?: any[];
  media?: any[];
  isPinned?: boolean;
  visibility: Visibility;
  status: PostStatus;
  user_liked?: boolean;
  user_prayed?: boolean;
  user_fired?: boolean;
  author?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url: string;
  };
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

      if (!res.ok) throw new Error("Failed to update request");

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
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ ...smoothTransition, delay: index * 0.05 }}
      className={cn(
        "px-4 py-3 overflow-hidden",
        status === "approved" || status === "ignored" ? "bg-muted/30" : "",
      )}
    >
      <div className="flex items-start gap-3">
        <motion.div whileHover={{ scale: 1.05 }} transition={springTransition}>
          <Avatar className="h-9 w-9 shrink-0 border border-border/50 shadow-sm">
            <AvatarImage src={request.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-muted to-muted/50 text-muted-foreground text-[10px] font-bold">
              {request.initials}
            </AvatarFallback>
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
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={springTransition}
                  >
                    <Badge
                      variant="secondary"
                      className="text-[7px] h-3.5 px-1 bg-emerald-50 text-emerald-600 border-none font-bold uppercase tracking-wider"
                    >
                      Donor
                    </Badge>
                  </motion.div>
                )}
                <TimeAgo
                  date={request.created_at}
                  className="text-[9px] text-muted-foreground"
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
                      variant="maia"
                      className="w-full h-8 text-[9px] uppercase tracking-wider rounded-lg font-bold"
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
                      variant="maia-outline"
                      className="w-full h-8 text-[9px] uppercase tracking-wider rounded-lg font-bold"
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
                    <Loader2 className="h-4 w-4 text-muted-foreground" />
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
                  className="flex items-center gap-1.5 h-full absolute inset-0 text-emerald-600"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ ...springTransition, delay: 0.1 }}
                    className="bg-emerald-100 rounded-full p-0.5"
                  >
                    <Check className="h-3 w-3" />
                  </motion.div>
                  <span className="text-[9px] font-bold uppercase tracking-wider">
                    Accepted
                  </span>
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
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ ...springTransition, delay: 0.1 }}
                    className="bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </motion.div>
                  <span className="text-[9px] font-bold uppercase tracking-wider">
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
      initial={{ opacity: 0, scale: 0, y: 0, x: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0, 1.8, 1.2, 0.8],
        y: [-20, -120],
        x: offsetX,
        rotate: offsetRotate,
      }}
      transition={{
        duration: 1.2,
        ease: "easeOut",
        times: [0, 0.2, 0.8, 1],
      }}
      className="absolute pointer-events-none z-50 text-2xl filter drop-shadow-md"
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
        emoji: emoji,
        offsetX: (Math.random() - 0.5) * 80,
        offsetRotate: (Math.random() - 0.5) * 90,
      }));
      setParticles((prev) => [...prev, ...newParticles]);
      setTimeout(() => {
        setParticles((prev) =>
          prev.filter((p) => !newParticles.find((np) => np.id === p.id)),
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
            key={p.id}
            emoji={p.emoji}
            offsetX={p.offsetX}
            offsetRotate={p.offsetRotate}
          />
        ))}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.92 }}
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        className={cn(
          "relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 font-bold text-[11px] sm:text-xs uppercase tracking-wide overflow-hidden",
          isActive
            ? cn(bg, activeColor, "shadow-sm ring-1 ring-black/5")
            : "text-muted-foreground bg-card border border-border",
          !isActive && hoverBg,
        )}
      >
        <motion.div
          className="text-base sm:text-lg relative z-10 select-none"
          animate={
            isActive
              ? {
                  scale: [1, 1.4, 1],
                  rotate: [0, 15, -15, 0],
                }
              : {}
          }
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {emoji}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.span
            key={count}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="relative z-10 tabular-nums min-w-[1ch]"
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
  comments: any[];
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={smoothTransition}
      className="bg-muted/30 rounded-b-2xl border-t border-border p-4 sm:p-6 space-y-4 sm:space-y-6"
    >
      {comments.length > 0 ? (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="space-y-4 sm:space-y-6"
        >
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              variants={fadeInUp}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <div className="flex gap-3 sm:gap-4 text-sm">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={springTransition}
                >
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9 bg-card border border-border mt-1 shadow-sm">
                    <AvatarFallback className="text-[10px] text-muted-foreground font-bold">
                      {comment.avatar || "U"}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <div className="flex-1 space-y-2">
                  <motion.div
                    whileHover={{ y: -1 }}
                    className="bg-card p-3 sm:p-4 rounded-2xl rounded-tl-none border border-border shadow-sm inline-block min-w-[200px] sm:min-w-[240px] relative"
                  >
                    <div className="flex items-center justify-between gap-2 sm:gap-4 mb-1">
                      <span className="font-bold text-foreground text-xs">
                        {comment.author?.full_name || "Anonymous"}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                        {canManageComments && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="text-muted-foreground/50 hover:text-destructive transition-colors">
                                <MoreHorizontal className="h-3 w-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="rounded-xl p-1 shadow-lg border-border"
                            >
                              <DropdownMenuItem
                                onClick={() => onDeleteComment(comment.id)}
                                className="text-destructive font-bold text-[10px] uppercase tracking-wider rounded-lg"
                              >
                                <Trash2 className="h-3 w-3 mr-2" /> Delete
                                Comment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {comment.content}
                    </p>
                  </motion.div>
                  <div className="flex items-center gap-4 pl-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider transition-colors"
                      onClick={() =>
                        setReplyingTo(
                          replyingTo === comment.id ? null : comment.id,
                        )
                      }
                    >
                      Reply
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-[10px] font-bold text-muted-foreground hover:text-rose-600 uppercase tracking-wider transition-colors"
                    >
                      Like
                    </motion.button>
                  </div>
                </div>
              </div>

              {comment.replies && comment.replies.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="ml-8 sm:ml-10 mt-4 space-y-4 pl-4 border-l-2 border-border"
                >
                  {comment.replies.map((reply: any, replyIndex: number) => (
                    <motion.div
                      key={reply.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: replyIndex * 0.05 }}
                      className="flex gap-3 sm:gap-4 text-sm"
                    >
                      <Avatar className="h-6 w-6 sm:h-7 sm:w-7 bg-card border border-border shadow-sm mt-1">
                        <AvatarFallback className="text-[9px] text-muted-foreground font-bold">
                          {reply.author?.avatar_url || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div
                          className={cn(
                            "p-3 rounded-2xl rounded-tl-none inline-block shadow-sm",
                            reply.isWorker
                              ? "bg-blue-50 border border-blue-100 text-blue-900"
                              : "bg-card border border-border",
                          )}
                        >
                          <div className="flex items-center justify-between gap-2 sm:gap-4 mb-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[11px]">
                                {reply.author?.full_name || "Anonymous"}
                              </span>
                              {reply.isWorker && (
                                <Badge
                                  variant="secondary"
                                  className="text-[8px] h-3.5 px-1.5 bg-blue-100 text-blue-700 border-none font-bold uppercase tracking-wider"
                                >
                                  Author
                                </Badge>
                              )}
                            </div>
                            {canManageComments && (
                              <button
                                onClick={() =>
                                  onDeleteComment(reply.id, comment.id)
                                }
                                className="text-muted-foreground/50 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
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
                          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
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
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-10 sm:ml-14 mt-4 flex gap-3 overflow-hidden"
                  >
                    <div className="relative flex-1">
                      <Input
                        autoFocus
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && submitReply(comment.id)
                        }
                        placeholder={`Reply to ${comment.author?.full_name || "user"}...`}
                        className="h-10 text-sm bg-card pr-10 rounded-xl shadow-sm border-border"
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => submitReply(comment.id)}
                        disabled={!replyText}
                        className="absolute right-2 top-2 p-1.5 text-primary hover:bg-muted rounded-lg disabled:opacity-50 transition-all"
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground font-medium uppercase tracking-wider text-center py-4"
        >
          No comments yet
        </motion.p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="pt-2 relative"
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="h-11 sm:h-12 pr-12 bg-card shadow-sm border-border focus:border-ring rounded-xl transition-all"
          onKeyDown={(e) =>
            e.key === "Enter" && text && (onAddComment(text), setText(""))
          }
        />
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="icon"
            className="absolute right-1.5 top-1.5 h-8 w-8 sm:h-9 sm:w-9 bg-primary hover:bg-primary/90 transition-all shadow-sm rounded-lg"
            onClick={() => {
              if (text) {
                onAddComment(text);
                setText("");
              }
            }}
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
  expandedComments,
  setExpandedComments,
  index,
}: {
  post: Post;
  onEdit: () => void;
  onDelete: () => void;
  onReaction: (type: "heart" | "fire" | "prayer") => void;
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
        className="overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-500 rounded-2xl sm:rounded-3xl group bg-card"
      >
        <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 flex flex-row items-start justify-between space-y-0">
          <div className="flex gap-3 sm:gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={springTransition}
            >
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-background shadow-md ring-1 ring-border">
                <AvatarImage src={authorAvatar} />
                <AvatarFallback>
                  {post.author?.first_name?.[0] || "M"}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h3 className="font-bold text-foreground text-base sm:text-lg tracking-tight">
                  {authorName}
                </h3>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Badge className="bg-muted text-muted-foreground border-none font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                    {post.post_type}
                  </Badge>
                </motion.div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
                <span className="text-border">•</span>
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  {post.visibility === "public" ? (
                    <Globe className="h-3 w-3" />
                  ) : post.visibility === "partners" ? (
                    <Users className="h-3 w-3" />
                  ) : (
                    <Lock className="h-3 w-3" />
                  )}
                  <span className="hidden xs:inline">{post.visibility}</span>
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
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 sm:h-10 sm:w-10 text-muted-foreground hover:text-foreground rounded-xl transition-all"
                >
                  <MoreHorizontal className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="rounded-xl border-border shadow-lg p-2 min-w-[160px] sm:min-w-[180px]"
            >
              <DropdownMenuItem className="font-bold text-[10px] uppercase tracking-wider rounded-lg py-2.5 sm:py-3 cursor-pointer gap-2.5 sm:gap-3">
                <Pin className="h-3.5 w-3.5 text-muted-foreground" /> Pin to Top
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onEdit}
                className="font-bold text-[10px] uppercase tracking-wider rounded-lg py-2.5 sm:py-3 cursor-pointer gap-2.5 sm:gap-3"
              >
                <Settings className="h-3.5 w-3.5 text-muted-foreground" /> Edit
                Post
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={onDelete}
                className="font-bold text-[10px] uppercase tracking-wider rounded-lg py-2.5 sm:py-3 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer gap-2.5 sm:gap-3"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6"
          >
            <div
              className="prose prose-sm sm:prose-base max-w-none text-foreground/80 leading-relaxed
                        prose-headings:font-bold prose-headings:text-foreground prose-headings:tracking-tight
                        prose-strong:font-bold prose-strong:text-foreground
                        prose-a:text-primary prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                        prose-blockquote:border-l-4 prose-blockquote:border-border prose-blockquote:italic prose-blockquote:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            {post.media && post.media.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="rounded-xl sm:rounded-2xl overflow-hidden border border-border shadow-md group-hover:shadow-lg transition-all duration-500"
              >
                {post.media.length === 1 ? (
                  <div className="relative w-full h-auto min-h-[200px] max-h-[400px] sm:max-h-[600px]">
                    <Image
                      src={post.media[0].url}
                      alt="Update"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 700px"
                    />
                  </div>
                ) : (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {post.media.map((item: any, idx: number) => (
                        <CarouselItem key={idx}>
                          <div className="relative w-full h-auto min-h-[200px] max-h-[400px] sm:max-h-[600px]">
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
                    <CarouselPrevious className="left-2 sm:left-4 bg-background/80 border-none hover:bg-background transition-all shadow-md" />
                    <CarouselNext className="right-2 sm:right-4 bg-background/80 border-none hover:bg-background transition-all shadow-md" />
                  </Carousel>
                )}
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0"
          >
            <div className="flex gap-1.5 sm:gap-2 flex-wrap">
              <ReactionButton
                isActive={post.user_liked || false}
                count={post.likes_count || 0}
                type="heart"
                label="Love"
                onClick={() => onReaction("heart")}
              />
              <ReactionButton
                isActive={post.user_fired || false}
                count={post.fires_count || 0}
                type="fire"
                label="Hot"
                onClick={() => onReaction("fire")}
              />
              <ReactionButton
                isActive={post.user_prayed || false}
                count={post.prayers_count || 0}
                type="prayer"
                label="Pray"
                onClick={() => onReaction("prayer")}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-all group/comm"
              onClick={() =>
                setExpandedComments(
                  expandedComments === post.id ? null : post.id,
                )
              }
            >
              <motion.div
                animate={{ rotate: expandedComments === post.id ? 180 : 0 }}
                transition={springTransition}
              >
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50" />
              </motion.div>
              {(post.comments || []).length} comments
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {expandedComments === post.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={smoothTransition}
                className="overflow-hidden"
              >
                <CommentSection
                  comments={post.comments || []}
                  canManageComments={true}
                  onAddComment={() => {
                    toast.success("Comment published");
                  }}
                  onDeleteComment={() => {}}
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
    >
      <Clock className="h-3.5 w-3.5" />
      {lastSynced ? `Last synced: ${lastSynced}` : "Syncing..."}
    </motion.div>
  );
}

function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 sm:py-24 gap-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/30" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-bold text-xs uppercase tracking-wider text-muted-foreground/50"
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={smoothTransition}
      className="text-center py-20 sm:py-32 bg-muted/20 rounded-2xl sm:rounded-3xl border-2 border-dashed border-border"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={springTransition}
        className="w-16 h-16 sm:w-20 sm:h-20 bg-card rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-md"
      >
        <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/30" />
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="font-bold text-lg sm:text-2xl text-foreground tracking-tight"
      >
        {title}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-muted-foreground font-medium mt-2 text-sm sm:text-base"
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
  const [localLevel, setLocalLevel] = useState<SecurityLevel>(securityLevel);
  const [publicMirror, setPublicMirror] = useState(securityLevel === "low");
  const [autoApproval, setAutoApproval] = useState(securityLevel !== "high");

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        setLocalLevel(securityLevel);
        setPublicMirror(securityLevel === "low");
        setAutoApproval(securityLevel !== "high");
      }
      setIsOpen(open);
    },
    [securityLevel],
  );

  const handleLevelChange = (level: SecurityLevel) => {
    setLocalLevel(level);
    setPublicMirror(level === "low");
    setAutoApproval(level !== "high");
  };

  const handlePublicMirrorChange = (checked: boolean) => {
    setPublicMirror(checked);
    if (checked) {
      setLocalLevel("low");
      setAutoApproval(true);
    } else if (localLevel === "low") {
      setLocalLevel("medium");
    }
  };

  const handleAutoApprovalChange = (checked: boolean) => {
    setAutoApproval(checked);
    if (!checked) {
      setLocalLevel("high");
      setPublicMirror(false);
    } else if (localLevel === "high") {
      setLocalLevel("medium");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSecurityLevel(localLevel);
    setIsSaving(false);
    setIsOpen(false);
    toast.success("Security settings saved");
  };

  const securityOptions = [
    {
      level: "high" as SecurityLevel,
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
      level: "medium" as SecurityLevel,
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
      level: "low" as SecurityLevel,
      icon: Shield,
      title: "Open Access",
      description:
        "Public feed visible on your giving page. Maximum reach for your updates.",
      features: [
        "Public visibility",
        "Auto-sync to page",
        "Maximum engagement",
      ],
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      ringColor: "ring-emerald-500/20",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-4 text-xs font-medium gap-2"
          >
            <ShieldCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Security & Access</span>
            <span className="sm:hidden">Security</span>
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden gap-0 rounded-2xl border-border">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight">
                Security & Access
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Control who can see your feed and updates
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Security Level
            </Label>
            <div className="space-y-3">
              {securityOptions.map(
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
                        "w-full text-left p-4 rounded-xl border-2 transition-all duration-200",
                        isSelected
                          ? cn(borderColor, bgColor, "ring-2", ringColor)
                          : "border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/30",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                            isSelected
                              ? cn(bgColor, color)
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={cn(
                                "font-bold text-sm",
                                isSelected ? color : "text-foreground",
                              )}
                            >
                              {title}
                            </span>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={springTransition}
                              >
                                <Badge
                                  className={cn(
                                    "h-5 px-1.5 text-[8px] font-black uppercase tracking-wider border-0",
                                    bgColor,
                                    color,
                                  )}
                                >
                                  Active
                                </Badge>
                              </motion.div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                            {description}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {features.map((feature) => (
                              <span
                                key={feature}
                                className={cn(
                                  "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
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
                            "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                            isSelected
                              ? cn(borderColor, bgColor)
                              : "border-border",
                          )}
                        >
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={springTransition}
                            >
                              <Check className={cn("h-3 w-3", color)} />
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

          <div className="space-y-4 pt-4 border-t border-border">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Quick Settings
            </Label>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Globe className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <Label className="text-xs font-bold cursor-pointer">
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

              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <Label className="text-xs font-bold cursor-pointer">
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

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20">
          <div className="flex items-center gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1 h-10 rounded-xl text-xs font-bold"
            >
              Cancel
            </Button>
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="flex-1"
            >
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full h-10 rounded-xl text-xs font-bold"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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

export default function WorkerFeed() {
  const [postType, setPostType] = useState("Update");
  const [postContent, setPostContent] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [drafts, setDrafts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<PostStatus>("published");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [postPrivacy, setPostPrivacy] = useState<Visibility>("public");
  const [selectedMedia, setSelectedMedia] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [securityLevel, setSecurityLevel] = useState<SecurityLevel>("medium");
  const [followerRequests, setFollowerRequests] = useState<FollowerRequest[]>(
    [],
  );
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);

  const pendingRequests = useMemo(
    () => followerRequests.filter((f) => f.status === "pending"),
    [followerRequests],
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
    setSelectedMedia((prev) => [...prev, { url: randomImage, type: "image" }]);
    setIsUploading(false);
    toast.success("Image uploaded successfully!");
  };

  const fetchPosts = useCallback(async (status: PostStatus = "published") => {
    try {
      const res = await fetch(`/api/posts?status=${status}`);
      const data = await res.json();
      if (status === "published") setPosts(data.posts || []);
      else setDrafts(data.posts || []);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      toast.error("Could not load feed");
    } finally {
      setIsLoading(false);
    }
  }, []);

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
  }, []);

  useEffect(() => {
    fetchPosts("published");
    fetchPosts("draft");
    fetchFollowerRequests();
  }, [fetchPosts, fetchFollowerRequests]);

  useEffect(() => {
    if (
      !postContent ||
      postContent === "<p></p>" ||
      postContent === "<p><br></p>" ||
      isSaving ||
      (activeTab === "published" && !editingPostId)
    )
      return;

    const timer = setTimeout(() => {
      handlePost("draft");
    }, 30000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally only trigger on postContent changes for auto-save debounce
  }, [postContent]);

  const handlePost = async (status: PostStatus = "published") => {
    const plainText = postContent.replace(/<[^>]*>?/gm, "").trim();
    if (!plainText && !postContent.includes("<img")) return;

    setIsSaving(true);
    try {
      const method = editingPostId ? "PATCH" : "POST";
      const url = editingPostId ? `/api/posts/${editingPostId}` : "/api/posts";

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

      if (!res.ok) throw new Error("Failed to save post");

      const { post } = await res.json();

      if (status === "published") {
        if (editingPostId && activeTab === "draft") {
          setDrafts((prev) => prev.filter((d) => d.id !== editingPostId));
          setPosts((prev) => [post, ...prev]);
        } else {
          setPosts((prev) =>
            editingPostId
              ? prev.map((p) => (p.id === editingPostId ? post : p))
              : [post, ...prev],
          );
        }
        toast.success(editingPostId ? "Update updated!" : "Update published!");
      } else {
        setDrafts((prev) =>
          editingPostId
            ? prev.map((p) => (p.id === editingPostId ? post : p))
            : [post, ...prev],
        );
        setLastSaved(new Date());
        toast.success("Draft saved!");
      }

      setPostContent("");
      setEditingPostId(null);
      setPostType("Update");
      setSelectedMedia([]);
    } catch (err) {
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditDraft = (draft: Post) => {
    setPostContent(draft.content);
    setPostType(draft.post_type);
    setPostPrivacy(draft.visibility);
    setEditingPostId(draft.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.info("Editing draft...");
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;

    try {
      const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");

      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setDrafts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("Post deleted");
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleResolveRequest = (id: string, approved: boolean) => {
    setFollowerRequests((prev) => prev.filter((f) => f.id !== id));
    toast.success(approved ? "Follower accepted" : "Request removed");
  };

  const handleReaction = async (
    postId: string,
    type: "heart" | "fire" | "prayer",
  ) => {
    const post = [...posts, ...drafts].find((p) => p.id === postId);
    if (!post) return;

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
              (Number(p[countKey]) || 0) + (isActive ? -1 : 1),
            ),
          };
        }
        return p;
      });

    setPosts(updatePosts);
    setDrafts(updatePosts);

    try {
      const res = await fetch(`/api/posts/${postId}/${endpoint}`, { method });
      if (!res.ok) throw new Error("Failed to update reaction");
    } catch (err) {
      fetchPosts("published");
      fetchPosts("draft");
      toast.error("Failed to update reaction");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-[1500px] mx-auto pb-20"
    >
      <PageHeader
        title="Ministry Updates"
        description="Share updates with your supporters and stay connected."
      >
        <SecurityAccessDialog
          securityLevel={securityLevel}
          setSecurityLevel={setSecurityLevel}
        />
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...smoothTransition, delay: 0.1 }}
          className="lg:col-span-9 space-y-6 sm:space-y-8 lg:space-y-10"
        >
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...smoothTransition, delay: 0.15 }}
            className="overflow-hidden border border-border shadow-md rounded-2xl sm:rounded-3xl bg-card"
          >
            <div className="p-4 sm:p-6">
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
                        variant={postType === type ? "maia" : "maia-outline"}
                        onClick={() => setPostType(type)}
                        className={cn(
                          "px-3 sm:px-5 py-2 h-8 sm:h-9 text-[9px] sm:text-[10px] uppercase tracking-wider font-bold",
                          postType === type && "shadow-md",
                        )}
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
                        className="ml-auto text-destructive font-bold text-[10px] uppercase tracking-wider hover:bg-destructive/10 rounded-xl"
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
                  <Avatar className="h-9 w-9 sm:h-11 sm:w-11 border-2 border-border shadow-sm shrink-0">
                    <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80" />
                    <AvatarFallback className="font-bold text-sm">
                      MF
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex-1 min-w-0 rounded-xl sm:rounded-2xl border border-border overflow-hidden focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-ring transition-all"
                >
                  <RichTextEditor
                    value={postContent}
                    onChange={setPostContent}
                    placeholder={`What's happening? Share a ${postType.toLowerCase()}...`}
                    className=""
                    contentClassName="py-3 sm:py-4 px-3 sm:px-4 text-sm sm:text-base text-foreground placeholder:text-muted-foreground min-h-[100px] sm:min-h-[140px] leading-relaxed"
                    toolbarPosition="bottom"
                    proseInvert={false}
                    actions={
                      <div className="flex flex-col gap-3 w-full">
                        <AnimatePresence>
                          {selectedMedia.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-2"
                            >
                              {selectedMedia.map((item, idx) => (
                                <motion.div
                                  key={idx}
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
                                    className="h-14 w-14 sm:h-16 sm:w-16 object-cover rounded-lg border border-border shadow-sm"
                                  />
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() =>
                                      setSelectedMedia((prev) =>
                                        prev.filter((_, i) => i !== idx),
                                      )
                                    }
                                    className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity shadow-sm"
                                  >
                                    <X className="h-3 w-3" />
                                  </motion.button>
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
                                className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider hidden md:inline-block"
                              >
                                Saved{" "}
                                {lastSaved.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </motion.span>
                            )}
                          </AnimatePresence>

                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isUploading}
                              onClick={simulateUpload}
                              className="h-8 text-muted-foreground gap-1.5 font-bold text-[9px] uppercase tracking-wider hover:bg-muted rounded-lg px-2.5 border border-border transition-all"
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
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-muted-foreground gap-1.5 font-bold text-[9px] uppercase tracking-wider hover:bg-muted rounded-lg px-2.5 border border-border transition-all"
                                >
                                  {postPrivacy === "public" ? (
                                    <Globe className="h-3 w-3" />
                                  ) : postPrivacy === "partners" ? (
                                    <Users className="h-3 w-3" />
                                  ) : (
                                    <Lock className="h-3 w-3" />
                                  )}
                                  <span className="hidden sm:inline capitalize">
                                    {postPrivacy === "partners"
                                      ? "Partners"
                                      : postPrivacy}
                                  </span>
                                  <ChevronDown className="h-2.5 w-2.5 opacity-40" />
                                </Button>
                              </motion.div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="start"
                              className="rounded-xl border-border shadow-lg p-1.5 min-w-[160px]"
                            >
                              <DropdownMenuItem
                                onClick={() => setPostPrivacy("public")}
                                className="font-bold text-[9px] uppercase tracking-wider rounded-lg py-2 cursor-pointer gap-2"
                              >
                                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                                Public
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setPostPrivacy("partners")}
                                className="font-bold text-[9px] uppercase tracking-wider rounded-lg py-2 cursor-pointer gap-2"
                              >
                                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                Partners Only
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setPostPrivacy("private")}
                                className="font-bold text-[9px] uppercase tracking-wider rounded-lg py-2 cursor-pointer gap-2"
                              >
                                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                                Private
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <div className="flex-1" />

                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              onClick={() => handlePost("draft")}
                              variant="maia-outline"
                              size="sm"
                              disabled={
                                isSaving ||
                                isUploading ||
                                ((!postContent ||
                                  postContent === "<p></p>" ||
                                  postContent === "<p><br></p>") &&
                                  selectedMedia.length === 0)
                              }
                              className="h-8 px-2.5 sm:px-4 text-[9px] uppercase tracking-wider rounded-lg"
                            >
                              {isSaving ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
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

                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              onClick={() => handlePost("published")}
                              variant="maia"
                              size="sm"
                              disabled={
                                isSaving ||
                                isUploading ||
                                ((!postContent ||
                                  postContent === "<p></p>" ||
                                  postContent === "<p><br></p>") &&
                                  selectedMedia.length === 0)
                              }
                              className="h-8 px-3 sm:px-5 text-[9px] uppercase tracking-wider rounded-lg shadow-sm"
                            >
                              {isSaving ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
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
                    }
                  />
                </motion.div>
              </div>
            </div>
          </MotionCard>

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
                <TabsList className="bg-muted/50 p-1 rounded-xl h-auto border border-border backdrop-blur-sm">
                  <TabsTrigger
                    value="published"
                    className="rounded-lg px-4 sm:px-6 py-2 font-bold text-[10px] uppercase tracking-wider data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all"
                  >
                    Published
                  </TabsTrigger>
                  <TabsTrigger
                    value="draft"
                    className="rounded-lg px-4 sm:px-6 py-2 font-bold text-[10px] uppercase tracking-wider data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all flex items-center gap-2"
                  >
                    Drafts
                    <AnimatePresence>
                      {drafts.length > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={springTransition}
                        >
                          <Badge className="bg-primary text-primary-foreground border-none h-4 px-1 text-[8px] font-bold">
                            {drafts.length}
                          </Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </TabsTrigger>
                </TabsList>

                <LastSyncedDisplay />
              </motion.div>

              <TabsContent value="published" className="mt-0">
                <LayoutGroup>
                  <motion.div
                    layout
                    className="space-y-6 sm:space-y-8 lg:space-y-10"
                  >
                    <AnimatePresence mode="popLayout">
                      {isLoading ? (
                        <LoadingState />
                      ) : posts.length > 0 ? (
                        posts.map((post, index) => (
                          <PostCard
                            key={post.id}
                            post={post}
                            index={index}
                            onEdit={() => handleEditDraft(post)}
                            onDelete={() => handleDeletePost(post.id)}
                            onReaction={(type: "heart" | "fire" | "prayer") =>
                              handleReaction(post.id, type)
                            }
                            expandedComments={expandedComments}
                            setExpandedComments={setExpandedComments}
                          />
                        ))
                      ) : (
                        <EmptyState
                          icon={Globe}
                          title="Your feed is empty"
                          description="Start sharing your journey with your partners."
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
                </LayoutGroup>
              </TabsContent>

              <TabsContent value="draft" className="mt-0">
                <LayoutGroup>
                  <motion.div
                    layout
                    className="space-y-4 sm:space-y-6 lg:space-y-8"
                  >
                    <AnimatePresence mode="popLayout">
                      {drafts.length > 0 ? (
                        drafts.map((draft, index) => (
                          <motion.div
                            key={draft.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{
                              ...smoothTransition,
                              delay: index * 0.05,
                            }}
                            className="group"
                          >
                            <MotionCard
                              whileHover={{ y: -2 }}
                              transition={springTransition}
                              className="overflow-hidden border border-border hover:border-muted-foreground/30 hover:shadow-lg transition-all duration-500 rounded-2xl sm:rounded-3xl bg-card p-4 sm:p-6 lg:p-8"
                            >
                              <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6 lg:gap-8">
                                <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
                                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                    <motion.div
                                      initial={{ scale: 0.9, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      transition={{ delay: 0.1 }}
                                    >
                                      <Badge className="bg-muted text-muted-foreground border-none font-bold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                                        Draft • {draft.post_type}
                                      </Badge>
                                    </motion.div>
                                    <span className="text-[10px] text-muted-foreground font-medium">
                                      Saved{" "}
                                      {new Date(
                                        draft.created_at,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div
                                    className="prose prose-sm sm:prose-base max-w-none line-clamp-3 opacity-60 text-foreground"
                                    dangerouslySetInnerHTML={{
                                      __html: draft.content,
                                    }}
                                  />
                                </div>
                                <div className="flex flex-row sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                                  <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex-1 sm:flex-none"
                                  >
                                    <Button
                                      variant="maia"
                                      size="sm"
                                      onClick={() => handleEditDraft(draft)}
                                      className="w-full h-9 sm:h-10 px-4 sm:px-6 text-[10px] uppercase tracking-wider rounded-xl"
                                    >
                                      <ExternalLink className="h-3.5 w-3.5 mr-2" />
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
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeletePost(draft.id)}
                                      className="w-full h-9 sm:h-10 text-destructive hover:bg-destructive/10 font-bold text-[10px] uppercase tracking-wider rounded-xl"
                                    >
                                      <Trash2 className="h-3.5 w-3.5 mr-2" />
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...smoothTransition, delay: 0.2 }}
          className="lg:col-span-3 space-y-6 sm:space-y-8 lg:space-y-10"
        >
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl sm:rounded-3xl border border-border shadow-sm overflow-hidden bg-card"
          >
            <div className="px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-[11px] uppercase tracking-wider text-foreground">
                Follow Requests
              </h3>
              <AnimatePresence>
                {pendingRequests.length > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={springTransition}
                  >
                    <Badge className="bg-primary text-primary-foreground border-none font-bold text-[10px] h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center">
                      {pendingRequests.length}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
                    <Loader2 className="h-5 w-5 text-muted-foreground" />
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
                        onResolve={handleResolveRequest}
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
                    className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-100"
                  >
                    <Check className="h-5 w-5 text-emerald-500" />
                  </motion.div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    All caught up!
                  </p>
                </motion.div>
              )}
            </div>
          </MotionCard>
        </motion.div>
      </div>
    </motion.div>
  );
}

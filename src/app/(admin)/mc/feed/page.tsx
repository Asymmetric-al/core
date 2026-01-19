"use client";

import React, { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
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
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Download,
  ArrowUpDown,
  Sparkles,
  PenSquare,
  X,
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { TimeAgo } from "@/hooks";
import { BrandAvatar, brandConfig } from "@/components/brand-logo";

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

type PostStatus = "published" | "flagged" | "hidden" | "pending_review";
type Visibility = "public" | "partners" | "private";
type ModerationAction = "approve" | "hide" | "flag" | "delete" | "edit";

interface Post {
  id: string;
  post_type: string;
  content: string;
  created_at: string;
  updated_at?: string;
  likes_count: number;
  prayers_count: number;
  fires_count: number;
  comments_count: number;
  visibility: Visibility;
  status: PostStatus;
  isPinned?: boolean;
  isFlagged?: boolean;
  flagReason?: string;
  media?: { url: string; type: string }[];
  author: {
    id: string;
    name: string;
    avatar_url: string;
    role: "missionary" | "organization";
    location?: string;
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    name: string;
    avatar_url: string;
  };
  post_id: string;
  is_flagged?: boolean;
}

interface ModerationStats {
  totalPosts: number;
  flaggedPosts: number;
  hiddenPosts: number;
  pendingReview: number;
  totalComments: number;
  flaggedComments: number;
  actionsToday: number;
}

const MOCK_STATS: ModerationStats = {
  totalPosts: 1247,
  flaggedPosts: 12,
  hiddenPosts: 3,
  pendingReview: 8,
  totalComments: 4892,
  flaggedComments: 5,
  actionsToday: 23,
};

const MOCK_POSTS: Post[] = [
  {
    id: "1",
    post_type: "Update",
    content:
      "<p>The well project in Chiang Mai is 75% complete. We hit bedrock but the team persevered. Looking forward to the dedication ceremony next week!</p><p>Thank you to all our partners for making this possible.</p>",
    created_at: "2025-12-30T08:00:00Z",
    likes_count: 45,
    prayers_count: 12,
    fires_count: 8,
    comments_count: 7,
    visibility: "public",
    status: "published",
    isPinned: true,
    author: {
      id: "w1",
      name: "The Miller Family",
      avatar_url:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80",
      role: "missionary",
      location: "Thailand",
    },
    media: [
      {
        url: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=800",
        type: "image",
      },
    ],
  },
  {
    id: "2",
    post_type: "Prayer Request",
    content:
      "<p>Please pray for our medical supply shipment. It has been held up at customs for 3 days now.</p><p>We are running low on essential antibiotics and insulin.</p>",
    created_at: "2025-12-29T10:00:00Z",
    likes_count: 15,
    prayers_count: 89,
    fires_count: 2,
    comments_count: 3,
    visibility: "partners",
    status: "flagged",
    isFlagged: true,
    flagReason: "Potentially sensitive medical content",
    author: {
      id: "w2",
      name: "Dr. Sarah Smith",
      avatar_url:
        "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?fit=facearea&facepad=2&w=256&h=256&q=80",
      role: "missionary",
      location: "Kenya",
    },
  },
  {
    id: "3",
    post_type: "Story",
    content:
      "<p>Meet Aroon. He's 8 years old and just attended his first English class today. Before our center opened, he spent his days collecting recyclables to help his family.</p><p>His dream is to become a pilot so he can see the world.</p>",
    created_at: "2025-12-27T14:30:00Z",
    likes_count: 124,
    prayers_count: 5,
    fires_count: 31,
    comments_count: 12,
    visibility: "public",
    status: "published",
    author: {
      id: "w1",
      name: "The Miller Family",
      avatar_url:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80",
      role: "missionary",
      location: "Thailand",
    },
    media: [
      {
        url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80",
        type: "image",
      },
    ],
  },
  {
    id: "4",
    post_type: "Announcement",
    content:
      "<p><strong>Year-End Giving Reminder</strong></p><p>All donations made before December 31st will be included in your 2024 tax-deductible statement. Thank you for your continued support!</p>",
    created_at: "2025-12-25T09:00:00Z",
    likes_count: 67,
    prayers_count: 0,
    fires_count: 12,
    comments_count: 4,
    visibility: "public",
    status: "published",
    isPinned: true,
    author: {
      id: "org1",
      name: brandConfig.name,
      avatar_url: "",
      role: "organization",
    },
  },
];

const MOCK_FLAGGED_COMMENTS: Comment[] = [
  {
    id: "c1",
    content: "This seems suspicious, how do we know this is legitimate?",
    created_at: "2025-12-30T09:00:00Z",
    author: { id: "u1", name: "John Doe", avatar_url: "" },
    post_id: "1",
    is_flagged: true,
  },
  {
    id: "c2",
    content: "I have concerns about how funds are being used here.",
    created_at: "2025-12-30T06:00:00Z",
    author: { id: "u2", name: "Jane Smith", avatar_url: "" },
    post_id: "3",
    is_flagged: true,
  },
];

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  variant = "default",
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
        className={cn(
          "rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300",
          variant === "warning" && "border-amber-200/50",
          variant === "danger" && "border-rose-200/50",
          variant === "success" && "border-emerald-200/50",
        )}
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
              className={cn(
                "h-9 w-9 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center",
                variant === "default" && "bg-muted text-muted-foreground",
                variant === "warning" && "bg-amber-100 text-amber-600",
                variant === "danger" && "bg-rose-100 text-rose-600",
                variant === "success" && "bg-emerald-100 text-emerald-600",
              )}
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </motion.div>
          </div>
        </CardContent>
      </MotionCard>
    </motion.div>
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
              <motion.div
                key={post.id}
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
                    "rounded-2xl sm:rounded-3xl border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden",
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
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
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
                                      onClick={() =>
                                        handleActionClick(post.id, "approve")
                                      }
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
                                      onClick={() =>
                                        handleActionClick(post.id, "hide")
                                      }
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
                                      onClick={() =>
                                        handleActionClick(post.id, "delete")
                                      }
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
                                  onClick={() => setSelectedPost(post)}
                                  className="rounded-lg py-2.5 cursor-pointer gap-2.5"
                                >
                                  <Eye className="h-4 w-4 text-muted-foreground" />{" "}
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg py-2.5 cursor-pointer gap-2.5">
                                  <Edit3 className="h-4 w-4 text-muted-foreground" />{" "}
                                  Edit Post
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="rounded-lg py-2.5 cursor-pointer gap-2.5">
                                  <UserX className="h-4 w-4 text-muted-foreground" />{" "}
                                  View Author
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-amber-600 rounded-lg py-2.5 cursor-pointer gap-2.5">
                                  <AlertTriangle className="h-4 w-4" /> Warn
                                  Author
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

                        <div
                          className="prose prose-sm max-w-none text-sm text-foreground/80 line-clamp-2"
                          dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {post.media && post.media.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="flex gap-2"
                          >
                            {post.media.slice(0, 3).map((item, idx) => (
                              <motion.div
                                key={idx}
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
            ))}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
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
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="Add a reason for this action..."
              className="mt-2 rounded-xl"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
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

      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
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

              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedPost.content }}
              />

              {selectedPost.media && selectedPost.media.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {selectedPost.media.map((item, idx) => (
                    <div
                      key={idx}
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
              onClick={() => setSelectedPost(null)}
              className="rounded-xl"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                handleActionClick(selectedPost!.id, "approve");
                setSelectedPost(null);
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
            <motion.div
              key={post.id}
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
                  "rounded-2xl sm:rounded-3xl border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden",
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
                              <Edit3 className="h-4 w-4 text-muted-foreground" />{" "}
                              Edit Post
                            </DropdownMenuItem>
                            {post.isPinned ? (
                              <DropdownMenuItem className="rounded-lg py-2.5 cursor-pointer gap-2.5">
                                <Pin className="h-4 w-4 text-muted-foreground" />{" "}
                                Unpin Post
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="rounded-lg py-2.5 cursor-pointer gap-2.5">
                                <Pin className="h-4 w-4 text-muted-foreground" />{" "}
                                Pin to Top
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
                              <UserX className="h-4 w-4 text-muted-foreground" />{" "}
                              View Author
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

                      <div
                        className="prose prose-sm max-w-none text-sm text-foreground/80 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                      />

                      {post.media && post.media.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="flex gap-2"
                        >
                          {post.media.slice(0, 4).map((item, idx) => (
                            <motion.div
                              key={idx}
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
            <Card className="rounded-xl border-amber-200 hover:shadow-md transition-all duration-300">
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
          key={idx}
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

export default function ContentModerationPage() {
  const [activeTab, setActiveTab] = useState("moderation");
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [flaggedComments, setFlaggedComments] = useState<Comment[]>(
    MOCK_FLAGGED_COMMENTS,
  );
  const [stats] = useState<ModerationStats>(MOCK_STATS);
  const [isLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVisibility, setFilterVisibility] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const flaggedPosts = useMemo(
    () => posts.filter((p) => p.isFlagged || p.status === "pending_review"),
    [posts],
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast.success("Feed refreshed");
  };

  const handlePostAction = useCallback(
    (postId: string, action: ModerationAction, reason?: string) => {
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id === postId) {
            switch (action) {
              case "approve":
                toast.success("Post approved");
                return {
                  ...post,
                  status: "published" as PostStatus,
                  isFlagged: false,
                  flagReason: undefined,
                };
              case "hide":
                toast.success("Post hidden");
                return { ...post, status: "hidden" as PostStatus };
              case "flag":
                toast.success("Post flagged for review");
                return { ...post, isFlagged: true, flagReason: reason };
              case "delete":
                toast.success("Post deleted");
                return post;
              default:
                return post;
            }
          }
          return post;
        }),
      );

      if (action === "delete") {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      }
    },
    [],
  );

  const handleCommentAction = useCallback(
    (commentId: string, action: "approve" | "delete") => {
      if (action === "delete") {
        setFlaggedComments((prev) => prev.filter((c) => c.id !== commentId));
        toast.success("Comment deleted");
      } else {
        setFlaggedComments((prev) => prev.filter((c) => c.id !== commentId));
        toast.success("Comment approved");
      }
    },
    [],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-4 sm:p-6 pb-20 space-y-6 sm:space-y-8"
    >
      <PageHeader
        title="Ministry Updates Moderation"
        description="Review flagged content, moderate posts, and manage comments."
      >
        <Link href="/mc/feed/org-updates">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button className="h-9 gap-2 rounded-xl font-semibold">
              <PenSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Org Updates</span>
            </Button>
          </motion.div>
        </Link>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button variant="outline" size="sm" className="h-9 gap-2 rounded-xl">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-xl"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={cn("h-4 w-4", isRefreshing && "animate-spin")}
            />
          </Button>
        </motion.div>
      </PageHeader>

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

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8">
        <div className="xl:col-span-8 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
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
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 sm:h-10 w-full sm:w-56 lg:w-64 rounded-xl"
                      />
                      {searchQuery && (
                        <motion.button
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          onClick={() => setSearchQuery("")}
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
                          onCheckedChange={() => setFilterVisibility("all")}
                          className="rounded-lg"
                        >
                          All
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={filterVisibility === "public"}
                          onCheckedChange={() => setFilterVisibility("public")}
                          className="rounded-lg"
                        >
                          Public
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={filterVisibility === "partners"}
                          onCheckedChange={() =>
                            setFilterVisibility("partners")
                          }
                          className="rounded-lg"
                        >
                          Partners
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={filterVisibility === "private"}
                          onCheckedChange={() => setFilterVisibility("private")}
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
                          onCheckedChange={() => setFilterType("all")}
                          className="rounded-lg"
                        >
                          All Types
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={filterType === "update"}
                          onCheckedChange={() => setFilterType("update")}
                          className="rounded-lg"
                        >
                          Updates
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={filterType === "prayer request"}
                          onCheckedChange={() =>
                            setFilterType("prayer request")
                          }
                          className="rounded-lg"
                        >
                          Prayer Requests
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={filterType === "story"}
                          onCheckedChange={() => setFilterType("story")}
                          className="rounded-lg"
                        >
                          Stories
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={filterType === "announcement"}
                          onCheckedChange={() => setFilterType("announcement")}
                          className="rounded-lg"
                        >
                          Announcements
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Select value={sortBy} onValueChange={setSortBy}>
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
                onAction={handlePostAction}
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
                onAction={handlePostAction}
              />
            </TabsContent>
          </Tabs>
        </div>

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
                onAction={handleCommentAction}
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
                      Configure Settings{" "}
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </MotionCard>
        </motion.div>
      </div>
    </motion.div>
  );
}

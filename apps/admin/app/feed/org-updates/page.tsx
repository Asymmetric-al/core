"use client";

import React, { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Send,
  Globe,
  ChevronDown,
  X,
  Lock,
  Users,
  Pin,
  Trash2,
  Clock,
  Image as ImageIcon,
  Loader2,
  MoreHorizontal,
  Eye,
  MessageCircle,
  Settings,
  ExternalLink,
  Save,
  Bell,
  UserPlus,
  Check,
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { Card, CardContent, CardHeader } from "@asym/ui/components/shadcn/card";
import { Button } from "@asym/ui/components/shadcn/button";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Switch } from "@asym/ui/components/shadcn/switch";
import { Label } from "@asym/ui/components/shadcn/label";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@asym/ui/components/shadcn/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@asym/ui/components/shadcn/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@asym/ui/components/shadcn/sheet";
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
import { Separator } from "@asym/ui/components/shadcn/separator";
import { ScrollArea } from "@asym/ui/components/shadcn/scroll-area";
import {
  RadioGroup,
  RadioGroupItem,
} from "@asym/ui/components/shadcn/radio-group";
import { cn } from "@asym/ui/lib/utils";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/page-header";
import { TimeAgo, useLastSynced } from "@asym/lib/hooks";
import {
  BrandAvatar,
  BrandLogo,
  brandConfig,
} from "@asym/ui/components/brand-logo";

type OrgPostVisibility = "all_donors" | "followers_only";
type Visibility = "public" | "partners" | "private";
type PostStatus = "published" | "draft";

const RichTextEditor = dynamic(
  () =>
    import("@asym/ui/components/shadcn/RichTextEditor").then(
      (mod) => mod.RichTextEditor,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[140px] w-full bg-muted rounded-xl animate-pulse" />
    ),
  },
);

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

interface OrgPost {
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
  isPinned: boolean;
  status: PostStatus;
  media?: { url: string; type: string }[];
}

const MOCK_ORG_POSTS: OrgPost[] = [
  {
    id: "o1",
    post_type: "Announcement",
    content:
      "<p><strong>Year-End Giving Reminder</strong></p><p>All donations made before December 31st will be included in your 2024 tax-deductible statement. Thank you for your continued support!</p>",
    created_at: "2025-12-28T10:00:00Z",
    likes_count: 156,
    prayers_count: 23,
    fires_count: 45,
    comments_count: 12,
    visibility: "public",
    isPinned: true,
    status: "published",
  },
  {
    id: "o2",
    post_type: "Newsletter",
    content:
      "<p><strong>December Newsletter</strong></p><p>This month we celebrate 50 new missionaries joining our network and the completion of 12 major projects across 8 countries.</p>",
    created_at: "2025-12-23T14:30:00Z",
    likes_count: 234,
    prayers_count: 56,
    fires_count: 78,
    comments_count: 34,
    visibility: "public",
    isPinned: false,
    status: "published",
    media: [
      {
        url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80",
        type: "image",
      },
    ],
  },
  {
    id: "o3",
    post_type: "Prayer Request",
    content:
      "<p>Please join us in prayer for the missionaries serving in regions affected by recent natural disasters. Your prayers and support mean everything.</p>",
    created_at: "2025-12-16T09:15:00Z",
    likes_count: 89,
    prayers_count: 312,
    fires_count: 23,
    comments_count: 45,
    visibility: "partners",
    isPinned: false,
    status: "published",
  },
];

const MOCK_DRAFTS: OrgPost[] = [
  {
    id: "d1",
    post_type: "Update",
    content: "<p>Exciting news coming soon about our new initiative...</p>",
    created_at: "2025-12-29T16:00:00Z",
    likes_count: 0,
    prayers_count: 0,
    fires_count: 0,
    comments_count: 0,
    visibility: "public",
    isPinned: false,
    status: "draft",
  },
];

function FeedSettingsSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [visibility, setVisibility] = useState<OrgPostVisibility>("all_donors");
  const [emailOrgPosts, setEmailOrgPosts] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSaving(false);
    toast.success("Settings saved");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold">
                Feed Settings
              </SheetTitle>
              <SheetDescription className="text-sm">
                Visibility and notification defaults
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-foreground">
                  Feed Visibility
                </Label>
                <p className="text-xs text-muted-foreground">
                  Who sees organization updates by default
                </p>
              </div>

              <RadioGroup
                value={visibility}
                onValueChange={(val) => setVisibility(val as OrgPostVisibility)}
                className="space-y-2"
              >
                <label
                  htmlFor="all_donors"
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                    visibility === "all_donors"
                      ? "border-foreground bg-muted/50"
                      : "border-border hover:bg-muted/30",
                  )}
                >
                  <RadioGroupItem value="all_donors" id="all_donors" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        All Donors
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[9px] h-4 px-1.5 font-semibold"
                      >
                        Default
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Anyone who has donated sees org posts
                    </p>
                  </div>
                </label>

                <label
                  htmlFor="followers_only"
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                    visibility === "followers_only"
                      ? "border-foreground bg-muted/50"
                      : "border-border hover:bg-muted/30",
                  )}
                >
                  <RadioGroupItem value="followers_only" id="followers_only" />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground">
                      Followers Only
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Only donors who follow the org
                    </p>
                  </div>
                </label>
              </RadioGroup>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-foreground">
                  Notification Defaults
                </Label>
                <p className="text-xs text-muted-foreground">
                  Default settings for new donors
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl border">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Email for Org Posts
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Default: Off
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={emailOrgPosts}
                    onCheckedChange={setEmailOrgPosts}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Donors can change these settings individually. Missionary
                  notification preferences are separate and independent.
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="p-4 border-t">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-10 rounded-xl font-semibold"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function PostCard({
  post,
  onEdit,
  onDelete,
  onTogglePin,
  index,
}: {
  post: OrgPost;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  index: number;
}) {
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
        className="overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-500 rounded-2xl sm:rounded-3xl bg-card"
      >
        <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 flex flex-row items-start justify-between space-y-0">
          <div className="flex gap-3 sm:gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={springTransition}
            >
              <BrandAvatar size="md" />
            </motion.div>
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h3 className="font-bold text-foreground text-base sm:text-lg tracking-tight">
                  {brandConfig.name}
                </h3>
                <Badge
                  variant="secondary"
                  className="font-semibold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                >
                  {post.post_type}
                </Badge>
                {post.isPinned && (
                  <Badge
                    variant="outline"
                    className="text-[9px] px-2 py-0.5 gap-1 rounded-full font-semibold uppercase tracking-wider"
                  >
                    <Pin className="h-2.5 w-2.5" /> Pinned
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  <TimeAgo date={post.created_at} />
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
              className="rounded-xl border shadow-lg p-2 min-w-[160px]"
            >
              <DropdownMenuItem
                onClick={onTogglePin}
                className="font-medium text-xs rounded-lg py-2.5 cursor-pointer gap-2.5"
              >
                <Pin className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                {post.isPinned ? "Unpin" : "Pin to Top"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onEdit}
                className="font-medium text-xs rounded-lg py-2.5 cursor-pointer gap-2.5"
              >
                <Settings className="h-3.5 w-3.5 text-muted-foreground" /> Edit
                Post
              </DropdownMenuItem>
              <DropdownMenuItem className="font-medium text-xs rounded-lg py-2.5 cursor-pointer gap-2.5">
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                View Public
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="font-medium text-xs rounded-lg py-2.5 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer gap-2.5"
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
            className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4"
          >
            <div
              className="prose prose-sm sm:prose-base max-w-none text-foreground/80 leading-relaxed prose-headings:font-bold prose-headings:text-foreground prose-headings:tracking-tight prose-strong:font-bold prose-strong:text-foreground prose-a:text-primary prose-a:font-bold prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            {post.media && post.media.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
                className="flex gap-2 flex-wrap"
              >
                {post.media.slice(0, 4).map((item, idx) => (
                  <div
                    key={idx}
                    className="relative h-24 w-24 sm:h-32 sm:w-32 rounded-xl overflow-hidden border shadow-sm"
                  >
                    <Image
                      src={item.url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="px-4 sm:px-6 py-3 sm:py-4 border-t bg-muted/20 flex items-center gap-6"
          >
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <span className="text-base">❤️</span> {post.likes_count}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <span className="text-base">🙏</span> {post.prayers_count}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <span className="text-base">🔥</span> {post.fires_count}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <MessageCircle className="h-4 w-4" /> {post.comments_count}
            </span>
          </motion.div>
        </CardContent>
      </MotionCard>
    </motion.div>
  );
}

function DraftCard({
  draft,
  onEdit,
  onDelete,
  index,
}: {
  draft: OrgPost;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ ...smoothTransition, delay: index * 0.05 }}
    >
      <MotionCard
        whileHover={{ y: -2 }}
        transition={springTransition}
        className="overflow-hidden border hover:shadow-lg transition-all duration-500 rounded-2xl sm:rounded-3xl bg-card p-4 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Badge
                variant="secondary"
                className="font-semibold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full"
              >
                Draft • {draft.post_type}
              </Badge>
              <span className="text-[10px] text-muted-foreground font-medium">
                Saved <TimeAgo date={draft.created_at} />
              </span>
            </div>
            <div
              className="prose prose-sm max-w-none line-clamp-2 opacity-60 text-foreground"
              dangerouslySetInnerHTML={{ __html: draft.content }}
            />
          </div>
          <div className="flex flex-row sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 sm:flex-none"
            >
              <Button
                onClick={onEdit}
                className="w-full h-9 sm:h-10 px-4 sm:px-6 text-[10px] uppercase tracking-wider rounded-xl font-semibold"
              >
                <ExternalLink className="h-3.5 w-3.5 mr-2" />
                <span className="hidden sm:inline">Edit & Publish</span>
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
                onClick={onDelete}
                className="w-full h-9 sm:h-10 text-destructive hover:bg-destructive/10 font-semibold text-[10px] uppercase tracking-wider rounded-xl"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete
              </Button>
            </motion.div>
          </div>
        </div>
      </MotionCard>
    </motion.div>
  );
}

function ComposeCard({
  onSave,
  editingPost,
  onCancelEdit,
}: {
  onSave: (post: Partial<OrgPost>) => void;
  editingPost: OrgPost | null;
  onCancelEdit: () => void;
}) {
  const [postContent, setPostContent] = useState(editingPost?.content || "");
  const [postType, setPostType] = useState(
    editingPost?.post_type || "Announcement",
  );
  const [visibility, setVisibility] = useState<Visibility>(
    editingPost?.visibility || "public",
  );
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<
    { url: string; type: string }[]
  >(editingPost?.media || []);
  const [isUploading, setIsUploading] = useState(false);

  const handlePublish = async () => {
    const plainText = postContent.replace(/<[^>]*>?/gm, "").trim();
    if (!plainText && !postContent.includes("<img")) return;

    setIsPublishing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    onSave({
      content: postContent,
      post_type: postType,
      visibility,
      media: selectedMedia,
      status: "published",
    });

    toast.success(
      editingPost ? "Update saved!" : "Organization update published!",
    );
    setPostContent("");
    setSelectedMedia([]);
    setIsPublishing(false);
  };

  const handleSaveDraft = async () => {
    const plainText = postContent.replace(/<[^>]*>?/gm, "").trim();
    if (!plainText && !postContent.includes("<img")) return;

    setIsPublishing(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    onSave({
      content: postContent,
      post_type: postType,
      visibility,
      media: selectedMedia,
      status: "draft",
    });

    toast.success("Draft saved!");
    setPostContent("");
    setSelectedMedia([]);
    setIsPublishing(false);
  };

  const handleAddMedia = async () => {
    setIsUploading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const demoImages = [
      "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&q=80",
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80",
    ];
    const randomImage =
      demoImages[Math.floor(Math.random() * demoImages.length)] ??
      demoImages[0]!;
    setSelectedMedia((prev) => [...prev, { url: randomImage, type: "image" }]);
    setIsUploading(false);
    toast.success("Image added");
  };

  const isDisabled =
    isPublishing ||
    isUploading ||
    ((!postContent ||
      postContent === "<p></p>" ||
      postContent === "<p><br></p>") &&
      selectedMedia.length === 0);

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...smoothTransition, delay: 0.15 }}
      className="overflow-hidden border shadow-md rounded-2xl sm:rounded-3xl bg-card"
    >
      <div className="p-4 sm:p-6">
        <div className="flex gap-2 sm:gap-3 flex-wrap items-center mb-4 sm:mb-6">
          {["Announcement", "Newsletter", "Update", "Prayer Request"].map(
            (type, i) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={postType === type ? "default" : "outline"}
                  onClick={() => setPostType(type)}
                  className={cn(
                    "px-3 sm:px-5 py-2 h-8 sm:h-9 text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold rounded-xl",
                    postType === type && "shadow-md",
                  )}
                >
                  {type}
                </Button>
              </motion.div>
            ),
          )}
          <AnimatePresence>
            {editingPost && (
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
                  onClick={onCancelEdit}
                  className="ml-auto text-destructive font-semibold text-[10px] uppercase tracking-wider hover:bg-destructive/10 rounded-xl"
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
            <BrandLogo size="md" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-1 min-w-0 rounded-xl sm:rounded-2xl border overflow-hidden focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-ring transition-all"
          >
            <RichTextEditor
              value={postContent}
              onChange={setPostContent}
              placeholder={`Write your ${postType.toLowerCase()}...`}
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
                              className="h-14 w-14 sm:h-16 sm:w-16 object-cover rounded-lg border shadow-sm"
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
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isUploading}
                        onClick={handleAddMedia}
                        className="h-8 text-muted-foreground gap-1.5 font-semibold text-[9px] uppercase tracking-wider hover:bg-muted rounded-lg px-2.5 border transition-all"
                      >
                        {isUploading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
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
                            className="h-8 text-muted-foreground gap-1.5 font-semibold text-[9px] uppercase tracking-wider hover:bg-muted rounded-lg px-2.5 border transition-all"
                          >
                            {visibility === "public" ? (
                              <Globe className="h-3 w-3" />
                            ) : visibility === "partners" ? (
                              <Users className="h-3 w-3" />
                            ) : (
                              <Lock className="h-3 w-3" />
                            )}
                            <span className="hidden sm:inline capitalize">
                              {visibility === "partners"
                                ? "Partners"
                                : visibility}
                            </span>
                            <ChevronDown className="h-2.5 w-2.5 opacity-40" />
                          </Button>
                        </motion.div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="rounded-xl border shadow-lg p-1.5 min-w-[160px]"
                      >
                        <DropdownMenuItem
                          onClick={() => setVisibility("public")}
                          className="font-medium text-[9px] uppercase tracking-wider rounded-lg py-2 cursor-pointer gap-2"
                        >
                          <Globe className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                          Public
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setVisibility("partners")}
                          className="font-medium text-[9px] uppercase tracking-wider rounded-lg py-2 cursor-pointer gap-2"
                        >
                          <Users className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                          Partners Only
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setVisibility("private")}
                          className="font-medium text-[9px] uppercase tracking-wider rounded-lg py-2 cursor-pointer gap-2"
                        >
                          <Lock className="h-3.5 w-3.5 text-muted-foreground" />{" "}
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
                        onClick={handleSaveDraft}
                        variant="outline"
                        size="sm"
                        disabled={isDisabled}
                        className="h-8 px-2.5 sm:px-4 text-[9px] uppercase tracking-wider rounded-lg font-semibold"
                      >
                        {isPublishing ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
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
                        onClick={handlePublish}
                        size="sm"
                        disabled={isDisabled}
                        className="h-8 px-3 sm:px-5 text-[9px] uppercase tracking-wider rounded-lg shadow-sm font-semibold"
                      >
                        {isPublishing ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Send className="h-3 w-3 sm:mr-1.5" />
                        )}
                        <span className="hidden sm:inline">Publish</span>
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
        className="font-semibold text-xs uppercase tracking-wider text-muted-foreground/50"
      >
        Loading Updates...
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
      className="text-center py-20 sm:py-32 bg-muted/20 rounded-2xl sm:rounded-3xl border-2 border-dashed"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={springTransition}
        className="w-16 h-16 sm:w-20 sm:h-20 bg-card rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-md border"
      >
        <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/30" />
      </motion.div>
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="font-bold text-lg sm:text-xl text-foreground tracking-tight"
      >
        {title}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-muted-foreground font-medium mt-2 text-sm"
      >
        {description}
      </motion.p>
    </motion.div>
  );
}

export default function OrgUpdatesPage() {
  const [posts, setPosts] = useState<OrgPost[]>(MOCK_ORG_POSTS);
  const [drafts, setDrafts] = useState<OrgPost[]>(MOCK_DRAFTS);
  const [activeTab, setActiveTab] = useState<PostStatus>("published");
  const [isLoading, setIsLoading] = useState(false);
  const [editingPost, setEditingPost] = useState<OrgPost | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const lastSynced = useLastSynced();

  const handleSavePost = useCallback(
    (postData: Partial<OrgPost>) => {
      if (editingPost) {
        if (postData.status === "published") {
          setPosts((prev) =>
            prev.map((p) =>
              p.id === editingPost.id
                ? { ...p, ...postData, updated_at: new Date().toISOString() }
                : p,
            ),
          );
          setDrafts((prev) => prev.filter((d) => d.id !== editingPost.id));
        } else {
          setDrafts((prev) =>
            prev.map((p) =>
              p.id === editingPost.id
                ? { ...p, ...postData, updated_at: new Date().toISOString() }
                : p,
            ),
          );
        }
      } else {
        const newPost: OrgPost = {
          id: `o${Date.now()}`,
          post_type: postData.post_type || "Announcement",
          content: postData.content || "",
          created_at: new Date().toISOString(),
          likes_count: 0,
          prayers_count: 0,
          fires_count: 0,
          comments_count: 0,
          visibility: postData.visibility || "public",
          isPinned: false,
          status: postData.status || "published",
          media: postData.media,
        };
        if (postData.status === "draft") {
          setDrafts((prev) => [newPost, ...prev]);
        } else {
          setPosts((prev) => [newPost, ...prev]);
        }
      }
      setEditingPost(null);
    },
    [editingPost],
  );

  const handleEdit = (post: OrgPost) => {
    setEditingPost(post);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.info("Editing post...");
  };

  const handleDelete = (postId: string) => {
    setPostToDelete(postId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      setPosts((prev) => prev.filter((p) => p.id !== postToDelete));
      setDrafts((prev) => prev.filter((p) => p.id !== postToDelete));
      toast.success("Post deleted");
    }
    setDeleteDialogOpen(false);
    setPostToDelete(null);
  };

  const handleTogglePin = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isPinned: !p.isPinned } : p)),
    );
    const post = posts.find((p) => p.id === postId);
    toast.success(post?.isPinned ? "Post unpinned" : "Post pinned");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-[1200px] mx-auto pb-20"
    >
      <PageHeader
        title={`${brandConfig.name} Updates`}
        description="Share announcements and updates with your supporters."
      >
        <Link href="/mc/feed">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 rounded-xl font-medium"
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Moderation</span>
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSettingsOpen(true)}
          className="h-9 gap-2 rounded-xl font-medium"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Settings</span>
        </Button>
      </PageHeader>

      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        <ComposeCard
          onSave={handleSavePost}
          editingPost={editingPost}
          onCancelEdit={() => setEditingPost(null)}
        />

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
            <TabsList className="bg-muted/50 p-1 rounded-xl h-auto border backdrop-blur-sm">
              <TabsTrigger
                value="published"
                className="rounded-lg px-4 sm:px-6 py-2 font-semibold text-[10px] uppercase tracking-wider data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all"
              >
                Published
              </TabsTrigger>
              <TabsTrigger
                value="draft"
                className="rounded-lg px-4 sm:px-6 py-2 font-semibold text-[10px] uppercase tracking-wider data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all flex items-center gap-2"
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
                      <Badge className="bg-primary text-primary-foreground border-none h-4 px-1 text-[8px] font-semibold">
                        {drafts.length}
                      </Badge>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsTrigger>
            </TabsList>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
            >
              <Clock className="h-3.5 w-3.5" />
              {lastSynced ? `Last synced: ${lastSynced}` : "Syncing..."}
            </motion.div>
          </motion.div>

          <TabsContent value="published" className="mt-0">
            <LayoutGroup>
              <motion.div layout className="space-y-6 sm:space-y-8">
                <AnimatePresence mode="popLayout">
                  {isLoading ? (
                    <LoadingState />
                  ) : posts.length > 0 ? (
                    posts.map((post, index) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        index={index}
                        onEdit={() => handleEdit(post)}
                        onDelete={() => handleDelete(post.id)}
                        onTogglePin={() => handleTogglePin(post.id)}
                      />
                    ))
                  ) : (
                    <EmptyState
                      icon={Send}
                      title="No organization updates yet"
                      description="Create your first update to reach all supporters."
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            </LayoutGroup>
          </TabsContent>

          <TabsContent value="draft" className="mt-0">
            <LayoutGroup>
              <motion.div layout className="space-y-4 sm:space-y-6">
                <AnimatePresence mode="popLayout">
                  {drafts.length > 0 ? (
                    drafts.map((draft, index) => (
                      <DraftCard
                        key={draft.id}
                        draft={draft}
                        index={index}
                        onEdit={() => handleEdit(draft)}
                        onDelete={() => handleDelete(draft.id)}
                      />
                    ))
                  ) : (
                    <EmptyState
                      icon={Save}
                      title="No drafts yet"
                      description="Drafts let you perfect updates before sharing."
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            </LayoutGroup>
          </TabsContent>
        </Tabs>
      </div>

      <FeedSettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Update?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The update will be permanently
              removed from all feeds.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 rounded-xl"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

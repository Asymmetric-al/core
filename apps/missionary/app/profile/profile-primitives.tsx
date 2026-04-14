"use client";

import { motion, AnimatePresence } from "@asym/lib/motion";
import { MISSIONARY_SHELL_AVATAR_VT_NAME } from "@asym/lib/view-transitions";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Button } from "@asym/ui/components/shadcn/button";
import { Card, CardContent, CardHeader } from "@asym/ui/components/shadcn/card";
import { Label } from "@asym/ui/components/shadcn/label";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@asym/ui/components/shadcn/tooltip";
import { SharedNamedViewTransition } from "@asym/ui/components/view-transitions";
import { cn } from "@asym/ui/lib/utils";
import {
  Camera,
  Eye,
  Save,
  ImageIcon,
  Smartphone,
  Monitor,
  Loader2,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Globe,
  Check,
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import * as React from "react";

import {
  DESKTOP_PREVIEW_HEIGHT,
  DESKTOP_PREVIEW_WIDTH,
  MOBILE_PREVIEW_HEIGHT,
  MOBILE_PREVIEW_WIDTH,
} from "./profile-model";

import type { ProfileData } from "./profile-model";

export const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
};

export const springTransition = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

export const smoothTransition = {
  duration: 0.25,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

export const gentleTransition = {
  duration: 0.35,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between pb-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-6">
          {["skeleton-a", "skeleton-b", "skeleton-c"].map((skeletonId) => (
            <Card key={skeletonId} className="rounded-2xl">
              <CardHeader className="border-b border-zinc-100 px-6 py-4">
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="aspect-[9/16] rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FormField({
  label,
  icon: Icon,
  children,
  error,
  helperText,
  className,
}: {
  label: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  error?: string;
  helperText?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={cn("space-y-1.5", className)} variants={fadeInUp}>
      <Label className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </Label>
      {children}
      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            key="error"
            className="text-xs text-red-500 flex items-center gap-1"
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            {error}
          </motion.p>
        ) : helperText ? (
          <motion.div
            key="helper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {helperText}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export function SocialIcon({
  platform,
  url,
}: {
  platform: string;
  url: string;
}) {
  if (!url) return null;

  const icons: Record<string, React.ElementType> = {
    instagram: Instagram,
    facebook: Facebook,
    twitter: Twitter,
    youtube: Youtube,
    website: Globe,
  };

  const Icon = icons[platform] || Globe;

  return (
    <motion.div
      className="cursor-pointer"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.1, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={springTransition}
    >
      <Icon className="h-4 w-4 text-zinc-400 hover:text-zinc-600 transition-colors" />
    </motion.div>
  );
}

export function AvatarUploadArea({
  avatarUrl,
  initials,
}: {
  avatarUrl: string;
  initials: string;
}) {
  return (
    <motion.div
      className="relative group cursor-pointer rounded-full"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={springTransition}
    >
      <SharedNamedViewTransition name={MISSIONARY_SHELL_AVATAR_VT_NAME}>
        <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-white shadow-lg">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="bg-zinc-900 text-lg sm:text-xl font-bold text-white uppercase">
            {initials || "U"}
          </AvatarFallback>
        </Avatar>
      </SharedNamedViewTransition>

      <motion.div
        className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center"
        initial={false}
      >
        <motion.div
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          initial={false}
        >
          <Camera className="h-6 w-6 text-white drop-shadow-lg" />
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute -bottom-1 -right-1 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-lg border-2 border-white"
        whileHover={{ scale: 1.1 }}
        transition={springTransition}
      >
        <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </motion.div>
    </motion.div>
  );
}

export function CoverUploadArea({ coverUrl }: { coverUrl: string }) {
  return (
    <motion.div
      className={cn(
        "w-full aspect-[3/1] rounded-xl sm:rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all relative overflow-hidden cursor-pointer",
        coverUrl
          ? "border-transparent"
          : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300",
      )}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      transition={smoothTransition}
    >
      {coverUrl ? (
        <>
          <motion.img
            src={coverUrl}
            alt="Cover"
            className="absolute inset-0 w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={gentleTransition}
          />
          <motion.div
            className="absolute inset-0 bg-black/0 hover:bg-black/40 flex items-center justify-center transition-colors"
            initial={false}
          >
            <motion.div className="bg-white rounded-lg px-3 py-1.5 shadow-lg opacity-0 hover:opacity-100 transition-opacity">
              <span className="text-xs font-medium flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5" />
                Change Cover
              </span>
            </motion.div>
          </motion.div>
        </>
      ) : (
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={smoothTransition}
        >
          <motion.div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center mb-2 sm:mb-3">
            <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-300" />
          </motion.div>
          <p className="text-xs sm:text-sm font-medium text-zinc-700">
            Click to upload cover photo
          </p>
          <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">
            1200x400px recommended
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

export function PreviewToggle({
  value,
  onChange,
}: {
  value: "mobile" | "desktop";
  onChange: (v: "mobile" | "desktop") => void;
}) {
  return (
    <div className="relative bg-zinc-100 border border-zinc-200 p-1 rounded-lg flex">
      <motion.div
        className="absolute top-1 bottom-1 bg-white rounded-md shadow-sm"
        layout
        transition={springTransition}
        style={{
          left: value === "mobile" ? 4 : "50%",
          width: "calc(50% - 4px)",
        }}
      />
      <button
        type="button"
        onClick={() => onChange("mobile")}
        className={cn(
          "relative z-10 px-2.5 py-1 rounded-md transition-colors",
          value === "mobile"
            ? "text-zinc-900"
            : "text-zinc-400 hover:text-zinc-600",
        )}
        aria-label="Mobile preview"
      >
        <Smartphone className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange("desktop")}
        className={cn(
          "relative z-10 px-2.5 py-1 rounded-md transition-colors",
          value === "desktop"
            ? "text-zinc-900"
            : "text-zinc-400 hover:text-zinc-600",
        )}
        aria-label="Desktop preview"
      >
        <Monitor className="h-4 w-4" />
      </button>
    </div>
  );
}

export function MotionCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={fadeInUp} transition={gentleTransition}>
      <Card className={cn("rounded-2xl border-zinc-200 shadow-sm", className)}>
        {children}
      </Card>
    </motion.div>
  );
}

export function MobilePreviewFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const calculateScale = () => {
      const containerWidth = container.offsetWidth;
      const padding = 16;
      const availableWidth = containerWidth - padding;
      const newScale = Math.min(1, availableWidth / MOBILE_PREVIEW_WIDTH);
      setScale(newScale);
    };

    calculateScale();
    const resizeObserver = new ResizeObserver(calculateScale);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full flex justify-center">
      <div
        style={{
          width: MOBILE_PREVIEW_WIDTH * scale,
          height: MOBILE_PREVIEW_HEIGHT * scale,
          overflow: "hidden",
        }}
      >
        <div
          className="origin-top-left"
          style={{
            transform: `scale(${scale})`,
            width: MOBILE_PREVIEW_WIDTH,
            height: MOBILE_PREVIEW_HEIGHT,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function DesktopPreviewFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const calculateScale = () => {
      const containerWidth = container.offsetWidth;
      const padding = 16;
      const availableWidth = containerWidth - padding;
      const newScale = Math.min(1, availableWidth / DESKTOP_PREVIEW_WIDTH);
      setScale(newScale);
    };

    calculateScale();
    const resizeObserver = new ResizeObserver(calculateScale);
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full flex justify-center">
      <div
        style={{
          width: DESKTOP_PREVIEW_WIDTH * scale,
          height: DESKTOP_PREVIEW_HEIGHT * scale,
          overflow: "hidden",
        }}
      >
        <div
          className="origin-top-left"
          style={{
            transform: `scale(${scale})`,
            width: DESKTOP_PREVIEW_WIDTH,
            height: DESKTOP_PREVIEW_HEIGHT,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export type ProfileHeaderActionsProps = {
  copiedLink: boolean;
  profile: ProfileData;
  hasChanges: boolean;
  isSaving: boolean;
  saveSuccess: boolean;
  handleCopyLink: () => void | Promise<void>;
  handleDiscard: () => void;
  handleSave: () => void | Promise<void>;
};

export function ProfileHeaderActions({
  copiedLink,
  profile,
  hasChanges,
  isSaving,
  saveSuccess,
  handleCopyLink,
  handleDiscard,
  handleSave,
}: ProfileHeaderActionsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="h-9 px-3 text-xs font-medium"
            >
              <AnimatePresence mode="wait">
                {copiedLink ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0.95, rotate: -90, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0.95, rotate: 90, opacity: 0 }}
                    transition={springTransition}
                  >
                    <Check className="h-4 w-4 text-emerald-600" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={springTransition}
                  >
                    <Copy className="h-4 w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>Copy profile link</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 text-xs font-medium"
              asChild
            >
              <a
                href={`/workers/${profile.firstName?.toLowerCase()}-${profile.lastName?.toLowerCase()}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Eye className="mr-1.5 h-4 w-4" />
                <span className="hidden sm:inline">View Public Page</span>
                <span className="sm:hidden">View</span>
                <ExternalLink className="ml-1 h-3 w-3 opacity-50" />
              </a>
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>View your public profile</TooltipContent>
      </Tooltip>

      <AnimatePresence>
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: -8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -8 }}
            transition={springTransition}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDiscard}
              className="h-9 px-3 text-xs font-medium text-zinc-500 hover:text-zinc-900"
            >
              <RotateCcw className="mr-1.5 h-4 w-4" />
              Discard
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        layout
      >
        <Button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          size="sm"
          className={cn(
            "h-9 px-4 text-xs font-medium min-w-[100px] transition-colors duration-200",
            saveSuccess && "bg-emerald-600 hover:bg-emerald-600",
          )}
        >
          <AnimatePresence mode="wait">
            {isSaving ? (
              <motion.div
                key="saving"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Loader2 className="h-4 w-4 animate-spin" />
              </motion.div>
            ) : saveSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center"
                transition={springTransition}
              >
                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                Saved!
              </motion.div>
            ) : (
              <motion.div
                key="save"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center"
                transition={{ duration: 0.15 }}
              >
                <Save className="mr-1.5 h-4 w-4" />
                Save Changes
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>
    </div>
  );
}

"use client";

import * as React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ImageUpload } from "@/components/ui/image-upload";
import {
  Camera,
  Upload,
  Globe,
  MapPin,
  Phone as PhoneIcon,
  Save,
  Eye,
  ImageIcon,
  Smartphone,
  Monitor,
  Loader2,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Link as LinkIcon,
  Check,
  X,
  User,
  ExternalLink,
  Copy,
  CheckCircle2,
  AlertCircle,
  Info,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QuickGive } from "@/components/quick-give";

const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
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

const gentleTransition = {
  duration: 0.35,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

const TAGLINE_MAX_LENGTH = 100;
const BIO_MIN_WORDS = 200;
const BIO_MAX_WORDS = 600;
const BIO_MAX_CHARS = 3500;

const PLACEHOLDER_AVATAR =
  "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face";
const PLACEHOLDER_COVER =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  ministryFocus: string;
  bio: string;
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  website: string;
  avatarUrl: string;
  coverUrl: string;
}

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  website?: string;
  ministryFocus?: string;
  bio?: string;
}

const initialProfile: ProfileData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  location: "",
  ministryFocus: "",
  bio: "",
  facebook: "",
  instagram: "",
  twitter: "",
  youtube: "",
  website: "",
  avatarUrl: "",
  coverUrl: "",
};

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
}

function ProfileSkeleton() {
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
          {[1, 2, 3].map((i) => (
            <Card key={`skeleton-card-${i}`} className="rounded-2xl">
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

function FormField({
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

function SocialIcon({ platform, url }: { platform: string; url: string }) {
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
      whileTap={{ scale: 0.95 }}
      transition={springTransition}
    >
      <Icon className="h-4 w-4 text-zinc-400 hover:text-zinc-600 transition-colors" />
    </motion.div>
  );
}

function AvatarUploadArea({
  avatarUrl,
  initials,
  isUploading,
  onUploadClick,
}: {
  avatarUrl: string;
  initials: string;
  isUploading: boolean;
  onUploadClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onUploadClick}
      disabled={isUploading}
      className="relative group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 rounded-full"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={springTransition}
      aria-label="Upload profile picture"
    >
      <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-white shadow-lg">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback className="bg-zinc-900 text-lg sm:text-xl font-bold text-white uppercase">
          {initials || "U"}
        </AvatarFallback>
      </Avatar>

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

      <AnimatePresence>
        {isUploading && (
          <motion.div
            className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 text-white animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="absolute -bottom-1 -right-1 h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-zinc-900 text-white flex items-center justify-center shadow-lg border-2 border-white"
        whileHover={{ scale: 1.1 }}
        transition={springTransition}
      >
        <Camera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </motion.div>
    </motion.button>
  );
}

function CoverUploadArea({
  coverUrl,
  isUploading,
  onUploadClick,
}: {
  coverUrl: string;
  isUploading: boolean;
  onUploadClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onUploadClick}
      disabled={isUploading}
      className={cn(
        "w-full aspect-[3/1] rounded-xl sm:rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all relative overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2",
        coverUrl
          ? "border-transparent"
          : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300",
      )}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.995 }}
      transition={smoothTransition}
      aria-label="Upload cover photo"
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
            {isUploading ? (
              <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-400 animate-spin" />
            ) : (
              <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-300" />
            )}
          </motion.div>
          <p className="text-xs sm:text-sm font-medium text-zinc-700">
            Click to upload cover photo
          </p>
          <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">
            1200x400px recommended
          </p>
        </motion.div>
      )}
    </motion.button>
  );
}

function PreviewToggle({
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

function MotionCard({
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

type PreviewMode = "mobile" | "desktop";

const MOBILE_PREVIEW_WIDTH = 320;
const MOBILE_PREVIEW_HEIGHT = 568;
const DESKTOP_PREVIEW_WIDTH = 400;
const DESKTOP_PREVIEW_HEIGHT = 300;

function MobilePreviewFrame({ children }: { children: React.ReactNode }) {
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

function DesktopPreviewFrame({ children }: { children: React.ReactNode }) {
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

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("mobile");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {},
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [originalProfile, setOriginalProfile] =
    useState<ProfileData>(initialProfile);

  const initials =
    (profile.firstName?.[0] || "") + (profile.lastName?.[0] || "");
  const bioWordCount = countWords(profile.bio);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setFetchError(null);
        const res = await fetch("/api/profile");
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to load profile");
        }
        const data = await res.json();
        if (data.profile) {
          const p = data.profile;
          const m = p.missionary || {};
          const social = m.social_links || {};
          const profileData: ProfileData = {
            firstName: p.first_name || "",
            lastName: p.last_name || "",
            email: p.email || "",
            phone: m.phone || "",
            location: m.location || "",
            ministryFocus: m.tagline || "",
            bio: m.bio || "",
            facebook: social.facebook || "",
            instagram: social.instagram || "",
            twitter: social.twitter || "",
            youtube: social.youtube || "",
            website: social.website || "",
            avatarUrl: p.avatar_url || "",
            coverUrl: m.cover_url || "",
          };
          setProfile(profileData);
          setOriginalProfile(profileData);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        const message =
          error instanceof Error ? error.message : "Failed to load profile";
        setFetchError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  useEffect(() => {
    const changed = JSON.stringify(profile) !== JSON.stringify(originalProfile);
    setHasChanges(changed);
  }, [profile, originalProfile]);

  const validateProfile = useCallback((): boolean => {
    const errors: ValidationErrors = {};

    if (profile.firstName && profile.firstName.length > 50) {
      errors.firstName = "First name is too long (max 50 characters)";
    }

    if (profile.lastName && profile.lastName.length > 50) {
      errors.lastName = "Last name is too long (max 50 characters)";
    }

    if (profile.phone && !/^[+\d\s()-]*$/.test(profile.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    if (
      profile.ministryFocus &&
      profile.ministryFocus.length > TAGLINE_MAX_LENGTH
    ) {
      errors.ministryFocus = `Tagline is too long (max ${TAGLINE_MAX_LENGTH} characters)`;
    }

    if (profile.bio) {
      const wordCount = countWords(profile.bio);
      if (wordCount < BIO_MIN_WORDS) {
        errors.bio = `Please write at least ${BIO_MIN_WORDS} words (currently ${wordCount})`;
      } else if (wordCount > BIO_MAX_WORDS) {
        errors.bio = `Please keep under ${BIO_MAX_WORDS} words (currently ${wordCount})`;
      }
    }

    if (profile.website && profile.website.length > 0) {
      if (
        !profile.website.startsWith("http://") &&
        !profile.website.startsWith("https://")
      ) {
        errors.website = "Website should start with http:// or https://";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [profile]);

  const updateProfile = useCallback(
    (field: keyof ProfileData, value: string) => {
      setProfile((prev) => ({ ...prev, [field]: value }));
      if (validationErrors[field as keyof ValidationErrors]) {
        setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [validationErrors],
  );

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    setIsUploading(true);
    const supabase = createClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("profiles").getPublicUrl(filePath);

      const oldAvatarUrl = profile.avatarUrl;
      setProfile((prev) => ({ ...prev, avatarUrl: publicUrl }));

      if (oldAvatarUrl) {
        try {
          const oldPath = oldAvatarUrl.split("/public/profiles/")[1];
          if (oldPath) {
            await supabase.storage.from("profiles").remove([oldPath]);
          }
        } catch (err) {
          console.warn("Failed to delete old avatar:", err);
        }
      }

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: publicUrl }),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      setOriginalProfile((prev) => ({ ...prev, avatarUrl: publicUrl }));
      toast.success("Profile picture updated");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload image";
      console.error("Upload error:", error);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be smaller than 10MB");
      return;
    }

    setIsUploadingCover(true);
    const supabase = createClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const fileName = `cover-${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profiles")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("profiles").getPublicUrl(filePath);

      setProfile((prev) => ({ ...prev, coverUrl: publicUrl }));

      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverUrl: publicUrl }),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      setOriginalProfile((prev) => ({ ...prev, coverUrl: publicUrl }));
      toast.success("Cover photo uploaded");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload cover image";
      console.error("Cover upload error:", error);
      toast.error(errorMessage);
    } finally {
      setIsUploadingCover(false);
      if (coverInputRef.current) {
        coverInputRef.current.value = "";
      }
    }
  };

  const handleSave = async () => {
    if (!validateProfile()) {
      toast.error("Please fix the errors before saving");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          bio: profile.bio,
          tagline: profile.ministryFocus,
          location: profile.location,
          phone: profile.phone,
          coverUrl: profile.coverUrl,
          socialLinks: {
            facebook: profile.facebook,
            instagram: profile.instagram,
            twitter: profile.twitter,
            youtube: profile.youtube,
            website: profile.website,
          },
        }),
      });
      if (res.ok) {
        setOriginalProfile(profile);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
        toast.success("Profile saved");
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to save profile");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save profile";
      console.error("Failed to save profile:", error);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setProfile(originalProfile);
    setHasChanges(false);
    setValidationErrors({});
    toast.info("Changes discarded");
  };

  const handleCopyLink = async () => {
    const link = `${window.location.origin}/workers/${profile.firstName?.toLowerCase()}-${profile.lastName?.toLowerCase()}`;
    await navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    toast.success("Link copied!");
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (fetchError) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-20 space-y-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={gentleTransition}
      >
        <motion.div
          className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ ...springTransition, delay: 0.1 }}
        >
          <AlertCircle className="h-6 w-6 text-red-500" />
        </motion.div>
        <p className="text-zinc-600">{fetchError}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </motion.div>
    );
  }

  return (
    <TooltipProvider>
      <LayoutGroup>
        <motion.div
          className="space-y-6 pb-20"
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp} transition={gentleTransition}>
            <PageHeader
              title="Profile"
              description="Update your information and how you appear to supporters."
            >
              <div className="flex items-center gap-2 flex-wrap">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
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
                              initial={{ scale: 0, rotate: -90 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 90 }}
                              transition={springTransition}
                            >
                              <Check className="h-4 w-4 text-emerald-600" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="copy"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
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
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
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
                          <span className="hidden sm:inline">
                            View Public Page
                          </span>
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
            </PageHeader>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-12">
            <motion.div
              className="lg:col-span-7 space-y-6"
              variants={staggerContainer}
            >
              <MotionCard>
                <CardHeader className="border-b border-zinc-100 px-4 sm:px-6 py-4">
                  <CardTitle className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Personal Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <motion.div
                    className="space-y-5"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        label="First Name"
                        error={validationErrors.firstName}
                      >
                        <Input
                          value={profile.firstName}
                          onChange={(e) =>
                            updateProfile("firstName", e.target.value)
                          }
                          className="h-10 transition-all duration-200 focus:ring-2 focus:ring-zinc-200"
                          placeholder="Your first name"
                        />
                      </FormField>
                      <FormField
                        label="Last Name"
                        error={validationErrors.lastName}
                      >
                        <Input
                          value={profile.lastName}
                          onChange={(e) =>
                            updateProfile("lastName", e.target.value)
                          }
                          className="h-10 transition-all duration-200 focus:ring-2 focus:ring-zinc-200"
                          placeholder="Your last name"
                        />
                      </FormField>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField label="Location" icon={MapPin}>
                        <Input
                          value={profile.location}
                          onChange={(e) =>
                            updateProfile("location", e.target.value)
                          }
                          placeholder="City, Country"
                          className="h-10 transition-all duration-200 focus:ring-2 focus:ring-zinc-200"
                        />
                      </FormField>
                      <FormField
                        label="Phone"
                        icon={PhoneIcon}
                        error={validationErrors.phone}
                      >
                        <Input
                          value={profile.phone}
                          onChange={(e) =>
                            updateProfile("phone", e.target.value)
                          }
                          placeholder="+1 (555) 000-0000"
                          className="h-10 transition-all duration-200 focus:ring-2 focus:ring-zinc-200"
                        />
                      </FormField>
                    </div>

                    <FormField
                      label="Tagline"
                      error={validationErrors.ministryFocus}
                      helperText={
                        <p className="text-[11px] text-zinc-400 flex items-start gap-1.5">
                          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>
                            A brief description of your work that appears next
                            to your name on the giving page and directory.
                            <span
                              className={cn(
                                "ml-1 font-medium",
                                profile.ministryFocus.length >
                                  TAGLINE_MAX_LENGTH - 10
                                  ? "text-amber-500"
                                  : "",
                              )}
                            >
                              ({profile.ministryFocus.length}/
                              {TAGLINE_MAX_LENGTH})
                            </span>
                          </span>
                        </p>
                      }
                    >
                      <Input
                        value={profile.ministryFocus}
                        onChange={(e) =>
                          updateProfile("ministryFocus", e.target.value)
                        }
                        placeholder="e.g., Church planting in Southeast Asia"
                        maxLength={TAGLINE_MAX_LENGTH}
                        className="h-10 transition-all duration-200 focus:ring-2 focus:ring-zinc-200"
                      />
                    </FormField>

                    <FormField
                      label="About You"
                      error={validationErrors.bio}
                      helperText={
                        <div className="space-y-1">
                          <p className="text-[11px] text-zinc-400 flex items-start gap-1.5">
                            <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span>
                              Share your story, calling, and ministry work. This
                              appears on your public profile page. Include what
                              you do, where you serve, and how supporters can
                              pray for you.
                            </span>
                          </p>
                          <p
                            className={cn(
                              "text-[11px] font-medium text-right",
                              bioWordCount < BIO_MIN_WORDS
                                ? "text-zinc-400"
                                : bioWordCount > BIO_MAX_WORDS
                                  ? "text-amber-500"
                                  : "text-emerald-600",
                            )}
                          >
                            {bioWordCount} / {BIO_MIN_WORDS}–{BIO_MAX_WORDS}{" "}
                            words
                          </p>
                        </div>
                      }
                    >
                      <Textarea
                        value={profile.bio}
                        onChange={(e) => updateProfile("bio", e.target.value)}
                        placeholder="Tell supporters about yourself, your ministry, and how they can partner with you..."
                        className="min-h-[180px] resize-none transition-all duration-200 focus:ring-2 focus:ring-zinc-200"
                        maxLength={BIO_MAX_CHARS}
                      />
                    </FormField>
                  </motion.div>
                </CardContent>
              </MotionCard>

              <MotionCard>
                <CardHeader className="border-b border-zinc-100 px-4 sm:px-6 py-4">
                  <CardTitle className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Profile Photos
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-6">
                  <motion.div
                    className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
                    variants={fadeInUp}
                  >
                    <ImageUpload
                      value={profile.avatarUrl}
                      onChange={(url) => {
                        updateProfile("avatarUrl", url);
                        handleSave(); // Save to DB immediately when avatar changes
                      }}
                      path="avatars"
                      aspect={1}
                    >
                      <AvatarUploadArea
                        avatarUrl={profile.avatarUrl}
                        initials={initials}
                        isUploading={isUploading}
                        onUploadClick={() => {}} // Handled by ImageUpload wrapper
                      />
                    </ImageUpload>
                    <div className="space-y-2 text-center sm:text-left">
                      <p className="text-sm font-medium text-zinc-900">
                        Profile Picture
                      </p>
                      <p className="text-xs text-zinc-500 max-w-[220px]">
                        Square image, at least 400x400px. JPG or PNG, max 5MB.
                      </p>
                      <ImageUpload
                        value={profile.avatarUrl}
                        onChange={(url) => {
                          updateProfile("avatarUrl", url);
                          handleSave();
                        }}
                        path="avatars"
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                        >
                          <Upload className="mr-1.5 h-3.5 w-3.5" />
                          Upload Photo
                        </Button>
                      </ImageUpload>
                    </div>
                  </motion.div>

                  <motion.div className="space-y-2" variants={fadeInUp}>
                    <Label className="text-xs font-medium text-zinc-500">
                      Cover Photo
                    </Label>
                    <ImageUpload
                      value={profile.coverUrl}
                      onChange={(url) => {
                        updateProfile("coverUrl", url);
                        handleSave();
                      }}
                      path="covers"
                      aspect={3 / 1}
                    >
                      <CoverUploadArea
                        coverUrl={profile.coverUrl}
                        isUploading={isUploadingCover}
                        onUploadClick={() => {}} // Handled by ImageUpload wrapper
                      />
                    </ImageUpload>
                    <p className="text-[11px] text-zinc-400">
                      This image appears at the top of your public profile. Max
                      10MB.
                    </p>
                  </motion.div>
                </CardContent>
              </MotionCard>

              <MotionCard>
                <CardHeader className="border-b border-zinc-100 px-4 sm:px-6 py-4">
                  <CardTitle className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Social Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <motion.div
                    className="space-y-4"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                  >
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField label="Instagram" icon={Instagram}>
                        <Input
                          value={profile.instagram}
                          onChange={(e) =>
                            updateProfile("instagram", e.target.value)
                          }
                          placeholder="@yourhandle"
                          className="h-10 transition-all duration-200 focus:ring-2 focus:ring-zinc-200"
                        />
                      </FormField>
                      <FormField label="Facebook" icon={Facebook}>
                        <Input
                          value={profile.facebook}
                          onChange={(e) =>
                            updateProfile("facebook", e.target.value)
                          }
                          placeholder="facebook.com/yourpage"
                          className="h-10 transition-all duration-200 focus:ring-2 focus:ring-zinc-200"
                        />
                      </FormField>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField label="Twitter / X" icon={Twitter}>
                        <Input
                          value={profile.twitter}
                          onChange={(e) =>
                            updateProfile("twitter", e.target.value)
                          }
                          placeholder="@yourhandle"
                          className="h-10 transition-all duration-200 focus:ring-2 focus:ring-zinc-200"
                        />
                      </FormField>
                      <FormField label="YouTube" icon={Youtube}>
                        <Input
                          value={profile.youtube}
                          onChange={(e) =>
                            updateProfile("youtube", e.target.value)
                          }
                          placeholder="youtube.com/@channel"
                          className="h-10 transition-all duration-200 focus:ring-2 focus:ring-zinc-200"
                        />
                      </FormField>
                    </div>
                    <FormField
                      label="Website"
                      icon={LinkIcon}
                      error={validationErrors.website}
                    >
                      <Input
                        value={profile.website}
                        onChange={(e) =>
                          updateProfile("website", e.target.value)
                        }
                        placeholder="https://yourwebsite.com"
                        className="h-10 transition-all duration-200 focus:ring-2 focus:ring-zinc-200"
                      />
                    </FormField>
                  </motion.div>
                </CardContent>
              </MotionCard>
            </motion.div>

            <motion.div
              className="lg:col-span-5"
              variants={fadeInUp}
              transition={{ ...gentleTransition, delay: 0.15 }}
            >
              <div className="sticky top-24 pb-6">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-medium text-zinc-500">
                    Live Preview
                  </span>
                  <PreviewToggle
                    value={previewMode}
                    onChange={setPreviewMode}
                  />
                </div>

                <AnimatePresence mode="wait">
                  {previewMode === "mobile" ? (
                    <MobilePreviewFrame>
                      <motion.div
                        key="mobile-preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={gentleTransition}
                        className="border-[12px] border-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl bg-white relative"
                        style={{
                          width: MOBILE_PREVIEW_WIDTH,
                          height: MOBILE_PREVIEW_HEIGHT,
                        }}
                      >
                        <div className="absolute top-0 left-0 right-0 h-[120px]">
                          <motion.img
                            key={profile.coverUrl || "placeholder"}
                            src={profile.coverUrl || PLACEHOLDER_COVER}
                            alt="Cover"
                            className="w-full h-full object-cover"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.25 }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent" />
                        </div>

                        <div className="absolute top-[72px] left-0 right-0 flex justify-center">
                          <motion.div
                            className="h-[72px] w-[72px] rounded-full border-[3px] border-white bg-white overflow-hidden shadow-lg ring-4 ring-white/50"
                            layout
                            transition={springTransition}
                          >
                            <Avatar className="h-full w-full">
                              <AvatarImage
                                src={profile.avatarUrl || PLACEHOLDER_AVATAR}
                              />
                              <AvatarFallback className="bg-zinc-100 font-semibold text-base">
                                {initials || "U"}
                              </AvatarFallback>
                            </Avatar>
                          </motion.div>
                        </div>

                        <div className="absolute top-[152px] left-0 right-0 bottom-0 px-5 text-center flex flex-col overflow-hidden">
                          <div className="flex-shrink-0">
                            <div className="flex items-center justify-center gap-1.5">
                              <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
                                {profile.firstName || "First"}{" "}
                                {profile.lastName || "Last"}
                              </h2>
                              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[8px] font-bold uppercase tracking-wider">
                                <Check className="h-2 w-2" /> Verified
                              </div>
                            </div>
                            <div className="flex items-center justify-center gap-1 text-[10px] text-zinc-500 mt-0.5">
                              <MapPin className="h-2.5 w-2.5" />
                              <span>{profile.location || "Location"}</span>
                            </div>
                          </div>

                          <div className="mt-4 flex justify-center flex-shrink-0">
                            <QuickGive workerId="preview" size="sm" />
                          </div>

                          <div className="mt-6 flex-1 flex flex-col min-h-0">
                            <Tabs
                              defaultValue="story"
                              className="w-full flex-1 flex flex-col"
                            >
                              <TabsList className="w-full justify-center border-b border-zinc-100 bg-transparent h-auto p-0 mb-4 gap-4">
                                <TabsTrigger
                                  value="story"
                                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:shadow-none px-0 py-1.5 font-semibold text-zinc-400 data-[state=active]:text-zinc-900 transition-all text-[10px]"
                                >
                                  Our Story
                                </TabsTrigger>
                                <TabsTrigger
                                  value="updates"
                                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:shadow-none px-0 py-1.5 font-semibold text-zinc-400 data-[state=active]:text-zinc-900 transition-all text-[10px]"
                                >
                                  Field Journal
                                </TabsTrigger>
                              </TabsList>

                              <TabsContent
                                value="story"
                                className="outline-none flex-1 overflow-y-auto text-left pb-4"
                              >
                                <div className="space-y-3">
                                  <p className="text-[11px] font-semibold text-zinc-900 leading-relaxed italic border-l-2 border-emerald-500 pl-3">
                                    &quot;
                                    {profile.ministryFocus ||
                                      "Your tagline will appear here"}
                                    &quot;
                                  </p>
                                  <div className="text-[10px] text-zinc-500 leading-relaxed whitespace-pre-wrap">
                                    {profile.bio ||
                                      "Your bio will appear here. Share your story, calling, and ministry work with potential supporters."}
                                  </div>
                                </div>
                              </TabsContent>

                              <TabsContent
                                value="updates"
                                className="outline-none flex-1 overflow-y-auto pb-4"
                              >
                                <div className="space-y-4 py-2">
                                  <div className="p-3 rounded-xl border border-zinc-100 bg-zinc-50/50 text-left">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="h-5 w-5 rounded-full bg-zinc-200" />
                                      <div className="flex-1">
                                        <div className="h-2 w-16 bg-zinc-200 rounded mb-1" />
                                        <div className="h-1.5 w-10 bg-zinc-100 rounded" />
                                      </div>
                                    </div>
                                    <div className="h-2 w-full bg-zinc-100 rounded mb-1.5" />
                                    <div className="h-2 w-2/3 bg-zinc-100 rounded" />
                                  </div>
                                  <p className="text-[10px] text-zinc-400 text-center italic">
                                    Updates from your feed will appear here
                                  </p>
                                </div>
                              </TabsContent>
                            </Tabs>
                          </div>

                          <div className="flex justify-center gap-3 py-3 mt-auto bg-white border-t border-zinc-50">
                            <AnimatePresence>
                              {profile.instagram && (
                                <SocialIcon
                                  key="mobile-instagram"
                                  platform="instagram"
                                  url={profile.instagram}
                                />
                              )}
                              {profile.facebook && (
                                <SocialIcon
                                  key="mobile-facebook"
                                  platform="facebook"
                                  url={profile.facebook}
                                />
                              )}
                              {profile.twitter && (
                                <SocialIcon
                                  key="mobile-twitter"
                                  platform="twitter"
                                  url={profile.twitter}
                                />
                              )}
                              {profile.youtube && (
                                <SocialIcon
                                  key="mobile-youtube"
                                  platform="youtube"
                                  url={profile.youtube}
                                />
                              )}
                              {profile.website && (
                                <SocialIcon
                                  key="mobile-website"
                                  platform="website"
                                  url={profile.website}
                                />
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        <div className="absolute top-0 left-0 right-0 h-6 flex justify-center pt-0.5 pointer-events-none">
                          <div className="bg-zinc-900 h-4 w-24 rounded-full" />
                        </div>
                        <div className="absolute bottom-1 left-0 right-0 flex justify-center pointer-events-none">
                          <div className="bg-zinc-200 h-1 w-28 rounded-full" />
                        </div>
                      </motion.div>
                    </MobilePreviewFrame>
                  ) : (
                    <DesktopPreviewFrame>
                      <motion.div
                        key="desktop-preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={gentleTransition}
                        className="border border-zinc-200 rounded-xl overflow-hidden shadow-lg bg-white"
                        style={{
                          width: DESKTOP_PREVIEW_WIDTH,
                          height: DESKTOP_PREVIEW_HEIGHT,
                        }}
                      >
                        <div className="h-[24px] bg-zinc-100 border-b border-zinc-200 flex items-center px-3 gap-1.5">
                          <div className="h-2 w-2 rounded-full bg-zinc-300" />
                          <div className="h-2 w-2 rounded-full bg-zinc-300" />
                          <div className="h-2 w-2 rounded-full bg-zinc-300" />
                        </div>

                        <div
                          className="relative"
                          style={{ height: DESKTOP_PREVIEW_HEIGHT - 24 }}
                        >
                          <div className="h-[72px]">
                            <Image
                              src={profile.coverUrl || PLACEHOLDER_COVER}
                              alt="Cover"
                              width={400}
                              height={72}
                              unoptimized
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-x-0 top-0 h-[72px] bg-gradient-to-t from-white/40 via-transparent to-transparent" />
                          </div>

                          <div className="px-5 pb-4">
                            <div className="flex items-end gap-3 -mt-6">
                              <Avatar className="h-12 w-12 border-2 border-white shadow-md ring-2 ring-white/50">
                                <AvatarImage
                                  src={profile.avatarUrl || PLACEHOLDER_AVATAR}
                                />
                                <AvatarFallback className="bg-zinc-100 text-sm font-semibold">
                                  {initials || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 pb-0.5 min-w-0">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <h2 className="text-base font-bold text-zinc-900 tracking-tight truncate">
                                    {profile.firstName || "First"}{" "}
                                    {profile.lastName || "Last"}
                                  </h2>
                                  <div className="flex-shrink-0 flex items-center gap-1 px-1 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[6px] font-bold uppercase tracking-wider">
                                    <Check className="h-2 w-2" />
                                  </div>
                                </div>
                                <p className="text-[10px] text-zinc-500 flex items-center gap-0.5">
                                  <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
                                  <span className="truncate">
                                    {profile.location || "Location"}
                                  </span>
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-3">
                              <QuickGive workerId="preview" size="xs" />
                              <div className="flex gap-2 flex-shrink-0">
                                <AnimatePresence>
                                  {profile.instagram && (
                                    <SocialIcon
                                      key="desktop-instagram"
                                      platform="instagram"
                                      url={profile.instagram}
                                    />
                                  )}
                                  {profile.facebook && (
                                    <SocialIcon
                                      key="desktop-facebook"
                                      platform="facebook"
                                      url={profile.facebook}
                                    />
                                  )}
                                  {profile.twitter && (
                                    <SocialIcon
                                      key="desktop-twitter"
                                      platform="twitter"
                                      url={profile.twitter}
                                    />
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>

                            <p className="text-[10px] font-semibold text-zinc-600 mt-3 line-clamp-1 leading-relaxed italic border-l border-emerald-500 pl-2">
                              &quot;
                              {profile.ministryFocus ||
                                "Your tagline will appear here"}
                              &quot;
                            </p>
                            <p className="text-[10px] text-zinc-400 mt-2 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                              {profile.bio ||
                                "Your bio will appear here. Share your story with supporters."}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </DesktopPreviewFrame>
                  )}
                </AnimatePresence>

                <motion.p
                  className="text-[10px] text-zinc-400 text-center mt-3 flex items-center justify-center gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Updates as you type
                </motion.p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </LayoutGroup>
    </TooltipProvider>
  );
}

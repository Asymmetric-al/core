"use client";

import { motion } from "@asym/lib/motion";
import { ImageUpload } from "@asym/ui/components/primitives/image-upload";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { cn } from "@asym/ui/lib/utils";
import {
  Globe,
  MapPin,
  Phone as PhoneIcon,
  Upload,
  User,
  ImageIcon,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Link as LinkIcon,
  Info,
} from "lucide-react";

import {
  BIO_MAX_CHARS,
  BIO_MAX_WORDS,
  BIO_MIN_WORDS,
  TAGLINE_MAX_LENGTH,
} from "./profile-model";
import {
  AvatarUploadArea,
  CoverUploadArea,
  FormField,
  MotionCard,
  staggerContainer,
  fadeInUp,
} from "./profile-primitives";

import type { ProfileData, ValidationErrors } from "./profile-model";

export type ProfileFormColumnProps = {
  profile: ProfileData;
  validationErrors: ValidationErrors;
  bioWordCount: number;
  initials: string;
  updateProfile: (field: keyof ProfileData, value: string) => void;
  handleSave: () => void | Promise<void>;
};

export function ProfileFormColumn({
  profile,
  validationErrors,
  bioWordCount,
  initials,
  updateProfile,
  handleSave,
}: ProfileFormColumnProps) {
  return (
    <motion.div className="lg:col-span-7 space-y-6" variants={staggerContainer}>
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
              <FormField label="First Name" error={validationErrors.firstName}>
                <Input
                  value={profile.firstName}
                  onChange={(e) => updateProfile("firstName", e.target.value)}
                  className="h-10 transition-all duration-200 focus:ring-2 focus:ring-zinc-200"
                  placeholder="Your first name"
                />
              </FormField>
              <FormField label="Last Name" error={validationErrors.lastName}>
                <Input
                  value={profile.lastName}
                  onChange={(e) => updateProfile("lastName", e.target.value)}
                  className="h-10 transition-all duration-200 focus:ring-2 focus:ring-zinc-200"
                  placeholder="Your last name"
                />
              </FormField>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Location" icon={MapPin}>
                <Input
                  value={profile.location}
                  onChange={(e) => updateProfile("location", e.target.value)}
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
                  onChange={(e) => updateProfile("phone", e.target.value)}
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
                    A brief description of your work that appears next to your
                    name on the giving page and directory.
                    <span
                      className={cn(
                        "ml-1 font-medium",
                        profile.ministryFocus.length > TAGLINE_MAX_LENGTH - 10
                          ? "text-amber-500"
                          : "",
                      )}
                    >
                      ({profile.ministryFocus.length}/{TAGLINE_MAX_LENGTH})
                    </span>
                  </span>
                </p>
              }
            >
              <Input
                value={profile.ministryFocus}
                onChange={(e) => updateProfile("ministryFocus", e.target.value)}
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
                      Share your story, calling, and ministry work. This appears
                      on your public profile page. Include what you do, where
                      you serve, and how supporters can pray for you.
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
                    {bioWordCount} / {BIO_MIN_WORDS}–{BIO_MAX_WORDS} words
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
                handleSave();
              }}
              path="avatars"
              aspect={1}
              triggerAriaLabel="Upload profile picture"
            >
              <AvatarUploadArea
                avatarUrl={profile.avatarUrl}
                initials={initials}
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
              triggerAriaLabel="Upload cover photo"
            >
              <CoverUploadArea coverUrl={profile.coverUrl} />
            </ImageUpload>
            <p className="text-[11px] text-zinc-400">
              This image appears at the top of your public profile. Max 10MB.
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
                  onChange={(e) => updateProfile("instagram", e.target.value)}
                  placeholder="@yourhandle"
                  className="h-10 transition-all duration-200 focus:ring-2 focus:ring-zinc-200"
                />
              </FormField>
              <FormField label="Facebook" icon={Facebook}>
                <Input
                  value={profile.facebook}
                  onChange={(e) => updateProfile("facebook", e.target.value)}
                  placeholder="facebook.com/yourpage"
                  className="h-10 transition-all duration-200 focus:ring-2 focus:ring-zinc-200"
                />
              </FormField>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Twitter / X" icon={Twitter}>
                <Input
                  value={profile.twitter}
                  onChange={(e) => updateProfile("twitter", e.target.value)}
                  placeholder="@yourhandle"
                  className="h-10 transition-all duration-200 focus:ring-2 focus:ring-zinc-200"
                />
              </FormField>
              <FormField label="YouTube" icon={Youtube}>
                <Input
                  value={profile.youtube}
                  onChange={(e) => updateProfile("youtube", e.target.value)}
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
                onChange={(e) => updateProfile("website", e.target.value)}
                placeholder="https://yourwebsite.com"
                className="h-10 transition-all duration-200 focus:ring-2 focus:ring-zinc-200"
              />
            </FormField>
          </motion.div>
        </CardContent>
      </MotionCard>
    </motion.div>
  );
}

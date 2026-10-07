"use client";

import { motion } from "@asym/lib/motion";
import { ImageUpload } from "@asym/ui/components/primitives/image-upload";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from "@asym/ui/components/shadcn/icons";
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
  Link as LinkIcon,
  Info,
} from "lucide-react";

import {
  BIO_MAX_CHARS,
  BIO_MAX_WORDS,
  BIO_MIN_WORDS,
  TAGLINE_MAX_LENGTH,
} from "./profile-model";
import { staggerContainer, fadeInUp } from "./profile-motion";
import {
  AvatarUploadArea,
  CoverUploadArea,
  FormField,
  MotionCard,
} from "./profile-primitives";

import type { ProfileData, ValidationErrors } from "./profile-model";

export type ProfileFormColumnProps = {
  profile: ProfileData;
  validationErrors: ValidationErrors;
  bioWordCount: number;
  initials: string;
  updateProfile: (field: keyof ProfileData, value: string) => void;
  onSave: () => void | Promise<void>;
};

export function ProfileFormColumn({
  profile,
  validationErrors,
  bioWordCount,
  initials,
  updateProfile,
  onSave,
}: ProfileFormColumnProps) {
  return (
    <motion.div className="lg:col-span-7 space-y-6" variants={staggerContainer}>
      <MotionCard>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <User className="size-4" />
              Personal Details
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                  placeholder="Your first name"
                />
              </FormField>
              <FormField label="Last Name" error={validationErrors.lastName}>
                <Input
                  value={profile.lastName}
                  onChange={(e) => updateProfile("lastName", e.target.value)}
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
                />
              </FormField>
            </div>

            <FormField
              label="Tagline"
              error={validationErrors.ministryFocus}
              helperText={
                <p className="text-sm text-muted-foreground flex items-start gap-1.5">
                  <Info className="size-3 mt-0.5 shrink-0" />
                  <span>
                    A brief description of your work that appears next to your
                    name on the giving page and directory.
                    <span
                      className={cn(
                        "ml-1 font-medium",
                        profile.ministryFocus.length > TAGLINE_MAX_LENGTH - 10
                          ? "text-warning"
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
              />
            </FormField>

            <FormField
              label="About You"
              error={validationErrors.bio}
              helperText={
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-start gap-1.5">
                    <Info className="size-3 mt-0.5 shrink-0" />
                    <span>
                      Share your story, calling, and ministry work. This appears
                      on your public profile page. Include what you do, where
                      you serve, and how supporters can pray for you.
                    </span>
                  </p>
                  <p
                    className={cn(
                      "text-xs font-medium text-right",
                      bioWordCount < BIO_MIN_WORDS
                        ? "text-muted-foreground"
                        : bioWordCount > BIO_MAX_WORDS
                          ? "text-warning"
                          : "text-success",
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
                rows={7}
                maxLength={BIO_MAX_CHARS}
              />
            </FormField>
          </motion.div>
        </CardContent>
      </MotionCard>

      <MotionCard>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <ImageIcon className="size-4" />
              Profile Photos
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <motion.div
            className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
            variants={fadeInUp}
          >
            <ImageUpload
              value={profile.avatarUrl}
              onChange={(url) => {
                updateProfile("avatarUrl", url);
                onSave();
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
              <p className="text-sm font-medium text-foreground">
                Profile Picture
              </p>
              <p className="text-xs text-muted-foreground max-w-55">
                Square image, at least 400x400px. JPG or PNG, max 5MB.
              </p>
              <ImageUpload
                value={profile.avatarUrl}
                onChange={(url) => {
                  updateProfile("avatarUrl", url);
                  onSave();
                }}
                path="avatars"
              >
                <Button type="button" variant="outline" size="sm">
                  <Upload aria-hidden data-icon="inline-start" />
                  Upload Photo
                </Button>
              </ImageUpload>
            </div>
          </motion.div>

          <motion.div className="space-y-2" variants={fadeInUp}>
            <Label>Cover Photo</Label>
            <ImageUpload
              value={profile.coverUrl}
              onChange={(url) => {
                updateProfile("coverUrl", url);
                onSave();
              }}
              path="covers"
              aspect={3 / 1}
              triggerAriaLabel="Upload cover photo"
            >
              <CoverUploadArea coverUrl={profile.coverUrl} />
            </ImageUpload>
            <p className="text-xs text-muted-foreground">
              This image appears at the top of your public profile. Max 10MB.
            </p>
          </motion.div>
        </CardContent>
      </MotionCard>

      <MotionCard>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Globe className="size-4" />
              Social Links
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                />
              </FormField>
              <FormField label="Facebook" icon={Facebook}>
                <Input
                  value={profile.facebook}
                  onChange={(e) => updateProfile("facebook", e.target.value)}
                  placeholder="facebook.com/yourpage"
                />
              </FormField>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Twitter / X" icon={Twitter}>
                <Input
                  value={profile.twitter}
                  onChange={(e) => updateProfile("twitter", e.target.value)}
                  placeholder="@yourhandle"
                />
              </FormField>
              <FormField label="YouTube" icon={Youtube}>
                <Input
                  value={profile.youtube}
                  onChange={(e) => updateProfile("youtube", e.target.value)}
                  placeholder="youtube.com/@channel"
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
              />
            </FormField>
          </motion.div>
        </CardContent>
      </MotionCard>
    </motion.div>
  );
}

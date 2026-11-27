"use client";

import { motion } from "@asym/lib/motion";
import { ImageUpload } from "@asym/ui/components/primitives/image-upload";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
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
import { useEffect, useId, useRef } from "react";

import {
  BIO_MAX_CHARS,
  BIO_MAX_WORDS,
  BIO_MIN_WORDS,
  TAGLINE_MAX_LENGTH,
} from "./profile-model";
import { staggerContainer, fadeInUp } from "./profile-motion";
import { CoverUploadArea, FormField, MotionCard } from "./profile-primitives";

import type { ProfileData, ValidationErrors } from "./profile-model";

export type ProfileFormColumnProps = {
  formId?: string;
  profile: ProfileData;
  validationErrors: ValidationErrors;
  // Each rise moves focus to the first field with an error.
  rejectedSaveCount?: number;
  // Set while the page is read-only: fields stay readable and the uploads
  // point to this notice for why they are unavailable.
  readOnlyNoticeId?: string;
  bioWordCount: number;
  initials: string;
  updateProfile: (field: keyof ProfileData, value: string) => void;
  onSave: () => void | Promise<void>;
};

export function ProfileFormColumn({
  formId,
  profile,
  validationErrors,
  rejectedSaveCount = 0,
  readOnlyNoticeId,
  bioWordCount,
  initials,
  updateProfile,
  onSave,
}: ProfileFormColumnProps) {
  const coverLabelId = useId();
  const coverHintId = useId();
  const readOnly = readOnlyNoticeId !== undefined;
  const columnRef = useRef<HTMLFormElement>(null);
  const focusedRejection = useRef(rejectedSaveCount);
  useEffect(() => {
    if (rejectedSaveCount === focusedRejection.current) return;
    focusedRejection.current = rejectedSaveCount;
    columnRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
  }, [rejectedSaveCount]);
  return (
    <motion.form
      ref={columnRef}
      id={formId}
      noValidate
      tabIndex={-1}
      onSubmit={(event) => {
        event.preventDefault();
        void onSave();
      }}
      className="lg:col-span-7 space-y-6 outline-none"
      variants={staggerContainer}
    >
      <MotionCard>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <User className="size-4" />
              Personal details
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
              <FormField label="First name" error={validationErrors.firstName}>
                <Input
                  value={profile.firstName}
                  readOnly={readOnly}
                  onChange={(e) => updateProfile("firstName", e.target.value)}
                  placeholder="Your first name"
                />
              </FormField>
              <FormField label="Last name" error={validationErrors.lastName}>
                <Input
                  value={profile.lastName}
                  readOnly={readOnly}
                  onChange={(e) => updateProfile("lastName", e.target.value)}
                  placeholder="Your last name"
                />
              </FormField>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Location" icon={MapPin}>
                <Input
                  value={profile.location}
                  readOnly={readOnly}
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
                  readOnly={readOnly}
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
                    A short line about your work, shown with your name on your
                    giving page.
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
                readOnly={readOnly}
                onChange={(e) => updateProfile("ministryFocus", e.target.value)}
                placeholder="e.g., Church planting in Southeast Asia"
                maxLength={TAGLINE_MAX_LENGTH}
              />
            </FormField>

            <FormField
              label="About you"
              error={validationErrors.bio}
              helperText={
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-start gap-1.5">
                    <Info className="size-3 mt-0.5 shrink-0" />
                    <span>
                      Your story for your giving page: what you do, where you
                      serve and how supporters can pray for you.
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
                    {bioWordCount < BIO_MIN_WORDS
                      ? `${bioWordCount} words · aim for ${BIO_MIN_WORDS} or more`
                      : `${bioWordCount} of ${BIO_MAX_WORDS} words`}
                  </p>
                </div>
              }
            >
              <Textarea
                value={profile.bio}
                readOnly={readOnly}
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
              Profile photos
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <motion.div
            className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
            variants={fadeInUp}
          >
            <Avatar className="size-24 sm:size-28">
              {profile.avatarUrl ? (
                <AvatarImage src={profile.avatarUrl} alt="" />
              ) : null}
              <AvatarFallback>{initials || "?"}</AvatarFallback>
            </Avatar>
            <div className="space-y-2 text-center sm:text-left">
              <p className="text-sm font-medium text-foreground">
                Profile picture
              </p>
              <p className="text-xs text-muted-foreground max-w-55">
                Square JPG or PNG, at least 400 × 400 pixels. Cropped photo up
                to 4 MB.
              </p>
              <ImageUpload
                value={profile.avatarUrl}
                onChange={(url) => {
                  updateProfile("avatarUrl", url);
                  onSave();
                }}
                path="avatars"
                aspect={1}
                disabled={readOnly}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  // Left unset otherwise, so the uploader keeps focus on it
                  // while an upload runs.
                  focusableWhenDisabled={readOnly ? true : undefined}
                  aria-describedby={readOnlyNoticeId}
                >
                  <Upload aria-hidden data-icon="inline-start" />
                  {profile.avatarUrl ? "Change photo" : "Upload photo"}
                </Button>
              </ImageUpload>
            </div>
          </motion.div>

          <motion.div className="space-y-2" variants={fadeInUp}>
            <Label id={coverLabelId}>Cover photo</Label>
            <ImageUpload
              value={profile.coverUrl}
              onChange={(url) => {
                updateProfile("coverUrl", url);
                onSave();
              }}
              path="covers"
              aspect={3 / 1}
              triggerAriaLabel="Upload cover photo"
              disabled={readOnly}
            >
              <CoverUploadArea
                coverUrl={profile.coverUrl}
                aria-labelledby={coverLabelId}
                aria-describedby={
                  readOnly ? `${coverHintId} ${readOnlyNoticeId}` : coverHintId
                }
                tabIndex={readOnly ? 0 : undefined}
              />
            </ImageUpload>
            <p id={coverHintId} className="text-xs text-muted-foreground">
              Shown across the top of your giving page. Cropped cover up to 4
              MB.
            </p>
          </motion.div>
        </CardContent>
      </MotionCard>

      <MotionCard>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Globe className="size-4" />
              Social links
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
                  readOnly={readOnly}
                  onChange={(e) => updateProfile("instagram", e.target.value)}
                  placeholder="@yourhandle"
                />
              </FormField>
              <FormField label="Facebook" icon={Facebook}>
                <Input
                  value={profile.facebook}
                  readOnly={readOnly}
                  onChange={(e) => updateProfile("facebook", e.target.value)}
                  placeholder="facebook.com/yourpage"
                />
              </FormField>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Twitter / X" icon={Twitter}>
                <Input
                  value={profile.twitter}
                  readOnly={readOnly}
                  onChange={(e) => updateProfile("twitter", e.target.value)}
                  placeholder="@yourhandle"
                />
              </FormField>
              <FormField label="YouTube" icon={Youtube}>
                <Input
                  value={profile.youtube}
                  readOnly={readOnly}
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
                readOnly={readOnly}
                onChange={(e) => updateProfile("website", e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </FormField>
          </motion.div>
        </CardContent>
      </MotionCard>
    </motion.form>
  );
}

"use client";

import { motion, AnimatePresence } from "@asym/lib/motion";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@asym/ui/components/shadcn/tabs";
import { Check, MapPin } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import {
  DESKTOP_PREVIEW_HEIGHT,
  DESKTOP_PREVIEW_WIDTH,
  MOBILE_PREVIEW_HEIGHT,
  MOBILE_PREVIEW_WIDTH,
  PLACEHOLDER_AVATAR,
  PLACEHOLDER_COVER,
} from "./profile-model";
import { fadeInUp, gentleTransition, springTransition } from "./profile-motion";
import {
  DesktopPreviewFrame,
  MobilePreviewFrame,
  PreviewToggle,
  SocialIcon,
} from "./profile-primitives";

import type { PreviewMode, ProfileData } from "./profile-model";

import { QuickGive } from "@/features/giving/components/quick-give";

export type ProfilePreviewFrameProps = {
  profile: ProfileData;
  initials: string;
};

function MobileProfilePreview({ profile, initials }: ProfilePreviewFrameProps) {
  return (
    <MobilePreviewFrame>
      <motion.div
        key="mobile-preview"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={gentleTransition}
        className="border-12 border-border rounded-4xl overflow-hidden shadow-2xl bg-card relative"
        style={{
          width: MOBILE_PREVIEW_WIDTH,
          height: MOBILE_PREVIEW_HEIGHT,
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-30">
          <motion.img
            key={profile.coverUrl || "placeholder"}
            src={profile.coverUrl || PLACEHOLDER_COVER}
            alt="Cover"
            className="size-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          />
          <div className="absolute inset-0 bg-linear-to-t from-background/60 via-transparent to-transparent" />
        </div>

        <div className="absolute top-18 left-0 right-0 flex justify-center">
          <motion.div
            className="rounded-full border-3 border-background bg-card overflow-hidden shadow-lg ring-4 ring-background/50 size-18"
            layout
            transition={springTransition}
          >
            <Avatar className="size-full">
              <AvatarImage src={profile.avatarUrl || PLACEHOLDER_AVATAR} />
              <AvatarFallback>{initials || "U"}</AvatarFallback>
            </Avatar>
          </motion.div>
        </div>

        <div className="absolute top-38 left-0 right-0 bottom-0 px-5 text-center flex flex-col overflow-hidden">
          <div className="shrink-0">
            <div className="flex items-center justify-center gap-1.5">
              <h2 className="text-lg font-semibold text-foreground tracking-tight">
                {profile.firstName || "First"} {profile.lastName || "Last"}
              </h2>
              <div className="flex items-center gap-1 rounded-full bg-info/10 text-info border border-info/20 text-xs font-semibold uppercase tracking-wider p-2">
                <Check className="size-2" /> Verified
              </div>
            </div>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPin className="size-2.5" />
              <span>{profile.location || "Location"}</span>
            </div>
          </div>

          <div className="mt-4 flex justify-center shrink-0">
            <QuickGive workerId="preview" size="sm" />
          </div>

          <div className="mt-6 flex-1 flex flex-col min-h-0">
            <Tabs defaultValue="story" className="w-full flex-1 flex flex-col">
              <div className="mb-4 flex justify-center">
                <TabsList variant="line">
                  <TabsTrigger value="story">Our Story</TabsTrigger>
                  <TabsTrigger value="updates">Field Journal</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value="story"
                className="flex-1 overflow-y-auto pb-4"
              >
                <div className="space-y-3 text-left">
                  <p className="text-xs font-semibold text-foreground leading-relaxed italic border-l-2 border-success pl-3">
                    &quot;
                    {profile.ministryFocus || "Your tagline will appear here"}
                    &quot;
                  </p>
                  <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {profile.bio ||
                      "Your bio will appear here. Share your story, calling, and ministry work with potential supporters."}
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="updates"
                className="flex-1 overflow-y-auto pb-4"
              >
                <div className="space-y-4 py-2">
                  <div className="p-3 rounded-xl border border-border bg-muted/50 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="size-5 rounded-full bg-muted" />
                      <div className="flex-1">
                        <div className="h-2 w-16 bg-muted rounded mb-1" />
                        <div className="h-1.5 w-10 bg-muted rounded" />
                      </div>
                    </div>
                    <div className="h-2 w-full bg-muted rounded mb-1.5" />
                    <div className="size-2/3 bg-muted rounded" />
                  </div>
                  <p className="text-xs text-muted-foreground text-center italic">
                    Updates from your feed will appear here
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex justify-center gap-3 py-3 mt-auto bg-card border-t border-border">
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
          <div className="bg-primary h-4 w-24 rounded-full" />
        </div>
        <div className="absolute bottom-1 left-0 right-0 flex justify-center pointer-events-none">
          <div className="bg-muted h-1 w-28 rounded-full" />
        </div>
      </motion.div>
    </MobilePreviewFrame>
  );
}

function DesktopProfilePreview({
  profile,
  initials,
}: ProfilePreviewFrameProps) {
  return (
    <DesktopPreviewFrame>
      <motion.div
        key="desktop-preview"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={gentleTransition}
        className="border border-border rounded-xl overflow-hidden shadow-lg bg-card"
        style={{
          width: DESKTOP_PREVIEW_WIDTH,
          height: DESKTOP_PREVIEW_HEIGHT,
        }}
      >
        <div className="h-6 bg-muted border-b border-border flex items-center px-3 gap-1.5">
          <div className="size-2 rounded-full bg-muted" />
          <div className="size-2 rounded-full bg-muted" />
          <div className="size-2 rounded-full bg-muted" />
        </div>

        <div
          className="relative"
          style={{ height: DESKTOP_PREVIEW_HEIGHT - 24 }}
        >
          <div className="h-18">
            <Image
              src={profile.coverUrl || PLACEHOLDER_COVER}
              alt="Cover"
              width={400}
              height={72}
              unoptimized
              className="size-full object-cover"
            />
            <div className="absolute inset-x-0 top-0 h-18 bg-linear-to-t from-background/40 via-transparent to-transparent" />
          </div>

          <div className="px-5 pb-4">
            <div className="flex items-end gap-3 -mt-6">
              <Avatar className="size-12">
                <AvatarImage src={profile.avatarUrl || PLACEHOLDER_AVATAR} />
                <AvatarFallback>{initials || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 pb-0.5 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h2 className="text-base font-semibold text-foreground tracking-tight truncate">
                    {profile.firstName || "First"} {profile.lastName || "Last"}
                  </h2>
                  <div className="shrink-0 flex items-center gap-1 px-1 py-0.5 rounded-full bg-info/10 text-info border border-info/20 text-xs font-semibold uppercase tracking-wider">
                    <Check className="size-2" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-0.5">
                  <MapPin className="size-2.5 shrink-0" />
                  <span className="truncate">
                    {profile.location || "Location"}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <QuickGive workerId="preview" size="xs" />
              <div className="flex gap-2 shrink-0">
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

            <p className="text-xs font-semibold text-muted-foreground mt-3 line-clamp-1 leading-relaxed italic border-l border-success pl-2">
              &quot;{profile.ministryFocus || "Your tagline will appear here"}
              &quot;
            </p>
            <p className="text-xs text-muted-foreground mt-2 line-clamp-3 leading-relaxed whitespace-pre-wrap">
              {profile.bio ||
                "Your bio will appear here. Share your story with supporters."}
            </p>
          </div>
        </div>
      </motion.div>
    </DesktopPreviewFrame>
  );
}

export type ProfilePreviewColumnProps = {
  profile: ProfileData;
  previewMode: PreviewMode;
  initials: string;
  setPreviewMode: (value: React.SetStateAction<PreviewMode>) => void;
};

export function ProfilePreviewColumn({
  profile,
  previewMode,
  initials,
  setPreviewMode,
}: ProfilePreviewColumnProps) {
  return (
    <motion.div
      className="lg:col-span-5"
      variants={fadeInUp}
      transition={{ ...gentleTransition, delay: 0.15 }}
    >
      <div className="sticky top-24 pb-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-medium text-muted-foreground">
            Live Preview
          </span>
          <PreviewToggle value={previewMode} onChange={setPreviewMode} />
        </div>

        <AnimatePresence mode="wait">
          {previewMode === "mobile" ? (
            <MobileProfilePreview profile={profile} initials={initials} />
          ) : (
            <DesktopProfilePreview profile={profile} initials={initials} />
          )}
        </AnimatePresence>

        <motion.p
          className="text-xs text-muted-foreground text-center mt-3 flex items-center justify-center gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex size-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full size-2 bg-success" />
          </span>
          Updates as you type
        </motion.p>
      </div>
    </motion.div>
  );
}

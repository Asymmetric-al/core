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
import {
  DesktopPreviewFrame,
  MobilePreviewFrame,
  PreviewToggle,
  SocialIcon,
  fadeInUp,
  gentleTransition,
  springTransition,
} from "./profile-primitives";

import type { PreviewMode, ProfileData } from "./profile-model";

import { QuickGive } from "@/features/giving/components/quick-give";

export type ProfilePreviewFrameProps = {
  profile: ProfileData;
  initials: string;
};

export function MobileProfilePreview({
  profile,
  initials,
}: ProfilePreviewFrameProps) {
  return (
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
              <AvatarImage src={profile.avatarUrl || PLACEHOLDER_AVATAR} />
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
                {profile.firstName || "First"} {profile.lastName || "Last"}
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
            <Tabs defaultValue="story" className="w-full flex-1 flex flex-col">
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
                    {profile.ministryFocus || "Your tagline will appear here"}
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
  );
}

export function DesktopProfilePreview({
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
                <AvatarImage src={profile.avatarUrl || PLACEHOLDER_AVATAR} />
                <AvatarFallback className="bg-zinc-100 text-sm font-semibold">
                  {initials || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 pb-0.5 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h2 className="text-base font-bold text-zinc-900 tracking-tight truncate">
                    {profile.firstName || "First"} {profile.lastName || "Last"}
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
              &quot;{profile.ministryFocus || "Your tagline will appear here"}
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
          <span className="text-xs font-medium text-zinc-500">
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
  );
}

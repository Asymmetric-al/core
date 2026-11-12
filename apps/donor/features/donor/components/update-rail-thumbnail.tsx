"use client";

import Image from "next/image";
import { useState } from "react";

interface UpdateRailThumbnailProps {
  image?: string | null;
  /** Shown when the update has no photo of its own. */
  authorAvatar?: string | null;
  initials: string;
}

/**
 * Small thumbnail for the dashboard's updates rail. Remote post
 * images can be unavailable, so a failed load falls back to the author's
 * initials instead of a broken-image icon.
 */
export function UpdateRailThumbnail({
  image,
  authorAvatar,
  initials,
}: UpdateRailThumbnailProps) {
  const [failed, setFailed] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  if (image && !failed) {
    return (
      <Image
        src={image}
        alt=""
        width={40}
        height={40}
        onError={() => setFailed(true)}
        className="size-10 rounded-lg object-cover border border-border shadow-sm"
      />
    );
  }

  if (authorAvatar && !avatarFailed) {
    return (
      <Image
        src={authorAvatar}
        alt=""
        width={40}
        height={40}
        onError={() => setAvatarFailed(true)}
        className="size-10 rounded-full object-cover border border-border"
      />
    );
  }

  return (
    // Decorative like the image it replaces: the author's name follows.
    <div
      aria-hidden="true"
      className="size-10 rounded-lg bg-muted flex items-center justify-center font-semibold text-muted-foreground text-xs"
    >
      {initials}
    </div>
  );
}

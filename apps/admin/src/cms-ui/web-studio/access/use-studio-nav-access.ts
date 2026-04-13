"use client";

import { useAuth } from "@payloadcms/ui";

export type StudioNavAccess = {
  isAuthenticated: boolean;
  /** Payload staff user is loaded (not necessarily super-admin). */
  hasUser: boolean;
};

/**
 * Access-aware shell helpers for Web Studio navigation chrome.
 * Permissions for collections/docs remain authoritative in Payload list/edit contexts.
 */
export function useStudioNavAccess(): StudioNavAccess {
  const { user } = useAuth();

  return {
    isAuthenticated: Boolean(user),
    hasUser: Boolean(user),
  };
}

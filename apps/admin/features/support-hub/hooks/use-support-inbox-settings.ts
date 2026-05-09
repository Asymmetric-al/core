"use client";

import {
  useSupportInboxSettingsLive,
  useSupportInboxesLive,
} from "@asym/database/hooks";
import * as React from "react";

import type { SupportInbox, SupportInboxSettings } from "@asym/database/hooks";

export function useSupportInboxes(): {
  data: SupportInbox[];
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
} {
  const query = useSupportInboxesLive();
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isReady: query.isReady,
    isError: query.isError,
  };
}

interface UseSupportInboxSettingsReturn {
  data: SupportInboxSettings | undefined;
  all: SupportInboxSettings[];
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
}

export function useSupportInboxSettings(
  inboxId?: string | null,
): UseSupportInboxSettingsReturn {
  const query = useSupportInboxSettingsLive();

  const all = React.useMemo<SupportInboxSettings[]>(
    () => query.data ?? [],
    [query.data],
  );

  const data = React.useMemo<SupportInboxSettings | undefined>(() => {
    if (!inboxId) return all[0];
    return all.find((row) => row.inboxId === inboxId);
  }, [all, inboxId]);

  return {
    data,
    all,
    isLoading: query.isLoading,
    isReady: query.isReady,
    isError: query.isError,
  };
}

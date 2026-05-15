"use client";

import { useQuery } from "@tanstack/react-query";
import * as React from "react";

import { supportApiGet, supportApiQueryDefaults } from "../lib/api-client";
import { supportHubQueryKeys } from "../lib/query-keys";

import type {
  SupportBusinessHours,
  SupportInbox,
  SupportInboxSettings,
  SupportSlaPolicy,
} from "@asym/database/hooks";

interface InboxesResponse {
  inboxes: SupportInbox[];
}

interface InboxSettingsListResponse {
  settings: SupportInboxSettings[];
}

interface BusinessHoursResponse {
  businessHours: SupportBusinessHours[];
}

interface SlaPoliciesResponse {
  slaPolicies: SupportSlaPolicy[];
}

export function useSupportInboxes(): {
  data: SupportInbox[];
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
} {
  const query = useQuery({
    queryKey: supportHubQueryKeys.inboxes,
    queryFn: async () =>
      (await supportApiGet<InboxesResponse>("/api/admin/support/inboxes"))
        .inboxes,
    ...supportApiQueryDefaults,
  });
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isReady: query.isSuccess,
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
  const query = useQuery({
    queryKey: supportHubQueryKeys.inboxSettings,
    queryFn: async () =>
      (
        await supportApiGet<InboxSettingsListResponse>(
          "/api/admin/support/inbox-settings?list=true",
        )
      ).settings,
    ...supportApiQueryDefaults,
  });

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
    isReady: query.isSuccess,
    isError: query.isError,
  };
}

export function useSupportBusinessHours(): {
  data: SupportBusinessHours[];
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
} {
  const query = useQuery({
    queryKey: supportHubQueryKeys.businessHours,
    queryFn: async () =>
      (
        await supportApiGet<BusinessHoursResponse>(
          "/api/admin/support/business-hours",
        )
      ).businessHours,
    ...supportApiQueryDefaults,
  });
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isReady: query.isSuccess,
    isError: query.isError,
  };
}

export function useSupportSlaPolicies(): {
  data: SupportSlaPolicy[];
  isLoading: boolean;
  isReady: boolean;
  isError: boolean;
} {
  const query = useQuery({
    queryKey: supportHubQueryKeys.slaPolicies,
    queryFn: async () =>
      (
        await supportApiGet<SlaPoliciesResponse>(
          "/api/admin/support/sla-policies",
        )
      ).slaPolicies,
    ...supportApiQueryDefaults,
  });
  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isReady: query.isSuccess,
    isError: query.isError,
  };
}

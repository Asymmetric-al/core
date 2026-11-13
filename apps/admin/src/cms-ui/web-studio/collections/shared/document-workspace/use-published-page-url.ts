"use client";

import { useConfig, useDocumentInfo, useLocale } from "@payloadcms/ui";
import { useQuery } from "@tanstack/react-query";
import { formatAdminURL } from "payload/shared";

import { resolveConfiguredDonorOrigin } from "../../../adapters/resolve-donor-origin";

import type { WebStudioCollectionConfig } from "../../config";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function recordId(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return typeof value === "string" && value.trim() ? value : null;
}

/** Resolve only the published address; never cache or expose the document body. */
export function usePublishedPageURL(studioConfig: WebStudioCollectionConfig) {
  const {
    id,
    collectionSlug,
    data,
    docPermissions,
    hasPublishedDoc,
    isInitializing,
    isTrashed,
    lastUpdateTime,
    versionCount,
  } = useDocumentInfo();
  const {
    config: {
      routes: { api },
    },
  } = useConfig();
  const locale = useLocale()?.code;
  const origin = resolveConfiguredDonorOrigin();
  const documentId = recordId(id);
  const tenantId = recordId(
    isRecord(data?.tenant) ? data.tenant.id : data?.tenant,
  );
  const { previewPathForData } = studioConfig;
  const enabled = Boolean(
    origin &&
    previewPathForData &&
    documentId &&
    documentId === recordId(data?.id) &&
    tenantId &&
    collectionSlug === studioConfig.slug &&
    docPermissions?.read &&
    hasPublishedDoc &&
    !isInitializing &&
    !isTrashed,
  );
  const query = useQuery({
    queryKey: [
      "web-studio",
      "published-page-url",
      api,
      collectionSlug,
      documentId,
      tenantId,
      locale,
      origin,
      lastUpdateTime,
      versionCount,
      data?._status,
      data?.updatedAt,
      enabled,
    ],
    enabled,
    // Revalidate after saves and scope changes, without retaining private
    // results or substituting the previous document/locale while loading.
    gcTime: 0,
    staleTime: 0,
    retry: false,
    placeholderData: () => undefined,
    queryFn: async ({ signal }) => {
      if (!origin || !previewPathForData || !documentId || !collectionSlug) {
        return null;
      }
      const params = new URLSearchParams();
      if (locale) {
        params.set("locale", locale);
        params.set("fallback-locale", "null");
      }
      params.set("depth", "0");
      const url = formatAdminURL({
        apiRoute: api,
        path: `/${encodeURIComponent(collectionSlug)}/${encodeURIComponent(documentId)}?${params}`,
      });
      try {
        // As with NativeRevertToPublished, omitting draft=true reads the
        // published record through Payload's authenticated tenant access.
        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal,
        });
        if (!response.ok) throw new Error();
        const published: unknown = await response.json();
        if (
          signal.aborted ||
          !isRecord(published) ||
          published._status !== "published" ||
          typeof published.slug !== "string" ||
          !published.slug.trim() ||
          recordId(published.id) !== documentId ||
          recordId(published.tenant) !== tenantId
        ) {
          return null;
        }
        const path = previewPathForData(published);
        return path ? `${origin}${path}` : null;
      } catch {
        // Provider bodies and transport/parse errors can contain private data.
        throw new Error("The published page address is unavailable.");
      }
    },
  });

  return enabled && query.isSuccess && !query.isFetching ? query.data : null;
}

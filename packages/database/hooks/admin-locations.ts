"use client";

import { useLiveQuery } from "@tanstack/react-db";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  adminLocationsCollection,
  fetchAdminLocationsResponse,
} from "../collections/admin-locations";
import { getAdminSurfaceQueryKey } from "../query-keys";

export type {
  AdminLocation as Location,
  AdminLinkedMissionary as LinkedMissionary,
  AdminLocationLinkedEntities as LinkedEntities,
} from "../collections/admin-locations";

export type LocationType = "missionary" | "project" | "custom";
export type LocationStatus = "draft" | "published";

type LocationMutationPayload = {
  id?: string;
  title: string;
  lat: number;
  lng: number;
  type: LocationType;
  linked_id?: string | null;
  summary?: string | null;
  status: LocationStatus;
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as
    | (T & { error?: string })
    | null;

  if (!response.ok) {
    throw new Error(
      payload?.error || `Request failed with status ${response.status}`,
    );
  }

  if (!payload) {
    throw new Error("Request returned an empty response.");
  }

  return payload;
}

export function useLocations() {
  return useLiveQuery(adminLocationsCollection);
}

export function useLinkedEntities() {
  return useQuery({
    queryKey: getAdminSurfaceQueryKey("locationLinkedEntities"),
    queryFn: async () => (await fetchAdminLocationsResponse()).linkedEntities,
  });
}

export function useUpsertLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (location: LocationMutationPayload) => {
      const response = await fetch("/api/admin/locations", {
        body: JSON.stringify(location),
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      return parseJsonResponse<{ location: Location }>(response);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getAdminSurfaceQueryKey("locations"),
        }),
        queryClient.invalidateQueries({
          queryKey: getAdminSurfaceQueryKey("locationLinkedEntities"),
        }),
      ]);
    },
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch("/api/admin/locations", {
        body: JSON.stringify({ id }),
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "DELETE",
      });

      await parseJsonResponse<{ success: true }>(response);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: getAdminSurfaceQueryKey("locations"),
        }),
        queryClient.invalidateQueries({
          queryKey: getAdminSurfaceQueryKey("locationLinkedEntities"),
        }),
      ]);
    },
  });
}

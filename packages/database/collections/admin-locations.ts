"use client";

import { createCollection } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { z } from "zod";

import { getQueryClient } from "../providers/query-client";
import { adminSurfaceQueryKeys } from "../query-keys";

const linkedMissionarySchema = z.object({
  id: z.string().min(1),
  full_name: z.string().nullable(),
});

const _linkedEntitiesSchema = z.object({
  missionaries: z.array(linkedMissionarySchema),
  projects: z.array(z.unknown()),
});

const locationSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().min(1),
  title: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  type: z.enum(["missionary", "project", "custom"]),
  linked_id: z.string().nullable(),
  summary: z.string().nullable(),
  image_public_id: z.string().nullable(),
  status: z.enum(["draft", "published"]),
  sort_key: z.number(),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
});

export type AdminLocation = z.infer<typeof locationSchema>;
export type AdminLinkedMissionary = z.infer<typeof linkedMissionarySchema>;
export type AdminLocationLinkedEntities = z.infer<typeof _linkedEntitiesSchema>;

type AdminLocationsResponse = {
  locations: AdminLocation[];
  linkedEntities: AdminLocationLinkedEntities;
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

export async function fetchAdminLocationsResponse(): Promise<AdminLocationsResponse> {
  const response = await fetch("/api/admin/locations", {
    cache: "no-store",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
  });

  return parseJsonResponse<AdminLocationsResponse>(response);
}

export const adminLocationsCollection = createCollection(
  queryCollectionOptions({
    id: "admin_locations",
    queryKey: [...adminSurfaceQueryKeys.locations],
    queryClient: getQueryClient(),
    schema: locationSchema,
    getKey: (item) => item.id,
    queryFn: async () => (await fetchAdminLocationsResponse()).locations,
  }),
);

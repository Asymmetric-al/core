import { createBrowserClient } from "@asym/database/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { fetchWithSupabaseAuth } from "@/lib/authenticated-fetch";

export type LocationType = "missionary" | "project" | "custom";
export type LocationStatus = "draft" | "published";

export interface Location {
  id: string;
  tenant_id: string;
  title: string;
  lat: number;
  lng: number;
  type: LocationType;
  linked_id: string | null;
  summary: string | null;
  image_public_id: string | null;
  status: LocationStatus;
  sort_key: number;
  created_at: string;
  updated_at: string;
}

type LinkedMissionary = {
  id: string;
  full_name: string | null;
};

type LinkedEntities = {
  missionaries: LinkedMissionary[];
  projects: [];
};

type AdminLocationsResponse = {
  locations: Location[];
  linkedEntities: LinkedEntities;
};

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

const adminLocationsQueryKey = ["admin", "locations"] as const;

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

async function fetchAdminLocations(): Promise<AdminLocationsResponse> {
  const response = await fetchWithSupabaseAuth("/api/admin/locations", {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  return parseJsonResponse<AdminLocationsResponse>(response);
}

export function useLocations() {
  return useQuery({
    queryKey: adminLocationsQueryKey,
    queryFn: fetchAdminLocations,
    select: (data) => data.locations,
  });
}

export function usePublicLocations() {
  return useQuery({
    queryKey: ["locations", "public"],
    queryFn: async () => {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .eq("status", "published")
        .order("sort_key", { ascending: true });

      if (error) throw error;
      return data as Location[];
    },
  });
}

export function useUpsertLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (location: LocationMutationPayload) => {
      const response = await fetchWithSupabaseAuth("/api/admin/locations", {
        body: JSON.stringify(location),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const result = await parseJsonResponse<{ location: Location }>(response);
      return result.location;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminLocationsQueryKey });
      toast.success("Location saved successfully");
    },
    onError: (error) => {
      toast.error(`Error saving location: ${error.message}`);
    },
  });
}

export function useDeleteLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetchWithSupabaseAuth("/api/admin/locations", {
        body: JSON.stringify({ id }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "DELETE",
      });

      await parseJsonResponse<{ success: true }>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminLocationsQueryKey });
      toast.success("Location deleted successfully");
    },
    onError: (error) => {
      toast.error(`Error deleting location: ${error.message}`);
    },
  });
}

export function useLinkedEntities() {
  return useQuery({
    queryKey: adminLocationsQueryKey,
    queryFn: fetchAdminLocations,
    select: (data) => data.linkedEntities,
  });
}

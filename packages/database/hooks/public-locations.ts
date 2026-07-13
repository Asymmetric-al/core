"use client";

import { useQuery } from "@tanstack/react-query";

import { createBrowserClient } from "../supabase";

export type LocationType = "missionary" | "project" | "custom";
export type LocationStatus = "draft" | "published";

export interface PublicLocation {
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

/**
 * Published locations for public-facing maps (donor "where we work").
 * Owns the status scoping and row shape so app code never queries the
 * locations table directly; RLS limits anonymous reads to published rows.
 */
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
      return data as PublicLocation[];
    },
  });
}

import { useQuery } from "@tanstack/react-query";
import { createBrowserClient } from "@asym/database/supabase";

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

/**
 * Fetch published locations for public-facing map
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
      return data as Location[];
    },
  });
}

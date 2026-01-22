import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@asym/database/supabase";
import { toast } from "sonner";

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

export function useLocations() {
  return useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("sort_key", { ascending: true });

      if (error) throw error;
      return data as Location[];
    },
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
    mutationFn: async (location: Partial<Location>) => {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from("locations")
        .upsert(location)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
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
      const supabase = createBrowserClient();
      const { error } = await supabase.from("locations").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      toast.success("Location deleted successfully");
    },
    onError: (error) => {
      toast.error(`Error deleting location: ${error.message}`);
    },
  });
}

export function useLinkedEntities() {
  return useQuery({
    queryKey: ["linked-entities"],
    queryFn: async () => {
      const supabase = createBrowserClient();
      const { data: missionaries, error: mError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "missionary");

      if (mError) throw mError;

      return {
        missionaries: missionaries || [],
        projects: [],
      };
    },
  });
}

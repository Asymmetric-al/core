import type { PublicLocation } from "../../../packages/database/hooks/public-locations";
export type { PublicLocation };

export function usePublicLocations() {
  return {
    data: [
      {
        id: "location-1",
        tenant_id: null,
        title: "River Ministry",
        type: "missionary",
        lat: 15,
        lng: 20,
        linked_id: "worker-1",
        summary: "Serving families",
        image_public_id: null,
        status: "published",
        sort_key: 1,
        created_at: "2026-10-03",
        updated_at: "2026-10-03",
      } satisfies PublicLocation,
    ],
  };
}

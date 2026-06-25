export {
  usePublicLocations,
  type PublicLocation as Location,
} from "@asym/database/hooks";

export type LocationType = "missionary" | "project" | "custom";
export type LocationStatus = "draft" | "published";

import { WEB_STUDIO_ADMIN_COLLECTIONS } from "../../../shell/admin-collections";
import { getWebStudioCollectionConfig } from "../../config";

import type { WebStudioAdminCollectionSlug } from "../../../shell/admin-collections";
import type {
  WebStudioCollectionConfig,
  WebStudioCollectionSlug,
} from "../../config";

export type StudioListCollectionSlug =
  WebStudioCollectionSlug | WebStudioAdminCollectionSlug;

type StudioListConfig = Pick<
  WebStudioCollectionConfig,
  | "createLabel"
  | "createHref"
  | "description"
  | "hasDrafts"
  | "listPath"
  | "sectionLabel"
  | "titlePlural"
  | "titleSingular"
>;

export function getStudioListConfig(
  slug: StudioListCollectionSlug,
): StudioListConfig {
  if (slug === "cms-users" || slug === "tenants") {
    const collection = WEB_STUDIO_ADMIN_COLLECTIONS.find(
      (entry) => entry.slug === slug,
    )!;
    return {
      createLabel: slug === "cms-users" ? "New user" : "New organization",
      description: collection.description,
      hasDrafts: false,
      listPath: `/web-studio/collections/${slug}`,
      sectionLabel: collection.title,
      titlePlural: collection.title,
      titleSingular: slug === "cms-users" ? "User" : "Organization",
    };
  }
  return getWebStudioCollectionConfig(slug);
}

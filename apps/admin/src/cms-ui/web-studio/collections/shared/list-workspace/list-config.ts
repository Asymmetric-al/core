import { getWebStudioCollectionConfig } from "../../config";

import type {
  WebStudioCollectionConfig,
  WebStudioCollectionSlug,
} from "../../config";

export type StudioListCollectionSlug = WebStudioCollectionSlug;

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
  return getWebStudioCollectionConfig(slug);
}

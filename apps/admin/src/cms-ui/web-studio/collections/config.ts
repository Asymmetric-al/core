import { FileText, ImageIcon, LayoutList } from "lucide-react";

import { buildDonorPreviewPathForPageSlug } from "../adapters/preview-url";
import { isNativeCollectionWebStudioEnabled } from "../feature-flags";
import { WEB_STUDIO_COLLECTION_PREFERENCE_MAP } from "../preferences/keys";

export type WebStudioCollectionSlug = "media" | "navigation" | "pages";

export type WebStudioCollectionConfig = {
  createLabel: string;
  createHref?: string;
  description: string;
  editDescription: string;
  hasDrafts: boolean;
  hasVersions: boolean;
  listPath: string;
  previewMode: "none" | "public-link";
  previewPathForData?: (
    data: Record<string, unknown> | undefined,
  ) => string | null;
  preferences: (typeof WEB_STUDIO_COLLECTION_PREFERENCE_MAP)[WebStudioCollectionSlug];
  sectionLabel: string;
  slug: WebStudioCollectionSlug;
  titleSingular: string;
  titlePlural: string;
  icon: typeof FileText;
};

export const WEB_STUDIO_COLLECTION_CONFIGS: Record<
  WebStudioCollectionSlug,
  WebStudioCollectionConfig
> = {
  media: {
    createLabel: "New media record",
    description:
      "Alt text, credit and folder for the images used across the public site.",
    editDescription:
      "Media records hold editorial details only; images are added through Core.",
    hasDrafts: false,
    hasVersions: false,
    icon: ImageIcon,
    listPath: "/web-studio/collections/media",
    previewMode: "none",
    preferences: WEB_STUDIO_COLLECTION_PREFERENCE_MAP.media,
    sectionLabel: "Media",
    slug: "media",
    titlePlural: "Media",
    titleSingular: "Media asset",
  },
  navigation: {
    createLabel: "New navigation",
    description: "Menus and links for the public site.",
    editDescription:
      "Navigation arrays and row controls remain Payload form widgets inside the shared editor shell.",
    hasDrafts: false,
    hasVersions: false,
    icon: LayoutList,
    listPath: "/web-studio/collections/navigation",
    previewMode: "none",
    preferences: WEB_STUDIO_COLLECTION_PREFERENCE_MAP.navigation,
    sectionLabel: "Navigation",
    slug: "navigation",
    titlePlural: "Navigation",
    titleSingular: "Navigation",
  },
  pages: {
    createLabel: "New page",
    createHref: "/web-studio/pages/new-from-template",
    description: "Site pages with drafts and publishing.",
    editDescription:
      "Pages keep Payload draft, publish, and Lexical form behavior while the shared document shell owns framing.",
    hasDrafts: true,
    hasVersions: true,
    icon: FileText,
    listPath: "/web-studio/collections/pages",
    previewMode: "public-link",
    preferences: WEB_STUDIO_COLLECTION_PREFERENCE_MAP.pages,
    previewPathForData: (data) => {
      if (data?.family !== undefined && data.family !== "standard") {
        return null;
      }
      const slug = typeof data?.slug === "string" ? data.slug : "";
      return buildDonorPreviewPathForPageSlug(slug);
    },
    sectionLabel: "Pages",
    slug: "pages",
    titlePlural: "Pages",
    titleSingular: "Page",
  },
};

export function getWebStudioCollectionConfig(
  slug: WebStudioCollectionSlug,
): WebStudioCollectionConfig {
  return WEB_STUDIO_COLLECTION_CONFIGS[slug];
}

export const WEB_STUDIO_COLLECTION_GROUPS: ReadonlyArray<{
  id: "content" | "site";
  label: string;
  slugs: readonly WebStudioCollectionSlug[];
}> = [
  {
    id: "content",
    label: "Content",
    slugs: ["pages"],
  },
  {
    id: "site",
    label: "Site",
    slugs: ["navigation", "media"],
  },
];

export function getGroupedWebStudioCollections() {
  const enabled = new Map(
    getEnabledWebStudioCollections().map((config) => [config.slug, config]),
  );
  return WEB_STUDIO_COLLECTION_GROUPS.map((group) => ({
    ...group,
    collections: group.slugs.flatMap((slug) => {
      const config = enabled.get(slug);
      return config ? [config] : [];
    }),
  })).filter((group) => group.collections.length > 0);
}

export function getEnabledWebStudioCollections() {
  return (
    Object.keys(WEB_STUDIO_COLLECTION_CONFIGS) as WebStudioCollectionSlug[]
  ).flatMap((slug) =>
    isNativeCollectionWebStudioEnabled(slug)
      ? [WEB_STUDIO_COLLECTION_CONFIGS[slug]]
      : [],
  );
}

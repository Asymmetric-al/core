import {
  ImageIcon,
  FileText,
  LayoutList,
  Newspaper,
  UserRound,
} from "lucide-react";

import { buildDonorPreviewPathForPageSlug } from "../adapters/preview-url";
import { isNativeCollectionWebStudioEnabled } from "../feature-flags";
import { WEB_STUDIO_COLLECTION_PREFERENCE_MAP } from "../preferences/keys";

export type WebStudioCollectionSlug =
  | "media"
  | "missionary-profiles"
  | "ministry-updates"
  | "navigation"
  | "pages";

export type WebStudioCollectionConfig = {
  createLabel: string;
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
    createLabel: "Upload media",
    description:
      "Tenant-scoped media assets. Upload, edit alt text, and manage image variants.",
    editDescription:
      "Upload metadata and asset preview stay Payload-owned; Mission Control owns the surrounding workspace.",
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
  "missionary-profiles": {
    createLabel: "New profile",
    description:
      "Missionary profile records with portrait relationships and public-facing bio/location content.",
    editDescription:
      "Profiles keep Payload relationship/upload field behavior while using the shared document workspace.",
    hasDrafts: false,
    hasVersions: false,
    icon: UserRound,
    listPath: "/web-studio/collections/missionary-profiles",
    previewMode: "none",
    preferences: WEB_STUDIO_COLLECTION_PREFERENCE_MAP["missionary-profiles"],
    sectionLabel: "Missionary Profiles",
    slug: "missionary-profiles",
    titlePlural: "Missionary Profiles",
    titleSingular: "Missionary Profile",
  },
  "ministry-updates": {
    createLabel: "New update",
    description:
      "Published ministry updates tied to missionary profiles with drafts, autosave, and donor homepage consumption.",
    editDescription:
      "Updates keep Payload draft and publish semantics while using a shared Mission Control frame.",
    hasDrafts: true,
    hasVersions: true,
    icon: Newspaper,
    listPath: "/web-studio/collections/ministry-updates",
    previewMode: "public-link",
    preferences: WEB_STUDIO_COLLECTION_PREFERENCE_MAP["ministry-updates"],
    sectionLabel: "Ministry Updates",
    slug: "ministry-updates",
    titlePlural: "Ministry Updates",
    titleSingular: "Ministry Update",
  },
  navigation: {
    createLabel: "New navigation",
    description:
      "Tenant-scoped navigation trees with array-based link items and open-in-new-tab settings.",
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
    description:
      "Tenant-scoped site pages. Search, filter, and open a document to edit.",
    editDescription:
      "Pages keep Payload draft, publish, and Lexical form behavior while the shared document shell owns framing.",
    hasDrafts: true,
    hasVersions: true,
    icon: FileText,
    listPath: "/web-studio/collections/pages",
    previewMode: "public-link",
    preferences: WEB_STUDIO_COLLECTION_PREFERENCE_MAP.pages,
    previewPathForData: (data) => {
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

export function getEnabledWebStudioCollections() {
  return (
    Object.keys(WEB_STUDIO_COLLECTION_CONFIGS) as WebStudioCollectionSlug[]
  )
    .filter((slug) => isNativeCollectionWebStudioEnabled(slug))
    .map((slug) => WEB_STUDIO_COLLECTION_CONFIGS[slug]);
}

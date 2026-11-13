import {
  FileText,
  Globe2,
  ImageIcon,
  LayoutList,
  Newspaper,
  Target,
  UserRound,
} from "lucide-react";

import { buildDonorPreviewPathForPageSlug } from "../adapters/preview-url";
import { isNativeCollectionWebStudioEnabled } from "../feature-flags";
import { WEB_STUDIO_COLLECTION_PREFERENCE_MAP } from "../preferences/keys";

export type WebStudioCollectionSlug =
  | "media"
  | "missionary-giving-pages"
  | "missionary-profiles"
  | "ministry-updates"
  | "navigation"
  | "page-templates"
  | "pages"
  | "project-pages";

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
    createLabel: "Upload media",
    description: "Images and files used across the public site.",
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
  "missionary-giving-pages": {
    createLabel: "New giving page",
    createHref: "/web-studio/pages/give",
    description: "Giving pages for each missionary's supporters.",
    editDescription:
      "Missionary giving pages keep Payload draft, publish, and block editing behavior while the shared document shell owns framing.",
    hasDrafts: true,
    hasVersions: true,
    icon: Globe2,
    listPath: "/web-studio/collections/missionary-giving-pages",
    previewMode: "public-link",
    preferences:
      WEB_STUDIO_COLLECTION_PREFERENCE_MAP["missionary-giving-pages"],
    sectionLabel: "Giving pages",
    slug: "missionary-giving-pages",
    titlePlural: "Giving pages",
    titleSingular: "Giving page",
  },
  "missionary-profiles": {
    createLabel: "New profile",
    description: "Public bios, portraits and locations for missionaries.",
    editDescription:
      "Profiles keep Payload relationship/upload field behavior while using the shared document workspace.",
    hasDrafts: false,
    hasVersions: false,
    icon: UserRound,
    listPath: "/web-studio/collections/missionary-profiles",
    previewMode: "none",
    preferences: WEB_STUDIO_COLLECTION_PREFERENCE_MAP["missionary-profiles"],
    sectionLabel: "Missionary profiles",
    slug: "missionary-profiles",
    titlePlural: "Missionary profiles",
    titleSingular: "Missionary profile",
  },
  "ministry-updates": {
    createLabel: "New update",
    createHref: "/web-studio/ministry-updates/new",
    description: "News from the field for donor homepages.",
    editDescription:
      "Updates keep Payload draft and publish semantics while using a shared Mission Control frame.",
    hasDrafts: true,
    hasVersions: true,
    icon: Newspaper,
    listPath: "/web-studio/collections/ministry-updates",
    previewMode: "public-link",
    preferences: WEB_STUDIO_COLLECTION_PREFERENCE_MAP["ministry-updates"],
    sectionLabel: "Ministry updates",
    slug: "ministry-updates",
    titlePlural: "Ministry updates",
    titleSingular: "Ministry update",
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
  "page-templates": {
    createLabel: "New template",
    description: "Starting layouts for every new page.",
    editDescription:
      "Templates store default layout blocks and metadata while remaining ordinary Payload editorial assets.",
    hasDrafts: true,
    hasVersions: true,
    icon: FileText,
    listPath: "/web-studio/collections/page-templates",
    previewMode: "none",
    preferences: WEB_STUDIO_COLLECTION_PREFERENCE_MAP["page-templates"],
    sectionLabel: "Page templates",
    slug: "page-templates",
    titlePlural: "Page templates",
    titleSingular: "Page template",
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
      const slug = typeof data?.slug === "string" ? data.slug : "";
      return buildDonorPreviewPathForPageSlug(slug);
    },
    sectionLabel: "Pages",
    slug: "pages",
    titlePlural: "Pages",
    titleSingular: "Page",
  },
  "project-pages": {
    createLabel: "New project page",
    createHref: "/web-studio/projects/new",
    description: "Fund-backed project pages with giving context.",
    editDescription:
      "Project pages keep Payload draft, publish, and block editing behavior while the shared document shell owns framing.",
    hasDrafts: true,
    hasVersions: true,
    icon: Target,
    listPath: "/web-studio/collections/project-pages",
    previewMode: "public-link",
    preferences: WEB_STUDIO_COLLECTION_PREFERENCE_MAP["project-pages"],
    sectionLabel: "Project pages",
    slug: "project-pages",
    titlePlural: "Project pages",
    titleSingular: "Project page",
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
    slugs: [
      "pages",
      "missionary-giving-pages",
      "project-pages",
      "ministry-updates",
      "missionary-profiles",
    ],
  },
  {
    id: "site",
    label: "Site",
    slugs: ["navigation", "page-templates", "media"],
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

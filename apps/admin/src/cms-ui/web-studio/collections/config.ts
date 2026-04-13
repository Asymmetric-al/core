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
  "missionary-giving-pages": {
    createLabel: "New missionary page",
    createHref: "/web-studio/pages/give",
    description:
      "Missionary giving pages tied to canonical missionary records, marketing blocks, and donation context.",
    editDescription:
      "Missionary giving pages keep Payload draft, publish, and block editing behavior while the shared document shell owns framing.",
    hasDrafts: true,
    hasVersions: true,
    icon: Globe2,
    listPath: "/web-studio/collections/missionary-giving-pages",
    previewMode: "public-link",
    previewPathForData: (data) => {
      const missionaryId =
        typeof data?.missionaryId === "string" ? data.missionaryId : "";
      return missionaryId
        ? `/workers/${encodeURIComponent(missionaryId)}`
        : null;
    },
    preferences:
      WEB_STUDIO_COLLECTION_PREFERENCE_MAP["missionary-giving-pages"],
    sectionLabel: "Missionary Pages",
    slug: "missionary-giving-pages",
    titlePlural: "Missionary Pages",
    titleSingular: "Missionary Page",
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
  "page-templates": {
    createLabel: "New template",
    createHref: "/web-studio/templates",
    description:
      "Template gallery for standard pages, missionary pages, and fund-backed project pages.",
    editDescription:
      "Templates store default layout blocks and metadata while remaining ordinary Payload editorial assets.",
    hasDrafts: true,
    hasVersions: true,
    icon: FileText,
    listPath: "/web-studio/collections/page-templates",
    previewMode: "none",
    preferences: WEB_STUDIO_COLLECTION_PREFERENCE_MAP["page-templates"],
    sectionLabel: "Templates",
    slug: "page-templates",
    titlePlural: "Page Templates",
    titleSingular: "Page Template",
  },
  pages: {
    createLabel: "New page",
    createHref: "/web-studio/templates?pageType=standard",
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
  "project-pages": {
    createLabel: "New project page",
    createHref: "/web-studio/projects/new",
    description:
      "Fund-backed project landing pages with template-driven layout, marketing copy, and donation context.",
    editDescription:
      "Project pages keep Payload draft, publish, and block editing behavior while the shared document shell owns framing.",
    hasDrafts: true,
    hasVersions: true,
    icon: Target,
    listPath: "/web-studio/collections/project-pages",
    previewMode: "public-link",
    previewPathForData: (data) => {
      const slug = typeof data?.slug === "string" ? data.slug : "";
      return slug ? `/projects/${encodeURIComponent(slug)}` : null;
    },
    preferences: WEB_STUDIO_COLLECTION_PREFERENCE_MAP["project-pages"],
    sectionLabel: "Project Pages",
    slug: "project-pages",
    titlePlural: "Project Pages",
    titleSingular: "Project Page",
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

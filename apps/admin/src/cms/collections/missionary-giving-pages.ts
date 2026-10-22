import {
  PAGE_LAYOUT_BLOCK_SLUGS,
  buildPageBuilderCollectionFields,
  buildPageBuilderHooks,
  buildPageBuilderVersions,
} from "./page-builders";
import { createWebStudioAuthenticatedPreviewURL } from "../../cms-ui/web-studio/adapters/preview-url";
import { isNativeCollectionWebStudioEnabled } from "../../cms-ui/web-studio/feature-flags";
import {
  PUBLIC_COLLECTION_CAPABILITIES,
  publishedPublicReadAccess,
} from "../access/public-read";
import {
  tenantScopedCreateAccess,
  tenantScopedDeleteAccess,
  tenantScopedUpdateAccess,
} from "../access/tenant-access";

import type { CollectionConfig, Field } from "payload";

const missionaryGivingFields = buildPageBuilderCollectionFields(
  "missionary-giving",
).map((field): Field => {
  if (field.type !== "blocks" || field.name !== "layout") return field;

  return {
    ...field,
    blocks: field.blocks.map((block) => {
      if (
        typeof block === "string" ||
        block.slug !== PAGE_LAYOUT_BLOCK_SLUGS.impactStats
      ) {
        return block;
      }

      return {
        ...block,
        fields: block.fields.map((item): Field => {
          if (item.type !== "array" || item.name !== "items") return item;

          return {
            ...item,
            // Only this versioned array exceeds PostgreSQL's identifier limit.
            // Preserve the live table and every other collection's block names.
            dbName: ({ tableName }) =>
              tableName === "_missionary_giving_pages_v_blocks_impact_stats"
                ? "mgp_impact_items"
                : `${tableName}_items`,
          };
        }),
      };
    }),
  };
});

const nativeMissionaryGivingPagesAdmin = isNativeCollectionWebStudioEnabled(
  "missionary-giving-pages",
)
  ? {
      components: {
        views: {
          list: {
            Component:
              "/src/cms-ui/web-studio/missionary-giving-pages/list/MissionaryGivingPagesNativeListView.tsx#MissionaryGivingPagesNativeListView",
          },
          edit: {
            default: {
              Component:
                "/src/cms-ui/web-studio/missionary-giving-pages/document/MissionaryGivingPagesNativeEditView.tsx#MissionaryGivingPagesNativeEditView",
            },
          },
        },
      },
    }
  : {};

export const MissionaryGivingPages: CollectionConfig = {
  slug: "missionary-giving-pages",
  authorship: false,
  admin: {
    defaultColumns: ["title", "slug", "missionaryId", "tenant", "updatedAt"],
    preview: createWebStudioAuthenticatedPreviewURL("missionary-giving-pages"),
    useAsTitle: "title",
    ...nativeMissionaryGivingPagesAdmin,
  },
  access: {
    read: publishedPublicReadAccess(
      "tenant",
      PUBLIC_COLLECTION_CAPABILITIES["missionary-giving-pages"],
    ),
    create: tenantScopedCreateAccess("tenant"),
    update: tenantScopedUpdateAccess("tenant"),
    delete: tenantScopedDeleteAccess("tenant"),
  },
  hooks: buildPageBuilderHooks(),
  versions: buildPageBuilderVersions(),
  fields: missionaryGivingFields,
};

import {
  buildPageBuilderCollectionFields,
  buildPageBuilderHooks,
  buildPageBuilderVersions,
} from "./page-builders";
import { createWebStudioAuthenticatedPreviewURL } from "../../cms-ui/web-studio/adapters/preview-url";
import { isNativeCollectionWebStudioEnabled } from "../../cms-ui/web-studio/feature-flags";
import { publishedPublicReadAccess } from "../access/public-read";
import {
  tenantScopedCreateAccess,
  tenantScopedDeleteAccess,
  tenantScopedUpdateAccess,
} from "../access/tenant-access";

import type { CollectionConfig } from "payload";

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
  admin: {
    defaultColumns: ["title", "slug", "missionaryId", "tenant", "updatedAt"],
    preview: createWebStudioAuthenticatedPreviewURL("missionary-giving-pages"),
    useAsTitle: "title",
    ...nativeMissionaryGivingPagesAdmin,
  },
  access: {
    read: publishedPublicReadAccess("tenant", { draftable: true }),
    create: tenantScopedCreateAccess("tenant"),
    update: tenantScopedUpdateAccess("tenant"),
    delete: tenantScopedDeleteAccess("tenant"),
  },
  hooks: buildPageBuilderHooks(),
  versions: buildPageBuilderVersions(),
  fields: buildPageBuilderCollectionFields("missionary-giving"),
};

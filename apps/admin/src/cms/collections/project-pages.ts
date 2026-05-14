import {
  buildPageBuilderCollectionFields,
  buildPageBuilderHooks,
  buildPageBuilderVersions,
} from "./page-builders";
import { createWebStudioAuthenticatedPreviewURL } from "../../cms-ui/web-studio/adapters/preview-url";
import { isNativeCollectionWebStudioEnabled } from "../../cms-ui/web-studio/feature-flags";
import {
  tenantScopedCreateAccess,
  tenantScopedDeleteAccess,
  tenantScopedReadAccess,
  tenantScopedUpdateAccess,
} from "../access/tenant-access";
import { PROJECT_PAGES_SLUG } from "../constants";

import type { CollectionConfig } from "payload";

const nativeProjectPagesAdmin = isNativeCollectionWebStudioEnabled(
  "project-pages",
)
  ? {
      components: {
        views: {
          list: {
            Component:
              "/src/cms-ui/web-studio/project-pages/list/ProjectPagesNativeListView.tsx#ProjectPagesNativeListView",
          },
          edit: {
            default: {
              Component:
                "/src/cms-ui/web-studio/project-pages/document/ProjectPagesNativeEditView.tsx#ProjectPagesNativeEditView",
            },
          },
        },
      },
    }
  : {};

export const ProjectPages: CollectionConfig = {
  slug: PROJECT_PAGES_SLUG,
  admin: {
    defaultColumns: ["title", "fundId", "tenant", "updatedAt"],
    preview: createWebStudioAuthenticatedPreviewURL("project-pages"),
    useAsTitle: "title",
    ...nativeProjectPagesAdmin,
  },
  access: {
    read: tenantScopedReadAccess("tenant"),
    create: tenantScopedCreateAccess("tenant"),
    update: tenantScopedUpdateAccess("tenant"),
    delete: tenantScopedDeleteAccess("tenant"),
  },
  hooks: buildPageBuilderHooks(),
  versions: buildPageBuilderVersions(),
  fields: buildPageBuilderCollectionFields("project"),
};

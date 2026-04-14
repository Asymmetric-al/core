import { isNativeCollectionWebStudioEnabled } from "../../cms-ui/web-studio/feature-flags";
import {
  tenantScopedCreateAccess,
  tenantScopedDeleteAccess,
  tenantScopedReadAccess,
  tenantScopedUpdateAccess,
} from "../access/tenant-access";
import { logCmsChangeAudit, logCmsDeleteAudit } from "../hooks/audit";
import { applyTenantFromContext } from "../hooks/tenant";

import type { CollectionConfig } from "payload";

const nativeMinistryUpdatesAdmin = isNativeCollectionWebStudioEnabled(
  "ministry-updates",
)
  ? {
      components: {
        views: {
          list: {
            Component:
              "/src/cms-ui/web-studio/ministry-updates/list/MinistryUpdatesNativeListView.tsx#MinistryUpdatesNativeListView",
          },
          edit: {
            default: {
              Component:
                "/src/cms-ui/web-studio/ministry-updates/document/MinistryUpdatesNativeEditView.tsx#MinistryUpdatesNativeEditView",
            },
          },
        },
      },
    }
  : {};

export const MinistryUpdates: CollectionConfig = {
  slug: "ministry-updates",
  admin: {
    defaultColumns: ["title", "tenant", "updatedAt"],
    useAsTitle: "title",
    ...nativeMinistryUpdatesAdmin,
  },
  access: {
    read: tenantScopedReadAccess("tenant"),
    create: tenantScopedCreateAccess("tenant"),
    update: tenantScopedUpdateAccess("tenant"),
    delete: tenantScopedDeleteAccess("tenant"),
  },
  hooks: {
    beforeValidate: [applyTenantFromContext("tenant")],
    afterChange: [logCmsChangeAudit],
    afterDelete: [logCmsDeleteAudit],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 300,
        showSaveDraftButton: true,
      },
    },
  },
  fields: [
    {
      name: "tenant",
      type: "relationship",
      relationTo: "tenants",
      required: true,
      index: true,
    },
    {
      name: "missionary",
      type: "relationship",
      relationTo: "missionary-profiles",
      required: true,
      index: true,
    },
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      index: true,
    },
    {
      name: "excerpt",
      type: "textarea",
    },
    {
      name: "content",
      type: "richText",
      required: true,
    },
    {
      name: "publishedAt",
      type: "date",
    },
  ],
};

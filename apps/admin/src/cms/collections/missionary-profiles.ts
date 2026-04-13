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

const nativeMissionaryProfilesAdmin = isNativeCollectionWebStudioEnabled(
  "missionary-profiles",
)
  ? {
      components: {
        views: {
          list: {
            Component:
              "/src/cms-ui/web-studio/missionary-profiles/list/MissionaryProfilesNativeListView.tsx#MissionaryProfilesNativeListView",
          },
          edit: {
            default: {
              Component:
                "/src/cms-ui/web-studio/missionary-profiles/document/MissionaryProfilesNativeEditView.tsx#MissionaryProfilesNativeEditView",
            },
          },
        },
      },
    }
  : {};

export const MissionaryProfiles: CollectionConfig = {
  slug: "missionary-profiles",
  admin: {
    defaultColumns: ["fullName", "tenant", "updatedAt"],
    useAsTitle: "fullName",
    ...nativeMissionaryProfilesAdmin,
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
  fields: [
    {
      name: "tenant",
      type: "relationship",
      relationTo: "tenants",
      required: true,
      index: true,
    },
    {
      name: "fullName",
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
      name: "tagline",
      type: "text",
    },
    {
      name: "bio",
      type: "textarea",
    },
    {
      name: "location",
      type: "text",
    },
    {
      name: "portrait",
      type: "relationship",
      relationTo: "media",
    },
  ],
};

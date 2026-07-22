import { isNativeCollectionWebStudioEnabled } from "../../cms-ui/web-studio/feature-flags";
import { publishedPublicReadAccess } from "../access/public-read";
import {
  tenantScopedCreateAccess,
  tenantScopedDeleteAccess,
  tenantScopedUpdateAccess,
} from "../access/tenant-access";
import { logCmsChangeAudit, logCmsDeleteAudit } from "../hooks/audit";
import { applyTenantFromContext } from "../hooks/tenant";

import type { CollectionConfig } from "payload";

export const Navigation: CollectionConfig = {
  slug: "navigation",
  versions: false,
  admin: {
    defaultColumns: ["label", "tenant", "updatedAt"],
    useAsTitle: "label",
    ...(isNativeCollectionWebStudioEnabled("navigation")
      ? {
          components: {
            views: {
              list: {
                Component:
                  "/src/cms-ui/web-studio/navigation/list/NavigationNativeListView.tsx#NavigationNativeListView",
              },
              edit: {
                default: {
                  Component:
                    "/src/cms-ui/web-studio/navigation/document/NavigationNativeEditView.tsx#NavigationNativeEditView",
                },
              },
            },
          },
        }
      : {}),
  },
  access: {
    read: publishedPublicReadAccess("tenant", { draftable: false }),
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
      name: "label",
      type: "text",
      required: true,
    },
    {
      name: "items",
      type: "array",
      required: true,
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
        },
        {
          name: "href",
          type: "text",
          required: true,
        },
        {
          name: "openInNewTab",
          type: "checkbox",
          defaultValue: false,
        },
      ],
    },
  ],
};

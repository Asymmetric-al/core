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
import { logCmsChangeAudit, logCmsDeleteAudit } from "../hooks/audit";
import { applyTenantFromContext } from "../hooks/tenant";

import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  versions: false,
  admin: {
    defaultColumns: ["filename", "alt", "tenant", "updatedAt"],
    useAsTitle: "filename",
    ...(isNativeCollectionWebStudioEnabled("media")
      ? {
          components: {
            views: {
              edit: {
                default: {
                  Component:
                    "/src/cms-ui/web-studio/media/document/MediaNativeEditView.tsx#MediaNativeEditView",
                },
              },
              list: {
                Component:
                  "/src/cms-ui/web-studio/media/list/MediaNativeListView.tsx#MediaNativeListView",
              },
            },
          },
        }
      : {}),
  },
  access: {
    read: publishedPublicReadAccess(
      "tenant",
      PUBLIC_COLLECTION_CAPABILITIES["media"],
    ),
    create: tenantScopedCreateAccess("tenant"),
    update: tenantScopedUpdateAccess("tenant"),
    delete: tenantScopedDeleteAccess("tenant"),
  },
  hooks: {
    beforeValidate: [applyTenantFromContext("tenant")],
    afterChange: [logCmsChangeAudit],
    afterDelete: [logCmsDeleteAudit],
  },
  upload: {
    imageSizes: [
      {
        name: "thumbnail",
        width: 320,
        height: 320,
      },
      {
        name: "card",
        width: 960,
        height: 540,
      },
    ],
    mimeTypes: [
      "image/avif",
      "image/gif",
      "image/jpeg",
      "image/png",
      "image/webp",
    ],
    pasteURL: false,
    staticDir: "media",
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
      name: "alt",
      type: "text",
      required: true,
    },
    {
      name: "caption",
      type: "text",
    },
  ],
};

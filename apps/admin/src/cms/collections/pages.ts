import {
  createLegacyRichTextField,
  createPageLayoutField,
  createPageTypeField,
  createTemplateRelationshipField,
} from "./page-builders";
import { pagesGeneratePreviewURL } from "../../cms-ui/web-studio/adapters/preview-url";
import { isNativePagesWebStudioEnabled } from "../../cms-ui/web-studio/feature-flags";
import { publishedPublicReadAccess } from "../access/public-read";
import {
  tenantScopedCreateAccess,
  tenantScopedDeleteAccess,
  tenantScopedUpdateAccess,
} from "../access/tenant-access";
import { logCmsChangeAudit, logCmsDeleteAudit } from "../hooks/audit";
import { applyTenantFromContext } from "../hooks/tenant";

import type { CollectionConfig } from "payload";

const nativePagesAdmin = isNativePagesWebStudioEnabled()
  ? {
      components: {
        views: {
          list: {
            Component:
              "/src/cms-ui/web-studio/pages/list/PagesNativeListView.tsx#PagesNativeListView",
          },
          edit: {
            default: {
              Component:
                "/src/cms-ui/web-studio/pages/document/PagesNativeEditView.tsx#PagesNativeEditView",
            },
          },
        },
      },
    }
  : {};

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    defaultColumns: ["title", "slug", "tenant", "updatedAt"],
    useAsTitle: "title",
    preview: pagesGeneratePreviewURL,
    ...nativePagesAdmin,
  },
  access: {
    read: publishedPublicReadAccess("tenant", { draftable: true }),
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
      name: "summary",
      type: "textarea",
    },
    createPageTypeField(),
    createTemplateRelationshipField(),
    createPageLayoutField(),
    {
      name: "content",
      type: "richText",
      required: true,
      admin: {
        description:
          "Legacy rich-text fallback during the layout rollout. Public rendering should prefer layout when present.",
      },
    },
    createLegacyRichTextField(),
  ],
};

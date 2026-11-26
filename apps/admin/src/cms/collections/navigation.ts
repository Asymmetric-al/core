import { sameSitePageOptions, sameTenantOptions } from "./page-builders";
import { isNativeCollectionWebStudioEnabled } from "../../cms-ui/web-studio/feature-flags";
import { studioDocumentEditViews } from "../../cms-ui/web-studio/shell/document-tabs";
import { navigationItemsRule } from "../tenancy/navigation-rules";
import { tenantScoped } from "../tenancy/tenant-scoped";

import type { CollectionConfig } from "payload";

export const Navigation: CollectionConfig = tenantScoped(
  {
    slug: "navigation",
    authorship: true,
    versions: false,
    admin: {
      defaultColumns: ["label", "updatedAt"],
      useAsTitle: "label",
      enableRichTextLink: false,
      enableRichTextRelationship: false,
      ...(isNativeCollectionWebStudioEnabled("navigation")
        ? {
            components: {
              views: {
                list: {
                  Component:
                    "/src/cms-ui/web-studio/navigation/list/NavigationNativeListView.tsx#NavigationNativeListView",
                },
                edit: studioDocumentEditViews(
                  "/src/cms-ui/web-studio/navigation/document/NavigationNativeEditView.tsx#NavigationNativeEditView",
                ),
              },
            },
          }
        : {}),
    },
    fields: [
      {
        name: "site",
        label: "Site",
        type: "relationship",
        relationTo: "site-presentations",
        required: true,
        filterOptions: sameTenantOptions,
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
            name: "page",
            type: "relationship",
            relationTo: "pages",
            filterOptions: sameSitePageOptions,
          },
          {
            name: "href",
            label: "Web address",
            type: "text",
          },
          {
            name: "openInNewTab",
            type: "checkbox",
            defaultValue: false,
          },
        ],
      },
    ],
  },
  {
    actorCreate: true,
    actorUpdate: true,
    actorDelete: true,
    keepsServiceId: false,
    rules: [navigationItemsRule],
  },
);

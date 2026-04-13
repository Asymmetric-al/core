import {
  PAGE_TEMPLATE_PAGE_TYPES,
  createTenantField,
  createTemplateLayoutField,
  withTenantAccessAndHooks,
} from "./page-builders";
import { isNativeCollectionWebStudioEnabled } from "../../cms-ui/web-studio/feature-flags";
import { PAGE_TEMPLATES_SLUG } from "../constants";

import type { CollectionConfig } from "payload";

const nativePageTemplatesAdmin = isNativeCollectionWebStudioEnabled(
  "page-templates",
)
  ? {
      components: {
        views: {
          list: {
            Component:
              "/src/cms-ui/web-studio/page-templates/list/PageTemplatesNativeListView.tsx#PageTemplatesNativeListView",
          },
          edit: {
            default: {
              Component:
                "/src/cms-ui/web-studio/page-templates/document/PageTemplatesNativeEditView.tsx#PageTemplatesNativeEditView",
            },
          },
        },
      },
    }
  : {};

export const PageTemplates: CollectionConfig = {
  slug: PAGE_TEMPLATES_SLUG,
  admin: {
    defaultColumns: ["name", "pageType", "templateKey", "tenant", "updatedAt"],
    useAsTitle: "name",
    ...nativePageTemplatesAdmin,
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
    createTenantField(),
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "templateKey",
      type: "text",
      required: true,
      index: true,
    },
    {
      name: "description",
      type: "textarea",
    },
    {
      name: "pageType",
      type: "select",
      required: true,
      options: [...PAGE_TEMPLATE_PAGE_TYPES],
      defaultValue: "standard",
    },
    {
      name: "thumbnail",
      type: "relationship",
      relationTo: "media",
    },
    {
      name: "defaultSummary",
      type: "textarea",
    },
    createTemplateLayoutField(),
  ],
  ...withTenantAccessAndHooks(),
};

import {
  PAGE_TEMPLATE_PAGE_TYPES,
  createTenantField,
  createTemplateLayoutField,
  webStudioCreateFlowView,
  withTenantAccessAndHooks,
} from "./page-builders";
import { isNativeCollectionWebStudioEnabled } from "../../cms-ui/web-studio/feature-flags";
import { studioDocumentEditViews } from "../../cms-ui/web-studio/shell/document-tabs";
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
          edit: studioDocumentEditViews(
            "/src/cms-ui/web-studio/page-templates/document/PageTemplatesNativeEditView.tsx#PageTemplatesNativeEditView",
          ),
          // The gallery's registered view renders the new-template form here.
          ...webStudioCreateFlowView(
            "/src/cms-ui/web-studio/flows/TemplateGalleryView.tsx#TemplateGalleryView",
          ),
        },
      },
    }
  : {};

export const PageTemplates: CollectionConfig = {
  slug: PAGE_TEMPLATES_SLUG,
  authorship: false,
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

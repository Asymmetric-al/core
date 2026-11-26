import { isNativeCollectionWebStudioEnabled } from "../../cms-ui/web-studio/feature-flags";
import { studioDocumentEditViews } from "../../cms-ui/web-studio/shell/document-tabs";
import { tenantScoped } from "../tenancy/tenant-scoped";

import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = tenantScoped(
  {
    slug: "media",
    authorship: true,
    versions: false,
    admin: {
      defaultColumns: ["alt", "credit", "folder", "updatedAt"],
      useAsTitle: "alt",
      enableRichTextLink: false,
      ...(isNativeCollectionWebStudioEnabled("media")
        ? {
            components: {
              views: {
                edit: studioDocumentEditViews(
                  "/src/cms-ui/web-studio/media/document/MediaNativeEditView.tsx#MediaNativeEditView",
                ),
                list: {
                  Component:
                    "/src/cms-ui/web-studio/media/list/MediaNativeListView.tsx#MediaNativeListView",
                },
              },
            },
          }
        : {}),
    },
    fields: [
      {
        name: "alt",
        label: "Alt text",
        type: "text",
        required: true,
      },
      {
        name: "credit",
        type: "text",
      },
      {
        name: "folder",
        type: "text",
      },
    ],
  },
  {
    actorCreate: false,
    actorUpdate: true,
    actorDelete: false,
    keepsServiceId: true,
  },
);

import { validateUuidReference } from "./page-builders";
import { isNativeCollectionWebStudioEnabled } from "../../cms-ui/web-studio/feature-flags";
import { studioDocumentEditViews } from "../../cms-ui/web-studio/shell/document-tabs";
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
          edit: studioDocumentEditViews(
            "/src/cms-ui/web-studio/missionary-profiles/document/MissionaryProfilesNativeEditView.tsx#MissionaryProfilesNativeEditView",
          ),
        },
      },
    }
  : {};

export const MissionaryProfiles: CollectionConfig = {
  slug: "missionary-profiles",
  authorship: false,
  versions: false,
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
      label: "Organization",
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
      name: "supabaseMissionaryId",
      type: "text",
      index: true,
      validate: (value: unknown) => {
        if (value === null || value === undefined || value === "") {
          return true;
        }

        return validateUuidReference(value);
      },
      admin: {
        description:
          "Set automatically. Links this profile to the missionary in Mission Control.",
        readOnly: true,
      },
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

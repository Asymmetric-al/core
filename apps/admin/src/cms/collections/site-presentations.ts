import { tenantScoped } from "../tenancy/tenant-scoped";

import type { CollectionConfig } from "payload";

export const SitePresentations: CollectionConfig = tenantScoped(
  {
    slug: "site-presentations",
    labels: { singular: "Site", plural: "Sites" },
    authorship: true,
    versions: false,
    admin: {
      useAsTitle: "id",
      hidden: true,
      enableRichTextLink: false,
      enableRichTextRelationship: false,
    },
    fields: [],
  },
  {
    actorCreate: false,
    actorUpdate: false,
    actorDelete: false,
    keepsServiceId: true,
  },
);

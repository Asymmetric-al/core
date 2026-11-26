import { PRINCIPAL_LINKS_SLUG } from "../access/tenant-context";
import { createSupabaseAuthStrategy } from "../auth/supabase-strategy";
import { clearWebStudioTenantOnLogout } from "../auth/web-studio-logout";
import { discardSuppliedId } from "../tenancy/tenant-scoped";

import type { Access, CollectionConfig } from "payload";

const ownRowOnly: Access = ({ req }) =>
  req.user?.collection === PRINCIPAL_LINKS_SLUG &&
  typeof req.user.id === "string"
    ? { id: { equals: req.user.id } }
    : false;

const nobody: Access = () => false;

export const PrincipalLinks: CollectionConfig = {
  slug: PRINCIPAL_LINKS_SLUG,
  labels: { singular: "Person", plural: "People" },
  authorship: false,
  versions: false,
  admin: {
    useAsTitle: "email",
    hidden: true,
    enableRichTextLink: false,
    enableRichTextRelationship: false,
  },
  access: {
    read: ownRowOnly,
    create: nobody,
    update: nobody,
    delete: nobody,
  },
  auth: {
    disableLocalStrategy: true,
    strategies: [createSupabaseAuthStrategy()],
  },
  hooks: {
    beforeOperation: [discardSuppliedId(true)],
    afterLogout: [clearWebStudioTenantOnLogout],
  },
  fields: [
    {
      name: "email",
      type: "text",
      admin: { readOnly: true },
    },
  ],
};

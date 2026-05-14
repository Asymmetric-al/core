export type TwentySchemaManagementPath = "metadata_api" | "twenty_app_manifest";

export interface CrmSchemaManagementDecision {
  path: TwentySchemaManagementPath;
  productionReady: boolean;
  rejectedPath: TwentySchemaManagementPath;
  rationale: string[];
}

export type TwentyObjectKind = "standard" | "custom";
export type TwentyFieldType =
  | "text"
  | "number"
  | "boolean"
  | "date"
  | "select"
  | "relation"
  | "json"
  | "currency";

export interface TwentyFieldDefinition {
  name: string;
  type: TwentyFieldType;
  required?: boolean;
  description: string;
}

export interface TwentyObjectDefinition {
  namePlural: string;
  nameSingular: string;
  kind: TwentyObjectKind;
  purpose: string;
  fields: TwentyFieldDefinition[];
}

export const CRM_SCHEMA_MANAGEMENT_PATH = {
  path: "metadata_api",
  productionReady: true,
  rejectedPath: "twenty_app_manifest",
  rationale: [
    "Twenty's Metadata API is the documented schema-management surface for objects, fields, and relations.",
    "Twenty app manifests are still alpha and require a separate app toolchain, so they stay non-production proof tooling until a later phase accepts them.",
    "The Metadata API path keeps schema bootstrap behind packages/api and the existing server-only credential boundary.",
  ],
} as const satisfies CrmSchemaManagementDecision;

export const TWENTY_OBJECT_MODEL = [
  {
    namePlural: "people",
    nameSingular: "person",
    kind: "standard",
    purpose:
      "Operational relationship person. Links to donor, missionary, profile, and Stripe context through Asym link tables.",
    fields: [
      {
        name: "asymTenantId",
        type: "text",
        required: true,
        description: "Tenant scope used for Asym link repair and replay.",
      },
      {
        name: "asymPrimaryEntityType",
        type: "select",
        description:
          "Primary source identity type such as donor_profile or missionary_profile.",
      },
      {
        name: "asymPrimaryEntityId",
        type: "text",
        description: "Primary source identity id. This is not the Twenty id.",
      },
      {
        name: "preferredContactMethod",
        type: "select",
        description: "CRM contact preference copied from relationship context.",
      },
    ],
  },
  {
    namePlural: "companies",
    nameSingular: "company",
    kind: "standard",
    purpose:
      "Organizations, churches, agencies, and partner groups where the standard company shape is sufficient.",
    fields: [
      {
        name: "asymTenantId",
        type: "text",
        required: true,
        description: "Tenant scope used for Asym link repair and replay.",
      },
      {
        name: "organizationKind",
        type: "select",
        description: "Company, church, agency, ministry, or household proxy.",
      },
    ],
  },
  {
    namePlural: "churches",
    nameSingular: "church",
    kind: "custom",
    purpose:
      "Church-specific relationship context that should not be forced into a generic company when ministry workflows need church fields.",
    fields: [
      {
        name: "asymTenantId",
        type: "text",
        required: true,
        description: "Tenant scope used for Asym link repair and replay.",
      },
      {
        name: "primaryContact",
        type: "relation",
        description: "Optional relation to the primary CRM person.",
      },
    ],
  },
  {
    namePlural: "households",
    nameSingular: "household",
    kind: "custom",
    purpose:
      "Relationship grouping for families and shared giving/contact context.",
    fields: [
      {
        name: "asymTenantId",
        type: "text",
        required: true,
        description: "Tenant scope used for Asym link repair and replay.",
      },
      {
        name: "members",
        type: "relation",
        description: "People connected to the household.",
      },
    ],
  },
  {
    namePlural: "tasks",
    nameSingular: "task",
    kind: "standard",
    purpose: "Staff CRM follow-up work and relationship tasks.",
    fields: [
      {
        name: "asymTenantId",
        type: "text",
        required: true,
        description: "Tenant scope used for Asym link repair and replay.",
      },
    ],
  },
  {
    namePlural: "notes",
    nameSingular: "note",
    kind: "standard",
    purpose:
      "CRM relationship notes. Care-sensitive notes remain Asym-owned and are not mirrored by default.",
    fields: [
      {
        name: "asymTenantId",
        type: "text",
        required: true,
        description: "Tenant scope used for Asym link repair and replay.",
      },
    ],
  },
  {
    namePlural: "ministryActivities",
    nameSingular: "ministryActivity",
    kind: "custom",
    purpose:
      "Relationship activity timeline entries that are CRM context, not finance or care truth.",
    fields: [
      {
        name: "asymTenantId",
        type: "text",
        required: true,
        description: "Tenant scope used for Asym link repair and replay.",
      },
      {
        name: "activityKind",
        type: "select",
        description: "Call, meeting, email, visit, note, or imported context.",
      },
      {
        name: "occurredAt",
        type: "date",
        description: "When the activity happened.",
      },
    ],
  },
  {
    namePlural: "relationshipCommitments",
    nameSingular: "relationshipCommitment",
    kind: "custom",
    purpose:
      "Pledge or relationship intent. Payment execution, receipts, refunds, statements, and reconciliation remain Asym-owned.",
    fields: [
      {
        name: "asymPledgeId",
        type: "text",
        required: true,
        description: "Asym pledge or commitment id.",
      },
      {
        name: "commitmentAmountCents",
        type: "number",
        description:
          "Relationship commitment amount in cents, not payment truth.",
      },
      {
        name: "currency",
        type: "text",
        description: "ISO currency code for the commitment terms.",
      },
      {
        name: "frequency",
        type: "select",
        description: "Relationship commitment frequency.",
      },
      {
        name: "commitmentStatus",
        type: "select",
        description: "Relationship commitment status copied for CRM context.",
      },
    ],
  },
  {
    namePlural: "giftSummaries",
    nameSingular: "giftSummary",
    kind: "custom",
    purpose:
      "Read-only CRM context for approved gifts. Supabase remains the payment, receipt, refund, statement, and reconciliation source of truth.",
    fields: [
      {
        name: "asymTenantId",
        type: "text",
        required: true,
        description: "Tenant scope used for Asym link repair and replay.",
      },
      {
        name: "asymDonationId",
        type: "text",
        required: true,
        description: "Asym donation id. This is not the Twenty id.",
      },
      {
        name: "asymStagedGiftId",
        type: "text",
        required: true,
        description: "Asym staged gift id used for retry and proof cleanup.",
      },
      {
        name: "donorId",
        type: "text",
        description: "Optional Asym donor id linked to the gift.",
      },
      {
        name: "missionaryId",
        type: "text",
        description: "Optional Asym missionary id linked to the gift.",
      },
      {
        name: "fundId",
        type: "text",
        description: "Optional Asym fund id linked to the gift.",
      },
      {
        name: "amountCents",
        type: "number",
        required: true,
        description: "Gift amount in minor units for CRM display only.",
      },
      {
        name: "currencyCode",
        type: "text",
        required: true,
        description:
          "ISO currency code. Uses currencyCode because currency is reserved in Twenty metadata.",
      },
      {
        name: "stripePaymentIntentId",
        type: "text",
        description: "Stripe payment intent id for support correlation.",
      },
      {
        name: "stripeChargeId",
        type: "text",
        description: "Stripe charge id for support correlation.",
      },
      {
        name: "receiptStatus",
        type: "text",
        required: true,
        description: "Receipt status copied from Asym staged gift state.",
      },
      {
        name: "paymentStatus",
        type: "text",
        required: true,
        description: "Staged gift lifecycle state copied for CRM context.",
      },
    ],
  },
] as const satisfies readonly TwentyObjectDefinition[];

export function getTwentyObjectDefinition(
  namePlural: string,
): TwentyObjectDefinition {
  const definition = TWENTY_OBJECT_MODEL.find(
    (object) => object.namePlural === namePlural,
  );
  if (!definition) {
    throw new Error(`Unknown Twenty object definition: ${namePlural}`);
  }

  return definition;
}

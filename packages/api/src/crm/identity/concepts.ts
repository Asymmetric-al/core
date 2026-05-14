export type CrmIdentityConceptId =
  | "supabase_auth_user"
  | "asym_profile"
  | "tenant_membership"
  | "crm_person"
  | "donor_profile"
  | "missionary_profile"
  | "cms_public_entity"
  | "stripe_customer"
  | "fund_or_project"
  | "pledge_or_relationship_commitment"
  | "payment_record"
  | "receipt_record"
  | "refund_record"
  | "statement_record"
  | "reconciliation_record";

export type CrmIdentityLinkPolicy =
  | "direct_link"
  | "context_link"
  | "summary_only"
  | "no_crm_identity_link";

export interface CrmIdentityConcept {
  id: CrmIdentityConceptId;
  label: string;
  owner: "asym" | "supabase_auth" | "stripe" | "cms" | "twenty";
  description: string;
  linkPolicy: CrmIdentityLinkPolicy;
  notSameAs: CrmIdentityConceptId[];
}

export const CRM_IDENTITY_CONCEPTS = [
  {
    id: "supabase_auth_user",
    label: "Supabase auth user",
    owner: "supabase_auth",
    description:
      "Authentication subject and session authority. It is not the operational CRM person record.",
    linkPolicy: "context_link",
    notSameAs: ["asym_profile", "tenant_membership", "crm_person"],
  },
  {
    id: "asym_profile",
    label: "Asym profile",
    owner: "asym",
    description:
      "Platform profile row that connects a user to tenant-scoped roles and app identity.",
    linkPolicy: "context_link",
    notSameAs: ["supabase_auth_user", "tenant_membership", "crm_person"],
  },
  {
    id: "tenant_membership",
    label: "Tenant membership and role",
    owner: "asym",
    description:
      "Tenant-scoped authorization assignment. It can explain why an actor has access but is not a CRM person.",
    linkPolicy: "context_link",
    notSameAs: ["supabase_auth_user", "asym_profile", "crm_person"],
  },
  {
    id: "crm_person",
    label: "CRM person",
    owner: "twenty",
    description:
      "Operational relationship person in Twenty, linked to Asym records by tenant-scoped link tables.",
    linkPolicy: "direct_link",
    notSameAs: [
      "supabase_auth_user",
      "asym_profile",
      "donor_profile",
      "missionary_profile",
      "stripe_customer",
    ],
  },
  {
    id: "donor_profile",
    label: "Donor profile",
    owner: "asym",
    description:
      "Donor-facing account and giving relationship record. It may link to a CRM person but does not become the CRM person.",
    linkPolicy: "direct_link",
    notSameAs: ["crm_person", "stripe_customer", "payment_record"],
  },
  {
    id: "missionary_profile",
    label: "Missionary profile",
    owner: "asym",
    description:
      "Missionary operational profile and support-raising workspace identity. It may link to CRM context without becoming a CRM person.",
    linkPolicy: "direct_link",
    notSameAs: ["crm_person", "cms_public_entity"],
  },
  {
    id: "cms_public_entity",
    label: "CMS public entity",
    owner: "cms",
    description:
      "Public presentation entity for pages and content. It aligns to CRM operational truth without becoming operational truth.",
    linkPolicy: "context_link",
    notSameAs: ["missionary_profile", "fund_or_project", "crm_person"],
  },
  {
    id: "stripe_customer",
    label: "Stripe customer",
    owner: "stripe",
    description:
      "Stripe billing identity. It may be referenced for staff context but payment truth stays outside CRM.",
    linkPolicy: "context_link",
    notSameAs: ["donor_profile", "crm_person", "payment_record"],
  },
  {
    id: "fund_or_project",
    label: "Fund or project",
    owner: "asym",
    description:
      "Asym-owned designation or project. CRM may hold relationship context, but designation and public release truth stay in Asym/CMS.",
    linkPolicy: "direct_link",
    notSameAs: ["cms_public_entity", "payment_record"],
  },
  {
    id: "pledge_or_relationship_commitment",
    label: "Pledge or relationship commitment",
    owner: "asym",
    description:
      "Relationship intent and commitment terms. It is not payment execution, receipt, statement, or reconciliation truth.",
    linkPolicy: "direct_link",
    notSameAs: ["payment_record", "receipt_record", "statement_record"],
  },
  {
    id: "payment_record",
    label: "Payment record",
    owner: "asym",
    description:
      "Money execution state. CRM receives at most summary context and never becomes the system of record.",
    linkPolicy: "summary_only",
    notSameAs: [
      "donor_profile",
      "pledge_or_relationship_commitment",
      "receipt_record",
      "refund_record",
    ],
  },
  {
    id: "receipt_record",
    label: "Receipt record",
    owner: "asym",
    description:
      "Official donor-facing receipt truth. It is not a CRM identity and should not be linked as a CRM person.",
    linkPolicy: "no_crm_identity_link",
    notSameAs: ["payment_record", "statement_record", "crm_person"],
  },
  {
    id: "refund_record",
    label: "Refund record",
    owner: "asym",
    description:
      "Refund truth and audit trail. CRM may receive summary context only after later projection phases.",
    linkPolicy: "summary_only",
    notSameAs: ["payment_record", "receipt_record", "crm_person"],
  },
  {
    id: "statement_record",
    label: "Statement record",
    owner: "asym",
    description:
      "Official giving statement truth. It is not a CRM identity and does not move to Twenty.",
    linkPolicy: "no_crm_identity_link",
    notSameAs: ["receipt_record", "payment_record", "crm_person"],
  },
  {
    id: "reconciliation_record",
    label: "Reconciliation record",
    owner: "asym",
    description:
      "Finance reconciliation truth. It remains Asym-owned and outside CRM identity linking.",
    linkPolicy: "no_crm_identity_link",
    notSameAs: ["payment_record", "refund_record", "crm_person"],
  },
] as const satisfies readonly CrmIdentityConcept[];

export function getCrmIdentityConcept(
  id: CrmIdentityConceptId,
): CrmIdentityConcept {
  const concept = CRM_IDENTITY_CONCEPTS.find((item) => item.id === id);
  if (!concept) {
    throw new Error(`Unknown CRM identity concept: ${id}`);
  }

  return concept;
}

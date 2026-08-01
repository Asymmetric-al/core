import { validateDocumentPurposeCatalog } from "./validation";

import type {
  DocumentCaseId,
  DocumentPurposeContract,
  DocumentPurposeId,
  FixtureClass,
  ReleaseEvidenceClass,
  StructuredBlockId,
} from "./types";

/**
 * The exact Phase 18 launch purpose catalog, mirrored from the normative
 * document-purpose and authority manifest. Code-owned: tenants can never
 * create, edit, reclassify, or activate an entry, and catalog membership never
 * activates a purpose by itself — availability is resolved separately.
 */

const US_ACKNOWLEDGMENT_CASES = [
  "us.cash.under_250@1",
  "us.cash.250_or_more@1",
  "us.quid_pro_quo.over_75@1",
  "us.intangible_religious_benefit@1",
  "us.property_or_market_asset@1",
  "us.daf_or_pass_through@1",
  "us.corrected@1",
] as const satisfies readonly DocumentCaseId[];

const OFFICIAL_REQUIRED_BLOCKS = [
  "page@1",
  "section@1",
  "heading@1",
  "official_block@1",
] as const satisfies readonly StructuredBlockId[];

const CA_OFFICIAL_REQUIRED_BLOCKS = [
  ...OFFICIAL_REQUIRED_BLOCKS,
  "signer_block@1",
] as const satisfies readonly StructuredBlockId[];

const TENANT_PRESENTATION_BLOCKS = [
  "rich_text@1",
  "image@1",
  "fact@1",
  "money@1",
  "summary@1",
  "table@1",
  "divider@1",
  "spacer@1",
  "header@1",
  "footer@1",
  "page_break@1",
] as const satisfies readonly StructuredBlockId[];

const GOVERNED_REQUIRED_BLOCKS = [
  "page@1",
  "section@1",
  "heading@1",
] as const satisfies readonly StructuredBlockId[];

const ALL_FIXTURE_CLASSES = [
  "ordinary",
  "negative",
  "maximum_content",
  "locale",
  "accessibility",
  "failure",
] as const satisfies readonly FixtureClass[];

const OFFICIAL_RELEASE_EVIDENCE = [
  "renderer",
  "legal_finance",
  "accessibility",
  "security",
  "records",
  "load",
  "operational",
] as const satisfies readonly ReleaseEvidenceClass[];

const GOVERNED_RELEASE_EVIDENCE = [
  "renderer",
  "accessibility",
  "security",
  "records",
  "operational",
] as const satisfies readonly ReleaseEvidenceClass[];

const SCOPE_POLICY = {
  assignment: "configured_inheritance",
  recovery_order: ["same_scope_prior", "exact_locale_permitted_ancestor"],
} as const;

const FORBIDDEN_IDENTITY_FACTS = [
  "donor_ssn",
  "donor_sin",
  "payment_instrument_number",
  "bank_account_number",
  "donor_household_income",
] as const;

export const DOCUMENT_PURPOSE_CATALOG = {
  "us.contribution_acknowledgment.single@1": {
    purpose_key: "us.contribution_acknowledgment.single",
    purpose_version: 1,
    lane: "official_tax",
    source_owner: "phase-07-receipt-compliance+phase-13-contribution-ledger",
    legal_issuer_requirement: "verified_us_issuer",
    recipient_role: {
      role: "legal_contributor",
      authorization_policy: "source_owned_recipient_resolution",
    },
    approved_data_view: {
      view_key: "us.acknowledgment.single_contribution",
      view_version: 1,
      fields: [
        "issuer_legal_name",
        "issuer_ein",
        "legal_donor_name",
        "gift_date",
        "gift_amount",
        "goods_services_statement",
        "case_facts",
        "acknowledgment_reference",
      ],
    },
    case_registry: US_ACKNOWLEDGMENT_CASES,
    required_blocks: OFFICIAL_REQUIRED_BLOCKS,
    optional_blocks: TENANT_PRESENTATION_BLOCKS,
    forbidden_facts: {
      deny_set_version: 1,
      facts: [
        ...FORBIDDEN_IDENTITY_FACTS,
        "internal_valuation",
        "appraisal_value",
        "donor_claimed_value",
        "sale_proceeds",
      ],
    },
    output_policy: "accessible-archive-v1",
    locale_policy: {
      activated_locales: ["en-US"],
      required_legal_variants: [],
      fallback: "fail_closed",
    },
    publication_scope_policy: SCOPE_POLICY,
    review_floor: "protected",
    identity_policy: {
      internal: "opaque_logical_id",
      public_reference: "ack_reference_v1",
    },
    correction_policy: { model: "source_owned_successor_version" },
    delivery_policy: { phase17_routes: ["email", "mail", "portal"] },
    access_policy: {
      portal: true,
      guest_grant: true,
      staff: true,
      support: false,
      missionary: false,
    },
    records_schedule: {
      schedule_key: "p18.records.official_tax_artifact",
      schedule_version: 1,
    },
    fixture_pack: {
      pack_key: "p18.fixtures.us_acknowledgment_single",
      required_fixtures: ALL_FIXTURE_CLASSES,
    },
    release_evidence: OFFICIAL_RELEASE_EVIDENCE,
    launch: {
      state: "dark",
      gates: ["us_legal_finance_review", "core_d3_renderer_qualified"],
    },
  },
  "us.contribution_acknowledgment.annual@1": {
    purpose_key: "us.contribution_acknowledgment.annual",
    purpose_version: 1,
    lane: "official_tax",
    source_owner:
      "phase-19-statement-population+phase-07-receipt-compliance+phase-13-contribution-ledger",
    legal_issuer_requirement: "verified_us_issuer",
    recipient_role: {
      role: "legal_contributor",
      authorization_policy: "source_owned_recipient_resolution",
    },
    approved_data_view: {
      view_key: "us.acknowledgment.annual_item_set",
      view_version: 1,
      fields: [
        "issuer_legal_name",
        "issuer_ein",
        "legal_donor_name",
        "coverage_period",
        "item_gift_dates",
        "item_gift_amounts",
        "item_case_facts",
        "goods_services_statement",
        "acknowledgment_reference",
      ],
    },
    case_registry: US_ACKNOWLEDGMENT_CASES,
    required_blocks: OFFICIAL_REQUIRED_BLOCKS,
    optional_blocks: TENANT_PRESENTATION_BLOCKS,
    forbidden_facts: {
      deny_set_version: 1,
      facts: [
        ...FORBIDDEN_IDENTITY_FACTS,
        "internal_valuation",
        "appraisal_value",
        "donor_claimed_value",
        "sale_proceeds",
        "qcd_distribution_amounts",
      ],
    },
    output_policy: "accessible-archive-v1",
    locale_policy: {
      activated_locales: ["en-US"],
      required_legal_variants: [],
      fallback: "fail_closed",
    },
    publication_scope_policy: SCOPE_POLICY,
    review_floor: "protected",
    identity_policy: {
      internal: "opaque_logical_id",
      public_reference: "ack_reference_v1",
    },
    correction_policy: { model: "source_owned_successor_version" },
    delivery_policy: { phase17_routes: ["email", "mail", "portal"] },
    access_policy: {
      portal: true,
      guest_grant: true,
      staff: true,
      support: false,
      missionary: false,
    },
    records_schedule: {
      schedule_key: "p18.records.official_tax_artifact",
      schedule_version: 1,
    },
    fixture_pack: {
      pack_key: "p18.fixtures.us_acknowledgment_annual",
      required_fixtures: ALL_FIXTURE_CLASSES,
    },
    release_evidence: OFFICIAL_RELEASE_EVIDENCE,
    launch: {
      state: "dark",
      gates: [
        "us_legal_finance_review",
        "core_d3_renderer_qualified",
        "phase19_statement_seam",
      ],
    },
  },
  "us.qcd.acknowledgment@1": {
    purpose_key: "us.qcd.acknowledgment",
    purpose_version: 1,
    lane: "official_tax",
    source_owner: "phase-07-receipt-compliance+phase-13-contribution-ledger",
    legal_issuer_requirement: "verified_us_issuer",
    recipient_role: {
      role: "qcd_recipient",
      authorization_policy: "source_owned_recipient_resolution",
    },
    approved_data_view: {
      view_key: "us.acknowledgment.qcd_distribution",
      view_version: 1,
      fields: [
        "issuer_legal_name",
        "issuer_ein",
        "qcd_recipient_name",
        "distribution_date",
        "distribution_amount",
        "qcd_protected_statement",
        "acknowledgment_reference",
      ],
    },
    case_registry: ["us.qcd@1", "us.corrected@1"],
    required_blocks: OFFICIAL_REQUIRED_BLOCKS,
    optional_blocks: TENANT_PRESENTATION_BLOCKS,
    forbidden_facts: {
      deny_set_version: 1,
      facts: [
        ...FORBIDDEN_IDENTITY_FACTS,
        "ordinary_deductible_totals",
        "ordinary_acknowledgment_wording",
      ],
    },
    output_policy: "accessible-archive-v1",
    locale_policy: {
      activated_locales: ["en-US"],
      required_legal_variants: [],
      fallback: "fail_closed",
    },
    publication_scope_policy: SCOPE_POLICY,
    review_floor: "protected",
    identity_policy: {
      internal: "opaque_logical_id",
      public_reference: "ack_reference_v1",
    },
    correction_policy: { model: "source_owned_successor_version" },
    delivery_policy: { phase17_routes: ["email", "mail", "portal"] },
    access_policy: {
      portal: true,
      guest_grant: true,
      staff: true,
      support: false,
      missionary: false,
    },
    records_schedule: {
      schedule_key: "p18.records.official_tax_artifact",
      schedule_version: 1,
    },
    fixture_pack: {
      pack_key: "p18.fixtures.us_qcd_acknowledgment",
      required_fixtures: ALL_FIXTURE_CLASSES,
    },
    release_evidence: OFFICIAL_RELEASE_EVIDENCE,
    launch: {
      state: "dark",
      gates: ["us_legal_finance_review", "core_d3_renderer_qualified"],
    },
  },
  "ca.official_receipt.individual_cash@1": {
    purpose_key: "ca.official_receipt.individual_cash",
    purpose_version: 1,
    lane: "official_tax",
    source_owner: "phase-07-issuance+phase-13-contribution-ledger",
    legal_issuer_requirement: "active_ca_registered_charity_issuer",
    recipient_role: {
      role: "true_donor",
      authorization_policy: "source_owned_recipient_resolution",
    },
    approved_data_view: {
      view_key: "ca.official_receipt.individual_cash",
      view_version: 1,
      fields: [
        "issuer_legal_name",
        "issuer_cra_registration",
        "true_donor_name",
        "true_donor_address",
        "gift_date",
        "gift_amount",
        "issue_locality",
        "issue_date",
        "receipt_serial",
        "signer_name",
        "signer_title",
      ],
    },
    case_registry: ["ca.cash.individual@1", "ca.replacement@1"],
    required_blocks: CA_OFFICIAL_REQUIRED_BLOCKS,
    optional_blocks: TENANT_PRESENTATION_BLOCKS,
    forbidden_facts: {
      deny_set_version: 1,
      facts: [...FORBIDDEN_IDENTITY_FACTS, "us_acknowledgment_wording"],
    },
    output_policy: "accessible-archive-v1",
    locale_policy: {
      activated_locales: ["en-CA", "fr-CA"],
      required_legal_variants: ["fr-CA"],
      fallback: "fail_closed",
    },
    publication_scope_policy: SCOPE_POLICY,
    review_floor: "protected",
    identity_policy: {
      internal: "opaque_logical_id",
      public_reference: "ca_serial_r_v1",
    },
    correction_policy: { model: "source_owned_replacement_serial" },
    delivery_policy: { phase17_routes: ["email", "mail", "portal"] },
    access_policy: {
      portal: true,
      guest_grant: true,
      staff: true,
      support: false,
      missionary: false,
    },
    records_schedule: {
      schedule_key: "p18.records.ca_official_receipt",
      schedule_version: 1,
    },
    fixture_pack: {
      pack_key: "p18.fixtures.ca_individual_cash",
      required_fixtures: ALL_FIXTURE_CLASSES,
    },
    release_evidence: OFFICIAL_RELEASE_EVIDENCE,
    launch: {
      state: "absent_until_activation",
      gates: [
        "ca_pack_active",
        "core_d3_renderer_qualified",
        "ca_issuer_coverage_case_proof",
      ],
    },
  },
  "ca.official_receipt.cumulative_cash@1": {
    purpose_key: "ca.official_receipt.cumulative_cash",
    purpose_version: 1,
    lane: "official_tax",
    source_owner: "phase-19-statement-population+phase-07-issuance",
    legal_issuer_requirement: "active_ca_registered_charity_issuer",
    recipient_role: {
      role: "true_donor",
      authorization_policy: "source_owned_recipient_resolution",
    },
    approved_data_view: {
      view_key: "ca.official_receipt.cumulative_cash",
      view_version: 1,
      fields: [
        "issuer_legal_name",
        "issuer_cra_registration",
        "true_donor_name",
        "true_donor_address",
        "coverage_item_dates",
        "coverage_item_amounts",
        "coverage_total",
        "issue_locality",
        "issue_date",
        "receipt_serial",
        "signer_name",
        "signer_title",
      ],
    },
    case_registry: ["ca.cash.cumulative@1", "ca.replacement@1"],
    required_blocks: CA_OFFICIAL_REQUIRED_BLOCKS,
    optional_blocks: TENANT_PRESENTATION_BLOCKS,
    forbidden_facts: {
      deny_set_version: 1,
      facts: [...FORBIDDEN_IDENTITY_FACTS, "overlapping_coverage_items"],
    },
    output_policy: "accessible-archive-v1",
    locale_policy: {
      activated_locales: ["en-CA", "fr-CA"],
      required_legal_variants: ["fr-CA"],
      fallback: "fail_closed",
    },
    publication_scope_policy: SCOPE_POLICY,
    review_floor: "protected",
    identity_policy: {
      internal: "opaque_logical_id",
      public_reference: "ca_serial_r_v1",
    },
    correction_policy: { model: "source_owned_replacement_serial" },
    delivery_policy: { phase17_routes: ["email", "mail", "portal"] },
    access_policy: {
      portal: true,
      guest_grant: true,
      staff: true,
      support: false,
      missionary: false,
    },
    records_schedule: {
      schedule_key: "p18.records.ca_official_receipt",
      schedule_version: 1,
    },
    fixture_pack: {
      pack_key: "p18.fixtures.ca_cumulative_cash",
      required_fixtures: ALL_FIXTURE_CLASSES,
    },
    release_evidence: OFFICIAL_RELEASE_EVIDENCE,
    launch: {
      state: "absent_until_activation",
      gates: [
        "ca_pack_active",
        "core_d3_renderer_qualified",
        "ca_issuer_coverage_case_proof",
        "phase19_statement_seam",
      ],
    },
  },
  "ca.official_receipt.non_cash@1": {
    purpose_key: "ca.official_receipt.non_cash",
    purpose_version: 1,
    lane: "official_tax",
    source_owner: "phase-07-issuance+phase-13-contribution-ledger",
    legal_issuer_requirement: "active_ca_registered_charity_issuer",
    recipient_role: {
      role: "true_donor",
      authorization_policy: "source_owned_recipient_resolution",
    },
    approved_data_view: {
      view_key: "ca.official_receipt.non_cash",
      view_version: 1,
      fields: [
        "issuer_legal_name",
        "issuer_cra_registration",
        "true_donor_name",
        "true_donor_address",
        "gift_date",
        "property_description",
        "fair_market_value",
        "deemed_value",
        "advantage_amount",
        "eligible_amount",
        "issue_locality",
        "issue_date",
        "receipt_serial",
        "signer_name",
        "signer_title",
      ],
    },
    case_registry: ["ca.property.non_cash@1", "ca.replacement@1"],
    required_blocks: CA_OFFICIAL_REQUIRED_BLOCKS,
    optional_blocks: TENANT_PRESENTATION_BLOCKS,
    forbidden_facts: {
      deny_set_version: 1,
      facts: [...FORBIDDEN_IDENTITY_FACTS, "us_no_value_rule"],
    },
    output_policy: "accessible-archive-v1",
    locale_policy: {
      activated_locales: ["en-CA", "fr-CA"],
      required_legal_variants: ["fr-CA"],
      fallback: "fail_closed",
    },
    publication_scope_policy: SCOPE_POLICY,
    review_floor: "protected",
    identity_policy: {
      internal: "opaque_logical_id",
      public_reference: "ca_serial_r_v1",
    },
    correction_policy: { model: "source_owned_replacement_serial" },
    delivery_policy: { phase17_routes: ["email", "mail", "portal"] },
    access_policy: {
      portal: true,
      guest_grant: true,
      staff: true,
      support: false,
      missionary: false,
    },
    records_schedule: {
      schedule_key: "p18.records.ca_official_receipt",
      schedule_version: 1,
    },
    fixture_pack: {
      pack_key: "p18.fixtures.ca_non_cash",
      required_fixtures: ALL_FIXTURE_CLASSES,
    },
    release_evidence: OFFICIAL_RELEASE_EVIDENCE,
    launch: {
      state: "absent_until_activation",
      gates: [
        "ca_pack_active",
        "core_d3_renderer_qualified",
        "ca_issuer_coverage_case_proof",
      ],
    },
  },
  "ca.official_receipt.advantage_split@1": {
    purpose_key: "ca.official_receipt.advantage_split",
    purpose_version: 1,
    lane: "official_tax",
    source_owner: "phase-07-issuance+phase-13-contribution-ledger",
    legal_issuer_requirement: "active_ca_registered_charity_issuer",
    recipient_role: {
      role: "true_donor",
      authorization_policy: "source_owned_recipient_resolution",
    },
    approved_data_view: {
      view_key: "ca.official_receipt.advantage_split",
      view_version: 1,
      fields: [
        "issuer_legal_name",
        "issuer_cra_registration",
        "true_donor_name",
        "true_donor_address",
        "gift_date",
        "payment_amount",
        "advantage_description",
        "advantage_fair_market_value",
        "eligible_amount",
        "issue_locality",
        "issue_date",
        "receipt_serial",
        "signer_name",
        "signer_title",
      ],
    },
    case_registry: ["ca.advantage.split@1", "ca.replacement@1"],
    required_blocks: CA_OFFICIAL_REQUIRED_BLOCKS,
    optional_blocks: TENANT_PRESENTATION_BLOCKS,
    forbidden_facts: {
      deny_set_version: 1,
      facts: [...FORBIDDEN_IDENTITY_FACTS, "template_computed_eligible_amount"],
    },
    output_policy: "accessible-archive-v1",
    locale_policy: {
      activated_locales: ["en-CA", "fr-CA"],
      required_legal_variants: ["fr-CA"],
      fallback: "fail_closed",
    },
    publication_scope_policy: SCOPE_POLICY,
    review_floor: "protected",
    identity_policy: {
      internal: "opaque_logical_id",
      public_reference: "ca_serial_r_v1",
    },
    correction_policy: { model: "source_owned_replacement_serial" },
    delivery_policy: { phase17_routes: ["email", "mail", "portal"] },
    access_policy: {
      portal: true,
      guest_grant: true,
      staff: true,
      support: false,
      missionary: false,
    },
    records_schedule: {
      schedule_key: "p18.records.ca_official_receipt",
      schedule_version: 1,
    },
    fixture_pack: {
      pack_key: "p18.fixtures.ca_advantage_split",
      required_fixtures: ALL_FIXTURE_CLASSES,
    },
    release_evidence: OFFICIAL_RELEASE_EVIDENCE,
    launch: {
      state: "absent_until_activation",
      gates: [
        "ca_pack_active",
        "core_d3_renderer_qualified",
        "ca_issuer_coverage_case_proof",
      ],
    },
  },
  "giving.summary.informational@1": {
    purpose_key: "giving.summary.informational",
    purpose_version: 1,
    lane: "governed_business",
    source_owner:
      "phase-07-receipt-compliance+phase-13-contribution-ledger+phase-19-statement-population",
    legal_issuer_requirement: "none",
    recipient_role: {
      role: "authorized_donor",
      authorization_policy: "source_owned_recipient_resolution",
    },
    approved_data_view: {
      view_key: "giving.summary.period",
      view_version: 1,
      fields: [
        "tenant_display_name",
        "donor_display_name",
        "period_start",
        "period_end",
        "period_gift_dates",
        "period_gift_amounts",
        "period_total",
        "not_official_statement",
      ],
    },
    case_registry: [],
    required_blocks: GOVERNED_REQUIRED_BLOCKS,
    optional_blocks: TENANT_PRESENTATION_BLOCKS,
    forbidden_facts: {
      deny_set_version: 1,
      facts: [
        ...FORBIDDEN_IDENTITY_FACTS,
        "official_receipt_language",
        "deductibility_promise",
      ],
    },
    output_policy: "accessible-v1",
    locale_policy: {
      activated_locales: ["en-US"],
      required_legal_variants: [],
      fallback: "fail_closed",
    },
    publication_scope_policy: SCOPE_POLICY,
    review_floor: "standard",
    identity_policy: {
      internal: "opaque_logical_id",
      public_reference: "none",
    },
    correction_policy: { model: "successor_document" },
    delivery_policy: { phase17_routes: ["email", "portal"] },
    access_policy: {
      portal: true,
      guest_grant: false,
      staff: true,
      support: false,
      missionary: false,
    },
    records_schedule: {
      schedule_key: "p18.records.governed_business_document",
      schedule_version: 1,
    },
    fixture_pack: {
      pack_key: "p18.fixtures.giving_summary",
      required_fixtures: ALL_FIXTURE_CLASSES,
    },
    release_evidence: GOVERNED_RELEASE_EVIDENCE,
    launch: {
      state: "supported_after_gates",
      gates: ["core_d3_renderer_qualified", "core_d4_artifact_pipeline"],
    },
  },
  "tribute.notification@1": {
    purpose_key: "tribute.notification",
    purpose_version: 1,
    lane: "governed_business",
    source_owner: "phase-14-donor-credit-operations",
    legal_issuer_requirement: "none",
    recipient_role: {
      role: "tribute_notify_party",
      authorization_policy: "source_owned_recipient_resolution",
    },
    approved_data_view: {
      view_key: "tribute.notification.recipient",
      view_version: 1,
      fields: [
        "tenant_display_name",
        "notify_party_name",
        "honoree_name",
        "tribute_kind",
        "tribute_message",
      ],
    },
    case_registry: [],
    required_blocks: GOVERNED_REQUIRED_BLOCKS,
    optional_blocks: TENANT_PRESENTATION_BLOCKS,
    forbidden_facts: {
      deny_set_version: 1,
      facts: [
        ...FORBIDDEN_IDENTITY_FACTS,
        "gift_amount",
        "deductible_amount",
        "legal_donor_claim",
        "donor_giving_history",
      ],
    },
    output_policy: "accessible-v1",
    locale_policy: {
      activated_locales: ["en-US"],
      required_legal_variants: [],
      fallback: "fail_closed",
    },
    publication_scope_policy: SCOPE_POLICY,
    review_floor: "standard",
    identity_policy: {
      internal: "opaque_logical_id",
      public_reference: "none",
    },
    correction_policy: { model: "successor_document" },
    delivery_policy: { phase17_routes: ["email", "mail"] },
    access_policy: {
      portal: false,
      guest_grant: true,
      staff: true,
      support: false,
      missionary: false,
    },
    records_schedule: {
      schedule_key: "p18.records.governed_business_document",
      schedule_version: 1,
    },
    fixture_pack: {
      pack_key: "p18.fixtures.tribute_notification",
      required_fixtures: ALL_FIXTURE_CLASSES,
    },
    release_evidence: GOVERNED_RELEASE_EVIDENCE,
    launch: {
      state: "supported_after_gates",
      gates: ["phase14_tribute_contract"],
    },
  },
  "pledge.statement@1": {
    purpose_key: "pledge.statement",
    purpose_version: 1,
    lane: "governed_business",
    source_owner: "phase-16-pledges-recurring-commitments",
    legal_issuer_requirement: "none",
    recipient_role: {
      role: "commitment_party",
      authorization_policy: "source_owned_recipient_resolution",
    },
    approved_data_view: {
      view_key: "pledge.statement.commitment",
      view_version: 1,
      fields: [
        "tenant_display_name",
        "commitment_party_name",
        "commitment_plan",
        "fulfillment_to_date",
        "non_debt_meaning_statement",
      ],
    },
    case_registry: [],
    required_blocks: GOVERNED_REQUIRED_BLOCKS,
    optional_blocks: TENANT_PRESENTATION_BLOCKS,
    forbidden_facts: {
      deny_set_version: 1,
      facts: [
        ...FORBIDDEN_IDENTITY_FACTS,
        "invented_balance",
        "debt_collection_language",
      ],
    },
    output_policy: "accessible-v1",
    locale_policy: {
      activated_locales: ["en-US"],
      required_legal_variants: [],
      fallback: "fail_closed",
    },
    publication_scope_policy: SCOPE_POLICY,
    review_floor: "standard",
    identity_policy: {
      internal: "opaque_logical_id",
      public_reference: "none",
    },
    correction_policy: { model: "successor_document" },
    delivery_policy: { phase17_routes: ["email", "portal"] },
    access_policy: {
      portal: true,
      guest_grant: false,
      staff: true,
      support: false,
      missionary: false,
    },
    records_schedule: {
      schedule_key: "p18.records.governed_business_document",
      schedule_version: 1,
    },
    fixture_pack: {
      pack_key: "p18.fixtures.pledge_statement",
      required_fixtures: ALL_FIXTURE_CLASSES,
    },
    release_evidence: GOVERNED_RELEASE_EVIDENCE,
    launch: {
      state: "supported_after_gates",
      gates: ["phase16_pledge_contract"],
    },
  },
  "custom.business_document@1": {
    purpose_key: "custom.business_document",
    purpose_version: 1,
    lane: "general_custom",
    source_owner: "registered-approved-data-view-owner",
    legal_issuer_requirement: "none",
    recipient_role: {
      role: "purpose_approved_recipient",
      authorization_policy: "deterministic_purpose_approved_recipient",
    },
    approved_data_view: {
      view_key: "custom.registered_safe_view",
      view_version: 1,
      fields: ["tenant_display_name", "registered_safe_view_fields"],
    },
    case_registry: [],
    required_blocks: ["page@1", "section@1"],
    optional_blocks: ["heading@1", ...TENANT_PRESENTATION_BLOCKS],
    forbidden_facts: {
      deny_set_version: 1,
      facts: [
        ...FORBIDDEN_IDENTITY_FACTS,
        "official_tax_language",
        "receipt_serial",
        "acknowledgment_reference",
      ],
    },
    output_policy: "accessible-v1",
    locale_policy: {
      activated_locales: ["en-US"],
      required_legal_variants: [],
      fallback: "fail_closed",
    },
    publication_scope_policy: SCOPE_POLICY,
    review_floor: "standard",
    identity_policy: {
      internal: "opaque_logical_id",
      public_reference: "none",
    },
    correction_policy: { model: "successor_document" },
    delivery_policy: { phase17_routes: ["email", "portal"] },
    access_policy: {
      portal: true,
      guest_grant: false,
      staff: true,
      support: false,
      missionary: false,
    },
    records_schedule: {
      schedule_key: "p18.records.general_custom_document",
      schedule_version: 1,
    },
    fixture_pack: {
      pack_key: "p18.fixtures.custom_business_document",
      required_fixtures: ALL_FIXTURE_CLASSES,
    },
    release_evidence: GOVERNED_RELEASE_EVIDENCE,
    launch: {
      state: "supported_after_gates",
      gates: ["registered_safe_data_view"],
    },
  },
} as const satisfies Record<DocumentPurposeId, DocumentPurposeContract>;

function deepFreeze<T>(value: T): T {
  if (typeof value !== "object" || value === null) return value;
  for (const child of Object.values(value as Record<string, unknown>)) {
    deepFreeze(child);
  }
  return Object.freeze(value);
}

// Fail closed at module initialization: an invalid catalog can never load.
const initializationIssues = validateDocumentPurposeCatalog(
  DOCUMENT_PURPOSE_CATALOG,
);
if (initializationIssues.length > 0) {
  const summary = initializationIssues
    .map((issue) => `${issue.path}: ${issue.code}`)
    .join("; ");
  throw new Error(`Document purpose catalog failed validation: ${summary}`);
}
deepFreeze(DOCUMENT_PURPOSE_CATALOG);

/**
 * Code-authoritative capability vocabulary (ADR-0210, Phase 3 D12).
 *
 * Every capability the platform can grant is an atom here. There is no
 * capability table: Phase 12 (#671) seeds its generated tables 1:1 from
 * `capabilityRegistryRows()`. #667(a) extends `CapabilityMeta` additively.
 */
import { deepFreeze } from "./freeze";

export type CapabilityMeta = {
  readonly label: string;
  readonly description: string;
  readonly domain: string;
  readonly source: "code";
};

/** Lowercase dotted segments, at least two: `domain.action` or deeper. */
export const CAPABILITY_KEY_PATTERN = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;

export const CAPABILITY_REGISTRY = deepFreeze({
  "contributions.view_detail": {
    label: "View contribution detail",
    description: "Open a contribution and read its detail and history.",
    domain: "contributions",
    source: "code",
  },
  "contributions.request_corrections": {
    label: "Request contribution corrections",
    description: "Submit a correction request for an approver to review.",
    domain: "contributions",
    source: "code",
  },
  "contributions.manage_table_preferences": {
    label: "Manage contribution table preferences",
    description: "Save personal column and filter preferences.",
    domain: "contributions",
    source: "code",
  },
  "contributions.apply_corrections": {
    label: "Apply contribution corrections",
    description: "Apply metadata, relink and allocation corrections directly.",
    domain: "contributions",
    source: "code",
  },
  "contributions.manage_receipts": {
    label: "Manage receipts",
    description: "Resend and correct contribution receipts.",
    domain: "contributions",
    source: "code",
  },
  "contributions.retry_crm_post": {
    label: "Retry CRM posting",
    description: "Retry staged gifts and repost contributions to the CRM.",
    domain: "contributions",
    source: "code",
  },
  "contributions.approve_corrections": {
    label: "Approve contribution corrections",
    description: "Approve or reject correction requests raised by others.",
    domain: "contributions",
    source: "code",
  },
  "contributions.run_refunds": {
    label: "Run refunds",
    description: "Issue refunds through the payment provider.",
    domain: "contributions",
    source: "code",
  },
  "contributions.use_provider_actions": {
    label: "Use provider actions",
    description: "Run payment-provider actions such as event replay.",
    domain: "contributions",
    source: "code",
  },
  "contributions.manage_settings": {
    label: "Manage contribution settings",
    description: "Change tenant contribution and approval policy settings.",
    domain: "contributions",
    source: "code",
  },
  "crm.gift_history.manage_view_defaults": {
    label: "Manage gift history view defaults",
    description: "Set the tenant-wide default gift history views.",
    domain: "crm",
    source: "code",
  },
  "admin.dashboard.access": {
    label: "Access Mission Control",
    description: "Open the Mission Control admin dashboard.",
    domain: "admin",
    source: "code",
  },
  "admin.crm.manage": {
    label: "Manage CRM records",
    description: "Create and edit people, households and CRM records.",
    domain: "admin",
    source: "code",
  },
  "admin.gifts.manage": {
    label: "Manage gifts",
    description: "Work with gifts and giving records in Mission Control.",
    domain: "admin",
    source: "code",
  },
  "admin.reports.view": {
    label: "View reports",
    description: "Read Mission Control reports.",
    domain: "admin",
    source: "code",
  },
  "permissions.view": {
    label: "View permissions",
    description: "Read the capability registry, bundles and grants.",
    domain: "permissions",
    source: "code",
  },
  "permissions.propose_widening": {
    label: "Propose projection widenings",
    description: "Propose a widening for a second person to approve.",
    domain: "permissions",
    source: "code",
  },
  "permissions.approve_widening": {
    label: "Approve projection widenings",
    description: "Approve or reject a widening proposed by someone else.",
    domain: "permissions",
    source: "code",
  },
} as const satisfies Record<string, CapabilityMeta>);

export type Capability = keyof typeof CAPABILITY_REGISTRY;

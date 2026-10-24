import type { Capability } from "./registry";
import type { MembershipRole, StaffSubrole } from "@asym/database/types";

/*
 * Graduated bundles. The contribution chain reproduces today's incumbent
 * tiers (donor care 3, finance staff 6, finance approver 9, admin 11) and
 * `staff_base` reproduces `STAFF_SUBROLE_CAPABILITIES`. Each tier is a strict
 * superset of the one before it.
 */
const DONOR_CARE = [
  "contributions.view_detail",
  "contributions.request_corrections",
  "contributions.manage_table_preferences",
] as const;

const FINANCE_STAFF = [
  ...DONOR_CARE,
  "contributions.apply_corrections",
  "contributions.manage_receipts",
  "contributions.retry_crm_post",
] as const;

const FINANCE_APPROVER = [
  ...FINANCE_STAFF,
  "contributions.approve_corrections",
  "contributions.run_refunds",
  "contributions.use_provider_actions",
] as const;

const PERMISSIONS_VIEWER = ["permissions.view"] as const;
const PERMISSIONS_PROPOSER = [
  ...PERMISSIONS_VIEWER,
  "permissions.propose_widening",
] as const;

export const CAPABILITY_BUNDLES = {
  staff_base: [
    "admin.dashboard.access",
    "admin.crm.manage",
    "admin.gifts.manage",
    "admin.reports.view",
  ],
  donor_care: DONOR_CARE,
  finance_staff: FINANCE_STAFF,
  finance_approver: FINANCE_APPROVER,
  contribution_admin: [
    ...FINANCE_APPROVER,
    "contributions.manage_settings",
    "crm.gift_history.manage_view_defaults",
  ],
  permissions_viewer: PERMISSIONS_VIEWER,
  permissions_proposer: PERMISSIONS_PROPOSER,
  permissions_approver: [
    ...PERMISSIONS_PROPOSER,
    "permissions.approve_widening",
  ],
} as const satisfies Record<string, readonly Capability[]>;

export type BundleKey = keyof typeof CAPABILITY_BUNDLES;

/** Subjects granted by name rather than by a membership assignment. */
export type NamedGrantSubject = "tenant_admin" | "platform_admin";

/**
 * Closed set of grant subjects, derived from the membership vocabulary so a
 * new `StaffSubrole` cannot ship without a default-bundle entry below.
 */
export type GrantSubjectKey =
  | `member:${Exclude<MembershipRole, "staff">}`
  | `staff:${StaffSubrole}`
  | NamedGrantSubject;

const STAFF_DEFAULTS = ["staff_base", "donor_care"] as const;

/**
 * Default bundles per subject: the Phase 12 (#671) role-grant seeding shape.
 * Four-eyes: `tenant_admin` can propose widenings but only `platform_admin`
 * can approve them. Members and staff hold no `permissions.*` atom.
 */
export const ROLE_DEFAULT_BUNDLES: Readonly<
  Record<GrantSubjectKey, readonly BundleKey[]>
> = {
  "member:donor": [],
  "member:missionary": [],
  "staff:finance": ["staff_base", "finance_staff"],
  "staff:mobilizer": STAFF_DEFAULTS,
  "staff:development": STAFF_DEFAULTS,
  "staff:hr": STAFF_DEFAULTS,
  "staff:member_care": STAFF_DEFAULTS,
  tenant_admin: ["staff_base", "finance_approver", "permissions_proposer"],
  platform_admin: ["staff_base", "contribution_admin", "permissions_approver"],
};

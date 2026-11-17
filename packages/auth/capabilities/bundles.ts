import { deepFreeze } from "./freeze";

import type { Capability } from "./registry";
import type { MembershipRole, StaffSubrole } from "@asym/database/types";

/*
 * Graduated bundles. The contribution chain reproduces the incumbent tiers
 * (donor care 3, finance staff 6, finance approver 9, contribution admin 11)
 * and `staff_base` reproduces `STAFF_SUBROLE_CAPABILITIES`. Each tier is a
 * strict superset of the one before it.
 *
 * The SQL capability function `authz.assignment_capabilities` holds the same
 * mapping for the database (AL-2675); a real-stack test compares the two for
 * every grant subject and the tenant-administrator flag
 * (tests/unit/acceptance/issue-2675/capability-parity.realstack.acceptance.test.ts).
 * Change both together.
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

/** What every staff sub-role holds beyond `staff_base` (plan 5.4). */
const STAFF_CONTENT = ["web_studio.edit", "updates.review"] as const;

export const CAPABILITY_BUNDLES = deepFreeze({
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
  /*
   * One bundle per staff sub-role (B05, A06), so narrowing one sub-role is an
   * edit to its own bundle. Mobilizer and hr hold the same capabilities
   * today: the plan names none that distinguishes them.
   */
  staff_finance: [...STAFF_CONTENT, ...FINANCE_STAFF],
  staff_mobilizer: [...STAFF_CONTENT, ...DONOR_CARE],
  staff_development: [...STAFF_CONTENT, ...DONOR_CARE, "web_studio.publish"],
  staff_hr: [...STAFF_CONTENT, ...DONOR_CARE],
  staff_member_care: [...STAFF_CONTENT, ...DONOR_CARE, "care.access"],
  /** The tenant administrator's own capabilities (plan 5.4, default holders). */
  tenant_administration: [
    "people.manage_members",
    "people.erase",
    "sites.manage",
    "payments.manage_account",
    "web_studio.publish",
    "safety.restrict_publication",
    "imports.commit",
  ],
  permissions_viewer: PERMISSIONS_VIEWER,
  permissions_proposer: PERMISSIONS_PROPOSER,
  /**
   * Held by no subject: approving a widening has no holder until Phase 12
   * (plan 5.1). Kept so the key stays stable for Phase 12 seeding.
   */
  permissions_approver: [
    ...PERMISSIONS_PROPOSER,
    "permissions.approve_widening",
  ],
} as const satisfies Record<string, readonly Capability[]>);

export type BundleKey = keyof typeof CAPABILITY_BUNDLES;

/**
 * Subjects granted by name rather than by a membership assignment. The
 * tenant-administrator flag on a staff membership reaches the registry as
 * `tenant_admin`. `platform_admin` is retired with `super_admin` (plan 5.1).
 */
export type NamedGrantSubject = "tenant_admin";

/**
 * Closed set of grant subjects, derived from the membership vocabulary so a
 * new `StaffSubrole` cannot ship without a default-bundle entry below.
 */
export type GrantSubjectKey =
  | `member:${Exclude<MembershipRole, "staff">}`
  | `staff:${StaffSubrole}`
  | NamedGrantSubject;

/**
 * Default bundles per subject: the Phase 12 (#671) role-grant seeding shape.
 * The tenant administrator holds the contribution-settings bundle the retired
 * `platform_admin` held, and can propose a widening; no subject can approve
 * one. Members and staff hold no `permissions.*` atom.
 */
export const ROLE_DEFAULT_BUNDLES: Readonly<
  Record<GrantSubjectKey, readonly BundleKey[]>
> = deepFreeze({
  "member:donor": [],
  "member:missionary": [],
  "staff:finance": ["staff_base", "staff_finance"],
  "staff:mobilizer": ["staff_base", "staff_mobilizer"],
  "staff:development": ["staff_base", "staff_development"],
  "staff:hr": ["staff_base", "staff_hr"],
  "staff:member_care": ["staff_base", "staff_member_care"],
  tenant_admin: [
    "staff_base",
    "contribution_admin",
    "permissions_proposer",
    "tenant_administration",
  ],
});

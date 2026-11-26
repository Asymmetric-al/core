import { deepFreeze } from "./freeze";

import type { Capability } from "./registry";
import type { MembershipRole, StaffSubrole } from "@asym/database/types";

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
  staff_finance: [...STAFF_CONTENT, ...FINANCE_STAFF],
  staff_mobilizer: [...STAFF_CONTENT, ...DONOR_CARE],
  staff_development: [...STAFF_CONTENT, ...DONOR_CARE, "web_studio.publish"],
  staff_hr: [...STAFF_CONTENT, ...DONOR_CARE],
  staff_member_care: [...STAFF_CONTENT, ...DONOR_CARE, "care.access"],
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
  permissions_approver: [
    ...PERMISSIONS_PROPOSER,
    "permissions.approve_widening",
  ],
  missionary_partners: ["partners.add"],
} as const satisfies Record<string, readonly Capability[]>);

export type BundleKey = keyof typeof CAPABILITY_BUNDLES;

export type NamedGrantSubject = "tenant_admin";

export type GrantSubjectKey =
  | `member:${Exclude<MembershipRole, "staff">}`
  | `staff:${StaffSubrole}`
  | NamedGrantSubject;

export const ROLE_DEFAULT_BUNDLES: Readonly<
  Record<GrantSubjectKey, readonly BundleKey[]>
> = deepFreeze({
  "member:donor": [],
  "member:missionary": ["missionary_partners"],
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

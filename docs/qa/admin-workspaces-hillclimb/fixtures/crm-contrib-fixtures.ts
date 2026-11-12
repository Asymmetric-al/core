/**
 * Deterministic CRM + Contributions API fixtures for the admin UI hillclimb.
 *
 * The local environment has no Supabase, so every admin API answers 500/503.
 * Instead of hand-writing response JSON, this module seeds "database rows"
 * (donors, donations, staged gifts, allocations, corrections, pledges, ...) and
 * runs them through the SAME pure read-model builders the route handlers use
 * (`buildContributionGridRow`, `buildCrmGiftHistoryRow`, `buildContributionDetail`,
 * `projectContributionDetailForViewer`, `mapLocalCrmRelationshipRows`, ...).
 * Every assembled response body is then checked with `satisfies <RealType>` so
 * `tsc` proves the contract against the exported server/client types.
 *
 * Everything is relative to the fixed REFERENCE_DATE (no Date.now()). All names,
 * emails (example.org / example.com) and phone numbers (555-01xx) are fictional.
 */

import {
  applyEffectiveContributionToDonation,
  assembleSharedContributionEffectiveState,
  buildSharedContributionDesignationSets,
  mapContributionAdjustmentRow,
} from "@asym/api/admin/contribution-shared";
import {
  CRM_GIFT_HISTORY_TABLE_ID,
  CRM_ROW_ACTION_SCHEMA_VERSION,
} from "@asym/api/admin/crm/table-preferences";

import { resolveCorrectionApprovalPolicy } from "../../../../packages/api/src/admin/contribution-operations/approval-policy";
import { describeCorrectionRequestChange } from "../../../../packages/api/src/admin/contribution-operations/correction-request-change";
import { buildContributionDetail } from "../../../../packages/api/src/admin/contribution-operations/detail-read-model";
import { resolveTenantReceiptDeliveryPolicy } from "../../../../packages/api/src/admin/contribution-operations/receipt-delivery";
import {
  buildContributionReceiptDeliveryView,
  projectContributionDetailForViewer,
  projectCorrectionRequestsForViewer,
} from "../../../../packages/api/src/admin/contribution-operations/viewer-projection";
import { buildContributionGridRow } from "../../../../packages/api/src/admin/contributions/model";
import { buildCrmGiftHistoryRow } from "../../../../packages/api/src/admin/crm/detail/gift-history";
import { buildCrmGridRow } from "../../../../packages/api/src/admin/crm/model";
import { mapCrmNoteRow } from "../../../../packages/api/src/admin/crm/notes/model";
import {
  buildCrmRelationshipReport,
  mapLocalCrmRelationshipRows,
  sortCrmRelationships,
} from "../../../../packages/api/src/admin/crm/relationships/model";
import {
  buildNeedsAttentionGroups,
  mapNeedsAttentionRow,
  withoutRetiredNeedsAttention,
  type NeedsAttentionRow,
} from "../../../../packages/api/src/admin/mission-control-tasks/read-model";

import type {
  ContributionCapability,
  ViewerProjectedContributionDetail,
} from "@asym/api/admin/contribution-operations";
import type { ContributionActionType } from "@asym/api/admin/contribution-operations/types";
import type {
  AdminContributionsListResponse,
  ContributionGridRow,
} from "@asym/api/admin/contributions/types";
import type { AdminCrmListResponse } from "@asym/api/admin/crm/types";
import type {
  MissionControlNeedsAttentionGroup,
  MissionControlNeedsAttentionItem,
} from "@asym/database/hooks";
import type {
  AdminCrmNoteCreateResponse,
  AdminCrmNotesListResponse,
  AdminCrmRelationshipsListResponse,
  AdminCrmListResponse as AdminCrmListResponseClient,
  CrmDonorDetailResponse,
  CrmGiftHistoryRow,
  CrmGridRow,
  CrmNamedView,
  CrmNamedViewsResponse,
  CrmNoteRow,
  CrmRelationshipRow,
  CrmTablePreferencesResponse,
  CrmTimelineEntry,
} from "@asym/database/types";

// ---------------------------------------------------------------------------
// Fixed context
// ---------------------------------------------------------------------------

export const REFERENCE_DATE = "2026-11-01T00:00:00.000Z";
const REF_MS = Date.parse(REFERENCE_DATE);
const DAY_MS = 86_400_000;

/** Tenant + profile baked into the `/api/auth/demo-account` admin cookie. */
export const FIXTURE_TENANT_ID = "00000000-0000-0000-0000-000000000001";
export const FIXTURE_VIEWER_PROFILE_ID = "11111111-1111-1111-1111-111111111111";

/**
 * `resolveContributionCapabilities` for `role: "admin"` (FINANCE_APPROVER).
 * Admins do not hold `crm.gift_history.manage_view_defaults`; the tenant default
 * delegates the viewer instead, which is how `canManageTenantDefaults` is true.
 */
export const FIXTURE_VIEWER_CAPABILITIES: ContributionCapability[] = [
  "contributions.view_detail",
  "contributions.request_corrections",
  "contributions.manage_table_preferences",
  "contributions.apply_corrections",
  "contributions.manage_receipts",
  "contributions.retry_crm_post",
  "contributions.approve_corrections",
  "contributions.run_refunds",
  "contributions.use_provider_actions",
];

const APPROVAL_POLICY = resolveCorrectionApprovalPolicy(null);
const RECEIPT_POLICY = resolveTenantReceiptDeliveryPolicy(null);

// ---------------------------------------------------------------------------
// Deterministic helpers
// ---------------------------------------------------------------------------

function fnv1a(input: string, seed: number): number {
  let hash = seed >>> 0;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

function hashHex(input: string): string {
  return [0x811c9dc5, 0x01234567, 0x89abcdef, 0x5bd1e995]
    .map((seed) => fnv1a(input, seed).toString(16).padStart(8, "0"))
    .join("");
}

/** Deterministic RFC 4122 v4-shaped UUID (passes the client UUID_PATTERN and zod `.uuid()`). */
export function fixtureUuid(key: string): string {
  const hex = hashHex(key);
  const variant = "89ab"[Number.parseInt(hex.charAt(16), 16) % 4];
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${variant}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function fakeStripeId(prefix: "pi" | "ch" | "re" | "sub", key: string) {
  return `${prefix}_fx${hashHex(`${prefix}:${key}`).slice(0, 22)}`;
}

/** ISO timestamp `daysAgo` days before REFERENCE_DATE at hh:mm UTC. */
function at(daysAgo: number, hour = 15, minute = 0): string {
  return new Date(
    REF_MS - daysAgo * DAY_MS + (hour * 60 + minute) * 60_000,
  ).toISOString();
}

function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function compareText(left: string | null, right: string | null) {
  return (left ?? "").localeCompare(right ?? "");
}

// ---------------------------------------------------------------------------
// Reference data: missionaries, funds, staff
// ---------------------------------------------------------------------------

const MISSIONARIES = {
  okafor: {
    displayName: "Daniel & Grace Okafor",
    firstName: "Daniel",
    lastName: "Okafor",
    location: "Nairobi, Kenya",
  },
  zhang: {
    displayName: "Mei Lin Zhang",
    firstName: "Mei Lin",
    lastName: "Zhang",
    location: "Taichung, Taiwan",
  },
  rivera: {
    displayName: "Carlos & Ana Rivera",
    firstName: "Carlos",
    lastName: "Rivera",
    location: "Quetzaltenango, Guatemala",
  },
  nair: {
    displayName: "Priya Nair",
    firstName: "Priya",
    lastName: "Nair",
    location: "Chennai, India",
  },
} as const;
type MissionaryKey = keyof typeof MISSIONARIES;

const missionaryId = (key: MissionaryKey) => fixtureUuid(`missionary:${key}`);
const missionaryProfileId = (key: MissionaryKey) =>
  fixtureUuid(`missionary-profile:${key}`);

const FUNDS = {
  general: {
    name: "General Fund",
    missionary: null,
    goal: null,
    start: null,
    end: null,
  },
  water: {
    name: "Clean Water Initiative",
    missionary: null,
    goal: 25_000_000,
    start: null,
    end: null,
  },
  kenya: {
    name: "Kenya School Build",
    missionary: null,
    goal: 18_000_000,
    start: "2026-06-01",
    end: "2026-12-31",
  },
  relief: {
    name: "Disaster Relief Fund",
    missionary: null,
    goal: null,
    start: null,
    end: null,
  },
  youth: {
    name: "Youth Mentorship Program",
    missionary: null,
    goal: 4_000_000,
    start: null,
    end: null,
  },
  okafor: {
    name: "Okafor Family Support",
    missionary: "okafor",
    goal: null,
    start: null,
    end: null,
  },
  zhang: {
    name: "Mei Lin Zhang Support",
    missionary: "zhang",
    goal: null,
    start: null,
    end: null,
  },
  rivera: {
    name: "Rivera Family Support",
    missionary: "rivera",
    goal: null,
    start: null,
    end: null,
  },
  nair: {
    name: "Priya Nair Support",
    missionary: "nair",
    goal: null,
    start: null,
    end: null,
  },
} as const satisfies Record<
  string,
  {
    name: string;
    missionary: MissionaryKey | null;
    goal: number | null;
    start: string | null;
    end: string | null;
  }
>;
type FundKey = keyof typeof FUNDS;

const fundId = (key: FundKey) => fixtureUuid(`fund:${key}`);

const FUND_ROWS = (Object.keys(FUNDS) as FundKey[]).map((key) => {
  const fund = FUNDS[key];
  return {
    id: fundId(key),
    name: fund.name,
    missionary_id: fund.missionary ? missionaryId(fund.missionary) : null,
    goal_amount: fund.goal,
    start_date: fund.start,
    end_date: fund.end,
  };
});
const FUND_MAP = new Map(FUND_ROWS.map((row) => [row.id, row]));
const FUND_NAME_BY_ID = new Map(FUND_ROWS.map((row) => [row.id, row.name]));

const MISSIONARY_ROWS = (Object.keys(MISSIONARIES) as MissionaryKey[]).map(
  (key) => ({
    id: missionaryId(key),
    display_name: MISSIONARIES[key].displayName,
  }),
);
const MISSIONARY_NAME_BY_ID = new Map<string, string | null>(
  MISSIONARY_ROWS.map((row) => [row.id, row.display_name]),
);

const STAFF = {
  joel: { name: "Joel Ramirez", profileId: fixtureUuid("staff:joel") },
  alicia: { name: "Alicia Moreno", profileId: fixtureUuid("staff:alicia") },
  priyad: { name: "Priya Desai", profileId: fixtureUuid("staff:priyad") },
  hannahl: { name: "Hannah Lee", profileId: fixtureUuid("staff:hannahl") },
  owen: { name: "Owen Fitzgerald", profileId: fixtureUuid("staff:owen") },
} as const;
type StaffKey = keyof typeof STAFF;
const STAFF_NAME_BY_PROFILE_ID = new Map<string, string>(
  Object.values(STAFF).map((staff) => [staff.profileId, staff.name]),
);

// ---------------------------------------------------------------------------
// Donors (CRM records)
// ---------------------------------------------------------------------------

type DonorType = "individual" | "Organization" | "Church";
type DonorStatus = "active" | "inactive" | "prospect";

interface DonorSpec {
  key: string;
  name: string;
  type: DonorType;
  city: string;
  status: DonorStatus;
  tags: string[];
  portal?: boolean;
  title?: string;
  organization?: string;
  spouse?: string;
  missionary?: MissionaryKey;
  notes?: string;
  emailDomain?: "example.org" | "example.com";
  email?: string | null;
  createdDaysAgo: number;
  updatedDaysAgo: number;
  /** Giving recorded before the fixture's donation history (cents). */
  baselineCents?: number;
  favoriteFund?: FundKey;
}

const DONOR_SPECS: DonorSpec[] = [
  {
    key: "margaret",
    name: "Margaret Okonkwo-Hale",
    type: "individual",
    city: "Austin, TX",
    status: "active",
    tags: ["major-donor", "board"],
    portal: true,
    title: "Retired pediatrician",
    spouse: "Richard Hale",
    missionary: "okafor",
    notes:
      "Prefers a phone call before year-end. Matching gifts through her former employer are pending HR confirmation.",
    createdDaysAgo: 2140,
    updatedDaysAgo: 6,
    baselineCents: 4_850_000,
    favoriteFund: "water",
  },
  {
    key: "theo",
    name: "Theodore Lindqvist",
    type: "individual",
    city: "Minneapolis, MN",
    status: "active",
    tags: ["monthly-donor", "prayer-team"],
    portal: true,
    title: "High school chemistry teacher",
    missionary: "nair",
    notes:
      "Monthly partner since 2017. Increased his gift from $20 to $25 in 2022.",
    createdDaysAgo: 3290,
    updatedDaysAgo: 1,
    favoriteFund: "nair",
  },
  {
    key: "aaliyah",
    name: "Aaliyah Brooks",
    type: "individual",
    city: "Atlanta, GA",
    status: "active",
    tags: ["monthly-donor"],
    portal: true,
    title: "UX researcher",
    organization: "Peachtree Health",
    missionary: "okafor",
    createdDaysAgo: 610,
    updatedDaysAgo: 5,
    favoriteFund: "okafor",
  },
  {
    key: "rafael",
    name: "Rafael Domínguez",
    type: "individual",
    city: "San Antonio, TX",
    status: "active",
    tags: ["volunteer"],
    portal: false,
    missionary: "rivera",
    spouse: "Lucía Domínguez",
    createdDaysAgo: 880,
    updatedDaysAgo: 24,
    favoriteFund: "rivera",
  },
  {
    key: "hannah",
    name: "Hannah Whitfield",
    type: "individual",
    city: "Nashville, TN",
    status: "active",
    tags: ["event-2026"],
    portal: true,
    title: "Music publisher",
    createdDaysAgo: 400,
    updatedDaysAgo: 13,
    favoriteFund: "kenya",
  },
  {
    key: "kenji",
    name: "Kenji Nakamura",
    type: "individual",
    city: "Seattle, WA",
    status: "active",
    tags: ["monthly-donor", "lapsed-risk"],
    portal: true,
    title: "Software engineer",
    createdDaysAgo: 520,
    updatedDaysAgo: 4,
    favoriteFund: "water",
  },
  {
    key: "priscilla",
    name: "Priscilla Adeyemi",
    type: "individual",
    city: "Houston, TX",
    status: "active",
    tags: ["prayer-team"],
    portal: false,
    missionary: "okafor",
    notes:
      "Receipt emails bounce from her work address; confirm a personal email.",
    createdDaysAgo: 760,
    updatedDaysAgo: 11,
    favoriteFund: "okafor",
  },
  {
    key: "samuel",
    name: "Samuel Ortiz",
    type: "individual",
    city: "Phoenix, AZ",
    status: "active",
    tags: ["monthly-donor", "lapsed-risk"],
    portal: true,
    missionary: "rivera",
    createdDaysAgo: 990,
    updatedDaysAgo: 47,
    favoriteFund: "rivera",
  },
  {
    key: "gracekim",
    name: "Grace Kim",
    type: "individual",
    city: "Irvine, CA",
    status: "active",
    tags: ["major-donor"],
    portal: true,
    title: "Partner, Kim & Associates CPAs",
    organization: "Kim & Associates CPAs",
    missionary: "zhang",
    spouse: "Daniel Kim",
    createdDaysAgo: 1460,
    updatedDaysAgo: 21,
    baselineCents: 2_200_000,
    favoriteFund: "zhang",
  },
  {
    key: "elijah",
    name: "Elijah Washington",
    type: "individual",
    city: "Charlotte, NC",
    status: "active",
    tags: [],
    portal: false,
    createdDaysAgo: 300,
    updatedDaysAgo: 52,
    favoriteFund: "general",
  },
  {
    key: "fatima",
    name: "Fatima Rahman",
    type: "individual",
    city: "Dearborn, MI",
    status: "active",
    tags: ["first-time"],
    portal: false,
    createdDaysAgo: 30,
    updatedDaysAgo: 16,
    favoriteFund: "relief",
  },
  {
    key: "luis",
    name: "Luis Herrera",
    type: "individual",
    city: "Denver, CO",
    status: "active",
    tags: [],
    portal: true,
    createdDaysAgo: 210,
    updatedDaysAgo: 10,
    favoriteFund: "relief",
  },
  {
    key: "naomi",
    name: "Naomi Goldberg",
    type: "individual",
    city: "Philadelphia, PA",
    status: "active",
    tags: ["event-2026"],
    portal: true,
    title: "Architect",
    createdDaysAgo: 1100,
    updatedDaysAgo: 18,
    favoriteFund: "kenya",
  },
  {
    key: "marcus",
    name: "Marcus Bell",
    type: "individual",
    city: "Columbus, OH",
    status: "inactive",
    tags: ["lapsed-risk"],
    portal: false,
    notes: "Card expired in August; two reminder emails sent with no reply.",
    createdDaysAgo: 1300,
    updatedDaysAgo: 80,
    favoriteFund: "youth",
  },
  {
    key: "sofia",
    name: "Sofia Rossi",
    type: "individual",
    city: "Boston, MA",
    status: "active",
    tags: ["volunteer"],
    portal: true,
    createdDaysAgo: 450,
    updatedDaysAgo: 40,
    favoriteFund: "youth",
  },
  {
    key: "danielm",
    name: "Daniel Mbeki",
    type: "individual",
    city: "Raleigh, NC",
    status: "active",
    tags: [],
    portal: true,
    title: "Civil engineer",
    createdDaysAgo: 700,
    updatedDaysAgo: 34,
    favoriteFund: "general",
  },
  {
    key: "olivia",
    name: "Olivia Chen",
    type: "individual",
    city: "San Jose, CA",
    status: "active",
    tags: ["first-time"],
    portal: true,
    createdDaysAgo: 12,
    updatedDaysAgo: 2,
    favoriteFund: "relief",
  },
  {
    key: "jamal",
    name: "Jamal Carter",
    type: "individual",
    city: "Baltimore, MD",
    status: "active",
    tags: [],
    portal: false,
    createdDaysAgo: 95,
    updatedDaysAgo: 6,
    favoriteFund: "youth",
  },
  {
    key: "isabella",
    name: "Isabella Moreno",
    type: "individual",
    city: "Miami, FL",
    status: "active",
    tags: ["first-time"],
    portal: false,
    createdDaysAgo: 40,
    updatedDaysAgo: 25,
    favoriteFund: "general",
  },
  {
    key: "thomas",
    name: "Thomas O'Neill",
    type: "individual",
    city: "Chicago, IL",
    status: "inactive",
    tags: [],
    portal: false,
    notes:
      "Requested a refund after a duplicate online gift; asked to pause outreach until spring.",
    createdDaysAgo: 1700,
    updatedDaysAgo: 55,
    favoriteFund: "relief",
  },
  {
    key: "mariam",
    name: "Mariam Haddad",
    type: "individual",
    city: "Portland, OR",
    status: "inactive",
    tags: ["volunteer"],
    portal: false,
    createdDaysAgo: 1900,
    updatedDaysAgo: 112,
    baselineCents: 310_000,
    favoriteFund: "relief",
  },
  {
    key: "benjamin",
    name: "Benjamin Foster",
    type: "individual",
    city: "Kansas City, MO",
    status: "active",
    tags: ["major-donor"],
    portal: true,
    title: "Owner, Foster Hardware",
    organization: "Foster Hardware",
    spouse: "Claire Foster",
    createdDaysAgo: 2500,
    updatedDaysAgo: 9,
    baselineCents: 1_750_000,
    favoriteFund: "general",
  },
  {
    key: "leah",
    name: "Leah Abernathy",
    type: "individual",
    city: "Louisville, KY",
    status: "inactive",
    tags: [],
    portal: true,
    notes:
      "Cancelled her monthly gift after relocating; open to an annual gift.",
    createdDaysAgo: 1250,
    updatedDaysAgo: 98,
    favoriteFund: "youth",
  },
  {
    key: "andre",
    name: "Andre Dubois",
    type: "individual",
    city: "New Orleans, LA",
    status: "inactive",
    tags: [],
    portal: false,
    createdDaysAgo: 1600,
    updatedDaysAgo: 117,
    favoriteFund: "relief",
  },
  {
    key: "ruth",
    name: "Ruth Mwangi",
    type: "individual",
    city: "Tulsa, OK",
    status: "active",
    tags: ["monthly-donor", "prayer-team"],
    portal: true,
    missionary: "zhang",
    createdDaysAgo: 830,
    updatedDaysAgo: 14,
    favoriteFund: "zhang",
  },
  {
    key: "caleb",
    name: "Caleb Jensen",
    type: "individual",
    city: "Boise, ID",
    status: "prospect",
    tags: ["event-2026"],
    portal: false,
    notes: "Met at the Kenya vision dinner; interested in the school build.",
    createdDaysAgo: 20,
    updatedDaysAgo: 19,
  },
  {
    key: "analucia",
    name: "Ana Lucía Vargas",
    type: "individual",
    city: "Albuquerque, NM",
    status: "active",
    tags: [],
    portal: false,
    missionary: "rivera",
    createdDaysAgo: 360,
    updatedDaysAgo: 60,
    favoriteFund: "rivera",
  },
  {
    key: "victor",
    name: "Victor Huang",
    type: "individual",
    city: "Sacramento, CA",
    status: "active",
    tags: [],
    portal: true,
    createdDaysAgo: 260,
    updatedDaysAgo: 39,
    favoriteFund: "youth",
  },
  {
    key: "esther",
    name: "Esther Nwosu",
    type: "individual",
    city: "Dallas, TX",
    status: "active",
    tags: [],
    portal: false,
    createdDaysAgo: 330,
    updatedDaysAgo: 75,
    favoriteFund: "water",
  },
  {
    key: "patrick",
    name: "Patrick Murphy",
    type: "individual",
    city: "Pittsburgh, PA",
    status: "inactive",
    tags: [],
    portal: false,
    createdDaysAgo: 2300,
    updatedDaysAgo: 119,
    baselineCents: 640_000,
    favoriteFund: "general",
  },
  {
    key: "amara",
    name: "Amara Diallo",
    type: "individual",
    city: "Richmond, VA",
    status: "active",
    tags: [],
    portal: true,
    createdDaysAgo: 150,
    updatedDaysAgo: 72,
    favoriteFund: "general",
  },
  {
    key: "jonah",
    name: "Jonah Feldman",
    type: "individual",
    city: "Madison, WI",
    status: "active",
    tags: ["event-2026"],
    portal: false,
    spouse: "Rachel Feldman",
    createdDaysAgo: 640,
    updatedDaysAgo: 84,
    favoriteFund: "kenya",
  },
  {
    key: "chloe",
    name: "Chloe Martin",
    type: "individual",
    city: "Omaha, NE",
    status: "active",
    tags: ["first-time"],
    portal: true,
    title: "Nursing student",
    createdDaysAgo: 4,
    updatedDaysAgo: 3,
    favoriteFund: "general",
  },
  {
    key: "tyrone",
    name: "Tyrone Jackson",
    type: "individual",
    city: "Memphis, TN",
    status: "active",
    tags: ["volunteer"],
    portal: false,
    createdDaysAgo: 500,
    updatedDaysAgo: 22,
    favoriteFund: "youth",
  },
  {
    key: "ingrid",
    name: "Ingrid Solberg",
    type: "individual",
    city: "Fargo, ND",
    status: "prospect",
    tags: [],
    portal: false,
    createdDaysAgo: 33,
    updatedDaysAgo: 30,
  },
  {
    key: "mateo",
    name: "Mateo Castillo",
    type: "individual",
    city: "El Paso, TX",
    status: "active",
    tags: [],
    portal: false,
    missionary: "rivera",
    createdDaysAgo: 420,
    updatedDaysAgo: 101,
    favoriteFund: "rivera",
  },
  {
    key: "rebecca",
    name: "Rebecca Stein",
    type: "individual",
    city: "Ann Arbor, MI",
    status: "inactive",
    tags: [],
    portal: false,
    createdDaysAgo: 2000,
    updatedDaysAgo: 115,
    baselineCents: 420_000,
    favoriteFund: "water",
  },
  {
    key: "joseph",
    name: "Joseph Abara",
    type: "individual",
    city: "Indianapolis, IN",
    status: "active",
    tags: [],
    portal: false,
    createdDaysAgo: 900,
    updatedDaysAgo: 33,
    favoriteFund: "general",
  },
  {
    key: "lauren",
    name: "Lauren Mitchell",
    type: "individual",
    city: "Greenville, SC",
    status: "active",
    tags: ["volunteer"],
    portal: true,
    createdDaysAgo: 280,
    updatedDaysAgo: 19,
    favoriteFund: "youth",
  },
  {
    key: "hiroshi",
    name: "Hiroshi Tanaka",
    type: "individual",
    city: "Honolulu, HI",
    status: "prospect",
    tags: [],
    portal: false,
    createdDaysAgo: 8,
    updatedDaysAgo: 7,
  },
  {
    key: "deborah",
    name: "Deborah Lawson",
    type: "individual",
    city: "Birmingham, AL",
    status: "active",
    tags: ["prayer-team"],
    portal: false,
    spouse: "Curtis Lawson",
    createdDaysAgo: 1800,
    updatedDaysAgo: 107,
    baselineCents: 980_000,
    favoriteFund: "water",
  },
  {
    key: "nikhil",
    name: "Nikhil Patel",
    type: "individual",
    city: "Edison, NJ",
    status: "active",
    tags: [],
    portal: true,
    title: "Pharmacist",
    createdDaysAgo: 230,
    updatedDaysAgo: 17,
    favoriteFund: "water",
  },
  {
    key: "camille",
    name: "Camille Laurent",
    type: "individual",
    city: "Savannah, GA",
    status: "prospect",
    tags: [],
    portal: false,
    createdDaysAgo: 15,
    updatedDaysAgo: 15,
  },
  {
    key: "gabriel",
    name: "Gabriel Santos",
    type: "individual",
    city: "Orlando, FL",
    status: "active",
    tags: [],
    portal: false,
    missionary: "rivera",
    createdDaysAgo: 190,
    updatedDaysAgo: 29,
    favoriteFund: "rivera",
  },
  {
    key: "yolanda",
    name: "Yolanda Pierce",
    type: "individual",
    city: "St. Louis, MO",
    status: "prospect",
    tags: ["board"],
    portal: false,
    title: "Nonprofit consultant",
    createdDaysAgo: 45,
    updatedDaysAgo: 44,
  },
  {
    key: "danm",
    name: "Dan Mbeki",
    type: "individual",
    city: "Raleigh, NC",
    status: "active",
    tags: [],
    portal: false,
    email: "dmbeki@example.com",
    notes:
      "Created from a paper reply card; likely the same person as Daniel Mbeki.",
    createdDaysAgo: 36,
    updatedDaysAgo: 36,
  },
  // Organizations
  {
    key: "brightwater",
    name: "Brightwater Family Foundation",
    email: "grants@brightwaterfoundation.example.org",
    type: "Organization",
    city: "Grand Rapids, MI",
    status: "active",
    tags: ["foundation", "major-donor"],
    portal: false,
    title: "Program officer: Elena Marsh",
    organization: "Brightwater Family Foundation",
    notes:
      "Annual grant cycle closes in March. Reports due 60 days after each disbursement.",
    createdDaysAgo: 1400,
    updatedDaysAgo: 12,
    baselineCents: 3_750_000,
    favoriteFund: "kenya",
  },
  {
    key: "harborlane",
    name: "Harbor Lane Builders, Inc.",
    email: "accounts@harborlanebuilders.example.com",
    type: "Organization",
    city: "Tacoma, WA",
    status: "active",
    tags: ["corporate"],
    portal: false,
    title: "CFO: Martin Ruiz",
    organization: "Harbor Lane Builders, Inc.",
    createdDaysAgo: 720,
    updatedDaysAgo: 54,
    favoriteFund: "kenya",
  },
  {
    key: "cedarpine",
    name: "Cedar & Pine Dental Group",
    email: "office@cedarpinedental.example.com",
    type: "Organization",
    city: "Asheville, NC",
    status: "inactive",
    tags: ["corporate"],
    portal: false,
    organization: "Cedar & Pine Dental Group",
    createdDaysAgo: 1500,
    updatedDaysAgo: 110,
    baselineCents: 250_000,
    favoriteFund: "general",
  },
  {
    key: "meridian",
    name: "Meridian Logistics",
    email: "community@meridianlogistics.example.com",
    type: "Organization",
    city: "Cincinnati, OH",
    status: "prospect",
    tags: ["corporate"],
    portal: false,
    organization: "Meridian Logistics",
    notes: "Employee giving match proposal sent Oct 14.",
    createdDaysAgo: 28,
    updatedDaysAgo: 18,
  },
  {
    key: "northfield",
    name: "Northfield Community Bank",
    email: "giving@northfieldbank.example.com",
    type: "Organization",
    city: "Northfield, MN",
    status: "active",
    tags: ["corporate", "major-donor"],
    portal: false,
    title: "Community relations: Dana Holt",
    organization: "Northfield Community Bank",
    createdDaysAgo: 1050,
    updatedDaysAgo: 3,
    favoriteFund: "water",
  },
  {
    key: "rotary",
    name: "Sunrise Rotary Club of Tucson",
    email: "treasurer@sunriserotarytucson.example.org",
    type: "Organization",
    city: "Tucson, AZ",
    status: "active",
    tags: ["event-2026"],
    portal: false,
    organization: "Sunrise Rotary Club of Tucson",
    createdDaysAgo: 600,
    updatedDaysAgo: 118,
    favoriteFund: "water",
  },
  {
    key: "lumen",
    name: "Lumen Software Cooperative",
    email: "hello@lumencoop.example.com",
    type: "Organization",
    city: "Durham, NC",
    status: "active",
    tags: ["corporate", "in-kind"],
    portal: false,
    organization: "Lumen Software Cooperative",
    createdDaysAgo: 340,
    updatedDaysAgo: 30,
    favoriteFund: "youth",
  },
  {
    key: "okonjo",
    name: "Okonjo Family Trust",
    email: "trustees@okonjotrust.example.org",
    type: "Organization",
    city: "Atlanta, GA",
    status: "active",
    tags: ["foundation"],
    portal: false,
    title: "Trustee: Ifeoma Okonjo",
    organization: "Okonjo Family Trust",
    createdDaysAgo: 980,
    updatedDaysAgo: 20,
    favoriteFund: "kenya",
  },
  // Churches
  {
    key: "gracefellowship",
    name: "Grace Fellowship Church",
    email: "missions@gracefellowship.example.org",
    type: "Church",
    city: "Wheaton, IL",
    status: "active",
    tags: ["church-partner"],
    portal: false,
    title: "Missions pastor: Rev. Alan Brooks",
    organization: "Grace Fellowship Church",
    missionary: "okafor",
    createdDaysAgo: 2600,
    updatedDaysAgo: 8,
    baselineCents: 6_400_000,
    favoriteFund: "okafor",
  },
  {
    key: "newhope",
    name: "New Hope Community Church",
    email: "office@newhopefresno.example.org",
    type: "Church",
    city: "Fresno, CA",
    status: "active",
    tags: ["church-partner"],
    portal: false,
    organization: "New Hope Community Church",
    createdDaysAgo: 1200,
    updatedDaysAgo: 26,
    favoriteFund: "kenya",
  },
  {
    key: "standrews",
    name: "St. Andrew's Presbyterian Church",
    email: "missions@standrewspres.example.org",
    type: "Church",
    city: "Lexington, KY",
    status: "active",
    tags: ["church-partner"],
    portal: false,
    organization: "St. Andrew's Presbyterian Church",
    missionary: "okafor",
    createdDaysAgo: 2900,
    updatedDaysAgo: 39,
    baselineCents: 2_900_000,
    favoriteFund: "okafor",
  },
  {
    key: "livingwaters",
    name: "Living Waters Ministry",
    email: "info@livingwatersspokane.example.org",
    type: "Church",
    city: "Spokane, WA",
    status: "active",
    tags: ["church-partner"],
    portal: false,
    organization: "Living Waters Ministry",
    missionary: "nair",
    createdDaysAgo: 870,
    updatedDaysAgo: 45,
    favoriteFund: "nair",
  },
  {
    key: "vidanueva",
    name: "Iglesia Vida Nueva",
    email: "tesoreria@vidanueva.example.org",
    type: "Church",
    city: "Laredo, TX",
    status: "active",
    tags: ["church-partner"],
    portal: false,
    organization: "Iglesia Vida Nueva",
    missionary: "rivera",
    createdDaysAgo: 530,
    updatedDaysAgo: 57,
    favoriteFund: "rivera",
  },
  {
    key: "firstbaptist",
    name: "First Baptist Church of Maple Grove",
    email: "office@fbcmaplegrove.example.org",
    type: "Church",
    city: "Maple Grove, MN",
    status: "inactive",
    tags: ["church-partner"],
    portal: false,
    organization: "First Baptist Church of Maple Grove",
    createdDaysAgo: 3100,
    updatedDaysAgo: 116,
    baselineCents: 1_200_000,
    favoriteFund: "general",
  },
];

const donorId = (key: string) => fixtureUuid(`donor:${key}`);
const DONOR_SPEC_BY_KEY = new Map(DONOR_SPECS.map((spec) => [spec.key, spec]));

function donorEmail(spec: DonorSpec, index: number): string | null {
  if (spec.email !== undefined) return spec.email;
  const domain =
    spec.emailDomain ?? (index % 3 === 0 ? "example.com" : "example.org");
  if (spec.type !== "individual") {
    const slug = spec.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 18);
    return `giving@${slug}.${domain === "example.com" ? "example.com" : "example.org"}`;
  }
  const local = spec.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z\s-]/g, "")
    .trim()
    .split(/\s+/)
    .join(".");
  return `${local}@${domain}`;
}

const AREA_CODES: Record<string, string> = {
  TX: "512",
  MN: "612",
  GA: "404",
  TN: "615",
  WA: "206",
  AZ: "602",
  CA: "949",
  NC: "704",
  MI: "313",
  CO: "303",
  PA: "215",
  OH: "614",
  MA: "617",
  MD: "410",
  FL: "305",
  IL: "312",
  OR: "503",
  MO: "816",
  KY: "502",
  LA: "504",
  OK: "918",
  ID: "208",
  NM: "505",
  VA: "804",
  WI: "608",
  NE: "402",
  ND: "701",
  IN: "317",
  SC: "864",
  HI: "808",
  AL: "205",
  NJ: "732",
};

function donorPhone(spec: DonorSpec, index: number): string | null {
  if (spec.status === "prospect" && index % 2 === 0) return null;
  const state = spec.city.split(", ")[1] ?? "TX";
  const area = AREA_CODES[state] ?? "555";
  // 555-0100..555-0199 is reserved for fictional use.
  const line = String(100 + ((index * 37) % 100)).padStart(4, "0");
  // Dan/Daniel Mbeki share a number on purpose (duplicate warning).
  if (spec.key === "danm") return "(919) 555-0148";
  if (spec.key === "danielm") return "(919) 555-0148";
  return `(${area}) 555-${line}`;
}

interface DonorRecord {
  id: string;
  profile_id: string | null;
  missionary_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  avatar_url: string | null;
  location: string;
  organization: string | null;
  title: string | null;
  type: DonorType;
  status: DonorStatus;
  total_given: number;
  last_gift_date: string | null;
  tags: string[];
  notes: string | null;
  spouse: string | null;
  do_not_email: boolean;
  created_at: string;
  updated_at: string;
}

const DONORS: DonorRecord[] = DONOR_SPECS.map((spec, index) => ({
  id: donorId(spec.key),
  profile_id: spec.portal ? fixtureUuid(`donor-profile:${spec.key}`) : null,
  missionary_id: spec.missionary ? missionaryProfileId(spec.missionary) : null,
  name: spec.name,
  email: donorEmail(spec, index),
  phone: donorPhone(spec, index),
  mobile: null,
  avatar_url: null,
  location: spec.city,
  organization: spec.organization ?? null,
  title: spec.title ?? null,
  type: spec.type,
  status: spec.status,
  total_given: 0, // filled in after donations are seeded
  last_gift_date: null,
  tags: spec.tags,
  notes: spec.notes ?? null,
  spouse: spec.spouse ?? null,
  do_not_email: spec.key === "thomas",
  created_at: at(spec.createdDaysAgo, 14, 20),
  updated_at: at(spec.updatedDaysAgo, 16, (index * 7) % 60),
}));
const DONOR_BY_ID = new Map(DONORS.map((donor) => [donor.id, donor]));

// ---------------------------------------------------------------------------
// Pledges / recurring agreements
// ---------------------------------------------------------------------------

const PLEDGE_SPECS = {
  "theo-monthly": {
    donor: "theo",
    amount: 2500,
    frequency: "monthly",
    status: "active",
    fund: "nair",
    missionary: "nair",
    startDaysAgo: 3290,
    nextDaysAgo: -29,
  },
  "aaliyah-monthly": {
    donor: "aaliyah",
    amount: 10000,
    frequency: "monthly",
    status: "active",
    fund: "okafor",
    missionary: "okafor",
    startDaysAgo: 600,
    nextDaysAgo: -25,
  },
  "grace-monthly": {
    donor: "gracefellowship",
    amount: 100000,
    frequency: "monthly",
    status: "active",
    fund: "okafor",
    missionary: "okafor",
    startDaysAgo: 2200,
    nextDaysAgo: -22,
  },
  "ruth-monthly": {
    donor: "ruth",
    amount: 4000,
    frequency: "monthly",
    status: "active",
    fund: "zhang",
    missionary: "zhang",
    startDaysAgo: 800,
    nextDaysAgo: -16,
  },
  "samuel-monthly": {
    donor: "samuel",
    amount: 7500,
    frequency: "monthly",
    status: "active",
    fund: "rivera",
    missionary: "rivera",
    startDaysAgo: 950,
    nextDaysAgo: 17,
  },
  "okonjo-pledge": {
    donor: "okonjo",
    amount: 500000,
    frequency: "quarterly",
    status: "active",
    fund: "kenya",
    missionary: null,
    startDaysAgo: 200,
    nextDaysAgo: -70,
  },
  "marcus-monthly": {
    donor: "marcus",
    amount: 5000,
    frequency: "monthly",
    status: "lapsed",
    fund: "youth",
    missionary: null,
    startDaysAgo: 1200,
    nextDaysAgo: 84,
  },
  "leah-monthly": {
    donor: "leah",
    amount: 3000,
    frequency: "monthly",
    status: "cancelled",
    fund: "youth",
    missionary: null,
    startDaysAgo: 1100,
    nextDaysAgo: null,
  },
} as const satisfies Record<
  string,
  {
    donor: string;
    amount: number;
    frequency: string;
    status: "active" | "lapsed" | "cancelled";
    fund: FundKey;
    missionary: MissionaryKey | null;
    startDaysAgo: number;
    nextDaysAgo: number | null;
  }
>;
type PledgeKey = keyof typeof PLEDGE_SPECS;
const pledgeId = (key: PledgeKey) => fixtureUuid(`pledge:${key}`);

const PLEDGES = (Object.keys(PLEDGE_SPECS) as PledgeKey[]).map((key) => {
  const spec = PLEDGE_SPECS[key];
  return {
    key,
    id: pledgeId(key),
    tenant_id: FIXTURE_TENANT_ID,
    donor_id: donorId(spec.donor),
    amount: spec.amount,
    currency: "usd",
    frequency: spec.frequency,
    status: spec.status,
    fund_id: fundId(spec.fund),
    missionary_id: spec.missionary ? missionaryId(spec.missionary) : null,
    start_date: at(spec.startDaysAgo, 12),
    next_payment_date:
      spec.nextDaysAgo == null ? null : at(spec.nextDaysAgo, 12),
    stripe_subscription_id:
      key === "okonjo-pledge" ? null : fakeStripeId("sub", key),
    created_at: at(spec.startDaysAgo, 12),
    updated_at: at(Math.max(1, Math.min(spec.startDaysAgo, 40)), 12),
  };
});
const PLEDGE_BY_ID = new Map(PLEDGES.map((pledge) => [pledge.id, pledge]));

// ---------------------------------------------------------------------------
// Donations (hub gifts + older CRM gift history)
// ---------------------------------------------------------------------------

type PaymentMethodKey = "card" | "ach" | "check" | "cash" | "paypal" | "other";
type SourceKey =
  "online" | "mobile" | "in_person" | "mail" | "phone" | "import";
type RawStatus = "completed" | "pending" | "processing" | "failed" | "refunded";
type ReceiptKey = "sent" | "pending" | "failed" | "not_required" | "suppressed";
type CrmKey = "posted" | "queued" | "failed" | "blocked" | "not_required";
type StagedStatus =
  | "received"
  | "needs_review"
  | "ready_to_post"
  | "posted"
  | "failed"
  | "refunded"
  | "voided";

interface GiftSpec {
  key: string;
  donor: string | null;
  daysAgo: number;
  hour?: number;
  amount: number;
  fund: FundKey;
  missionary?: MissionaryKey | null;
  status?: RawStatus;
  method: PaymentMethodKey;
  source: SourceKey;
  kind?: "one_time" | "recurring" | "pledge_payment" | "in_kind";
  pledge?: PledgeKey;
  providerRecurring?: boolean;
  /** `null` = no staged-gift workflow row for this donation. */
  receipt?: ReceiptKey | null;
  crm?: CrmKey | null;
  staged?: StagedStatus;
  reviewReason?: string;
  refund?: number;
  refundedDaysAgo?: number;
  allocations?: Array<{
    fund: FundKey;
    amount: number;
    missionary?: MissionaryKey;
    memo?: string;
  }>;
  corrections?: Array<{
    type: string;
    status: "pending" | "applied" | "rejected";
    daysAgo: number;
  }>;
  requests?: Array<{
    action: ContributionActionType;
    status: "pending" | "approved" | "rejected";
    reason: string;
    by: StaffKey;
    daysAgo: number;
    proposal?: "email" | "pdf" | "defer";
    payload?: Record<string, unknown>;
  }>;
  adjustments?: Array<{
    type: string;
    status: "applied" | "reversed";
    values: { amountCents?: number; fund?: FundKey; paymentStatus?: string };
    reason: string;
    by: StaffKey;
    daysAgo: number;
  }>;
  audit?: Array<{
    action: string;
    surface: string;
    reason: string | null;
    daysAgo: number;
  }>;
  notes?: string;
  errorCode?: string;
  errorMessage?: string;
  crmLinkError?: string;
  campaign?: boolean;
}

const HUB_GIFTS: GiftSpec[] = [
  // Recurring partners linked to an internal agreement (agreement_linked).
  {
    key: "theo-1",
    donor: "theo",
    daysAgo: 1,
    hour: 9,
    amount: 2500,
    fund: "nair",
    method: "card",
    source: "online",
    kind: "recurring",
    pledge: "theo-monthly",
  },
  {
    key: "theo-2",
    donor: "theo",
    daysAgo: 31,
    hour: 9,
    amount: 2500,
    fund: "nair",
    method: "card",
    source: "online",
    kind: "recurring",
    pledge: "theo-monthly",
  },
  {
    key: "theo-3",
    donor: "theo",
    daysAgo: 62,
    hour: 9,
    amount: 2500,
    fund: "nair",
    method: "card",
    source: "online",
    kind: "recurring",
    pledge: "theo-monthly",
  },
  {
    key: "theo-4",
    donor: "theo",
    daysAgo: 92,
    hour: 9,
    amount: 2500,
    fund: "nair",
    method: "card",
    source: "online",
    kind: "recurring",
    pledge: "theo-monthly",
  },
  {
    key: "aaliyah-1",
    donor: "aaliyah",
    daysAgo: 5,
    hour: 13,
    amount: 10000,
    fund: "okafor",
    method: "card",
    source: "online",
    kind: "recurring",
    pledge: "aaliyah-monthly",
  },
  {
    key: "aaliyah-2",
    donor: "aaliyah",
    daysAgo: 35,
    hour: 13,
    amount: 10000,
    fund: "okafor",
    method: "card",
    source: "online",
    kind: "recurring",
    pledge: "aaliyah-monthly",
    receipt: "failed",
    notes: "Receipt email soft-bounced (mailbox full).",
  },
  {
    key: "aaliyah-3",
    donor: "aaliyah",
    daysAgo: 66,
    hour: 13,
    amount: 10000,
    fund: "okafor",
    method: "card",
    source: "online",
    kind: "recurring",
    pledge: "aaliyah-monthly",
  },
  {
    key: "aaliyah-4",
    donor: "aaliyah",
    daysAgo: 96,
    hour: 13,
    amount: 10000,
    fund: "okafor",
    method: "card",
    source: "online",
    kind: "recurring",
    pledge: "aaliyah-monthly",
  },
  {
    key: "grace-1",
    donor: "gracefellowship",
    daysAgo: 8,
    hour: 17,
    amount: 100000,
    fund: "okafor",
    method: "ach",
    source: "online",
    kind: "recurring",
    pledge: "grace-monthly",
    status: "processing",
    receipt: "pending",
    crm: "queued",
    staged: "received",
  },
  {
    key: "grace-2",
    donor: "gracefellowship",
    daysAgo: 38,
    hour: 17,
    amount: 100000,
    fund: "okafor",
    method: "ach",
    source: "online",
    kind: "recurring",
    pledge: "grace-monthly",
  },
  {
    key: "grace-3",
    donor: "gracefellowship",
    daysAgo: 69,
    hour: 17,
    amount: 100000,
    fund: "okafor",
    method: "ach",
    source: "online",
    kind: "recurring",
    pledge: "grace-monthly",
  },
  {
    key: "ruth-1",
    donor: "ruth",
    daysAgo: 14,
    hour: 20,
    amount: 4000,
    fund: "zhang",
    method: "card",
    source: "mobile",
    kind: "recurring",
    pledge: "ruth-monthly",
  },
  {
    key: "ruth-2",
    donor: "ruth",
    daysAgo: 44,
    hour: 20,
    amount: 4000,
    fund: "zhang",
    method: "card",
    source: "mobile",
    kind: "recurring",
    pledge: "ruth-monthly",
  },
  // Provider-only recurrence (Stripe subscription without an internal agreement).
  {
    key: "kenji-1",
    donor: "kenji",
    daysAgo: 4,
    hour: 7,
    amount: 5000,
    fund: "water",
    method: "card",
    source: "online",
    kind: "recurring",
    providerRecurring: true,
    crm: "not_required",
  },
  {
    key: "kenji-2",
    donor: "kenji",
    daysAgo: 34,
    hour: 7,
    amount: 5000,
    fund: "water",
    method: "card",
    source: "online",
    kind: "recurring",
    providerRecurring: true,
    crm: "not_required",
  },
  {
    key: "kenji-3",
    donor: "kenji",
    daysAgo: 64,
    hour: 7,
    amount: 5000,
    fund: "water",
    method: "card",
    source: "online",
    kind: "recurring",
    providerRecurring: true,
    status: "failed",
    errorCode: "expired_card",
    errorMessage: "Your card has expired.",
    receipt: "not_required",
    crm: "not_required",
    staged: "failed",
  },
  {
    key: "samuel-1",
    donor: "samuel",
    daysAgo: 47,
    hour: 10,
    amount: 7500,
    fund: "rivera",
    method: "card",
    source: "online",
    kind: "recurring",
    pledge: "samuel-monthly",
  },
  // Pledge installments.
  {
    key: "okonjo-1",
    donor: "okonjo",
    daysAgo: 20,
    hour: 15,
    amount: 500000,
    fund: "kenya",
    method: "ach",
    source: "online",
    kind: "pledge_payment",
    pledge: "okonjo-pledge",
    campaign: true,
  },
  {
    key: "okonjo-2",
    donor: "okonjo",
    daysAgo: 110,
    hour: 15,
    amount: 500000,
    fund: "kenya",
    method: "check",
    source: "mail",
    kind: "pledge_payment",
    pledge: "okonjo-pledge",
    campaign: true,
  },
  // Large foundation grant split across three designations (check, no provider charge).
  {
    key: "brightwater-1",
    donor: "brightwater",
    daysAgo: 12,
    hour: 16,
    amount: 1_250_000,
    fund: "kenya",
    method: "check",
    source: "mail",
    campaign: true,
    allocations: [
      { fund: "kenya", amount: 750_000, memo: "Classroom block B" },
      { fund: "water", amount: 400_000, memo: "Borehole at Kibera site" },
      {
        fund: "general",
        amount: 100_000,
        memo: "Unrestricted operating support",
      },
    ],
    notes: "FY27 grant disbursement 1 of 2 — check #4471.",
    audit: [
      {
        action: "resend_receipt",
        surface: "contribution_hub",
        reason: "Program officer requested a copy for the board packet.",
        daysAgo: 9,
      },
    ],
  },
  // Smallest gift.
  {
    key: "chloe-1",
    donor: "chloe",
    daysAgo: 3,
    hour: 22,
    amount: 500,
    fund: "general",
    method: "card",
    source: "mobile",
    crm: "not_required",
  },
  // Pending card payments.
  {
    key: "olivia-1",
    donor: "olivia",
    daysAgo: 2,
    hour: 11,
    amount: 25000,
    fund: "relief",
    method: "card",
    source: "online",
    status: "pending",
    receipt: "pending",
    crm: "queued",
    staged: "received",
  },
  {
    key: "jamal-1",
    donor: "jamal",
    daysAgo: 6,
    hour: 19,
    amount: 15000,
    fund: "youth",
    method: "card",
    source: "phone",
    status: "pending",
    receipt: "pending",
    crm: null,
    staged: "needs_review",
    reviewReason: "Cardholder name does not match donor record.",
  },
  // ACH still processing.
  {
    key: "northfield-1",
    donor: "northfield",
    daysAgo: 3,
    hour: 14,
    amount: 250000,
    fund: "water",
    method: "ach",
    source: "online",
    status: "processing",
    receipt: "pending",
    crm: "queued",
    staged: "received",
  },
  {
    key: "benjamin-1",
    donor: "benjamin",
    daysAgo: 9,
    hour: 12,
    amount: 50000,
    fund: "general",
    method: "ach",
    source: "online",
    status: "processing",
    receipt: "pending",
    crm: null,
    staged: "needs_review",
    reviewReason: "First ACH from a newly linked bank account.",
  },
  // Failed payments.
  {
    key: "luis-1",
    donor: "luis",
    daysAgo: 10,
    hour: 18,
    amount: 20000,
    fund: "relief",
    method: "card",
    source: "online",
    status: "failed",
    errorCode: "card_declined",
    errorMessage: "Your card was declined.",
    receipt: "not_required",
    crm: "not_required",
    staged: "failed",
  },
  {
    key: "isabella-1",
    donor: "isabella",
    daysAgo: 25,
    hour: 21,
    amount: 3500,
    fund: "general",
    method: "card",
    source: "mobile",
    status: "failed",
    errorCode: "insufficient_funds",
    errorMessage: "Your card has insufficient funds.",
    receipt: null,
    crm: null,
  },
  // Refunds.
  {
    key: "thomas-1",
    donor: "thomas",
    daysAgo: 58,
    hour: 10,
    amount: 30000,
    fund: "relief",
    method: "card",
    source: "online",
    status: "refunded",
    refund: 30000,
    refundedDaysAgo: 55,
    staged: "refunded",
    notes: "Duplicate of an earlier online gift; refunded at donor request.",
    audit: [
      {
        action: "refund",
        surface: "contribution_hub",
        reason: "Duplicate online gift — donor request.",
        daysAgo: 55,
      },
    ],
  },
  {
    key: "victor-1",
    donor: "victor",
    daysAgo: 41,
    hour: 15,
    amount: 12000,
    fund: "youth",
    method: "card",
    source: "online",
    status: "completed",
    refund: 12000,
    refundedDaysAgo: 40,
    notes:
      "Fully refunded at the processor; donation status was never flipped.",
  },
  {
    key: "esther-1",
    donor: "esther",
    daysAgo: 77,
    hour: 9,
    amount: 45000,
    fund: "water",
    method: "paypal",
    source: "online",
    status: "refunded",
    refund: 45000,
    refundedDaysAgo: 70,
    staged: "refunded",
  },
  {
    key: "naomi-1",
    donor: "naomi",
    daysAgo: 18,
    hour: 20,
    amount: 60000,
    fund: "kenya",
    method: "card",
    source: "online",
    refund: 10000,
    refundedDaysAgo: 16,
    notes: "Gala ticket add-on ($100) refunded; gift portion retained.",
    campaign: true,
  },
  {
    key: "elijah-1",
    donor: "elijah",
    daysAgo: 52,
    hour: 13,
    amount: 20000,
    fund: "general",
    method: "card",
    source: "online",
    refund: 5000,
    refundedDaysAgo: 50,
  },
  // Pending correction requests (decidable by the viewer).
  {
    key: "margaret-1",
    donor: "margaret",
    daysAgo: 7,
    hour: 10,
    amount: 100000,
    fund: "water",
    method: "card",
    source: "online",
    requests: [
      {
        action: "amount_correction",
        status: "pending",
        reason:
          "Donor confirmed she intended $1,500; the employer match was entered separately by mistake.",
        by: "joel",
        daysAgo: 2,
        proposal: "email",
        payload: { amount: 150000 },
      },
    ],
  },
  {
    key: "northfield-2",
    donor: "northfield",
    daysAgo: 27,
    hour: 14,
    amount: 500000,
    fund: "general",
    method: "ach",
    source: "online",
    requests: [
      {
        action: "refund",
        status: "pending",
        reason:
          "Bank flagged this transfer as a duplicate of the October sponsorship payment.",
        by: "alicia",
        daysAgo: 4,
        proposal: "pdf",
        payload: { amount: 500000 },
      },
    ],
  },
  // Receipt problems.
  {
    key: "priscilla-1",
    donor: "priscilla",
    daysAgo: 11,
    hour: 8,
    amount: 7500,
    fund: "okafor",
    method: "card",
    source: "online",
    receipt: "failed",
  },
  {
    key: "fatima-1",
    donor: "fatima",
    daysAgo: 16,
    hour: 23,
    amount: 18000,
    fund: "relief",
    method: "card",
    source: "mobile",
    receipt: "failed",
  },
  {
    key: "gabriel-1",
    donor: "gabriel",
    daysAgo: 29,
    hour: 12,
    amount: 10000,
    fund: "rivera",
    method: "paypal",
    source: "online",
    receipt: "pending",
    crm: "queued",
    staged: "ready_to_post",
  },
  {
    key: "tyrone-1",
    donor: "tyrone",
    daysAgo: 22,
    hour: 18,
    amount: 5000,
    fund: "youth",
    method: "cash",
    source: "in_person",
    receipt: "pending",
    crm: "not_required",
  },
  // Anonymous gifts.
  {
    key: "anon-1",
    donor: null,
    daysAgo: 15,
    hour: 19,
    amount: 2000,
    fund: "general",
    method: "cash",
    source: "in_person",
    receipt: "not_required",
    crm: "not_required",
    notes: "Cash in the offering basket at the Kenya vision dinner.",
  },
  {
    key: "anon-2",
    donor: null,
    daysAgo: 49,
    hour: 2,
    amount: 15000,
    fund: "water",
    method: "card",
    source: "online",
    receipt: "not_required",
    crm: "not_required",
  },
  // CRM posting states.
  {
    key: "hannah-1",
    donor: "hannah",
    daysAgo: 13,
    hour: 15,
    amount: 25000,
    fund: "kenya",
    method: "card",
    source: "online",
    crm: "failed",
    staged: "ready_to_post",
    crmLinkError:
      "Posting rejected: designation mapping missing for Kenya School Build.",
    campaign: true,
  },
  {
    key: "rafael-1",
    donor: "rafael",
    daysAgo: 24,
    hour: 17,
    amount: 8000,
    fund: "rivera",
    method: "card",
    source: "phone",
    crm: "failed",
    staged: "ready_to_post",
    crmLinkError: "Posting timed out after 3 attempts.",
  },
  {
    key: "joseph-1",
    donor: "joseph",
    daysAgo: 33,
    hour: 11,
    amount: 30000,
    fund: "general",
    method: "check",
    source: "mail",
    crm: "blocked",
    staged: "ready_to_post",
  },
  {
    key: "lauren-1",
    donor: "lauren",
    daysAgo: 19,
    hour: 16,
    amount: 12500,
    fund: "youth",
    method: "card",
    source: "online",
    crm: "queued",
    staged: "ready_to_post",
  },
  // Pending correction recorded on the corrections table.
  {
    key: "gracekim-1",
    donor: "gracekim",
    daysAgo: 21,
    hour: 9,
    amount: 40000,
    fund: "zhang",
    method: "card",
    source: "online",
    corrections: [
      { type: "designation_correction", status: "pending", daysAgo: 3 },
    ],
  },
  // Applied corrections with revision history.
  {
    key: "danielm-1",
    donor: "danielm",
    daysAgo: 36,
    hour: 10,
    amount: 10000,
    fund: "general",
    method: "check",
    source: "mail",
    corrections: [
      { type: "amount_correction", status: "applied", daysAgo: 33 },
    ],
    requests: [
      {
        action: "amount_correction",
        status: "approved",
        reason: "Check #2210 was for $150; keyed as $100 at intake.",
        by: "priyad",
        daysAgo: 34,
        proposal: "email",
        payload: { amount: 15000 },
      },
    ],
    adjustments: [
      {
        type: "amount_correction",
        status: "applied",
        values: { amountCents: 15000 },
        reason: "Check #2210 was for $150; keyed as $100 at intake.",
        by: "joel",
        daysAgo: 33,
      },
    ],
    audit: [
      {
        action: "amount_correction",
        surface: "contribution_hub",
        reason: "Approved by Joel Ramirez.",
        daysAgo: 33,
      },
      {
        action: "resend_receipt",
        surface: "contribution_hub",
        reason: "Updated receipt after amount correction.",
        daysAgo: 33,
      },
    ],
  },
  {
    key: "sofia-1",
    donor: "sofia",
    daysAgo: 43,
    hour: 14,
    amount: 20000,
    fund: "general",
    method: "card",
    source: "online",
    corrections: [{ type: "fund_correction", status: "applied", daysAgo: 41 }],
    adjustments: [
      {
        type: "fund_correction",
        status: "reversed",
        values: { fund: "relief" },
        reason: "Moved to Disaster Relief by mistake.",
        by: "hannahl",
        daysAgo: 42,
      },
      {
        type: "fund_correction",
        status: "applied",
        values: { fund: "youth" },
        reason:
          "Donor note on the online form asked for the mentorship program.",
        by: "hannahl",
        daysAgo: 41,
      },
    ],
    audit: [
      {
        action: "fund_correction",
        surface: "donor_crm_record",
        reason:
          "Donor note on the online form asked for the mentorship program.",
        daysAgo: 41,
      },
    ],
  },
  // Split designations (one does not reconcile).
  {
    key: "newhope-1",
    donor: "newhope",
    daysAgo: 26,
    hour: 13,
    amount: 240000,
    fund: "kenya",
    method: "check",
    source: "mail",
    allocations: [
      { fund: "kenya", amount: 120000, memo: "Missions Sunday offering" },
      { fund: "water", amount: 80000, memo: "VBS offering" },
    ],
    notes: "Cover letter lists $2,400; allocation lines entered total $2,000.",
  },
  {
    key: "nikhil-1",
    donor: "nikhil",
    daysAgo: 17,
    hour: 21,
    amount: 60000,
    fund: "water",
    method: "card",
    source: "online",
    allocations: [
      { fund: "water", amount: 30000 },
      { fund: "relief", amount: 30000, memo: "Hurricane response" },
    ],
  },
  {
    key: "standrews-1",
    donor: "standrews",
    daysAgo: 39,
    hour: 12,
    amount: 300000,
    fund: "okafor",
    method: "check",
    source: "mail",
    allocations: [
      { fund: "okafor", amount: 200000, missionary: "okafor" },
      { fund: "kenya", amount: 100000, memo: "Women's circle project" },
    ],
  },
  // In-kind.
  {
    key: "lumen-1",
    donor: "lumen",
    daysAgo: 30,
    hour: 15,
    amount: 180000,
    fund: "youth",
    method: "other",
    source: "in_person",
    kind: "in_kind",
    crm: "not_required",
    notes:
      "12 refurbished laptops for the fall mentorship cohort (donor valuation).",
  },
  // Imported batch rows.
  {
    key: "livingwaters-1",
    donor: "livingwaters",
    daysAgo: 45,
    hour: 12,
    amount: 75000,
    fund: "nair",
    method: "check",
    source: "import",
  },
  {
    key: "vidanueva-1",
    donor: "vidanueva",
    daysAgo: 57,
    hour: 12,
    amount: 32000,
    fund: "rivera",
    method: "check",
    source: "import",
  },
  {
    key: "harborlane-1",
    donor: "harborlane",
    daysAgo: 54,
    hour: 12,
    amount: 150000,
    fund: "kenya",
    method: "ach",
    source: "import",
    campaign: true,
  },
  // Older routine gifts (fall onto page 2 of the hub list).
  {
    key: "amara-1",
    donor: "amara",
    daysAgo: 72,
    hour: 18,
    amount: 5000,
    fund: "general",
    method: "card",
    source: "online",
  },
  {
    key: "jonah-1",
    donor: "jonah",
    daysAgo: 84,
    hour: 20,
    amount: 36000,
    fund: "kenya",
    method: "card",
    source: "online",
    campaign: true,
  },
  {
    key: "mateo-1",
    donor: "mateo",
    daysAgo: 101,
    hour: 11,
    amount: 2500,
    fund: "rivera",
    method: "card",
    source: "mobile",
  },
  {
    key: "deborah-1",
    donor: "deborah",
    daysAgo: 107,
    hour: 10,
    amount: 10000,
    fund: "water",
    method: "check",
    source: "mail",
  },
  {
    key: "marcus-1",
    donor: "marcus",
    daysAgo: 114,
    hour: 8,
    amount: 5000,
    fund: "youth",
    method: "card",
    source: "online",
    kind: "recurring",
    pledge: "marcus-monthly",
  },
  {
    key: "rotary-1",
    donor: "rotary",
    daysAgo: 118,
    hour: 19,
    amount: 50000,
    fund: "water",
    method: "check",
    source: "in_person",
  },
];

/** Older history (outside the 120-day hub window) so CRM gift history has depth. */
function buildHistoryGiftSpecs(): GiftSpec[] {
  const specs: GiftSpec[] = [];

  // Theo: monthly since 2017 -> 104 older gifts, so his record exceeds the
  // 100-row CRM gift-history cap ("First 100 shown").
  for (let month = 4; month < 108; month += 1) {
    const daysAgo = Math.round(1 + month * 30.44);
    specs.push({
      key: `theo-h${month}`,
      donor: "theo",
      daysAgo,
      hour: 9,
      amount: daysAgo > 1500 ? 2000 : 2500,
      fund: "nair",
      method: "card",
      source: "online",
      kind: "recurring",
      pledge: "theo-monthly",
    });
  }

  const random = mulberry32(20261101);
  const typicalAmounts = [2500, 5000, 10000, 15000, 25000, 50000, 100000];
  for (const spec of DONOR_SPECS) {
    if (
      spec.status === "prospect" ||
      spec.key === "theo" ||
      spec.key === "danm"
    ) {
      continue;
    }
    const count =
      spec.status === "inactive"
        ? 2 + Math.floor(random() * 3)
        : Math.floor(random() * 4);
    for (let index = 0; index < count; index += 1) {
      const daysAgo = 130 + Math.floor(random() * 900);
      const base =
        typicalAmounts[Math.floor(random() * typicalAmounts.length)] ?? 5000;
      const amount = spec.type === "individual" ? base : base * 4;
      const method: PaymentMethodKey =
        spec.type === "individual"
          ? random() > 0.25
            ? "card"
            : "check"
          : random() > 0.5
            ? "check"
            : "ach";
      specs.push({
        key: `${spec.key}-h${index}`,
        donor: spec.key,
        daysAgo,
        hour: 9 + Math.floor(random() * 10),
        amount,
        fund: spec.favoriteFund ?? "general",
        method,
        source: method === "check" ? "mail" : "online",
      });
    }
  }

  return specs;
}

const HISTORY_GIFTS = buildHistoryGiftSpecs();

interface DonationRecord {
  id: string;
  tenant_id: string;
  donor_id: string | null;
  missionary_id: string | null;
  fund_id: string | null;
  amount: number;
  currency: string;
  status: RawStatus;
  donation_type: string;
  payment_method: string;
  is_recurring: boolean;
  recurring_interval: string | null;
  notes: string | null;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  stripe_refund_ids: string[];
  gift_date: string;
  campaign_id: string | null;
  pledge_id: string | null;
  processed_at: string | null;
  completed_at: string | null;
  failed_at: string | null;
  error_code: string | null;
  error_message: string | null;
  refunded_at: string | null;
  refund_amount: number;
  source: string;
  created_at: string;
  updated_at: string;
  /** Fixture-only: part of the 60-gift Contributions Hub universe. */
  in_hub: boolean;
}

interface StagedGiftRecord {
  id: string;
  donation_id: string;
  status: StagedStatus;
  review_reason: string | null;
  receipt_status: ReceiptKey;
  receipt_send_log_id: string | null;
  crm_post_status: CrmKey | null;
  twenty_record_id: null;
  fund_id: string | null;
  missionary_id: string | null;
  created_at: string;
}

const KENYA_CAMPAIGN_ID = fixtureUuid("campaign:kenya-vision-dinner-2026");

function stagedStatusFor(spec: GiftSpec, status: RawStatus): StagedStatus {
  if (spec.staged) return spec.staged;
  if (status === "refunded") return "refunded";
  if (status === "failed") return "failed";
  if (status === "pending" || status === "processing") return "received";
  return "posted";
}

const DONATIONS: DonationRecord[] = [];
const STAGED_GIFTS: StagedGiftRecord[] = [];
const ALLOCATIONS: Array<{
  id: string;
  staged_gift_id: string;
  amount: number;
  fund_id: string | null;
  missionary_id: string | null;
  memo: string | null;
}> = [];
const CORRECTIONS: Array<{
  id: string;
  donation_id: string;
  correction_type: string;
  status: string;
  created_at: string;
}> = [];
const CORRECTION_REQUESTS: Array<{
  id: string;
  donation_id: string;
  action_type: ContributionActionType;
  status: string;
  reason: string;
  requested_by_profile_id: string;
  created_at: string;
  payload: Record<string, unknown>;
  receipt_delivery_proposal: {
    choice: "email" | "pdf" | "defer";
    deferReason: string | null;
  } | null;
}> = [];
const ADJUSTMENT_ROWS: Array<Record<string, unknown>> = [];
const AUDIT_EVENTS: Array<{
  id: string;
  donation_id: string;
  operation: string;
  source_surface: string;
  reason: string | null;
  created_at: string;
}> = [];
const CRM_LINKS: Array<{
  id: string;
  donation_id: string;
  scope: "parent";
  allocation_id: null;
  link_status: string;
  twenty_record_id: null;
  last_error: string | null;
}> = [];

function seedDonation(spec: GiftSpec, inHub: boolean) {
  const id = fixtureUuid(`donation:${spec.key}`);
  const status: RawStatus = spec.status ?? "completed";
  const giftDate = at(spec.daysAgo, spec.hour ?? 15, (spec.daysAgo * 13) % 60);
  const kind = spec.kind ?? "one_time";
  const hasProviderCharge = spec.method === "card" || spec.method === "ach";
  const settled = status === "completed" || status === "refunded";
  const refund = spec.refund ?? 0;
  const refundedAt =
    refund > 0
      ? at(spec.refundedDaysAgo ?? Math.max(1, spec.daysAgo - 2), 16)
      : null;
  const fundMissionary = FUNDS[spec.fund].missionary;
  const giftMissionary =
    spec.missionary === undefined ? fundMissionary : spec.missionary;

  DONATIONS.push({
    id,
    tenant_id: FIXTURE_TENANT_ID,
    donor_id: spec.donor ? donorId(spec.donor) : null,
    missionary_id: giftMissionary ? missionaryId(giftMissionary) : null,
    fund_id: fundId(spec.fund),
    amount: spec.amount,
    currency: "usd",
    status,
    donation_type: kind,
    payment_method: spec.method,
    is_recurring: kind === "recurring",
    recurring_interval: kind === "recurring" ? "month" : null,
    notes: spec.notes ?? null,
    stripe_payment_intent_id: hasProviderCharge
      ? fakeStripeId("pi", spec.key)
      : null,
    stripe_charge_id:
      hasProviderCharge && status !== "failed" && status !== "pending"
        ? fakeStripeId("ch", spec.key)
        : null,
    stripe_refund_ids:
      refund > 0 && hasProviderCharge ? [fakeStripeId("re", spec.key)] : [],
    gift_date: giftDate,
    campaign_id: spec.campaign ? KENYA_CAMPAIGN_ID : null,
    pledge_id: spec.pledge ? pledgeId(spec.pledge) : null,
    processed_at:
      status === "pending" ? null : at(spec.daysAgo, (spec.hour ?? 15) + 0, 5),
    completed_at: settled
      ? at(
          Math.max(0, spec.daysAgo - (spec.method === "ach" ? 3 : 0)),
          spec.hour ?? 15,
          9,
        )
      : null,
    failed_at:
      status === "failed" ? at(spec.daysAgo, spec.hour ?? 15, 1) : null,
    error_code: spec.errorCode ?? null,
    error_message: spec.errorMessage ?? null,
    refunded_at: refundedAt,
    refund_amount: refund,
    source: spec.source,
    created_at: giftDate,
    updated_at: refundedAt ?? at(Math.max(1, spec.daysAgo - 1), 6, 30),
    in_hub: inHub,
  });

  const receipt = spec.receipt === undefined ? "sent" : spec.receipt;
  if (receipt !== null) {
    const stagedId = fixtureUuid(`staged:${spec.key}`);
    STAGED_GIFTS.push({
      id: stagedId,
      donation_id: id,
      status: stagedStatusFor(spec, status),
      review_reason: spec.reviewReason ?? null,
      receipt_status: receipt,
      receipt_send_log_id:
        receipt === "sent" ? fixtureUuid(`receipt-log:${spec.key}`) : null,
      crm_post_status: spec.crm === undefined ? "posted" : spec.crm,
      twenty_record_id: null,
      fund_id: fundId(spec.fund),
      missionary_id: giftMissionary ? missionaryId(giftMissionary) : null,
      created_at: giftDate,
    });
    for (const [index, allocation] of (spec.allocations ?? []).entries()) {
      ALLOCATIONS.push({
        id: fixtureUuid(`allocation:${spec.key}:${index}`),
        staged_gift_id: stagedId,
        amount: allocation.amount,
        fund_id: fundId(allocation.fund),
        missionary_id: allocation.missionary
          ? missionaryId(allocation.missionary)
          : null,
        memo: allocation.memo ?? null,
      });
    }
    if (spec.crmLinkError) {
      CRM_LINKS.push({
        id: fixtureUuid(`crm-link:${spec.key}`),
        donation_id: id,
        scope: "parent",
        allocation_id: null,
        link_status: "failed",
        twenty_record_id: null,
        last_error: spec.crmLinkError,
      });
    }
  }

  for (const [index, correction] of (spec.corrections ?? []).entries()) {
    CORRECTIONS.push({
      id: fixtureUuid(`correction:${spec.key}:${index}`),
      donation_id: id,
      correction_type: correction.type,
      status: correction.status,
      created_at: at(correction.daysAgo, 11),
    });
  }
  for (const [index, request] of (spec.requests ?? []).entries()) {
    CORRECTION_REQUESTS.push({
      id: fixtureUuid(`correction-request:${spec.key}:${index}`),
      donation_id: id,
      action_type: request.action,
      status: request.status,
      reason: request.reason,
      requested_by_profile_id: STAFF[request.by].profileId,
      created_at: at(request.daysAgo, 10, 15),
      payload: request.payload ?? {},
      receipt_delivery_proposal: request.proposal
        ? { choice: request.proposal, deferReason: null }
        : null,
    });
  }
  for (const [index, adjustment] of (spec.adjustments ?? []).entries()) {
    const values: Record<string, unknown> = {};
    if (adjustment.values.amountCents !== undefined)
      values.amountCents = adjustment.values.amountCents;
    if (adjustment.values.fund !== undefined)
      values.fundId = fundId(adjustment.values.fund);
    if (adjustment.values.paymentStatus !== undefined)
      values.paymentStatus = adjustment.values.paymentStatus;
    ADJUSTMENT_ROWS.push({
      id: fixtureUuid(`adjustment:${spec.key}:${index}`),
      donation_id: id,
      adjustment_type: adjustment.type,
      status: adjustment.status,
      effective_values: values,
      reason: adjustment.reason,
      actor_profile_id: STAFF[adjustment.by].profileId,
      source_surface: "contribution_hub",
      created_at: at(adjustment.daysAgo, 11, 30),
    });
  }
  for (const [index, event] of (spec.audit ?? []).entries()) {
    AUDIT_EVENTS.push({
      id: fixtureUuid(`audit:${spec.key}:${index}`),
      donation_id: id,
      operation: event.action,
      source_surface: event.surface,
      reason: event.reason,
      created_at: at(event.daysAgo, 12, 45),
    });
  }
}

for (const spec of HUB_GIFTS) seedDonation(spec, true);
for (const spec of HISTORY_GIFTS) seedDonation(spec, false);

const DONATION_BY_KEY = new Map(
  [...HUB_GIFTS, ...HISTORY_GIFTS].map((spec) => [
    spec.key,
    fixtureUuid(`donation:${spec.key}`),
  ]),
);
export function fixtureDonationId(key: string): string {
  const id = DONATION_BY_KEY.get(key);
  if (!id) throw new Error(`Unknown fixture gift key: ${key}`);
  return id;
}
export function fixtureDonorId(key: string): string {
  if (!DONOR_SPEC_BY_KEY.has(key))
    throw new Error(`Unknown fixture donor key: ${key}`);
  return donorId(key);
}

const STAGED_BY_DONATION_ID = new Map(
  STAGED_GIFTS.map((gift) => [gift.donation_id, gift]),
);

// Shared derivations, assembled exactly like `loadSharedContributionRowInputs`.
const SHARED_EFFECTIVE_STATE = assembleSharedContributionEffectiveState({
  donations: DONATIONS,
  corrections: CORRECTIONS,
  correctionRequests: CORRECTION_REQUESTS.filter(
    (request) => request.status === "pending",
  ),
  adjustments: ADJUSTMENT_ROWS,
});
const ALLOCATIONS_BY_STAGED_GIFT_ID = new Map<
  string,
  Array<{
    id: string;
    amount: number;
    fund_id: string | null;
    missionary_id: string | null;
    memo: string | null;
  }>
>();
for (const allocation of ALLOCATIONS) {
  const existing =
    ALLOCATIONS_BY_STAGED_GIFT_ID.get(allocation.staged_gift_id) ?? [];
  existing.push({
    id: allocation.id,
    amount: allocation.amount,
    fund_id: allocation.fund_id,
    missionary_id: allocation.missionary_id,
    memo: allocation.memo,
  });
  ALLOCATIONS_BY_STAGED_GIFT_ID.set(allocation.staged_gift_id, existing);
}
const DESIGNATION_SETS = buildSharedContributionDesignationSets({
  donations: DONATIONS,
  stagedGifts: STAGED_GIFTS,
  allocationsByStagedGiftId: ALLOCATIONS_BY_STAGED_GIFT_ID,
  effectiveByDonationId: SHARED_EFFECTIVE_STATE.effectiveByDonationId,
  funds: FUND_MAP,
  missionaries: MISSIONARY_NAME_BY_ID,
});

// Donor aggregates (`donors.total_given` is BIGINT cents; `last_gift_date`).
for (const [index, donor] of DONORS.entries()) {
  const spec = DONOR_SPECS[index]!;
  const settled = DONATIONS.filter(
    (donation) =>
      donation.donor_id === donor.id &&
      (donation.status === "completed" || donation.status === "refunded"),
  );
  const net = settled.reduce(
    (sum, donation) =>
      sum + Math.max(0, donation.amount - donation.refund_amount),
    0,
  );
  donor.total_given = (spec.baselineCents ?? 0) + net;
  const latest = settled
    .filter((donation) => donation.status === "completed")
    .map((donation) => donation.gift_date)
    .sort()
    .at(-1);
  donor.last_gift_date =
    latest ?? (spec.baselineCents ? at(spec.updatedDaysAgo + 20, 12) : null);
}

// ---------------------------------------------------------------------------
// Contributions Hub rows (GET /api/admin/contributions)
// ---------------------------------------------------------------------------

function profileForDonor(donor: DonorRecord | null) {
  if (!donor?.profile_id) return null;
  const [first, ...rest] = donor.name.split(" ");
  return {
    display_name: donor.type === "individual" ? donor.name : null,
    first_name: donor.type === "individual" ? (first ?? null) : null,
    last_name: donor.type === "individual" ? rest.join(" ") || null : null,
    email: donor.email,
    avatar_url: null,
  };
}

function buildHubRow(donation: DonationRecord): ContributionGridRow {
  const effectiveDonation = applyEffectiveContributionToDonation(
    donation,
    SHARED_EFFECTIVE_STATE.effectiveByDonationId,
  );
  const donor = donation.donor_id
    ? (DONOR_BY_ID.get(donation.donor_id) ?? null)
    : null;
  const staged = STAGED_BY_DONATION_ID.get(donation.id) ?? null;
  return buildContributionGridRow({
    donation: effectiveDonation,
    refundBasis: { originalAmountCents: donation.amount },
    donor: donor
      ? {
          id: donor.id,
          name: donor.name,
          email: donor.email,
          phone: donor.phone,
          type: donor.type,
          location: donor.location,
          organization: donor.organization,
          notes: donor.notes,
        }
      : null,
    profile: profileForDonor(donor),
    fund: effectiveDonation.fund_id
      ? {
          id: effectiveDonation.fund_id,
          name: FUND_NAME_BY_ID.get(effectiveDonation.fund_id) ?? null,
        }
      : null,
    missionary: effectiveDonation.missionary_id
      ? {
          id: effectiveDonation.missionary_id,
          display_name:
            MISSIONARY_NAME_BY_ID.get(effectiveDonation.missionary_id) ?? null,
        }
      : null,
    stagedGift: staged
      ? {
          id: staged.id,
          status: staged.status,
          review_reason: staged.review_reason,
          receipt_status: staged.receipt_status,
          receipt_send_log_id: staged.receipt_send_log_id,
          crm_post_status: staged.crm_post_status,
        }
      : null,
    corrections: SHARED_EFFECTIVE_STATE.correctionsByDonationId.get(
      donation.id,
    ),
    designationSet: DESIGNATION_SETS.get(donation.id),
  });
}

function compareHubDefault(
  left: ContributionGridRow,
  right: ContributionGridRow,
) {
  // Server default: gift_date desc, then id desc.
  const byDate = right.date.localeCompare(left.date);
  return byDate !== 0 ? byDate : right.id.localeCompare(left.id);
}

const HUB_ROWS: ContributionGridRow[] = DONATIONS.filter(
  (donation) => donation.in_hub,
)
  .map(buildHubRow)
  .sort(compareHubDefault);

// ---------------------------------------------------------------------------
// Contribution detail (GET /api/admin/contribution-operations/:id)
// ---------------------------------------------------------------------------

function buildContributionDetailBody(
  donation: DonationRecord,
): ViewerProjectedContributionDetail {
  const donor = donation.donor_id
    ? (DONOR_BY_ID.get(donation.donor_id) ?? null)
    : null;
  const staged = STAGED_BY_DONATION_ID.get(donation.id) ?? null;
  const adjustments = ADJUSTMENT_ROWS.filter(
    (row) => row.donation_id === donation.id,
  ).map(mapContributionAdjustmentRow);
  const effective = SHARED_EFFECTIVE_STATE.effectiveByDonationId.get(
    donation.id,
  )?.effective;
  const pledge = donation.pledge_id
    ? (PLEDGE_BY_ID.get(donation.pledge_id) ?? null)
    : null;
  const pledgeGifts = pledge
    ? DONATIONS.filter((candidate) => candidate.pledge_id === pledge.id)
        .map((candidate) => candidate.gift_date)
        .sort()
    : [];
  const effectiveMissionaryId =
    effective?.missionaryId ?? donation.missionary_id;

  const detail = buildContributionDetail({
    donation: {
      id: donation.id,
      tenantId: donation.tenant_id,
      donorId: donation.donor_id,
      missionaryId: donation.missionary_id,
      fundId: donation.fund_id,
      amount: donation.amount,
      currency: donation.currency,
      status: donation.status,
      donationType: donation.donation_type,
      paymentMethod: donation.payment_method,
      isRecurring: donation.is_recurring,
      recurringInterval: donation.recurring_interval,
      notes: donation.notes,
      stripePaymentIntentId: donation.stripe_payment_intent_id,
      stripeChargeId: donation.stripe_charge_id,
      stripeRefundIds: donation.stripe_refund_ids,
      giftDate: donation.gift_date,
      campaignId: donation.campaign_id,
      pledgeId: donation.pledge_id,
      processedAt: donation.processed_at,
      completedAt: donation.completed_at,
      failedAt: donation.failed_at,
      errorCode: donation.error_code,
      errorMessage: donation.error_message,
      refundedAt: donation.refunded_at,
      refundAmount: donation.refund_amount,
      source: donation.source,
      createdAt: donation.created_at,
      updatedAt: donation.updated_at,
    },
    donor: donor
      ? {
          id: donor.id,
          profileId: donor.profile_id,
          name: donor.name,
          email: donor.email,
          phone: donor.phone,
          mobile: donor.mobile,
          location: donor.location,
          organization: donor.organization,
        }
      : null,
    fund: donation.fund_id
      ? {
          id: donation.fund_id,
          name: FUND_NAME_BY_ID.get(donation.fund_id) ?? null,
        }
      : null,
    missionary: effectiveMissionaryId
      ? {
          id: effectiveMissionaryId,
          name: MISSIONARY_NAME_BY_ID.get(effectiveMissionaryId) ?? null,
        }
      : null,
    stagedGift: staged
      ? {
          id: staged.id,
          status: staged.status,
          receiptStatus: staged.receipt_status,
          crmPostStatus: staged.crm_post_status,
          reviewReason: staged.review_reason,
          twentyRecordId: null,
        }
      : null,
    auditEvents: AUDIT_EVENTS.filter(
      (event) => event.donation_id === donation.id,
    )
      .sort((left, right) => right.created_at.localeCompare(left.created_at))
      .map((event) => ({
        id: event.id,
        actionType: event.operation,
        sourceSurface: event.source_surface,
        reason: event.reason,
        createdAt: event.created_at,
      })),
    corrections: CORRECTIONS.filter(
      (correction) => correction.donation_id === donation.id,
    ).map((correction) => ({
      id: correction.id,
      correctionType: correction.correction_type,
      status: correction.status,
    })),
    correctionRequests: CORRECTION_REQUESTS.filter(
      (request) => request.donation_id === donation.id,
    )
      .sort((left, right) => right.created_at.localeCompare(left.created_at))
      .map((request) => ({
        id: request.id,
        actionType: request.action_type,
        status: request.status,
        reason: request.reason,
        requestedByProfileId: request.requested_by_profile_id,
        requestedByName:
          STAFF_NAME_BY_PROFILE_ID.get(request.requested_by_profile_id) ?? null,
        createdAt: request.created_at,
        receiptDeliveryProposal: request.receipt_delivery_proposal,
        // The same describer the detail loader uses, over the request's own
        // payload and the gift's current effective values.
        proposedChange: describeCorrectionRequestChange({
          actionType: request.action_type,
          payload: request.payload,
          current: {
            amountCents: effective?.amountCents ?? donation.amount,
            currencyCode: donation.currency.toUpperCase(),
            fundId: effective?.fundId ?? donation.fund_id,
            fundName:
              FUND_NAME_BY_ID.get(
                effective?.fundId ?? donation.fund_id ?? "",
              ) ?? null,
            missionaryId: effectiveMissionaryId,
            missionaryName: effectiveMissionaryId
              ? (MISSIONARY_NAME_BY_ID.get(effectiveMissionaryId) ?? null)
              : null,
            paymentStatus: effective?.paymentStatus ?? donation.status,
            designationLineCount: staged
              ? (ALLOCATIONS_BY_STAGED_GIFT_ID.get(staged.id) ?? []).length || 1
              : 1,
            donorId: donation.donor_id,
            donorName: donor?.name ?? null,
          },
          names: {
            funds: new Map<string, string>(FUND_NAME_BY_ID),
            missionaries: new Map(
              [...MISSIONARY_NAME_BY_ID].filter(
                (entry): entry is [string, string] => Boolean(entry[1]),
              ),
            ),
            donors: new Map(
              DONORS.map((row) => [row.id, row.name] as [string, string]),
            ),
          },
        }),
        receiptAffectedFields:
          request.action_type === "amount_correction" ||
          request.action_type === "refund"
            ? ["amount"]
            : request.action_type === "fund_correction" ||
                request.action_type === "designation_correction"
              ? ["designation"]
              : [],
      })),
    adjustments,
    allocations: staged
      ? (ALLOCATIONS_BY_STAGED_GIFT_ID.get(staged.id) ?? [])
      : [],
    allocationFunds: FUND_ROWS,
    allocationMissionaries: MISSIONARY_ROWS,
    crmLinks: CRM_LINKS.filter((link) => link.donation_id === donation.id).map(
      (link) => ({
        id: link.id,
        scope: link.scope,
        allocationId: link.allocation_id,
        linkStatus: link.link_status,
        twentyRecordId: link.twenty_record_id,
        lastError: link.last_error,
      }),
    ),
    recurringAgreement: pledge
      ? {
          id: pledge.id,
          status: pledge.status,
          frequency: pledge.frequency,
          amountCents: pledge.amount,
          currencyCode: pledge.currency.toUpperCase(),
          fundId: pledge.fund_id,
          fundName: FUND_NAME_BY_ID.get(pledge.fund_id) ?? null,
          missionaryId: pledge.missionary_id,
          missionaryName: pledge.missionary_id
            ? (MISSIONARY_NAME_BY_ID.get(pledge.missionary_id) ?? null)
            : null,
          nextExpectedGiftAt: pledge.next_payment_date,
          stripeSubscriptionId: pledge.stripe_subscription_id,
          linkedGiftCount: pledgeGifts.length,
          lastLinkedGiftAt: pledgeGifts.at(-1) ?? null,
        }
      : null,
  });

  const projected = projectContributionDetailForViewer(
    detail,
    FIXTURE_VIEWER_CAPABILITIES,
    {
      approvalPolicy: APPROVAL_POLICY,
      providerDashboardTestMode: true,
    },
  );
  const correctionRequests =
    projected.correctionRequests.length > 0
      ? projectCorrectionRequestsForViewer(detail.correctionRequests, {
          policy: APPROVAL_POLICY,
          viewerProfileId: FIXTURE_VIEWER_PROFILE_ID,
          viewerCapabilities: FIXTURE_VIEWER_CAPABILITIES,
        })
      : [];
  const receiptDelivery =
    detail.shared.receiptStatus === "sent"
      ? buildContributionReceiptDeliveryView({
          policy: RECEIPT_POLICY,
          donor: {
            email: donor?.email ?? null,
            doNotEmail: donor?.do_not_email ?? false,
          },
          viewerCapabilities: FIXTURE_VIEWER_CAPABILITIES,
        })
      : null;

  return {
    ...projected,
    correctionRequests,
    receiptDelivery,
  } satisfies ViewerProjectedContributionDetail;
}

// ---------------------------------------------------------------------------
// CRM grid + detail (GET /api/admin/crm/records[/id])
// ---------------------------------------------------------------------------

function missionaryNameForDonor(donor: DonorRecord): string | null {
  if (!donor.missionary_id) return null;
  const key = (Object.keys(MISSIONARIES) as MissionaryKey[]).find(
    (candidate) => missionaryProfileId(candidate) === donor.missionary_id,
  );
  return key ? MISSIONARIES[key].displayName : null;
}

function compareCrmDefault(left: CrmGridRow, right: CrmGridRow) {
  // Server default: updated_at desc, then id desc.
  const byUpdated = right.updatedAt.localeCompare(left.updatedAt);
  return byUpdated !== 0 ? byUpdated : right.id.localeCompare(left.id);
}

const CRM_ROWS: CrmGridRow[] = DONORS.map((donor) =>
  buildCrmGridRow(
    {
      id: donor.id,
      profile_id: donor.profile_id,
      missionary_id: donor.missionary_id,
      name: donor.name,
      email: donor.email,
      phone: donor.phone,
      avatar_url: donor.avatar_url,
      location: donor.location,
      type: donor.type,
      status: donor.status,
      total_given: donor.total_given,
      last_gift_date: donor.last_gift_date,
      tags: donor.tags,
      organization: donor.organization,
      title: donor.title,
      notes: donor.notes,
      created_at: donor.created_at,
      updated_at: donor.updated_at,
    },
    missionaryNameForDonor(donor),
  ),
).sort(compareCrmDefault);

const ACTIVITY_TEMPLATES = [
  {
    type: "call",
    title: "Phone call",
    description:
      "Thanked them for their recent gift and shared the Kenya build update.",
  },
  {
    type: "email",
    title: "Email: quarterly impact report opened",
    description: null,
  },
  {
    type: "meeting",
    title: "Coffee with the development director",
    description:
      "Discussed a year-end gift and interest in visiting the Nairobi site.",
  },
  {
    type: "mail",
    title: "Handwritten thank-you card mailed",
    description: null,
  },
  {
    type: "event",
    title: "Attended the Kenya vision dinner",
    description: "Sat at the Okafor table; asked about matching opportunities.",
  },
  { type: "email", title: "Email: Giving Tuesday preview", description: null },
] as const;

const DUPLICATE_CANDIDATES: Record<
  string,
  { candidate: string; score: number; confidence: string; reasons: string[] }
> = {
  danielm: {
    candidate: "danm",
    score: 0.92,
    confidence: "high",
    reasons: ["Same phone number", "Similar name (Daniel / Dan)", "Same city"],
  },
  danm: {
    candidate: "danielm",
    score: 0.92,
    confidence: "high",
    reasons: ["Same phone number", "Similar name (Dan / Daniel)", "Same city"],
  },
};

function previewDonorNotes(notes: string | null): string | null {
  if (!notes?.trim()) return null;
  const trimmed = notes.trim().replace(/\s+/g, " ");
  return trimmed.length <= 160 ? trimmed : `${trimmed.slice(0, 157)}...`;
}

function buildCrmDetailBody(
  donor: DonorRecord,
  index: number,
): CrmDonorDetailResponse {
  const spec = DONOR_SPECS[index]!;
  const donationRows = DONATIONS.filter(
    (donation) => donation.donor_id === donor.id,
  ).sort((left, right) => right.created_at.localeCompare(left.created_at));
  const giftHistoryTruncated = donationRows.length > 100;
  const donations = donationRows.slice(0, 100);

  const giftHistory: CrmGiftHistoryRow[] = donations.map((donation) => {
    const staged = STAGED_BY_DONATION_ID.get(donation.id) ?? null;
    const effective = SHARED_EFFECTIVE_STATE.effectiveByDonationId.get(
      donation.id,
    )?.effective ?? {
      amountCents: donation.amount,
      fundId: donation.fund_id,
      missionaryId: donation.missionary_id,
      paymentStatus: donation.status,
    };
    return buildCrmGiftHistoryRow({
      designationSet: DESIGNATION_SETS.get(donation.id),
      donation: {
        id: donation.id,
        donor_id: donation.donor_id,
        missionary_id: effective.missionaryId,
        fund_id: effective.fundId,
        amount: effective.amountCents,
        currency: donation.currency,
        status: effective.paymentStatus,
        gift_date: donation.gift_date,
        refund_amount: donation.refund_amount,
        refunded_at: donation.refunded_at,
        created_at: donation.created_at,
        updated_at: donation.updated_at,
        is_recurring: donation.is_recurring,
        recurring_interval: donation.recurring_interval,
        pledge_id: donation.pledge_id,
      },
      donor: { id: donor.id, name: donor.name, email: donor.email },
      fund: effective.fundId
        ? {
            id: effective.fundId,
            name: FUND_NAME_BY_ID.get(effective.fundId) ?? null,
          }
        : null,
      missionary: effective.missionaryId
        ? {
            id: effective.missionaryId,
            display_name:
              MISSIONARY_NAME_BY_ID.get(effective.missionaryId) ?? null,
          }
        : null,
      stagedGift: staged
        ? {
            id: staged.id,
            status: staged.status,
            receipt_status: staged.receipt_status,
            crm_post_status: staged.crm_post_status,
            twenty_record_id: null,
          }
        : null,
      corrections: SHARED_EFFECTIVE_STATE.correctionsByDonationId.get(
        donation.id,
      ),
      provider: {
        stripePaymentIntentId: donation.stripe_payment_intent_id,
        stripeChargeId: donation.stripe_charge_id,
      },
      refundBasis: { originalAmountCents: donation.amount },
      viewerCapabilities: FIXTURE_VIEWER_CAPABILITIES,
      approvalPolicy: APPROVAL_POLICY,
    });
  });

  const activityCount = spec.status === "prospect" ? 1 : 1 + (index % 3);
  const activities: Array<{
    id: string;
    type: string;
    title: string;
    description: string | null;
    amount: number | null;
    date: string;
  }> = Array.from({ length: activityCount }, (_, activityIndex) => {
    const template =
      ACTIVITY_TEMPLATES[
        (index + activityIndex * 2) % ACTIVITY_TEMPLATES.length
      ]!;
    const daysAgo = 3 + ((index * 11 + activityIndex * 23) % 110);
    return {
      id: fixtureUuid(`donor-activity:${spec.key}:${activityIndex}`),
      type: template.type,
      title: template.title,
      description: template.description,
      amount: spec.key === "margaret" && activityIndex === 0 ? 500000 : null,
      date: at(daysAgo, 17),
    };
  });
  if (spec.key === "margaret") {
    activities[0] = {
      ...activities[0]!,
      title: "Pledged $5,000 at the Kenya vision dinner",
      description: "Will give by check before Dec 31.",
      type: "event",
    };
  }

  // Mirrors the timeline in packages/api/src/admin/crm/detail/service.ts:
  // a gift entry carries its payment state and a status-aware title (only a
  // settled gift reads as received).
  const giftTimelineTitle = (
    paymentStatus: string,
    refundState: string,
  ): string => {
    switch (paymentStatus) {
      case "completed":
        return refundState === "partial_refund"
          ? "Gift received, partly refunded"
          : "Gift received";
      case "refunded":
        return "Gift refunded";
      case "failed":
        return "Gift failed";
      default:
        return "Gift pending";
    }
  };
  const timeline: CrmTimelineEntry[] = [
    ...giftHistory.map((gift) => {
      const paymentStatus =
        gift.shared.refundState === "refunded"
          ? ("refunded" as const)
          : gift.shared.paymentStatus;
      return {
        amountCents: gift.amountCents,
        currencyCode: gift.currencyCode,
        description: gift.fundName,
        id: `gift:${gift.id}`,
        kind: "gift" as const,
        occurredAt: gift.giftDate || new Date(0).toISOString(),
        paymentStatus,
        source: "platform" as const,
        title: giftTimelineTitle(paymentStatus, gift.shared.refundState),
        visibility: "standard" as const,
      };
    }),
    ...activities.map((activity) => ({
      amountCents: activity.amount || null,
      currencyCode: null,
      paymentStatus: null,
      description: activity.description,
      id: `activity:${activity.id}`,
      kind: "activity" as const,
      occurredAt: activity.date,
      source: "platform" as const,
      title: activity.title ?? activity.type ?? "Donor activity",
      visibility: "standard" as const,
    })),
  ].sort(
    (left, right) =>
      new Date(right.occurredAt).getTime() -
      new Date(left.occurredAt).getTime(),
  );

  // Mirrors the private `buildSupportSummary` in packages/api/src/admin/crm/detail/service.ts
  // (Date.now() replaced by REFERENCE_DATE for determinism).
  const byFund = new Map<string, { label: string; amountCents: number }>();
  const byMissionary = new Map<
    string,
    { label: string; amountCents: number }
  >();
  for (const donation of donations) {
    if (donation.status && donation.status !== "completed") continue;
    const fundKey = donation.fund_id ?? "unassigned";
    const fund = byFund.get(fundKey) ?? {
      amountCents: 0,
      label: donation.fund_id
        ? (FUND_NAME_BY_ID.get(donation.fund_id) ?? "Unassigned fund")
        : "Unassigned fund",
    };
    fund.amountCents += donation.amount;
    byFund.set(fundKey, fund);
    const missionaryKey = donation.missionary_id ?? "unassigned";
    const missionary = byMissionary.get(missionaryKey) ?? {
      amountCents: 0,
      label: donation.missionary_id
        ? (MISSIONARY_NAME_BY_ID.get(donation.missionary_id) ??
          "Unassigned missionary")
        : "Unassigned missionary",
    };
    missionary.amountCents += donation.amount;
    byMissionary.set(missionaryKey, missionary);
  }
  const donorPledges = PLEDGES.filter((pledge) => pledge.donor_id === donor.id);

  const detail = {
    donor: {
      avatarUrl: donor.avatar_url,
      createdAt: donor.created_at,
      email: donor.email,
      id: donor.id,
      location: donor.location,
      missionaryId: donor.missionary_id,
      name: donor.name,
      notesPreview: previewDonorNotes(donor.notes),
      organization: donor.organization,
      phone: donor.phone,
      profileId: donor.profile_id,
      status: donor.status,
      tags: donor.tags,
      title: donor.title,
      type: donor.type,
      updatedAt: donor.updated_at,
    },
    duplicateWarnings: DUPLICATE_CANDIDATES[spec.key]
      ? [
          {
            id: fixtureUuid(`merge-candidate:${spec.key}`),
            candidateId: donorId(DUPLICATE_CANDIDATES[spec.key]!.candidate),
            candidateLabel: donorId(DUPLICATE_CANDIDATES[spec.key]!.candidate),
            confidence: DUPLICATE_CANDIDATES[spec.key]!.confidence,
            score: DUPLICATE_CANDIDATES[spec.key]!.score,
            reason: DUPLICATE_CANDIDATES[spec.key]!.reasons.join(", "),
          },
        ]
      : [],
    giftHistory,
    giftHistoryTruncated,
    privacy: {
      missionaryContactDataExposed: false,
      restrictedNotesVisible: true,
      roleGate: "admin",
    },
    reconciliation: { crmWriteMode: "enabled", platformPaymentTruth: true },
    support: {
      activeRecurringCommitments: donorPledges.filter(
        (pledge) => pledge.status === "active",
      ).length,
      atRiskCommitments: donorPledges.filter(
        (pledge) =>
          pledge.status === "active" &&
          pledge.next_payment_date != null &&
          Date.parse(pledge.next_payment_date) < REF_MS,
      ).length,
      byFund: Array.from(byFund.entries()).map(([key, row]) => ({
        amountCents: row.amountCents,
        fundId: key === "unassigned" ? null : key,
        fundName: row.label,
      })),
      byMissionary: Array.from(byMissionary.entries()).map(([key, row]) => ({
        amountCents: row.amountCents,
        missionaryId: key === "unassigned" ? null : key,
        missionaryName: row.label,
      })),
      lapsedCommitments: donorPledges.filter(
        (pledge) => pledge.status === "lapsed" || pledge.status === "cancelled",
      ).length,
      lastGiftAt: donor.last_gift_date,
      lifetimeGivingCents: donor.total_given,
    },
    timeline,
  } satisfies CrmDonorDetailResponse;

  return detail;
}

// ---------------------------------------------------------------------------
// CRM table preferences + named views (gift history)
// ---------------------------------------------------------------------------

export const FIXTURE_NAMED_VIEW_ID = fixtureUuid(
  "named-view:receipt-follow-up",
);

const NAMED_VIEWS: CrmNamedView[] = [
  {
    id: FIXTURE_NAMED_VIEW_ID,
    name: "Receipt follow-up",
    isDefault: false,
    schemaVersion: CRM_ROW_ACTION_SCHEMA_VERSION,
    pinnedActionId: "resend_receipt",
    settings: {
      columns: { designation: true, statusLine: true },
      filtersSort: {
        sortField: "giftDate",
        sortDirection: "desc",
        paymentStatus: "all",
        issue: "receipt_affected",
      },
    },
  },
];

function buildTablePreferences(): CrmTablePreferencesResponse {
  return {
    tableId: CRM_GIFT_HISTORY_TABLE_ID,
    schemaVersion: CRM_ROW_ACTION_SCHEMA_VERSION,
    user: {
      actionId: "resend_receipt",
      schemaVersion: CRM_ROW_ACTION_SCHEMA_VERSION,
      settings: { columns: { designation: true, statusLine: true } },
    },
    tenantDefault: {
      actionId: null,
      schemaVersion: CRM_ROW_ACTION_SCHEMA_VERSION,
      settings: {
        filtersSort: {
          sortField: "giftDate",
          sortDirection: "desc",
          paymentStatus: "all",
          issue: "all",
        },
        delegatedManagerProfileIds: [FIXTURE_VIEWER_PROFILE_ID],
      },
    },
    canManageTenantDefaults: true,
  } satisfies CrmTablePreferencesResponse;
}

// ---------------------------------------------------------------------------
// CRM notes (GET/POST /api/admin/crm/notes)
// ---------------------------------------------------------------------------

const NOTE_SPECS: Array<{
  title: string;
  body: string;
  author: StaffKey | "system";
  donor?: string;
  linkedType?: "donor_profile" | "missionary_profile" | "organization";
  missionary?: MissionaryKey;
  restricted?: boolean;
  createdDaysAgo: number;
  updatedDaysAgo?: number;
}> = [
  {
    title: "Year-end call plan",
    body: "Margaret asked for a call the week of Dec 8 to finalize her $5,000 pledge from the vision dinner. She wants an update on the Kibera borehole before deciding on a stock gift.",
    author: "joel",
    donor: "margaret",
    createdDaysAgo: 2,
    updatedDaysAgo: 1,
  },
  {
    title: "Receipt bounce — personal email needed",
    body: "Priscilla's receipts go to her hospital address, which rejects bulk mail. Left a voicemail asking for a personal email; resend the September receipt once we have it.",
    author: "alicia",
    donor: "priscilla",
    createdDaysAgo: 10,
  },
  {
    title: "Duplicate record review",
    body: "Dan Mbeki (reply card) and Daniel Mbeki (online) share a phone number and city. Confirm with the donor before merging so gift history and tax receipts stay on one record.",
    author: "priyad",
    donor: "danielm",
    createdDaysAgo: 30,
    updatedDaysAgo: 5,
  },
  {
    title: "Grant report due",
    body: "Brightwater Family Foundation needs the interim report 60 days after each disbursement. First disbursement landed Oct 20; report due Dec 19. Elena Marsh is the program officer.",
    author: "owen",
    donor: "brightwater",
    linkedType: "organization",
    createdDaysAgo: 11,
  },
  {
    title: "Pastoral context (restricted)",
    body: "Family is navigating a serious illness. Pause appeal mail through January; thank-you calls only. Do not reference in group emails.",
    author: "hannahl",
    donor: "deborah",
    restricted: true,
    createdDaysAgo: 40,
    updatedDaysAgo: 12,
  },
  {
    title: "Monthly gift increase",
    body: "Theo mentioned he may increase to $40/month in January when his stipend changes. Send the new-year partner letter with the updated pledge link.",
    author: "joel",
    donor: "theo",
    createdDaysAgo: 6,
  },
  {
    title: "Matching gift paperwork",
    body: "Kim & Associates matches 1:1 up to $10,000. Grace submitted the employer form; follow up with their HR portal on Nov 15.",
    author: "alicia",
    donor: "gracekim",
    createdDaysAgo: 19,
  },
  {
    title: "Field update request",
    body: "Daniel & Grace asked that church partners receive the classroom photos before Thanksgiving. Coordinate with Grace Fellowship's missions pastor.",
    author: "priyad",
    missionary: "okafor",
    linkedType: "missionary_profile",
    createdDaysAgo: 8,
  },
  {
    title: "ACH verification",
    body: "Benjamin's first ACH is from a new account at a credit union. Verified by phone with Claire Foster; okay to approve once funds settle.",
    author: "owen",
    donor: "benjamin",
    createdDaysAgo: 8,
    updatedDaysAgo: 7,
  },
  {
    title: "Refund follow-up",
    body: "Thomas confirmed the refund posted to his card. He asked us to pause appeals until spring; flagged as do-not-email for receipts.",
    author: "alicia",
    donor: "thomas",
    createdDaysAgo: 54,
  },
  {
    title: "Laptop donation valuation",
    body: "Lumen provided a valuation letter for 12 refurbished laptops ($1,800). In-kind receipt should state no goods or services were provided and omit a dollar value per IRS guidance.",
    author: "hannahl",
    donor: "lumen",
    linkedType: "organization",
    createdDaysAgo: 29,
  },
  {
    title: "Church partnership renewal",
    body: "St. Andrew's missions committee renews support in January. They prefer a printed packet with the Okafor family prayer card.",
    author: "joel",
    donor: "standrews",
    linkedType: "organization",
    createdDaysAgo: 37,
  },
  {
    title: "Board prospect intro",
    body: "Yolanda Pierce was introduced by Margaret. Strong nonprofit governance background; schedule a lunch with the board chair.",
    author: "owen",
    donor: "yolanda",
    createdDaysAgo: 44,
    updatedDaysAgo: 20,
  },
  {
    title: "Recurring card expired",
    body: "Kenji's subscription failed in September with an expired card. Stripe sent an update link; no internal agreement exists, so set one up on the next call.",
    author: "priyad",
    donor: "kenji",
    createdDaysAgo: 60,
    updatedDaysAgo: 3,
  },
  {
    title: "Allocation mismatch",
    body: "New Hope's cover letter lists $2,400 but allocation lines total $2,000. Called their treasurer — the missing $400 is for youth mentorship. Correction request pending.",
    author: "alicia",
    donor: "newhope",
    linkedType: "organization",
    createdDaysAgo: 24,
  },
  {
    title: "Gala table host",
    body: "Naomi hosted a table at the vision dinner and brought six first-time guests. Send her the guest follow-up list.",
    author: "hannahl",
    donor: "naomi",
    createdDaysAgo: 17,
  },
  {
    title: "Prayer team schedule",
    body: "Ruth volunteered to coordinate the Thursday prayer call for the Zhang ministry through December.",
    author: "joel",
    donor: "ruth",
    createdDaysAgo: 13,
  },
  {
    title: "Stock gift inquiry",
    body: "Benjamin asked about donating appreciated shares before Dec 31. Sent the brokerage transfer instructions and DTC number.",
    author: "owen",
    donor: "benjamin",
    createdDaysAgo: 4,
  },
  {
    title: "Spanish-language receipts",
    body: "Iglesia Vida Nueva asked for receipts and impact updates in Spanish. Confirm the template is available before the January batch.",
    author: "priyad",
    donor: "vidanueva",
    linkedType: "organization",
    createdDaysAgo: 50,
  },
  {
    title: "Corporate match proposal",
    body: "Sent Meridian Logistics a proposal for a 50% employee giving match. Decision expected after their Q4 budget meeting.",
    author: "owen",
    donor: "meridian",
    linkedType: "organization",
    createdDaysAgo: 18,
  },
  {
    title: "Site visit interest",
    body: "Caleb is interested in joining the March trip to Nairobi. Send the trip packet and the school build budget.",
    author: "hannahl",
    donor: "caleb",
    createdDaysAgo: 19,
  },
  {
    title: "Member care referral (restricted)",
    body: "Missionary requested confidential counseling support after a security incident. Coordinate with member care only.",
    author: "hannahl",
    missionary: "rivera",
    linkedType: "missionary_profile",
    restricted: true,
    createdDaysAgo: 22,
  },
  {
    title: "Weekly finance sync",
    body: "Open items: 2 failed receipts, 2 CRM posting failures, 1 refund request awaiting approval, 1 amount correction awaiting approval.",
    author: "system",
    createdDaysAgo: 1,
  },
  {
    title: "Bank reversal request",
    body: "Northfield Community Bank flagged the Oct 5 transfer as a duplicate of their sponsorship payment. Refund request submitted for approval.",
    author: "alicia",
    donor: "northfield",
    linkedType: "organization",
    createdDaysAgo: 4,
  },
  {
    title: "Thank-you call completed",
    body: "Called Chloe to thank her for her first gift. She heard about us through the campus ministry fair.",
    author: "joel",
    donor: "chloe",
    createdDaysAgo: 2,
  },
];

const NOTE_ROWS: CrmNoteRow[] = NOTE_SPECS.map((spec, index) => {
  const donor = spec.donor
    ? DONORS[DONOR_SPECS.findIndex((candidate) => candidate.key === spec.donor)]
    : undefined;
  const linkedType =
    spec.linkedType ??
    (donor ? "donor_profile" : spec.missionary ? "missionary_profile" : null);
  const linkedId = donor
    ? donor.id
    : spec.missionary
      ? missionaryProfileId(spec.missionary)
      : null;
  const linkedLabel = donor
    ? donor.name
    : spec.missionary
      ? MISSIONARIES[spec.missionary].displayName
      : null;
  const row = mapCrmNoteRow({
    id: fixtureUuid(`crm-note:${index}`),
    tenant_id: FIXTURE_TENANT_ID,
    title: spec.title,
    body: spec.body,
    author_name:
      spec.author === "system" ? "Mission Control" : STAFF[spec.author].name,
    linked_record_id: linkedId,
    linked_record_label: linkedLabel,
    linked_record_type: linkedType,
    visibility: spec.restricted ? "restricted" : "standard",
    created_at: at(spec.createdDaysAgo, 15, (index * 9) % 60),
    updated_at: at(
      spec.updatedDaysAgo ?? spec.createdDaysAgo,
      15,
      (index * 9) % 60,
    ),
  });
  if (!row) throw new Error(`note ${index} failed to map`);
  return row;
}).sort((left, right) => {
  const byUpdated =
    new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  return byUpdated !== 0 ? byUpdated : left.id.localeCompare(right.id);
});

const NOTES_ROLLBACK = { existingCrmPath: "/crm" } as const;

// ---------------------------------------------------------------------------
// CRM relationships (GET /api/admin/crm/relationships)
// ---------------------------------------------------------------------------

const MEMBER_CARE_ACTIVITY_SPECS = [
  {
    type: "site_visit",
    title: "Site visit: Kibera borehole",
    description:
      "Board members toured the completed borehole with the Okafors.",
    daysAgo: 9,
  },
  {
    type: "newsletter_sent",
    title: "October partner newsletter",
    description: "Sent to 1,240 partners; 46% open rate.",
    daysAgo: 14,
  },
  {
    type: "prayer_update",
    title: "Prayer update: Zhang ministry",
    description: "Requests for the new English club in Taichung.",
    daysAgo: 6,
  },
  {
    type: "event_attendance",
    title: "Kenya vision dinner",
    description: "112 guests, 18 first-time donors.",
    daysAgo: 15,
  },
  {
    type: "field_report",
    title: "Field report: Rivera family",
    description: "Literacy program enrolled 40 new students.",
    daysAgo: 21,
  },
  {
    type: "church_presentation",
    title: "Missions Sunday at Grace Fellowship",
    description: "Okafors presented by video call.",
    daysAgo: 28,
  },
  {
    type: "volunteer_shift",
    title: "Packing day for relief kits",
    description: "32 volunteers packed 600 hygiene kits.",
    daysAgo: 33,
  },
  {
    type: "board_meeting",
    title: "Q3 board meeting",
    description: "Approved the FY27 budget and Kenya phase 2.",
    daysAgo: 41,
  },
  {
    type: "webinar",
    title: "Webinar: Clean water 101",
    description: "78 attendees; recording sent to registrants.",
    daysAgo: 52,
  },
  {
    type: "field_report",
    title: "Field report: Nair ministry",
    description: "Medical camp served 300 families in Chennai.",
    daysAgo: 63,
  },
  {
    type: "partner_call",
    title: "Church partner roundtable",
    description: "Six partner churches joined the quarterly call.",
    daysAgo: 77,
  },
  {
    type: "newsletter_sent",
    title: "September partner newsletter",
    description: "Sent to 1,228 partners; 44% open rate.",
    daysAgo: 45,
  },
  // Care-sensitive rows: excluded from relationships and counted in the report.
  {
    type: "pastoral_note",
    title: "Pastoral check-in",
    description: "Confidential.",
    daysAgo: 12,
  },
  {
    type: "care_plan_update",
    title: "Care plan update",
    description: "Confidential.",
    daysAgo: 25,
  },
  {
    type: "crisis_intervention",
    title: "Crisis support",
    description: "Confidential.",
    daysAgo: 31,
  },
];

const RELATIONSHIP_INPUT = mapLocalCrmRelationshipRows({
  tenantId: FIXTURE_TENANT_ID,
  now: REFERENCE_DATE,
  donors: DONORS.map((donor) => ({ ...donor })),
  missionaries: (Object.keys(MISSIONARIES) as MissionaryKey[]).map(
    (key, index) => ({
      id: missionaryId(key),
      profile_id: missionaryProfileId(key),
      status: "active",
      location: MISSIONARIES[key].location,
      created_at: at(1500 + index * 200, 12),
      updated_at: at(5 + index * 9, 12),
    }),
  ),
  profiles: (Object.keys(MISSIONARIES) as MissionaryKey[]).map((key) => ({
    id: missionaryProfileId(key),
    first_name: MISSIONARIES[key].firstName,
    last_name: MISSIONARIES[key].lastName,
    display_name: MISSIONARIES[key].displayName,
  })),
  pledges: PLEDGES.map((pledge) => ({ ...pledge })),
  activities: MEMBER_CARE_ACTIVITY_SPECS.map((activity, index) => ({
    id: fixtureUuid(`member-care-activity:${index}`),
    type: activity.type,
    title: activity.title,
    description: activity.description,
    occurred_at: at(activity.daysAgo, 18),
    created_at: at(activity.daysAgo, 18),
  })),
});

const RELATIONSHIP_ROWS: CrmRelationshipRow[] = sortCrmRelationships(
  RELATIONSHIP_INPUT.rows,
  {
    field: "updatedAt",
    direction: "desc",
  },
);
const RELATIONSHIP_REPORT = {
  ...buildCrmRelationshipReport(RELATIONSHIP_INPUT.rows, {
    excludedCareActivityCount: RELATIONSHIP_INPUT.excludedCareActivityCount,
  }),
  generatedAt: REFERENCE_DATE,
};

// ---------------------------------------------------------------------------
// Mission Control needs attention
// ---------------------------------------------------------------------------

const ATTENTION_SPECS: Array<{
  gift: string;
  issue: string;
  urgency: "critical" | "high" | "normal";
  summary: string;
  firstDaysAgo: number;
}> = [
  {
    gift: "priscilla-1",
    issue: "receipt_failed",
    urgency: "critical",
    summary:
      "Receipt email bounced for Priscilla Adeyemi ($75.00, Okafor Family Support).",
    firstDaysAgo: 11,
  },
  {
    gift: "fatima-1",
    issue: "receipt_failed",
    urgency: "critical",
    summary:
      "Receipt email failed for Fatima Rahman ($180.00, Disaster Relief Fund).",
    firstDaysAgo: 16,
  },
  {
    gift: "aaliyah-2",
    issue: "receipt_failed",
    urgency: "high",
    summary: "Monthly receipt soft-bounced for Aaliyah Brooks ($100.00).",
    firstDaysAgo: 35,
  },
  {
    gift: "hannah-1",
    issue: "crm_post_failed",
    urgency: "high",
    summary:
      "CRM posting rejected for Hannah Whitfield's $250.00 gift: designation mapping missing.",
    firstDaysAgo: 13,
  },
  {
    gift: "rafael-1",
    issue: "crm_post_failed",
    urgency: "high",
    summary: "CRM posting timed out for Rafael Domínguez ($80.00).",
    firstDaysAgo: 24,
  },
  {
    gift: "margaret-1",
    issue: "correction_review",
    urgency: "high",
    summary:
      "Amount correction $1,000.00 → $1,500.00 awaiting approval (requested by Joel Ramirez).",
    firstDaysAgo: 2,
  },
  {
    gift: "northfield-2",
    issue: "correction_review",
    urgency: "high",
    summary:
      "Refund of $5,000.00 to Northfield Community Bank awaiting approval.",
    firstDaysAgo: 4,
  },
  {
    gift: "northfield-2",
    issue: "pending_refund",
    urgency: "normal",
    summary:
      "Pending refund: Northfield Community Bank duplicate transfer ($5,000.00).",
    firstDaysAgo: 4,
  },
  {
    gift: "jamal-1",
    issue: "staged_gift_review",
    urgency: "normal",
    summary:
      "Staged gift needs review: cardholder name does not match Jamal Carter.",
    firstDaysAgo: 6,
  },
  {
    gift: "benjamin-1",
    issue: "staged_gift_review",
    urgency: "normal",
    summary:
      "Staged gift needs review: first ACH from a newly linked account ($500.00).",
    firstDaysAgo: 9,
  },
  {
    gift: "luis-1",
    issue: "provider_failed",
    urgency: "high",
    summary: "Card declined for Luis Herrera ($200.00, Disaster Relief Fund).",
    firstDaysAgo: 10,
  },
  {
    gift: "kenji-3",
    issue: "recurring_gift_issue",
    urgency: "normal",
    summary:
      "Provider-only recurring gift failed (expired card) for Kenji Nakamura; no internal agreement linked.",
    firstDaysAgo: 64,
  },
];

const ATTENTION_ITEMS = ATTENTION_SPECS.map((spec, index) => {
  const contributionId = fixtureDonationId(spec.gift);
  const donation = DONATIONS.find(
    (candidate) => candidate.id === contributionId,
  );
  const row: NeedsAttentionRow = {
    id: fixtureUuid(`attention:${index}`),
    task_id: index % 3 === 0 ? fixtureUuid(`attention-task:${index}`) : null,
    issue_type: spec.issue,
    urgency: spec.urgency,
    status: "open",
    summary: spec.summary,
    dedupe_key: `${spec.issue}:${contributionId}`,
    first_seen_at: at(spec.firstDaysAgo, 12),
    last_seen_at: at(
      Math.max(1, Math.min(spec.firstDaysAgo, 1 + (index % 4))),
      8,
    ),
    details: { contributionId, donorId: donation?.donor_id ?? null },
  };
  return mapNeedsAttentionRow(row);
}).sort((left, right) => right.lastSeenAt.localeCompare(left.lastSeenAt));

// ---------------------------------------------------------------------------
// Assembled bodies
// ---------------------------------------------------------------------------

export const CRM_PAGE_SIZE = 50;

function crmCursorFor(row: CrmGridRow) {
  return encodeBase64Url(
    JSON.stringify({
      id: row.id,
      field: "updatedAt",
      direction: "desc",
      value: row.updatedAt,
    }),
  );
}

function noteCursor(offset: number) {
  return encodeBase64Url(JSON.stringify({ offset }));
}

export function buildPopulatedBodies() {
  const crmFirstPage = CRM_ROWS.slice(0, CRM_PAGE_SIZE);
  const crmRecords = {
    rows: crmFirstPage,
    nextCursor:
      CRM_ROWS.length > CRM_PAGE_SIZE
        ? crmCursorFor(crmFirstPage.at(-1)!)
        : null,
    hasMore: CRM_ROWS.length > CRM_PAGE_SIZE,
    limit: CRM_PAGE_SIZE,
    sort: { field: "updatedAt", direction: "desc" },
    filters: {
      recordTypes: [],
      lifecycleStatuses: [],
      tags: [],
      hasPortal: null,
    },
  } satisfies AdminCrmListResponse;
  // The client hook casts to the @asym/database copy of the contract; prove both.
  crmRecords satisfies AdminCrmListResponseClient;

  const crmNotes = {
    mode: "local",
    configured: true,
    missing: [],
    rows: NOTE_ROWS.slice(0, 50),
    nextCursor: NOTE_ROWS.length > 50 ? noteCursor(50) : null,
    hasMore: NOTE_ROWS.length > 50,
    limit: 50,
    sort: { field: "updatedAt", direction: "desc" },
    filters: { search: null },
    rollback: NOTES_ROLLBACK,
  } satisfies AdminCrmNotesListResponse;

  const crmRelationships = {
    mode: "local",
    configured: true,
    missing: [],
    rows: RELATIONSHIP_ROWS.slice(0, 50),
    nextCursor: RELATIONSHIP_ROWS.length > 50 ? noteCursor(50) : null,
    hasMore: RELATIONSHIP_ROWS.length > 50,
    limit: 50,
    sort: { field: "updatedAt", direction: "desc" },
    filters: { search: null, domains: [] },
    report: RELATIONSHIP_REPORT,
    rollback: NOTES_ROLLBACK,
  } satisfies AdminCrmRelationshipsListResponse;

  const contributionsFirstPage = HUB_ROWS.slice(0, 50);
  const lastHubRow = contributionsFirstPage.at(-1);
  const contributions = {
    rows: contributionsFirstPage,
    nextCursor:
      HUB_ROWS.length > 50 && lastHubRow
        ? encodeBase64Url(
            JSON.stringify({
              id: lastHubRow.id,
              field: "giftDate",
              direction: "desc",
              value: lastHubRow.date,
            }),
          )
        : null,
    hasMore: HUB_ROWS.length > 50,
    limit: 50,
    sort: { field: "giftDate", direction: "desc" },
    filters: {
      statuses: [],
      contributionTypes: [],
      paymentMethods: [],
      sources: [],
      fundIds: [],
      missionaryIds: [],
      receiptStatuses: [],
      anonymousOnly: false,
      dateFrom: null,
      dateTo: null,
      amountMin: null,
      amountMax: null,
    },
  } satisfies AdminContributionsListResponse;

  // The store drops retired issue kinds (CRM posting) before grouping, so
  // the route serves only what staff can act on; the fixture does the same.
  const actionableAttention = withoutRetiredNeedsAttention(ATTENTION_ITEMS);
  const needsAttention = {
    groups: buildNeedsAttentionGroups(actionableAttention),
    items: actionableAttention,
  } satisfies {
    groups: MissionControlNeedsAttentionGroup[];
    items: MissionControlNeedsAttentionItem[];
  };

  const crmTablePreferences = buildTablePreferences();
  const crmNamedViews = {
    tableId: CRM_GIFT_HISTORY_TABLE_ID,
    views: NAMED_VIEWS,
  } satisfies CrmNamedViewsResponse;

  const crmRecordDetails: Record<string, CrmDonorDetailResponse> = {};
  DONORS.forEach((donor, index) => {
    crmRecordDetails[donor.id] = buildCrmDetailBody(donor, index);
  });

  const contributionDetails: Record<string, ViewerProjectedContributionDetail> =
    {};
  for (const donation of DONATIONS) {
    contributionDetails[donation.id] = buildContributionDetailBody(donation);
  }

  // Template for POST /api/admin/crm/notes (the route fills in the note).
  const noteCreateExample = {
    note: NOTE_ROWS[0]!,
    commandLogId: fixtureUuid("command-log:example"),
    rollback: NOTES_ROLLBACK,
  } satisfies AdminCrmNoteCreateResponse;

  return {
    endpoints: {
      "GET /api/admin/crm/records": crmRecords,
      "GET /api/admin/crm/notes": crmNotes,
      "GET /api/admin/crm/relationships": crmRelationships,
      "GET /api/admin/crm/table-preferences": crmTablePreferences,
      "GET /api/admin/crm/table-preferences/views": crmNamedViews,
      "GET /api/admin/contributions": contributions,
      "GET /api/admin/mission-control/needs-attention": needsAttention,
      "POST /api/admin/crm/notes": noteCreateExample,
    },
    datasets: {
      crmRecords: CRM_ROWS,
      crmNotes: NOTE_ROWS,
      crmRelationships: RELATIONSHIP_ROWS,
      contributions: HUB_ROWS,
    },
    details: {
      "GET /api/admin/crm/records/:recordId": crmRecordDetails,
      "GET /api/admin/contribution-operations/:contributionId":
        contributionDetails,
    },
  };
}

export function buildEmptyBodies() {
  const emptyReport = {
    ...buildCrmRelationshipReport([], { excludedCareActivityCount: 0 }),
    generatedAt: REFERENCE_DATE,
  };
  return {
    "GET /api/admin/crm/records": {
      rows: [],
      nextCursor: null,
      hasMore: false,
      limit: CRM_PAGE_SIZE,
      sort: { field: "updatedAt", direction: "desc" },
      filters: {
        recordTypes: [],
        lifecycleStatuses: [],
        tags: [],
        hasPortal: null,
      },
    } satisfies AdminCrmListResponse,
    "GET /api/admin/crm/notes": {
      mode: "local",
      configured: true,
      missing: [],
      rows: [],
      nextCursor: null,
      hasMore: false,
      limit: 50,
      sort: { field: "updatedAt", direction: "desc" },
      filters: { search: null },
      rollback: NOTES_ROLLBACK,
    } satisfies AdminCrmNotesListResponse,
    "GET /api/admin/crm/relationships": {
      mode: "local",
      configured: true,
      missing: [],
      rows: [],
      nextCursor: null,
      hasMore: false,
      limit: 50,
      sort: { field: "updatedAt", direction: "desc" },
      filters: { search: null, domains: [] },
      report: emptyReport,
      rollback: NOTES_ROLLBACK,
    } satisfies AdminCrmRelationshipsListResponse,
    "GET /api/admin/crm/table-preferences": {
      tableId: CRM_GIFT_HISTORY_TABLE_ID,
      schemaVersion: CRM_ROW_ACTION_SCHEMA_VERSION,
      user: null,
      tenantDefault: null,
      canManageTenantDefaults: false,
    } satisfies CrmTablePreferencesResponse,
    "GET /api/admin/crm/table-preferences/views": {
      tableId: CRM_GIFT_HISTORY_TABLE_ID,
      views: [],
    } satisfies CrmNamedViewsResponse,
    "GET /api/admin/contributions": {
      rows: [],
      nextCursor: null,
      hasMore: false,
      limit: 50,
      sort: { field: "giftDate", direction: "desc" },
      filters: {
        statuses: [],
        contributionTypes: [],
        paymentMethods: [],
        sources: [],
        fundIds: [],
        missionaryIds: [],
        receiptStatuses: [],
        anonymousOnly: false,
        dateFrom: null,
        dateTo: null,
        amountMin: null,
        amountMax: null,
      },
    } satisfies AdminContributionsListResponse,
    "GET /api/admin/mission-control/needs-attention": {
      groups: [],
      items: [],
    } satisfies {
      groups: MissionControlNeedsAttentionGroup[];
      items: MissionControlNeedsAttentionItem[];
    },
  };
}

/** Error body shape from `toErrorResponse` (`{ error, requestId? }`). */
export interface FixtureErrorSpec {
  status: number;
  body: { error: string };
  /** Routes wrapped in `withOperation` add a `requestId`; the two plain list routes do not. */
  withRequestId: boolean;
}

/** Fallback messages each route passes to `toErrorResponse` on a 500. */
export function buildErrorBodies(): Record<string, FixtureErrorSpec> {
  const spec = (error: string, withRequestId = true): FixtureErrorSpec => ({
    status: 500,
    body: { error },
    withRequestId,
  });
  return {
    "GET /api/admin/crm/records": spec("Failed to load CRM records.", false),
    "GET /api/admin/crm/records/:recordId": spec(
      "Failed to load CRM donor detail.",
    ),
    "GET /api/admin/crm/notes": spec("Failed to load CRM notes."),
    "POST /api/admin/crm/notes": spec("Failed to save CRM note."),
    "GET /api/admin/crm/relationships": spec(
      "Failed to load CRM relationships.",
    ),
    "GET /api/admin/crm/table-preferences": spec(
      "Failed to load CRM table preferences.",
    ),
    "PUT /api/admin/crm/table-preferences": spec(
      "Failed to save table preferences.",
    ),
    "PUT /api/admin/crm/table-preferences/tenant-default": spec(
      "Failed to save the tenant default.",
    ),
    "GET /api/admin/crm/table-preferences/views": spec(
      "Failed to load named views.",
    ),
    "POST /api/admin/crm/table-preferences/views": spec(
      "Failed to save the named view.",
    ),
    "PUT /api/admin/crm/table-preferences/views/:viewId": spec(
      "Failed to update the named view.",
    ),
    "DELETE /api/admin/crm/table-preferences/views/:viewId": spec(
      "Failed to delete the named view.",
    ),
    "GET /api/admin/contributions": spec(
      "Failed to load contributions.",
      false,
    ),
    "GET /api/admin/contribution-operations/:contributionId": spec(
      "Failed to load contribution operation detail.",
    ),
    "GET /api/admin/mission-control/needs-attention": spec(
      "Failed to load Mission Control Needs Attention.",
    ),
  };
}

export function buildFixtureBundle() {
  const populated = buildPopulatedBodies();
  return {
    meta: {
      referenceDate: REFERENCE_DATE,
      tenantId: FIXTURE_TENANT_ID,
      viewerProfileId: FIXTURE_VIEWER_PROFILE_ID,
      viewerCapabilities: FIXTURE_VIEWER_CAPABILITIES,
      generatedBy:
        "docs/qa/admin-workspaces-hillclimb/fixtures/export-fixtures.ts",
      moneyUnits:
        "All *Cents fields, ContributionGridRow.amount/amountGross and CrmGridRow.lifetimeGiving are integer cents (donations.amount and donors.total_given are BIGINT cents).",
      counts: {
        crmRecords: CRM_ROWS.length,
        crmNotes: NOTE_ROWS.length,
        crmRelationships: RELATIONSHIP_ROWS.length,
        contributionsHub: HUB_ROWS.length,
        contributionDetails: DONATIONS.length,
        needsAttentionItems: ATTENTION_ITEMS.length,
      },
      keyIds: {
        truncatedGiftHistoryDonorId: donorId("theo"),
        duplicateWarningDonorIds: [donorId("danielm"), donorId("danm")],
        splitDesignationGiftIds: [
          fixtureDonationId("brightwater-1"),
          fixtureDonationId("standrews-1"),
          fixtureDonationId("nikhil-1"),
        ],
        designationMismatchGiftId: fixtureDonationId("newhope-1"),
        pendingCorrectionApprovalGiftIds: [
          fixtureDonationId("margaret-1"),
          fixtureDonationId("northfield-2"),
        ],
        pendingRefundCorrectionGiftId: fixtureDonationId("northfield-2"),
        blockedRefundGiftId: fixtureDonationId("brightwater-1"),
        largestGiftId: fixtureDonationId("brightwater-1"),
        smallestGiftId: fixtureDonationId("chloe-1"),
        namedViewId: FIXTURE_NAMED_VIEW_ID,
      },
    },
    /**
     * Anchors consumed by ../capture-workspaces.mjs (ready-text waits and
     * deep links). Names are what the default-sorted first rows render.
     */
    captureMeta: {
      crmFirstName: CRM_ROWS[0]!.displayName,
      crmDrawerId: donorId("margaret"),
      crmDrawerName: DONOR_SPEC_BY_KEY.get("margaret")!.name,
      crmTruncatedDrawerId: donorId("theo"),
      crmTruncatedDrawerName: DONOR_SPEC_BY_KEY.get("theo")!.name,
      crmDuplicateDrawerId: donorId("danielm"),
      crmFirstNoteTitle: NOTE_ROWS[0]!.title,
      crmFirstRelationshipName: RELATIONSHIP_ROWS[0]!.displayName,
      contributionFirstDonor: HUB_ROWS[0]!.donorName,
      // Card gift with a 2-line split and an available refund.
      contributionSheetId: fixtureDonationId("nikhil-1"),
      contributionSheetDonor: DONOR_SPEC_BY_KEY.get("nikhil")!.name,
      // Pending amount correction the viewer can approve.
      contributionCorrectionId: fixtureDonationId("margaret-1"),
      contributionCorrectionDonor: DONOR_SPEC_BY_KEY.get("margaret")!.name,
      contributionSplitId: fixtureDonationId("brightwater-1"),
      contributionMismatchId: fixtureDonationId("newhope-1"),
    },
    ...populated,
    empty: buildEmptyBodies(),
    errors: buildErrorBodies(),
  };
}

export type FixtureBundle = ReturnType<typeof buildFixtureBundle>;

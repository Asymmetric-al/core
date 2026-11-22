/**
 * AL-2675 (WP2a), plan WP2 acceptance: "A staff member without the
 * administrator flag is refused by the email, PDF-template, automation and
 * organization-settings handlers that ask for an administrator, and one with
 * the flag is admitted and holds the contribution settings capability."
 *
 * The real handlers run with the real gates; only the verified session and
 * each handler's data layer are stubbed, so "admitted" means the handler
 * reached its data layer.
 *
 * Extended by the WP2a sweep: one representative handler of every family the
 * sweep moved off role names, with the gate plan 5.4 names (or the flag where
 * the action is the tenant administrator's, or the membership classes an
 * endpoint serves). Each is refused, before any data access and naming the
 * gate, under a membership without it, and admitted under one with it.
 */
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { hasContextCapability } from "../../../../packages/auth/context";

import type * as AuthModule from "../../../../packages/auth/context";
import type { AuthContext } from "../../../../packages/auth/context";

const h = vi.hoisted(() => ({
  touched: [] as string[],
  auth: vi.fn(),
  listEmailTemplates: vi.fn(),
  listPdfTemplates: vi.fn(),
  loadAutomations: vi.fn(),
  getAdminClient: vi.fn(),
}));

vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof AuthModule>()),
  getAuthContext: h.auth,
}));
vi.mock(
  "../../../../packages/api/src/email/template-store",
  async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    listEmailTemplates: h.listEmailTemplates,
  }),
);
vi.mock(
  "../../../../packages/api/src/pdf-templates/store",
  async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    listPdfTemplates: h.listPdfTemplates,
  }),
);
vi.mock(
  "../../../../packages/api/src/admin/mission-control-automations/store",
  async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    loadMissionControlAutomationDashboard: h.loadAutomations,
  }),
);
/**
 * A data client that records every access and answers each query with an
 * error, so a handler past its gate fails in its data layer, and one stopped
 * at its gate leaves `h.touched` empty.
 */
function recordingClient(label: string): Record<string, unknown> {
  const chain = (): unknown =>
    new Proxy(() => undefined, {
      get: (_target, prop) =>
        prop === "then"
          ? (resolve: (value: unknown) => void) =>
              resolve({ data: null, error: { message: "stub" }, count: 0 })
          : chain(),
      apply: () => chain(),
    });
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (prop === "then") return undefined;
        h.touched.push(`${label}.${String(prop)}`);
        return chain();
      },
    },
  );
}

vi.mock("@asym/database/supabase/server", () => ({
  createClient: vi.fn(async () => {
    const recorder = recordingClient("server");
    return {
      from: (table: string) => (recorder.from as (t: string) => unknown)(table),
      rpc: (...args: unknown[]) =>
        (recorder.rpc as (...a: unknown[]) => unknown)(...args),
      auth: recorder.auth,
      storage: recorder.storage,
    };
  }),
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: h.getAdminClient,
}));
vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: vi.fn(() => ({})),
}));

import { GET as contributionsGET } from "../../../../packages/api/src/admin/contributions";
import { POST as replayPOST } from "../../../../packages/api/src/admin/contributions/replay";
import { POST_APPROVE as stagedGiftApprove } from "../../../../packages/api/src/admin/contributions/staged-gifts";
import { GET as commentsGET } from "../../../../packages/api/src/admin/comments";
import { GET as crmGET } from "../../../../packages/api/src/admin/crm";
import { GET as crmReportsGET } from "../../../../packages/api/src/admin/crm/reports";
import { GET as automationsGET } from "../../../../packages/api/src/admin/mission-control-automations/route";
import { GET as supportTicketsGET } from "../../../../packages/api/src/admin/support/tickets";
import { GET as inboundRoutesGET } from "../../../../packages/api/src/admin/support-hub/inbound-routes";
import { GET as usersGET } from "../../../../packages/api/src/admin/users";
import { GET as notificationPolicyGET } from "../../../../packages/api/src/admin/workflows/notification-policy";
import { GET as donationsGET } from "../../../../packages/api/src/donations";
import { GET as donorPortalGET } from "../../../../packages/api/src/donor-portal";
import { GET as eveGovernanceGET } from "../../../../packages/api/src/eve/governance/route";
import { GET as missionaryPortalGET } from "../../../../packages/api/src/missionary-portal";
import { GET as emailTemplatesGET } from "../../../../packages/api/src/email/templates";
import { GET as pdfTemplatesGET } from "../../../../packages/api/src/pdf-templates";

const TENANT = "00000000-0000-4000-8000-0000000000a1";

function staffContext(isTenantAdmin: boolean): AuthContext {
  return {
    userId: "00000000-0000-4000-8000-0000000000b1",
    email: "staff@example.test",
    tenantId: TENANT,
    role: isTenantAdmin ? "admin" : "staff",
    memberships: [
      {
        tenantId: TENANT,
        role: "staff",
        staffRole: "development",
        isActive: true,
        isTenantAdmin,
      },
    ],
    profileId: "00000000-0000-4000-8000-0000000000c1",
    isAuthenticated: true,
  };
}

const HANDLERS = [
  {
    name: "email templates",
    reached: () => h.listEmailTemplates,
    call: () =>
      emailTemplatesGET(
        new NextRequest("https://admin.example.test/api/email/templates"),
      ),
  },
  {
    name: "PDF templates",
    reached: () => h.listPdfTemplates,
    call: () =>
      pdfTemplatesGET(
        new NextRequest("https://admin.example.test/api/pdf-templates"),
      ),
  },
  {
    name: "Mission Control automations",
    reached: () => h.loadAutomations,
    call: () =>
      automationsGET(
        new NextRequest(
          "https://admin.example.test/api/admin/mission-control-automations",
        ),
      ),
  },
  // D-18/D-48: WP3 removed the unused direct tenant-settings handler and its case.
] as const;

beforeEach(() => {
  vi.clearAllMocks();
  h.listEmailTemplates.mockResolvedValue([]);
  h.listPdfTemplates.mockResolvedValue([]);
  h.loadAutomations.mockResolvedValue({ rules: [] });
  h.touched.length = 0;
  h.getAdminClient.mockImplementation(() => ({
    client: recordingClient("admin"),
    error: null,
  }));
});

describe("AL-2675 WP2 acceptance: administrator handlers read the flag", () => {
  it.each(HANDLERS)(
    "$name refuses a staff member without the flag before its data layer",
    async ({ call, reached }) => {
      h.auth.mockResolvedValue(staffContext(false));
      const response = await call();
      expect(response.status).toBe(403);
      expect(reached()).not.toHaveBeenCalled();
    },
  );

  it.each(HANDLERS)(
    "$name admits the same staff row with the flag",
    async ({ call, reached }) => {
      h.auth.mockResolvedValue(staffContext(true));
      const response = await call();
      expect(response.status).toBe(200);
      expect(reached()).toHaveBeenCalledOnce();
    },
  );

  it("the flagged row holds the contribution settings capability and the unflagged one does not", () => {
    expect(
      hasContextCapability(staffContext(true), "contributions.manage_settings"),
    ).toBe(true);
    expect(
      hasContextCapability(
        staffContext(false),
        "contributions.manage_settings",
      ),
    ).toBe(false);
  });
});

type Membership = AuthContext["memberships"][number];
function member(
  role: Membership["role"],
  staffRole: Membership["staffRole"] = null,
  isTenantAdmin = false,
): AuthContext {
  // D-18: the fixture now supplies the selected assignment carried by a resolved session.
  // Each case keeps its original membership class and administrator flag, so the route permission assertions are unchanged.
  const userId = "00000000-0000-4000-8000-0000000000b2";
  return {
    userId,
    email: "member@example.test",
    tenantId: TENANT,
    role: isTenantAdmin ? "admin" : role,
    assignment: {
      assignmentId: "00000000-0000-4000-8000-0000000000d2",
      userId,
      tenantId: TENANT,
      membershipRole: role,
      staffRole,
      isTenantAdmin,
      revision: "2026-11-19T00:00:00Z",
    },
    memberships: [
      { tenantId: TENANT, role, staffRole, isActive: true, isTenantAdmin },
    ],
    profileId: "00000000-0000-4000-8000-0000000000c2",
    isAuthenticated: true,
  };
}
// D-18: the authenticated fixture carries the session used by caller-token handlers.
const url = (path: string) =>
  new NextRequest(`https://app.example.test${path}`, {
    headers: { cookie: "sb-local-auth-token=session" },
  });
const post = (path: string, body: unknown) =>
  new NextRequest(`https://app.example.test${path}`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
const GIFT = "00000000-0000-4000-8000-00000000d001";

type Family = [
  family: string,
  gate: string,
  call: () => Promise<Response>,
  without: AuthContext,
  holder: AuthContext,
];

/** One representative handler per family the sweep moved. */
const FAMILIES: Family[] = [
  [
    "workflow notification policy",
    "requires the tenant administrator",
    () =>
      notificationPolicyGET(url("/api/admin/workflows/notification-policy")),
    member("staff", "development"),
    member("staff", "development", true),
  ],
  [
    "support hub inbound routes",
    "requires the tenant administrator",
    () => inboundRoutesGET(url("/api/admin/support/inbound-routes")),
    member("staff", "hr"),
    member("staff", "hr", true),
  ],
  [
    "assistant (Eve) governance",
    "requires the tenant administrator",
    () => eveGovernanceGET(url("/api/admin/eve/governance")),
    member("staff", "finance"),
    member("staff", "finance", true),
  ],
  [
    "member list (plan 5.4: manage members)",
    "requires people.manage_members",
    () => usersGET(url("/api/admin/users?limit=10")),
    member("staff", "development"),
    member("staff", "development", true),
  ],
  [
    "CRM",
    "requires admin.crm.manage",
    () => crmGET(url("/api/admin/crm")),
    member("donor"),
    member("staff", "mobilizer"),
  ],
  [
    "CRM reports",
    "requires admin.reports.view",
    () => crmReportsGET(url("/api/admin/crm/reports")),
    member("missionary"),
    member("staff", "hr"),
  ],
  [
    "gifts",
    "requires admin.gifts.manage",
    () => contributionsGET(url("/api/admin/contributions")),
    member("donor"),
    member("staff", "member_care"),
  ],
  [
    "staged gift approval (plan 5.4: approving posts the gift)",
    "requires contributions.apply_corrections",
    () =>
      stagedGiftApprove(
        post(`/api/admin/contributions/staged-gifts/${GIFT}/approve`, {}),
      ),
    member("staff", "mobilizer"),
    member("staff", "finance"),
  ],
  [
    "provider replay (plan 5.4: parked provider work)",
    "requires contributions.use_provider_actions",
    () => replayPOST(post("/api/admin/contributions/replay", {})),
    member("staff", "finance"),
    member("staff", "development", true),
  ],
  [
    "support tickets",
    "requires admin.dashboard.access",
    () => supportTicketsGET(url("/api/admin/support/tickets")),
    member("donor"),
    member("staff", "hr"),
  ],
  [
    "comment moderation",
    "requires admin.dashboard.access",
    () => commentsGET(url("/api/admin/comments")),
    member("missionary"),
    member("staff", "development"),
  ],
  [
    "donations (donor or staff)",
    "requires a donor or staff membership",
    () => donationsGET(url("/api/donations")),
    member("missionary"),
    member("donor"),
  ],
  [
    "missionary workspace",
    "requires a missionary membership",
    () => missionaryPortalGET(url("/api/missionary/portal")),
    member("donor"),
    member("missionary"),
  ],
  [
    "donor portal",
    "requires a donor membership",
    () => donorPortalGET(url("/api/donor/portal")),
    member("missionary"),
    member("donor"),
  ],
];

describe("AL-2675 WP2a sweep: every moved handler family asks for its gate", () => {
  it.each(FAMILIES)(
    "%s: refused with 403 naming the gate (%s), before any data access",
    async (_family, gate, call, without) => {
      h.auth.mockResolvedValue(without);
      const response = await call();
      expect(response.status).toBe(403);
      expect(JSON.stringify(await response.json())).toContain(gate);
      expect(h.touched).toEqual([]);
    },
  );

  it.each(FAMILIES)(
    "%s: admitted past the gate under a membership that holds it",
    async (_family, _gate, call, _without, holder) => {
      h.auth.mockResolvedValue(holder);
      const response = await call();
      expect([401, 403]).not.toContain(response.status);
    },
  );
});

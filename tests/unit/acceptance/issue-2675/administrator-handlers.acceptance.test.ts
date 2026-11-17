/**
 * AL-2675 (WP2a), plan WP2 acceptance: "A staff member without the
 * administrator flag is refused by the email, PDF-template, automation and
 * organization-settings handlers that ask for an administrator, and one with
 * the flag is admitted and holds the contribution settings capability."
 *
 * The real handlers run with the real role gate (`requireRole`, `hasRole`);
 * only the verified session and each handler's data layer are stubbed, so
 * "admitted" means the handler reached its data layer.
 */
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { hasContextCapability } from "../../../../packages/auth/context";

import type * as AuthModule from "../../../../packages/auth/context";
import type { AuthContext } from "../../../../packages/auth/context";

const h = vi.hoisted(() => ({
  auth: vi.fn(),
  listEmailTemplates: vi.fn(),
  listPdfTemplates: vi.fn(),
  loadAutomations: vi.fn(),
  tenantUpdate: vi.fn(),
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
vi.mock("@asym/database/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: vi.fn(() => ({
      update: (values: unknown) => ({
        eq: async () => {
          h.tenantUpdate(values);
          return { error: null };
        },
      }),
    })),
  })),
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: h.getAdminClient,
}));
vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: vi.fn(() => ({})),
}));

import { GET as automationsGET } from "../../../../packages/api/src/admin/mission-control-automations/route";
import { PATCH as orgSettingsPATCH } from "../../../../packages/api/src/admin/org-settings";
import { GET as emailTemplatesGET } from "../../../../packages/api/src/email/templates";
import { GET as pdfTemplatesGET } from "../../../../packages/api/src/pdf-templates";

const TENANT = "00000000-0000-4000-8000-0000000000a1";

function staffContext(isTenantAdmin: boolean): AuthContext {
  return {
    userId: "00000000-0000-4000-8000-0000000000b1",
    email: "staff@example.test",
    tenantId: TENANT,
    role: isTenantAdmin ? "admin" : "staff",
    profileRole: null,
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
  {
    name: "organization settings",
    reached: () => h.tenantUpdate,
    call: () =>
      orgSettingsPATCH(
        new Request("https://admin.example.test/api/admin/org-settings", {
          method: "PATCH",
          body: JSON.stringify({ orgPostVisibility: "followers_only" }),
          headers: { "content-type": "application/json" },
        }),
      ),
  },
] as const;

beforeEach(() => {
  vi.clearAllMocks();
  h.listEmailTemplates.mockResolvedValue([]);
  h.listPdfTemplates.mockResolvedValue([]);
  h.loadAutomations.mockResolvedValue({ rules: [] });
  h.getAdminClient.mockReturnValue({ client: {}, error: null });
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

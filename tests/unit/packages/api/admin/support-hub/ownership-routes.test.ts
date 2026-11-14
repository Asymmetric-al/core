import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getAuthContextMock = vi.hoisted(() => vi.fn());

vi.mock("@asym/auth/context", () => ({
  getAuthContext: getAuthContextMock,
  hasAnyContextRole: (auth: { role?: string }, roles: string[]) =>
    roles.includes(auth.role ?? ""),
}));

vi.mock(
  "../../../../../../packages/api/src/admin/support-hub/adapter",
  async () => {
    const actual = await vi.importActual<
      typeof import("../../../../../../packages/api/src/admin/support-hub/adapter")
    >("../../../../../../packages/api/src/admin/support-hub/adapter");
    return {
      ...actual,
      supportHubAdapter: actual.inMemorySupportHubAdapter,
    };
  },
);

import { SUPPORT_HUB_DEMO_TENANT_ID } from "../../../../../../packages/api/src/admin/support-hub/adapter/fixtures";
import {
  __resetInMemorySupportHubStore,
  inMemorySupportHubAdapter,
} from "../../../../../../packages/api/src/admin/support-hub/adapter";
import {
  GET as getPreferences,
  PATCH as patchPreferences,
} from "../../../../../../apps/admin/app/api/admin/support/notification-preferences/route";
import {
  DELETE as deleteView,
  PATCH as patchView,
} from "../../../../../../apps/admin/app/api/admin/support/saved-views/[id]/route";
import {
  GET as getViews,
  POST as postView,
} from "../../../../../../apps/admin/app/api/admin/support/saved-views/route";

// Fixture agents: Emily (admin@givehope.org) and David (care@givehope.org).
const EMILY = "agent-emily-thompson";
const DAVID = "agent-david-rodriguez";

function signIn(email: string, role: "staff" | "admin") {
  getAuthContextMock.mockResolvedValue({
    userId: `auth-${email}`,
    email,
    tenantId: SUPPORT_HUB_DEMO_TENANT_ID,
    role,
    profileRole: role,
    memberships: [],
    profileId: `profile-${email}`,
    isAuthenticated: true,
  });
}

function json(method: string, body: unknown): Request {
  return new Request("https://example.org/api/admin/support", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const prefs = (agentId: string) => ({
  agentId,
  emailMentions: true,
  emailAssignments: false,
  emailDailyDigest: false,
  inAppMentions: true,
  inAppAssignments: false,
  inAppSlaWarnings: false,
});

const view = (name: string, scope: "personal" | "workspace") => ({
  name,
  slug: name.toLowerCase().replace(/\s+/g, "-"),
  ownerAgentId: null,
  scope,
  filter: {
    view: "mine",
    layout: "table",
    status: "open",
    q: "",
    labelSlugs: [],
    assignee: "me",
  },
});

const params = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => __resetInMemorySupportHubStore());
afterEach(() => {
  __resetInMemorySupportHubStore();
  getAuthContextMock.mockReset();
});

describe("notification preferences routes", () => {
  it("lists only the staff member's own preferences and says what they can change", async () => {
    signIn("care@givehope.org", "staff");
    const response = await getPreferences(
      new Request("https://example.org/api/admin/support"),
    );
    const body = (await response.json()) as {
      preferences: Array<{ agentId: string }>;
      access: unknown;
    };
    expect(body.preferences.map((row) => row.agentId)).toEqual([DAVID]);
    expect(body.access).toEqual({ agentId: DAVID, canManageAll: false });
  });

  it("answers 403 with a plain reason when staff change someone else's preferences", async () => {
    signIn("care@givehope.org", "staff");
    const response = await patchPreferences(json("PATCH", prefs(EMILY)));
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: "You can only change your own notification preferences.",
    });
    const emily =
      await inMemorySupportHubAdapter.notificationPreferences.get(EMILY);
    expect(emily?.inAppAssignments).not.toBe(false);
  });

  it("lets an admin change another agent's preferences", async () => {
    signIn("admin@givehope.org", "admin");
    const response = await patchPreferences(json("PATCH", prefs(DAVID)));
    expect(response.status).toBe(200);
  });
});

describe("saved view routes", () => {
  it("refuses staff sharing a view with the whole workspace", async () => {
    signIn("care@givehope.org", "staff");
    const response = await postView(json("POST", view("Team", "workspace")));
    expect(response.status).toBe(403);
    expect(((await response.json()) as { error: string }).error).toBe(
      "Only support admins can share a view with the whole workspace.",
    );
  });

  it("makes a staff member's new personal view theirs", async () => {
    signIn("care@givehope.org", "staff");
    const response = await postView(json("POST", view("Mine", "personal")));
    expect(response.status).toBe(201);
    const body = (await response.json()) as {
      savedView: { ownerAgentId: string | null };
    };
    expect(body.savedView.ownerAgentId).toBe(DAVID);
  });

  it("refuses staff renaming or deleting another agent's view", async () => {
    signIn("admin@givehope.org", "admin");
    const created = (await (
      await postView(json("POST", view("Emily only", "personal")))
    ).json()) as { savedView: { id: string; ownerAgentId: string | null } };
    expect(created.savedView.ownerAgentId).toBe(EMILY);
    const id = created.savedView.id;

    signIn("care@givehope.org", "staff");
    const listed = (await (
      await getViews(new Request("https://example.org/api/admin/support"))
    ).json()) as { savedViews: Array<{ id: string }> };
    expect(listed.savedViews.map((row) => row.id)).not.toContain(id);

    const rename = await patchView(
      json("PATCH", view("Taken", "personal")),
      params(id),
    );
    expect(rename.status).toBe(403);
    const remove = await deleteView(
      new Request("https://example.org/api/admin/support", {
        method: "DELETE",
      }),
      params(id),
    );
    expect(remove.status).toBe(403);
    expect(
      (await inMemorySupportHubAdapter.savedViews.list()).some(
        (row) => row.id === id,
      ),
    ).toBe(true);
  });
});

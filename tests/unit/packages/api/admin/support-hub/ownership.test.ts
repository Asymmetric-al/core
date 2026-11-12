import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  __resetInMemorySupportHubStore,
  inMemorySupportHubAdapter,
} from "../../../../../../packages/api/src/admin/support-hub/adapter";
import {
  SupportHubForbiddenError,
  createSupportOwnershipService,
} from "../../../../../../packages/api/src/admin/support-hub/ownership";
import { toApiErrorResponse } from "../../../../../../packages/api/src/admin/support-hub/route-helpers";

import type { SupportHubContext } from "../../../../../../packages/api/src/admin/support-hub/route-helpers";

const service = createSupportOwnershipService(inMemorySupportHubAdapter);

// Fixture agents: Emily (admin@givehope.org) and David (care@givehope.org).
const EMILY = "agent-emily-thompson";
const DAVID = "agent-david-rodriguez";

function staff(email: string): SupportHubContext {
  return {
    tenantId: "00000000-0000-0000-0000-000000000001",
    userId: `user-${email}`,
    userEmail: email,
    isSuperAdmin: false,
    canManageAll: false,
  };
}

const david = staff("care@givehope.org");
const manager: SupportHubContext = {
  ...staff("someone-else@givehope.org"),
  canManageAll: true,
};
const notAnAgent = staff("nobody@givehope.org");

const prefs = (agentId: string) => ({
  agentId,
  emailMentions: true,
  emailAssignments: false,
  emailDailyDigest: false,
  inAppMentions: true,
  inAppAssignments: true,
  inAppSlaWarnings: false,
});

const personalView = (ownerAgentId: string | null, name = "My open") => ({
  name,
  slug: name.toLowerCase().replace(/\s+/g, "-"),
  ownerAgentId,
  scope: "personal" as const,
  filter: {
    view: "mine" as const,
    layout: "table" as const,
    status: "open" as const,
    q: "",
    labelSlugs: [],
    assignee: "me" as const,
  },
});

beforeEach(() => __resetInMemorySupportHubStore());
afterEach(() => __resetInMemorySupportHubStore());

describe("notification preferences ownership", () => {
  it("shows an agent only their own preferences", async () => {
    const list = await service.listNotificationPreferences(david);
    expect(list.map((p) => p.agentId)).toEqual([DAVID]);
  });

  it("lets a manager see every agent's preferences", async () => {
    const list = await service.listNotificationPreferences(manager);
    expect(list.map((p) => p.agentId)).toEqual(
      expect.arrayContaining([EMILY, DAVID]),
    );
  });

  it("lets an agent save their own preferences", async () => {
    const saved = await service.saveNotificationPreferences(
      david,
      prefs(DAVID),
    );
    expect(saved.agentId).toBe(DAVID);
  });

  it("refuses an agent changing someone else's preferences", async () => {
    await expect(
      service.saveNotificationPreferences(david, prefs(EMILY)),
    ).rejects.toBeInstanceOf(SupportHubForbiddenError);
    const emily =
      await inMemorySupportHubAdapter.notificationPreferences.get(EMILY);
    expect(emily?.emailAssignments).not.toBe(false);
  });

  it("lets a manager change anyone's preferences", async () => {
    const saved = await service.saveNotificationPreferences(
      manager,
      prefs(EMILY),
    );
    expect(saved.agentId).toBe(EMILY);
  });

  it("refuses a signed-in user who isn't a support agent", async () => {
    await expect(
      service.saveNotificationPreferences(notAnAgent, prefs(DAVID)),
    ).rejects.toBeInstanceOf(SupportHubForbiddenError);
    expect(await service.listNotificationPreferences(notAnAgent)).toEqual([]);
  });
});

describe("saved view ownership", () => {
  it("makes a new personal view belong to the agent who saved it", async () => {
    const view = await service.saveSavedView(david, personalView(null));
    expect(view.ownerAgentId).toBe(DAVID);
    expect(view.scope).toBe("personal");
  });

  it("refuses an agent saving a personal view for someone else", async () => {
    await expect(
      service.saveSavedView(david, personalView(EMILY)),
    ).rejects.toBeInstanceOf(SupportHubForbiddenError);
  });

  it("keeps workspace views for managers", async () => {
    const workspace = {
      ...personalView(null, "Team queue"),
      scope: "workspace" as const,
    };
    await expect(
      service.saveSavedView(david, workspace),
    ).rejects.toBeInstanceOf(SupportHubForbiddenError);
    const created = await service.saveSavedView(manager, workspace);
    expect(created.scope).toBe("workspace");
  });

  it("hides other agents' personal views but keeps shared ones", async () => {
    const emilys = await service.saveSavedView(
      manager,
      personalView(EMILY, "Emily only"),
    );
    const workspace = await service.saveSavedView(manager, {
      ...personalView(null, "Everyone"),
      scope: "workspace",
    });
    const mine = await service.saveSavedView(
      david,
      personalView(null, "David only"),
    );

    const ids = (await service.listSavedViews(david)).map((v) => v.id);
    expect(ids).toContain(workspace.id);
    expect(ids).toContain(mine.id);
    expect(ids).not.toContain(emilys.id);

    const all = (await service.listSavedViews(manager)).map((v) => v.id);
    expect(all).toEqual(
      expect.arrayContaining([emilys.id, workspace.id, mine.id]),
    );
  });

  it("lets an agent edit and delete only their own views", async () => {
    const emilys = await service.saveSavedView(
      manager,
      personalView(EMILY, "Emily only"),
    );
    const mine = await service.saveSavedView(
      david,
      personalView(null, "David only"),
    );

    await expect(
      service.saveSavedView(david, {
        ...personalView(EMILY, "Taken"),
        id: emilys.id,
      }),
    ).rejects.toBeInstanceOf(SupportHubForbiddenError);
    await expect(
      service.deleteSavedView(david, emilys.id),
    ).rejects.toBeInstanceOf(SupportHubForbiddenError);

    const renamed = await service.saveSavedView(david, {
      ...personalView(DAVID, "Renamed"),
      id: mine.id,
    });
    expect(renamed.name).toBe("Renamed");
    await service.deleteSavedView(david, mine.id);
    expect(
      (await service.listSavedViews(manager)).map((v) => v.id),
    ).not.toContain(mine.id);
  });

  it("doesn't let an agent share their view with the whole workspace", async () => {
    const mine = await service.saveSavedView(
      david,
      personalView(null, "David only"),
    );
    await expect(
      service.saveSavedView(david, {
        ...personalView(DAVID, "David only"),
        id: mine.id,
        scope: "workspace",
      }),
    ).rejects.toBeInstanceOf(SupportHubForbiddenError);
  });

  it("answers a refusal with 403 and a plain reason", async () => {
    const response = toApiErrorResponse(
      new SupportHubForbiddenError("You can only change your own saved views."),
      "Failed to update saved view.",
    );
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({
      error: "You can only change your own saved views.",
    });
  });

  it("refuses a manager giving a personal view to someone outside the workspace", async () => {
    await expect(
      service.saveSavedView(manager, personalView("agent-from-elsewhere")),
    ).rejects.toBeInstanceOf(SupportHubForbiddenError);
  });

  it("refuses a personal view with no owner, which would show to everyone", async () => {
    // This manager isn't a support agent, so there is no one to default to.
    await expect(
      service.saveSavedView(manager, personalView(null)),
    ).rejects.toBeInstanceOf(SupportHubForbiddenError);
  });
});

describe("describeAccess", () => {
  it("reports the signed-in agent and whether they manage everyone", async () => {
    expect(await service.describeAccess(david)).toEqual({
      agentId: DAVID,
      canManageAll: false,
    });
    expect(await service.describeAccess(notAnAgent)).toEqual({
      agentId: null,
      canManageAll: false,
    });
  });

  it("refuses a manager saving preferences for an agent outside the workspace", async () => {
    await expect(
      service.saveNotificationPreferences(
        manager,
        prefs("agent-from-elsewhere"),
      ),
    ).rejects.toBeInstanceOf(SupportHubForbiddenError);
  });
});

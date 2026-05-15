import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getAuthContextMock = vi.hoisted(() => vi.fn());
const hasAnyContextRoleMock = vi.hoisted(() => vi.fn());

vi.mock("@asym/auth/context", () => ({
  getAuthContext: getAuthContextMock,
  hasAnyContextRole: hasAnyContextRoleMock,
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
import { POST } from "../../../../../../apps/admin/app/api/admin/support/conversations/[id]/run-macro/route";

beforeEach(() => {
  __resetInMemorySupportHubStore();
  hasAnyContextRoleMock.mockReturnValue(true);
  getAuthContextMock.mockResolvedValue({
    userId: "auth-user-admin",
    email: "admin@givehope.org",
    tenantId: SUPPORT_HUB_DEMO_TENANT_ID,
    role: "admin",
    profileRole: "admin",
    memberships: [],
    profileId: "profile-admin",
    isAuthenticated: true,
  });
});

afterEach(() => {
  __resetInMemorySupportHubStore();
  vi.clearAllMocks();
});

describe("POST /api/admin/support/conversations/[id]/run-macro", () => {
  it("ignores spoofed authorAgentId and attributes notes to the authenticated agent", async () => {
    const [conversation] = await inMemorySupportHubAdapter.conversations.list(
      {},
    );
    if (!conversation) throw new Error("seed missing");
    const macro = await inMemorySupportHubAdapter.macros.save({
      name: "Add internal note",
      description: null,
      ownerAgentId: null,
      actions: [
        {
          kind: "add_private_note",
          bodyText: "Server-side attribution check.",
        },
      ],
    });

    const response = await POST(
      new Request(
        `http://localhost/api/admin/support/conversations/${conversation.id}/run-macro`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            conversationId: conversation.id,
            macroId: macro.id,
            authorAgentId: "agent-rachel-kim",
          }),
        },
      ),
      { params: Promise.resolve({ id: conversation.id }) },
    );

    expect(response.status).toBe(200);
    const messages = await inMemorySupportHubAdapter.conversations.listMessages(
      conversation.id,
    );
    const note = messages.find((message) =>
      message.body.text.includes("Server-side attribution check."),
    );
    expect(note?.author.name).toBe("Emily Thompson");
    expect(note?.author.name).not.toBe("Rachel Kim");
  });
});

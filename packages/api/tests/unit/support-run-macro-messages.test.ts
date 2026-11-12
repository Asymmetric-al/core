import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  macros: vi.fn(),
  assign: vi.fn(),
  toggleLabel: vi.fn(),
  agents: vi.fn(),
  labels: vi.fn(),
}));
vi.mock("../../src/admin/support-hub/adapter", () => ({
  supportHubAdapter: {
    conversations: {
      get: mocks.get,
      assign: mocks.assign,
      toggleLabel: mocks.toggleLabel,
    },
    macros: { list: mocks.macros },
    agents: { list: mocks.agents },
    labels: { list: mocks.labels },
  },
}));
import { runSupportMacroOnServer } from "../../src/admin/support-hub/mutations/run-macro";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.get.mockResolvedValue({ id: "conversation-secret" });
  mocks.agents.mockResolvedValue([{ id: "agent-secret", name: "Avery" }]);
  mocks.labels.mockResolvedValue([{ id: "label-secret", name: "Receipts" }]);
  mocks.assign.mockResolvedValue({});
  mocks.toggleLabel.mockResolvedValue({});
  mocks.macros.mockResolvedValue([
    {
      id: "macro-secret",
      actions: [
        { kind: "assign_agent", agentId: "agent-secret" },
        { kind: "add_label", labelId: "label-secret" },
        { kind: "assign_team", teamId: "team-secret" },
      ],
    },
  ]);
});
it("reports names and honest unavailable team assignment without IDs or implementation phases", async () => {
  const result = await runSupportMacroOnServer({
    conversationId: "conversation-secret",
    macroId: "macro-secret",
    authorAgentId: "author",
  });
  expect(result.outcomes.map((outcome) => outcome.message)).toEqual([
    "Assigned to Avery.",
    "Added label Receipts.",
    "Skipped: conversations can't be assigned to a team yet.",
  ]);
  expect(result.outcomes[2]?.status).toBe("skipped");
});
it("does not leak adapter errors into action messages", async () => {
  mocks.assign.mockRejectedValue(new Error("unknown agent-secret in table"));
  const result = await runSupportMacroOnServer({
    conversationId: "conversation-secret",
    macroId: "macro-secret",
    authorAgentId: "author",
  });
  expect(result.outcomes[0]?.message).toBe(
    "Could not complete this action. Try again.",
  );
  expect(result.ok).toBe(false);
});

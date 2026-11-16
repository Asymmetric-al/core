import { beforeEach, describe, expect, it, vi } from "vitest";

const fixtures = vi.hoisted(() => ({ list: vi.fn(), save: vi.fn() }));
vi.mock("../../src/admin/support-hub/adapter", () => ({
  supportHubAdapter: { cannedResponses: fixtures },
}));
import { saveSupportCannedResponse } from "../../src/admin/support-hub/mutations/registry";
const input = {
  shortCode: "receipt",
  title: "Receipt",
  ownerAgentId: null,
  bodyText: "Thank you",
};
beforeEach(() => {
  vi.clearAllMocks();
  fixtures.list.mockResolvedValue([]);
  fixtures.save.mockImplementation(async (value) => value);
});
describe("canned response shortcode saves", () => {
  it("normalizes a slash prefix and rejects malformed new codes", async () => {
    await expect(
      saveSupportCannedResponse({ ...input, shortCode: " /receipt " }),
    ).resolves.toMatchObject({ shortCode: "receipt" });
    await expect(
      saveSupportCannedResponse({ ...input, shortCode: "Follow_Up" }),
    ).rejects.toThrow("Use lowercase letters, numbers and hyphens.");
    expect(fixtures.save).toHaveBeenCalledTimes(1);
  });
  it("rejects a case-insensitive collision for the same owner", async () => {
    fixtures.list.mockResolvedValue([
      { id: "other", shortCode: "Receipt", ownerAgentId: null },
    ]);
    await expect(saveSupportCannedResponse(input)).rejects.toThrow(
      "This shortcode is already in use.",
    );
    expect(fixtures.save).not.toHaveBeenCalled();
  });
  it("keeps unchanged legacy codes and respects owner scope", async () => {
    fixtures.list.mockResolvedValue([
      { id: "legacy", shortCode: "Follow_Up", ownerAgentId: null },
      { id: "other", shortCode: "receipt", ownerAgentId: "agent-other" },
    ]);
    await expect(
      saveSupportCannedResponse({
        ...input,
        id: "legacy",
        shortCode: "Follow_Up",
      }),
    ).resolves.toMatchObject({ shortCode: "Follow_Up" });
    await expect(saveSupportCannedResponse(input)).resolves.toMatchObject({
      shortCode: "receipt",
    });
  });
});

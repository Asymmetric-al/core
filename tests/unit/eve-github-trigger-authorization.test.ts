import { describe, expect, it, vi } from "vitest";

import {
  authorizeEveGithubActor,
  authorizeEveGithubCheckSuite,
} from "../../packages/eve-runtime/src/github/authorize-trigger";

const actor = { id: 42, login: "member", type: "User" };

function github(state: string, permission: string) {
  return vi.fn(async ({ path }: { path: string; method: "GET" }) => ({
    status: 200,
    body: path.includes("/memberships/")
      ? { state, user: { id: 42 } }
      : { permission },
  }));
}

describe("Eve GitHub trigger authorization", () => {
  it.each(["write", "maintain", "admin"])(
    "accepts active private member with %s access",
    async (permission) => {
      const request = github("active", permission);
      expect(await authorizeEveGithubActor({ actor, request })).toBe(true);
      expect(request.mock.calls.map(([call]) => call.path)).toEqual([
        "/orgs/Asymmetric-al/memberships/member",
        "/repos/Asymmetric-al/core/collaborators/member/permission",
      ]);
    },
  );

  it.each([
    ["active", "read"],
    ["pending", "write"],
    ["inactive", "admin"],
  ])("denies %s membership with %s permission", async (state, permission) => {
    expect(
      await authorizeEveGithubActor({
        actor,
        request: github(state, permission),
      }),
    ).toBe(false);
  });

  it("fails closed on revoked membership and lookup failure", async () => {
    const first = github("active", "write");
    expect(await authorizeEveGithubActor({ actor, request: first })).toBe(true);
    expect(
      await authorizeEveGithubActor({
        actor,
        request: github("inactive", "write"),
      }),
    ).toBe(false);
    expect(
      await authorizeEveGithubActor({
        actor,
        request: async () => {
          throw new Error("Members: read unavailable");
        },
      }),
    ).toBe(false);
  });

  it("rejects mismatched numeric identity and bot-name spoofing", async () => {
    expect(
      await authorizeEveGithubActor({
        actor: { ...actor, id: 99 },
        request: github("active", "admin"),
      }),
    ).toBe(false);
    expect(
      await authorizeEveGithubActor({
        actor: { id: 99, login: "member[bot]", type: "Bot" },
        request: github("active", "admin"),
      }),
    ).toBe(false);
  });

  it("allows only a configured App proven by the signed event payload", async () => {
    const bot = { id: 99, login: "approved[bot]", type: "Bot" };
    const request = github("inactive", "none");
    const approvedAppIds = new Set([1234]);
    expect(
      await authorizeEveGithubActor({
        actor: bot,
        appProof: { id: 1234, slug: "approved" },
        approvedAppIds,
        request,
      }),
    ).toBe(true);
    expect(request).not.toHaveBeenCalled();
    expect(
      await authorizeEveGithubActor({
        actor: bot,
        appProof: { id: 4321, slug: "unknown" },
        approvedAppIds,
        request,
      }),
    ).toBe(false);
  });

  it("only accepts GitHub Actions check suites for automatic merge consideration", () => {
    expect(
      authorizeEveGithubCheckSuite({
        appId: 15368,
        appSlug: "github-actions",
        conclusion: "success",
      }),
    ).toBe(true);
    expect(
      authorizeEveGithubCheckSuite({
        appId: 1,
        appSlug: "github-actions",
        conclusion: "success",
      }),
    ).toBe(false);
  });
});

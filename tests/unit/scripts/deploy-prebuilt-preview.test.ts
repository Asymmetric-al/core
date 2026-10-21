import { describe, expect, it, vi } from "vitest";

import { deployPrebuiltPreview } from "../../../scripts/qa/deploy-prebuilt-preview.mjs";

const env = {
  GITHUB_ACTIONS: "true",
  VERCEL_ORG_ID: "team_YrLB8jJARcRH0jnF1HPpPGTB",
  VERCEL_PROJECT_ID: "prj_SB9DucsrJOT0wF1v43SWMFsSNdn8",
  VERCEL_TOKEN: "test-token",
};

describe("prebuilt preview delivery", () => {
  it("pulls preview settings, builds locally, then uploads prebuilt output", () => {
    const run = vi.fn(() => ({
      status: 0,
      stdout: "https://admin-test.vercel.app\n",
    }));
    const remove = vi.fn();
    expect(
      deployPrebuiltPreview({
        app: "admin",
        env,
        run,
        remove,
        root: "/tmp/preview-test",
      }),
    ).toBe("https://admin-test.vercel.app");
    expect(run.mock.calls.map((call) => call[1][1])).toEqual([
      "pull",
      "build",
      "deploy",
    ]);
    expect(run.mock.calls.map((call) => [call[0], call[1][0]])).toEqual([
      ["bunx", "vercel@65.0.0"],
      ["bunx", "vercel@65.0.0"],
      ["bunx", "vercel@65.0.0"],
    ]);
    expect(run.mock.calls[0][1]).toContain("--environment=preview");
    expect(run.mock.calls[2][1]).toContain("--prebuilt");
    expect(run.mock.calls[2][1]).toContain("--target=preview");
    for (const call of run.mock.calls) {
      expect(call[1]).not.toContain("--token");
      expect(call[1]).not.toContain(env.VERCEL_TOKEN);
      expect(call[2].env.VERCEL_TOKEN).toBe(env.VERCEL_TOKEN);
    }
    expect(remove).toHaveBeenCalledTimes(2);
  });

  it("cleans transient state and withholds credential-bearing output on failure", () => {
    const remove = vi.fn();
    const run = vi.fn(() => ({
      status: 1,
      stderr: "test-token other-private-value",
    }));
    expect(() =>
      deployPrebuiltPreview({ app: "admin", env, run, remove }),
    ).toThrow("Preview pull failed for admin");
    expect(remove).toHaveBeenCalledTimes(2);
    expect(run).toHaveBeenCalledTimes(1);
  });

  it("rejects mismatched app/project credentials before touching local state", () => {
    const run = vi.fn();
    const remove = vi.fn();
    expect(() =>
      deployPrebuiltPreview({ app: "donor", env, run, remove }),
    ).toThrow("configured Core app/team");
    expect(run).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });
});

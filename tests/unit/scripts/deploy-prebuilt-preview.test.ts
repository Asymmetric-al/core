import { describe, expect, it, vi } from "vitest";

import { deployPrebuiltPreview } from "../../../scripts/qa/deploy-prebuilt-preview.mjs";

const env = {
  GITHUB_ACTIONS: "true",
  CORE_PREVIEW_GIT_BRANCH: "chore/AL-1965-payload-public-v4",
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
    expect(run.mock.calls[0][1]).toContain(
      `--git-branch=${env.CORE_PREVIEW_GIT_BRANCH}`,
    );
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

  it.each([
    {
      result: {
        status: 137,
        signal: "SIGKILL",
        stderr: "private-cms-password",
      },
      expected:
        "status=137; signal=SIGKILL; spawn=none; categories=process-killed",
    },
    {
      result: {
        status: 1,
        stderr: "Invalid environment variables private-cms-password",
      },
      expected:
        "status=1; signal=none; spawn=none; categories=environment-validation",
    },
    {
      result: {
        status: 1,
        stderr:
          "PAYLOAD_DATABASE_SSL_CA requires exactly one sslmode=verify-full. private-cms-password",
      },
      expected:
        "status=1; signal=none; spawn=none; categories=tls-configuration",
    },
    {
      result: {
        status: null,
        error: { code: "ENOBUFS", message: "private-cms-password" },
      },
      expected:
        "status=unknown; signal=none; spawn=ENOBUFS; categories=output-limit",
    },
    {
      result: {
        status: 1,
        signal: "private-cms-password",
        error: { code: "private-cms-password" },
        stdout: "private-cms-password",
      },
      expected:
        "status=1; signal=unknown; spawn=unknown; categories=unclassified",
    },
  ])(
    "reports bounded failure diagnostics without exposing child output ($expected)",
    ({ result, expected }) => {
      const remove = vi.fn();
      const run = vi
        .fn()
        .mockReturnValueOnce({ status: 0, stdout: "pulled" })
        .mockReturnValueOnce(result);
      let failure: unknown;
      try {
        deployPrebuiltPreview({ app: "admin", env, run, remove });
      } catch (error) {
        failure = error;
      }
      expect(failure).toBeInstanceOf(Error);
      const message = failure instanceof Error ? failure.message : "";
      expect(message).toContain(expected);
      expect(message).not.toContain("private-cms-password");
      expect(message).not.toContain(env.VERCEL_TOKEN);
      expect(message).toContain("raw CLI output is withheld");
      expect(run).toHaveBeenCalledTimes(2);
      expect(remove).toHaveBeenCalledTimes(2);
    },
  );

  it.each([undefined, "", "HEAD", "feature\nother"])(
    "rejects an absent or invalid explicit PR branch (%s) before local mutation",
    (branch) => {
      const run = vi.fn();
      const remove = vi.fn();
      expect(() =>
        deployPrebuiltPreview({
          app: "admin",
          env: { ...env, CORE_PREVIEW_GIT_BRANCH: branch },
          run,
          remove,
        }),
      ).toThrow("explicit PR head branch");
      expect(run).not.toHaveBeenCalled();
      expect(remove).not.toHaveBeenCalled();
    },
  );

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

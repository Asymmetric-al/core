import { describe, expect, it, vi } from "vitest";

import { deployHostedPreview } from "../../../scripts/qa/deploy-hosted-preview.mjs";

const sha = "a".repeat(40);
const env = {
  GITHUB_ACTIONS: "true",
  GITHUB_REPOSITORY: "Asymmetric-al/core",
  VERCEL_PROJECT_ID: "prj_SB9DucsrJOT0wF1v43SWMFsSNdn8",
  VERCEL_ORG_ID: "team_YrLB8jJARcRH0jnF1HPpPGTB",
  VERCEL_TOKEN: "private-fixture-token",
  CORE_PREVIEW_GIT_BRANCH: "chore/AL-1965-payload-public-v4",
  CORE_PREVIEW_GIT_SHA: sha,
};
const deployment = (state = "BUILDING", patch = {}) => ({
  id: "dpl_fixture123",
  projectId: env.VERCEL_PROJECT_ID,
  target: null,
  gitSource: {
    type: "github",
    repoId: "1132484374",
    ref: env.CORE_PREVIEW_GIT_BRANCH,
    sha,
  },
  readyState: state,
  url: "admin-fixture.vercel.app",
  ...patch,
});
function fixture(responses = [deployment(), deployment("READY")]) {
  const request = vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => responses.shift(),
  }));
  const sleep = vi.fn(async () => {});
  return { request, sleep };
}

describe("hosted Git-source preview delivery", () => {
  it("builds the exact approved PR SHA remotely without pulling application Secrets", async () => {
    const fx = fixture();
    await expect(
      deployHostedPreview({ app: "admin", env, ...fx }),
    ).resolves.toBe("https://admin-fixture.vercel.app");
    const [url, options] = fx.request.mock.calls[0];
    expect(url).toBe(
      "https://api.vercel.com/v13/deployments?teamId=team_YrLB8jJARcRH0jnF1HPpPGTB&forceNew=1",
    );
    expect(options.redirect).toBe("error");
    const body = JSON.parse(options.body);
    expect(body).toMatchObject({
      project: env.VERCEL_PROJECT_ID,
      gitSource: deployment().gitSource,
      buildMachine: "turbo",
    });
    expect(body.build).toEqual({
      env: { CORE_QA_FORCE_BUILD_SHA: sha },
    });
    expect(body.gitMetadata).toMatchObject({
      commitRef: env.CORE_PREVIEW_GIT_BRANCH,
      commitSha: sha,
    });
    expect(body).not.toHaveProperty("target");
    expect(body).not.toHaveProperty("projectSettings");
    expect(body).not.toHaveProperty("env");
    expect(body).not.toHaveProperty("withLatestCommit");
    expect(JSON.stringify(body)).not.toContain(env.VERCEL_TOKEN);
    expect(fx.request.mock.calls).toHaveLength(2);
  });
  it("validates an immediate READY Preview with a complete identity readback", async () => {
    const fx = fixture([deployment("READY"), deployment("READY")]);
    await expect(
      deployHostedPreview({ app: "admin", env, ...fx }),
    ).resolves.toBe("https://admin-fixture.vercel.app");
    expect(fx.request.mock.calls).toHaveLength(2);
    expect(fx.request.mock.calls[0][1].method).toBe("POST");
    expect(fx.request.mock.calls[1][0]).toBe(
      "https://api.vercel.com/v13/deployments/dpl_fixture123?teamId=team_YrLB8jJARcRH0jnF1HPpPGTB&withGitRepoInfo=true",
    );
    expect(fx.request.mock.calls[1][1].method).toBe("GET");
    expect(fx.sleep).not.toHaveBeenCalled();
  });
  it.each([
    [
      "wrong-head POST",
      { gitSource: { ...deployment().gitSource, sha: "b".repeat(40) } },
      true,
    ],
    ["production POST", { target: "production" }, true],
    [
      "wrong-head readback",
      { gitSource: { ...deployment().gitSource, sha: "b".repeat(40) } },
      false,
    ],
    ["production readback", { target: "production" }, false],
  ])(
    "rejects an immediate READY response with %s",
    async (_label, patch, mismatchedPost) => {
      const fx = fixture([
        deployment("READY", mismatchedPost ? patch : {}),
        deployment("READY", patch),
      ]);
      await expect(
        deployHostedPreview({ app: "admin", env, ...fx }),
      ).rejects.toThrow();
      expect(fx.sleep).not.toHaveBeenCalled();
      expect(fx.request.mock.calls).toHaveLength(2);
      expect(
        fx.request.mock.calls.some(([, options]) => options.method === "PATCH"),
      ).toBe(false);
    },
  );
  it.each([
    ["donor", "prj_dZG3XkklLVZyqm85FW5Vvv7ph3kL"],
    ["missionary", "prj_6tXSJKsdv2JpK70GKkg9HIg5hiYN"],
  ])("keeps standard build resources for %s", async (app, projectId) => {
    const fx = fixture([
      deployment("BUILDING", { projectId }),
      deployment("READY", { projectId }),
    ]);
    await deployHostedPreview({
      app,
      env: { ...env, VERCEL_PROJECT_ID: projectId },
      ...fx,
    });
    expect(JSON.parse(fx.request.mock.calls[0][1].body)).not.toHaveProperty(
      "buildMachine",
    );
  });
  it.each([
    { GITHUB_ACTIONS: "false" },
    { GITHUB_REPOSITORY: "elsewhere/core" },
    { VERCEL_PROJECT_ID: "other" },
    { VERCEL_ORG_ID: "other" },
    { VERCEL_TOKEN: "" },
    { CORE_PREVIEW_GIT_BRANCH: "HEAD" },
    { CORE_PREVIEW_GIT_BRANCH: "branch\nprivate" },
    { CORE_PREVIEW_GIT_SHA: "main" },
  ])(
    "rejects invalid deployment scope before any network request: %s",
    async (patch) => {
      const fx = fixture();
      await expect(
        deployHostedPreview({ app: "admin", env: { ...env, ...patch }, ...fx }),
      ).rejects.toThrow();
      expect(fx.request).not.toHaveBeenCalled();
    },
  );
  it.each([
    { projectId: "other" },
    { target: "production" },
    { gitSource: { ...deployment().gitSource, sha: "b".repeat(40) } },
    { gitSource: { ...deployment().gitSource, ref: "develop" } },
    { url: "https://untrusted.example.test" },
  ])(
    "rejects a returned deployment outside the approved identity: %s",
    async (patch) => {
      const fx = fixture([deployment(), deployment("READY", patch)]);
      await expect(
        deployHostedPreview({ app: "admin", env, ...fx }),
      ).rejects.toThrow();
    },
  );
  it("withholds provider response text and arbitrary error messages", async () => {
    const request = vi.fn(async () => ({
      ok: false,
      status: 403,
      json: async () => ({ error: "private-provider-text" }),
    }));
    await expect(
      deployHostedPreview({ app: "admin", env, request }),
    ).rejects.toThrow("HTTP 403");
    const network = vi.fn(async () => {
      throw new Error("private-network-text");
    });
    await expect(
      deployHostedPreview({ app: "admin", env, request: network }),
    ).rejects.not.toThrow("private-network-text");
  });
  it("waits through queued builds and rejects terminal failure without provider text", async () => {
    const fx = fixture([
      deployment("QUEUED"),
      deployment("BUILDING"),
      deployment("ERROR", { errorMessage: "private-provider-text" }),
    ]);
    await expect(
      deployHostedPreview({ app: "admin", env, ...fx }),
    ).rejects.toThrow("ERROR");
    expect(fx.request.mock.calls).toHaveLength(3);
  });
  it("rejects a CANCELED canary instead of treating an ignored build as qualified", async () => {
    const fx = fixture([deployment("CANCELED"), deployment("CANCELED")]);
    await expect(
      deployHostedPreview({ app: "admin", env, ...fx }),
    ).rejects.toThrow("Hosted preview ended in CANCELED");
    expect(fx.request.mock.calls).toHaveLength(2);
    expect(fx.sleep).not.toHaveBeenCalled();
    expect(
      fx.request.mock.calls.some(([, options]) => options.method === "PATCH"),
    ).toBe(false);
  });
  it("cancels only the created owned deployment when its bounded wait expires", async () => {
    const fx = fixture([deployment(), deployment()]);
    let ticks = 0;
    const now = () => {
      ticks += 13 * 60 * 1000;
      return ticks;
    };
    await expect(
      deployHostedPreview({ app: "admin", env, ...fx, now }),
    ).rejects.toThrow("timed out");
    expect(
      fx.request.mock.calls.some(
        ([url, options]) =>
          url.includes("/dpl_fixture123/cancel") && options.method === "PATCH",
      ),
    ).toBe(true);
  });
});

describe("hosted build ownership before first poll", () => {
  it("cancels an exactly identified creation when its first poll fails", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => deployment(),
      })
      .mockRejectedValueOnce(new Error("private-first-poll-error"))
      .mockResolvedValueOnce({ ok: true, status: 200 });
    await expect(
      deployHostedPreview({ app: "admin", env, request }),
    ).rejects.toThrow("transport failed");
    expect(request.mock.calls[2][0]).toContain("/dpl_fixture123/cancel");
    expect(request.mock.calls[2][1].method).toBe("PATCH");
  });
  it("recovers complete identity before canceling an initially incomplete creation", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: "dpl_fixture123" }),
      })
      .mockRejectedValueOnce(new Error("private-first-poll-error"))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => deployment(),
      })
      .mockResolvedValueOnce({ ok: true, status: 200 });
    await expect(
      deployHostedPreview({ app: "admin", env, request }),
    ).rejects.toThrow("transport failed");
    expect(request.mock.calls[2][0]).toContain("withGitRepoInfo=true");
    expect(request.mock.calls[3][0]).toContain("/dpl_fixture123/cancel");
  });
  it("does not cancel an incomplete creation whose ownership cannot be recovered", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: "dpl_fixture123" }),
      })
      .mockRejectedValue(new Error("private-network-error"));
    await expect(
      deployHostedPreview({ app: "admin", env, request }),
    ).rejects.toThrow("cleanup unconfirmed");
    expect(
      request.mock.calls.some(([, options]) => options.method === "PATCH"),
    ).toBe(false);
  });
});

import { describe, expect, it, vi } from "vitest";

import {
  PRODUCTION_HOSTS,
  checkDeploymentHealth,
  deployRelease,
  selectReleaseApps,
  verifyLive,
} from "../../../../scripts/release/vercel-release.mjs";
import { EXPECTED_PROJECTS } from "../../../../scripts/verify/vercel-build-controls.mjs";
import {
  BYPASS_ENV,
  PROJECT_REF as ref,
  RELEASE_SHA as sha,
  fakeHealth,
  fakeVercel,
  forbidNetwork,
  healthy,
  isCreateDeploymentBody,
  noSleep,
  silent,
} from "./support/vercel-release-fixtures";

forbidNetwork();

describe("release job: live deployment verification and forced release", () => {
  it("verifyLive retries while an old deployment ID answers (even with a different project ref) and succeeds once the new ID answers", async () => {
    let calls = 0;
    const request = vi.fn(async () => {
      calls += 1;
      if (calls === 1) {
        return {
          status: 200,
          json: async () =>
            healthy({
              release: { commit: "b".repeat(40), deploymentId: "dpl_old1" },
              database: {
                supabaseProjectRef: "btewedpsxwsjczvmegby",
                environment: "disposable",
              },
            }).body,
        } as Response;
      }
      if (calls === 2) {
        return {
          status: 200,
          json: async () =>
            healthy({
              release: { commit: sha },
              database: {
                supabaseProjectRef: "btewedpsxwsjczvmegby",
                environment: "disposable",
              },
            }).body,
        } as Response;
      }
      return {
        status: 200,
        json: async () =>
          healthy({
            release: { commit: sha, deploymentId: "dpl_new1" },
          }).body,
      } as Response;
    });

    const body = await verifyLive({
      app: "admin",
      sha,
      projectRef: ref,
      deploymentId: "dpl_new1",
      bypassSecret: "bypass",
      request,
      sleep: noSleep,
      attempts: 5,
    });
    expect(calls).toBe(3);
    expect(body.release.deploymentId).toBe("dpl_new1");
  });

  it("verifyLive fails after the bound when an old deployment ID keeps answering on the same commit and ref, naming both IDs", async () => {
    const request = fakeHealth({
      "*": healthy({
        release: { commit: sha, deploymentId: "dpl_old1" },
      }),
    });

    await expect(
      verifyLive({
        app: "admin",
        sha,
        projectRef: ref,
        deploymentId: "dpl_new1",
        bypassSecret: "bypass",
        request,
        sleep: noSleep,
        attempts: 3,
      }),
    ).rejects.toThrow(
      /admin \(admin\.asymmetric\.al\): promotion of dpl_new1 was requested and could not be verified.*expected dpl_new1, last seen dpl_old1.*Check what admin\.asymmetric\.al serves before dispatching again or rolling back/,
    );
    await expect(
      verifyLive({
        app: "admin",
        sha,
        projectRef: ref,
        deploymentId: "dpl_new1",
        bypassSecret: "bypass",
        request,
        sleep: noSleep,
        attempts: 1,
      }),
    ).rejects.not.toThrow(/not promoted/);
    expect(request).toHaveBeenCalledTimes(4);
  });

  it("verifyLive stops immediately without retrying when the confirmed new deployment ID reads a wrong Supabase project ref", async () => {
    const request = fakeHealth({
      "*": healthy({
        release: { commit: sha, deploymentId: "dpl_new1" },
        database: {
          supabaseProjectRef: "btewedpsxwsjczvmegby",
          environment: "disposable",
        },
      }),
    });

    await expect(
      verifyLive({
        app: "admin",
        sha,
        projectRef: ref,
        deploymentId: "dpl_new1",
        bypassSecret: "bypass",
        request,
        sleep: noSleep,
        attempts: 5,
      }),
    ).rejects.toThrow(/reads Supabase project btewedpsxwsjczvmegby/);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("verifyLive retries status-only ok and behind answers (e.g. rotated bypass secret on old deployment) until the new deployment ID answers", async () => {
    let calls = 0;
    const request = vi.fn(async () => {
      calls += 1;
      if (calls === 1) {
        return {
          status: 200,
          json: async () => ({ status: "ok" }),
        } as Response;
      }
      if (calls === 2) {
        return {
          status: 503,
          json: async () => ({ status: "behind" }),
        } as Response;
      }
      return {
        status: 200,
        json: async () =>
          healthy({
            release: { commit: sha, deploymentId: "dpl_new1" },
          }).body,
      } as Response;
    });

    const body = await verifyLive({
      app: "admin",
      sha,
      projectRef: ref,
      deploymentId: "dpl_new1",
      bypassSecret: "bypass",
      request,
      sleep: noSleep,
      attempts: 5,
    });
    expect(calls).toBe(3);
    expect(body.release.deploymentId).toBe("dpl_new1");
  });

  it("verifyLive fails after the bound on status-only answers, naming app, domain, expected ID, none identified and never-identified detail without saying not promoted", async () => {
    const request = fakeHealth({
      "*": { status: 200, body: { status: "ok" } },
    });

    let message = "";
    try {
      await verifyLive({
        app: "donor",
        sha,
        projectRef: ref,
        deploymentId: "dpl_new2",
        bypassSecret: "bypass",
        request,
        sleep: noSleep,
        attempts: 3,
      });
    } catch (error) {
      message = (error as Error).message;
    }

    expect(request).toHaveBeenCalledTimes(3);
    expect(message).toContain("donor");
    expect(message).toContain(PRODUCTION_HOSTS.donor);
    expect(message).toContain("dpl_new2");
    expect(message).toContain("none identified");
    expect(message).toContain("never saw an identified answer");
    expect(message).toContain(
      "promotion of dpl_new2 was requested and could not be verified",
    );
    expect(message).toContain(
      `Check what ${PRODUCTION_HOSTS.donor} serves before dispatching again or rolling back.`,
    );
    expect(message).not.toContain("not promoted");
  });

  it("stops immediately when a confirmed new deployment reports a wrong project ref even on 503, while still retrying 503 answers without a ref", async () => {
    const wrongRef503 = fakeHealth({
      "*": {
        status: 503,
        body: {
          status: "unknown",
          release: { commit: sha, deploymentId: "dpl_new1" },
          database: {
            supabaseProjectRef: "btewedpsxwsjczvmegby",
            environment: "disposable",
          },
        },
      },
    });

    let stagedMessage = "";
    try {
      await checkDeploymentHealth({
        url: "https://admin-1.vercel.app",
        bypassSecret: "bypass",
        sha,
        projectRef: ref,
        deploymentId: "dpl_new1",
        request: wrongRef503,
        sleep: noSleep,
        attempts: 4,
      });
    } catch (error) {
      stagedMessage = (error as Error).message;
    }
    expect(wrongRef503).toHaveBeenCalledTimes(1);
    expect(stagedMessage).toMatch(
      /reads Supabase project btewedpsxwsjczvmegby.*not promoted/,
    );

    wrongRef503.mockClear();
    let liveMessage = "";
    try {
      await verifyLive({
        app: "admin",
        sha,
        projectRef: ref,
        deploymentId: "dpl_new1",
        bypassSecret: "bypass",
        request: wrongRef503,
        sleep: noSleep,
        attempts: 4,
      });
    } catch (error) {
      liveMessage = (error as Error).message;
    }
    expect(wrongRef503).toHaveBeenCalledTimes(1);
    expect(liveMessage).toContain(
      "reads Supabase project btewedpsxwsjczvmegby",
    );
    expect(liveMessage).toContain(
      "promotion of dpl_new1 was requested and could not be verified",
    );
    expect(liveMessage).not.toContain("not promoted");

    let calls = 0;
    const noRef503ThenOk = vi.fn(async () => {
      calls += 1;
      if (calls === 1) {
        return {
          status: 503,
          json: async () => ({
            status: "error",
            release: { commit: sha, deploymentId: "dpl_new1" },
            error: { code: "PGRST202" },
          }),
        } as Response;
      }
      return {
        status: 200,
        json: async () =>
          healthy({
            release: { commit: sha, deploymentId: "dpl_new1" },
          }).body,
      } as Response;
    });

    const body = await verifyLive({
      app: "admin",
      sha,
      projectRef: ref,
      deploymentId: "dpl_new1",
      bypassSecret: "bypass",
      request: noRef503ThenOk,
      sleep: noSleep,
      attempts: 4,
    });
    expect(calls).toBe(2);
    expect(body.release.deploymentId).toBe("dpl_new1");
  });

  it("models forced apps already serving the commit: stages with forceNew and CORE_RELEASE_FORCE_BUILD_SHA, switches production hosts on promote, waits out stale old IDs, and logs matched IDs", async () => {
    const plan = selectReleaseApps({
      liveCommits: { admin: sha, donor: sha, missionary: sha },
      listChangedFiles: () => [],
      buildAll: true,
    });
    const apps = plan.filter((item) => item.build).map((item) => item.app);
    expect(apps).toEqual(["admin", "donor", "missionary"]);

    // Stateful model: production domains serve old deployment IDs of the same
    // commit until promotion, answer one stale old-ID response during alias
    // propagation, then serve the promoted deployment IDs.
    const { call: baseCall, calls } = fakeVercel();
    const liveIdByHost = new Map<string, string>([
      [PRODUCTION_HOSTS.admin, "dpl_oldAdmin"],
      [PRODUCTION_HOSTS.donor, "dpl_oldDonor"],
      [PRODUCTION_HOSTS.missionary, "dpl_oldMissionary"],
    ]);
    const promotedIdByHost = new Map<string, string>();
    const staleLeftByHost = new Map<string, number>();
    const stagedIdByHost = new Map<string, string>();

    const call = vi.fn(
      async (pathname: string, method = "GET", body?: unknown) => {
        const res = await baseCall(pathname, method, body);
        if (pathname.startsWith("/v13/deployments?") && method === "POST") {
          if (!isCreateDeploymentBody(body)) {
            throw new Error("expected create deployment body");
          }
          const id = (res as { id: string }).id;
          const num = id.slice("dpl_".length);
          stagedIdByHost.set(`${body.name}-${num}.vercel.app`, id);
        }
        const promoteMatch =
          /^\/v10\/projects\/(prj_[A-Za-z0-9]+)\/promote\/(dpl_\w+)\?/.exec(
            pathname,
          );
        if (promoteMatch && method === "POST") {
          const appKey = EXPECTED_PROJECTS.find(
            (p) => p.projectId === promoteMatch[1],
          )!.key as keyof typeof PRODUCTION_HOSTS;
          const host = PRODUCTION_HOSTS[appKey];
          promotedIdByHost.set(host, promoteMatch[2]!);
          staleLeftByHost.set(host, 1);
        }
        return res;
      },
    );

    const request = vi.fn(async (input: URL | string) => {
      const host = new URL(String(input)).host;
      if (stagedIdByHost.has(host)) {
        return {
          status: 200,
          json: async () =>
            healthy({
              release: { commit: sha, deploymentId: stagedIdByHost.get(host) },
            }).body,
        } as Response;
      }
      const staleLeft = staleLeftByHost.get(host) ?? 0;
      if (staleLeft > 0) {
        staleLeftByHost.set(host, staleLeft - 1);
        return {
          status: 200,
          json: async () =>
            healthy({
              release: { commit: sha, deploymentId: liveIdByHost.get(host) },
              database: {
                supabaseProjectRef: "btewedpsxwsjczvmegby",
                environment: "disposable",
              },
            }).body,
        } as Response;
      }
      const activeId = promotedIdByHost.get(host) ?? liveIdByHost.get(host);
      return {
        status: 200,
        json: async () =>
          healthy({
            release: { commit: sha, deploymentId: activeId },
          }).body,
      } as Response;
    });

    const logs: string[] = [];
    const staged = await deployRelease({
      apps,
      sha,
      projectRef: ref,
      env: BYPASS_ENV,
      call,
      request,
      sleep: noSleep,
      log: (line: string) => logs.push(line),
    });

    expect(staged.map((s) => [s.app, s.id])).toEqual([
      ["admin", "dpl_1"],
      ["donor", "dpl_2"],
      ["missionary", "dpl_3"],
    ]);

    const creates = calls.filter(
      (c) => c.method === "POST" && c.path.startsWith("/v13/deployments?"),
    );
    expect(creates).toHaveLength(3);
    for (const create of creates) {
      expect(create.path).toContain("forceNew=1");
      expect(create.body).toMatchObject({
        target: "production",
        gitSource: { ref: "production", sha },
        build: { env: { CORE_RELEASE_FORCE_BUILD_SHA: sha } },
      });
    }

    const expectedBypassByHost: Record<string, string> = {
      "admin-1.vercel.app": "bypass-admin",
      "donor-2.vercel.app": "bypass-donor",
      "missionary-3.vercel.app": "bypass-missionary",
      [PRODUCTION_HOSTS.admin]: "bypass-admin",
      [PRODUCTION_HOSTS.donor]: "bypass-donor",
      [PRODUCTION_HOSTS.missionary]: "bypass-missionary",
    };
    for (const [host, secret] of Object.entries(expectedBypassByHost)) {
      const checkCall = request.mock.calls.find(
        ([input]) => new URL(String(input)).host === host,
      );
      expect(checkCall, host).toBeDefined();
      expect((checkCall![1] as RequestInit).headers).toEqual({
        "x-vercel-protection-bypass": secret,
      });
    }

    const promotes = calls.filter((c) => c.path.includes("/promote/"));
    expect(promotes.map((c) => c.path)).toEqual([
      expect.stringContaining("/promote/dpl_1?"),
      expect.stringContaining("/promote/dpl_3?"),
      expect.stringContaining("/promote/dpl_2?"),
    ]);

    expect(logs).toContain("admin: staged dpl_1.");
    expect(logs).toContain("donor: staged dpl_2.");
    expect(logs).toContain("missionary: staged dpl_3.");
    expect(logs).toContain("admin: promoted dpl_1 without a rebuild.");
    expect(logs).toContain("donor: promoted dpl_2 without a rebuild.");
    expect(logs).toContain("missionary: promoted dpl_3 without a rebuild.");
    expect(logs).toContain(
      "admin: the production domain serves dpl_1 for this release.",
    );
    expect(logs).toContain(
      "donor: the production domain serves dpl_2 for this release.",
    );
    expect(logs).toContain(
      "missionary: the production domain serves dpl_3 for this release.",
    );
  });

  it("fails forced deploy if a production domain stays stuck on the old deployment ID for the same commit and ref", async () => {
    const stuckVercel = fakeVercel();
    const stuckRequest = fakeHealth({
      "admin-1.vercel.app": healthy({
        release: { commit: sha, deploymentId: "dpl_1" },
      }),
      [PRODUCTION_HOSTS.admin]: healthy({
        release: { commit: sha, deploymentId: "dpl_oldAdmin" },
      }),
    });
    await expect(
      deployRelease({
        apps: ["admin"],
        sha,
        projectRef: ref,
        env: BYPASS_ENV,
        call: stuckVercel.call,
        request: stuckRequest,
        sleep: noSleep,
        log: silent,
      }),
    ).rejects.toThrow(/dpl_1.*dpl_oldAdmin|dpl_oldAdmin.*dpl_1/);
  });

  it("refuses to promote any forced app when a staged deployment reads the wrong Supabase project ref", async () => {
    const wrongRefVercel = fakeVercel();
    await expect(
      deployRelease({
        apps: ["admin", "donor", "missionary"],
        sha,
        projectRef: ref,
        env: BYPASS_ENV,
        call: wrongRefVercel.call,
        request: fakeHealth({
          "admin-1.vercel.app": healthy({
            release: { commit: sha, deploymentId: "dpl_1" },
          }),
          "donor-2.vercel.app": healthy({
            release: { commit: sha, deploymentId: "dpl_2" },
            database: { supabaseProjectRef: "btewedpsxwsjczvmegby" },
          }),
          "missionary-3.vercel.app": healthy({
            release: { commit: sha, deploymentId: "dpl_3" },
          }),
        }),
        sleep: noSleep,
        log: silent,
      }),
    ).rejects.toThrow(/reads Supabase project btewedpsxwsjczvmegby/);
    expect(
      wrongRefVercel.calls.filter((c) => c.path.includes("/promote/")),
    ).toHaveLength(0);
  });

  it("refuses to promote a forced app when its staged deployment omits deploymentId", async () => {
    const missingIdVercel = fakeVercel();
    await expect(
      deployRelease({
        apps: ["admin"],
        sha,
        projectRef: ref,
        env: BYPASS_ENV,
        call: missingIdVercel.call,
        request: fakeHealth({
          "admin-1.vercel.app": healthy({
            release: { commit: sha, deploymentId: null },
          }),
        }),
        sleep: noSleep,
        log: silent,
      }),
    ).rejects.toThrow(/expected deployment dpl_1, saw unknown/);
    expect(
      missingIdVercel.calls.filter((c) => c.path.includes("/promote/")),
    ).toHaveLength(0);
  });
});

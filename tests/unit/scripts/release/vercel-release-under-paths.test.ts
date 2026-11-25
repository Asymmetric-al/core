import { existsSync, mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { describe, expect, it, vi } from "vitest";

import {
  PROJECT_REF as ref,
  RELEASE_SHA as sha,
  fakeVercel,
  forbidNetwork,
  healthy,
  noSleep,
  silent,
} from "./support/vercel-release-fixtures";
import {
  PRODUCTION_HOSTS,
  checkDeploymentHealth,
  deployRelease,
  readLiveCommit,
  registerJobFunctions,
  runCli,
  verifyLive,
} from "../../../../scripts/release/vercel-release.mjs";

forbidNetwork();

const REFUSAL =
  "CORE_SERVE_UNDER_PATHS=1 is refused on production builds (VERCEL_ENV/VERCEL_TARGET_ENV=production).";
const COULD_NOT_REACH =
  "The migration health check did not pass: the health route could not be reached; not promoted.";

type Answer = { status: number; body: unknown };

const asFetch = (fake: unknown) => fake as typeof fetch;

const notFoundPage = () =>
  new Response("<!DOCTYPE html><html><body>Not found</body></html>", {
    status: 404,
    headers: { "content-type": "text/html; charset=utf-8" },
  });

const json = ({ status, body }: Answer) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

function answersAt(answers: Record<string, Answer | Answer[]>) {
  const seen = new Map<string, number>();
  return vi.fn(async (input: URL | RequestInfo, _init?: RequestInit) => {
    const url = String(input);
    const answer = answers[url];
    if (answer === undefined) return notFoundPage();
    if (!Array.isArray(answer)) return json(answer);
    const index = seen.get(url) ?? 0;
    seen.set(url, index + 1);
    return json(answer[Math.min(index, answer.length - 1)]);
  });
}

function vercelApi(call: ReturnType<typeof fakeVercel>["call"]) {
  return vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
    const url = new URL(String(input));
    if (url.host !== "api.vercel.com") {
      throw new Error("a test reached the network");
    }
    const body = await call(
      `${url.pathname}${url.search}`,
      init?.method ?? "GET",
      init?.body ? JSON.parse(String(init.body)) : undefined,
    );
    return new Response(JSON.stringify(body), { status: 200 });
  });
}

describe("runCli hands its request and sleep to every step that calls out", () => {
  it("register-jobs calls the given request and never the global fetch", async () => {
    const request = vi.fn(
      async (_input: URL | RequestInfo, _init?: RequestInit) =>
        new Response(null, { status: 200 }),
    );
    await runCli(["register-jobs"], {}, silent, { request: asFetch(request) });
    expect(
      request.mock.calls.map(([input, init]) => [String(input), init?.method]),
    ).toEqual([["https://admin.asymmetric.al/api/inngest", "PUT"]]);
  });

  it("check calls the given request and waits with the given sleep", async () => {
    const request = answersAt({});
    const sleep = vi.fn(noSleep);
    await expect(
      runCli(
        ["check", "--app", "donor", "--url", "https://d-1.vercel.app"],
        {},
        silent,
        { request: asFetch(request), sleep },
      ),
    ).rejects.toThrow(
      "The migration health check did not pass: the health route could not be reached; not promoted.",
    );
    expect(request.mock.calls.map(([input]) => String(input))).toEqual(
      Array(6).fill("https://d-1.vercel.app/api/health/migrations"),
    );
    expect(sleep).toHaveBeenCalledTimes(5);
  });

  it("deploy checks the staged and live deployments with the given request and sleep", async () => {
    const { call } = fakeVercel();
    vi.stubGlobal("fetch", vercelApi(call));
    const identified = healthy({
      release: { commit: sha, deploymentId: "dpl_1" },
    });
    const request = answersAt({
      "https://admin-1.vercel.app/api/health/migrations": [
        { status: 503, body: { status: "error" } },
        identified,
      ],
      "https://admin.asymmetric.al/api/health/migrations": identified,
    });
    const sleep = vi.fn(noSleep);
    await runCli(
      ["deploy"],
      {
        VERCEL_TOKEN: "token-fixture",
        RELEASE_SUPABASE_PROJECT_REF: ref,
        RELEASE_SHA: sha,
        RELEASE_APPS: "admin",
        VERCEL_ADMIN_AUTOMATION_BYPASS_SECRET: "bypass",
      },
      silent,
      { request: asFetch(request), sleep },
    );
    expect(request.mock.calls.map(([input]) => String(input))).toEqual([
      "https://admin-1.vercel.app/api/health/migrations",
      "https://admin-1.vercel.app/api/health/migrations",
      `https://${PRODUCTION_HOSTS.admin}/api/health/migrations`,
    ]);
    expect(sleep).toHaveBeenCalledTimes(1);
  });
});

const urlsOf = (request: ReturnType<typeof answersAt>) =>
  request.mock.calls.map(([input]) => String(input));

const checkArgs = (app: string, url: string) => [
  "check",
  "--app",
  app,
  "--url",
  url,
];

describe("check reads the migration health route under the prefix its environment states", () => {
  it.each([
    [
      "admin",
      "VERCEL_ADMIN_AUTOMATION_BYPASS_SECRET",
      "https://a-1.vercel.app/admin/api/health/migrations",
    ],
    [
      "missionary",
      "VERCEL_MISSIONARY_AUTOMATION_BYPASS_SECRET",
      "https://m-1.vercel.app/missionary/api/health/migrations",
    ],
  ])(
    "with CORE_SERVE_UNDER_PATHS=1, %s requests exactly the prefixed route with its bypass header and passes",
    async (app, secretName, healthUrl) => {
      const origin = new URL(healthUrl).origin;
      const request = answersAt({ [healthUrl]: healthy() });
      const logs: string[] = [];
      await runCli(
        checkArgs(app, origin),
        { CORE_SERVE_UNDER_PATHS: "1", [secretName]: "b" },
        (line: string) => logs.push(line),
        { request: asFetch(request), sleep: noSleep },
      );
      expect(urlsOf(request)).toEqual([healthUrl]);
      expect(urlsOf(request)).not.toContain(`${origin}/api/health/migrations`);
      expect(request.mock.calls[0][1]).toMatchObject({
        redirect: "error",
        cache: "no-store",
        headers: { "x-vercel-protection-bypass": "b" },
      });
      expect(logs).toEqual([
        `${app}: migration health ok on ${ref} (disposable).`,
      ]);
    },
  );

  it("with CORE_SERVE_UNDER_PATHS=1, donor still reads the root", async () => {
    const healthUrl = "https://d-1.vercel.app/api/health/migrations";
    const request = answersAt({ [healthUrl]: healthy() });
    await runCli(
      checkArgs("donor", "https://d-1.vercel.app"),
      {
        CORE_SERVE_UNDER_PATHS: "1",
        VERCEL_DONOR_AUTOMATION_BYPASS_SECRET: "b",
      },
      silent,
      { request: asFetch(request), sleep: noSleep },
    );
    expect(urlsOf(request)).toEqual([healthUrl]);
  });

  it.each([
    ["unset", {}],
    ["empty", { CORE_SERVE_UNDER_PATHS: "" }],
    ["0", { CORE_SERVE_UNDER_PATHS: "0" }],
  ])(
    "with the switch %s, every app reads the root",
    async (_label, switchEnv) => {
      for (const app of ["admin", "missionary", "donor"]) {
        const healthUrl = `https://${app}-1.vercel.app/api/health/migrations`;
        const request = answersAt({ [healthUrl]: healthy() });
        await runCli(
          checkArgs(app, `https://${app}-1.vercel.app`),
          { ...switchEnv },
          silent,
          { request: asFetch(request), sleep: noSleep },
        );
        expect(urlsOf(request), app).toEqual([healthUrl]);
      }
    },
  );

  it.each([
    ["1", "https://a-1.vercel.app/admin/api/health/migrations"],
    ["0", "https://a-1.vercel.app/api/health/migrations"],
  ])(
    "with the switch %s, a path in --url is dropped: only its origin counts",
    async (value, healthUrl) => {
      const request = answersAt({ [healthUrl]: healthy() });
      await runCli(
        checkArgs("admin", "https://a-1.vercel.app/x/y?z=1"),
        { CORE_SERVE_UNDER_PATHS: value },
        silent,
        { request: asFetch(request), sleep: noSleep },
      );
      expect(urlsOf(request)).toEqual([healthUrl]);
    },
  );

  it.each([
    ["true", 'Invalid CORE_SERVE_UNDER_PATHS value "true"'],
    [" 1", 'Invalid CORE_SERVE_UNDER_PATHS value " 1"'],
  ])(
    "refuses the switch value %j before any request, as the build does",
    async (value, message) => {
      const request = answersAt({});
      await expect(
        runCli(
          checkArgs("admin", "https://a-1.vercel.app"),
          { CORE_SERVE_UNDER_PATHS: value },
          silent,
          { request: asFetch(request), sleep: noSleep },
        ),
      ).rejects.toThrow(message);
      expect(request).not.toHaveBeenCalled();
    },
  );

  it("refuses CORE_SERVE_UNDER_PATHS=1 with a production target before any request, as the build does", async () => {
    const request = answersAt({});
    await expect(
      runCli(
        checkArgs("admin", "https://a-1.vercel.app"),
        { CORE_SERVE_UNDER_PATHS: "1", VERCEL_ENV: "production" },
        silent,
        { request: asFetch(request), sleep: noSleep },
      ),
    ).rejects.toThrow(REFUSAL);
    expect(request).not.toHaveBeenCalled();
  });
});

describe("a wrong statement of the mode fails closed for the two dashboards", () => {
  it.each([
    ["admin", "/admin"],
    ["missionary", "/missionary"],
  ])(
    "stated on while %s answers only at the root: the check stops and names no success",
    async (app, prefix) => {
      const origin = `https://${app}-1.vercel.app`;
      const request = answersAt({
        [`${origin}/api/health/migrations`]: healthy(),
      });
      const logs: string[] = [];
      await expect(
        runCli(
          checkArgs(app, origin),
          { CORE_SERVE_UNDER_PATHS: "1" },
          (line: string) => logs.push(line),
          { request: asFetch(request), sleep: noSleep },
        ),
      ).rejects.toThrow(COULD_NOT_REACH);
      expect(urlsOf(request)).toEqual(
        Array(6).fill(`${origin}${prefix}/api/health/migrations`),
      );
      expect(logs).toEqual([]);
    },
  );

  it.each([
    ["admin", "/admin"],
    ["missionary", "/missionary"],
  ])(
    "stated off while %s answers only under its prefix: the check stops and names no success",
    async (app, prefix) => {
      const origin = `https://${app}-1.vercel.app`;
      const request = answersAt({
        [`${origin}${prefix}/api/health/migrations`]: healthy(),
      });
      const logs: string[] = [];
      await expect(
        runCli(checkArgs(app, origin), {}, (line: string) => logs.push(line), {
          request: asFetch(request),
          sleep: noSleep,
        }),
      ).rejects.toThrow(COULD_NOT_REACH);
      expect(urlsOf(request)).toEqual(
        Array(6).fill(`${origin}/api/health/migrations`),
      );
      expect(logs).toEqual([]);
    },
  );
});

describe("the release job's production steps refuse CORE_SERVE_UNDER_PATHS=1 before any call", () => {
  it.each([
    ["one app", ["admin"]],
    ["three apps", ["admin", "donor", "missionary"]],
    ["no app", []],
  ])(
    "deployRelease with %s stops with the build's refusal and calls neither Vercel nor a deployment",
    async (_label, apps) => {
      const { call } = fakeVercel();
      const request = answersAt({});
      await expect(
        deployRelease({
          apps,
          sha,
          projectRef: ref,
          env: { CORE_SERVE_UNDER_PATHS: "1" },
          call,
          request: asFetch(request),
          sleep: noSleep,
          log: silent,
        }),
      ).rejects.toThrow(REFUSAL);
      expect(call).not.toHaveBeenCalled();
      expect(request).not.toHaveBeenCalled();
    },
  );

  it("deployRelease stops on a switch value the build refuses, before any call", async () => {
    const { call } = fakeVercel();
    await expect(
      deployRelease({
        apps: ["donor"],
        sha,
        projectRef: ref,
        env: { CORE_SERVE_UNDER_PATHS: "true" },
        call,
        request: asFetch(answersAt({})),
        sleep: noSleep,
        log: silent,
      }),
    ).rejects.toThrow('Invalid CORE_SERVE_UNDER_PATHS value "true"');
    expect(call).not.toHaveBeenCalled();
  });

  it("register-jobs stops with the build's refusal before its request", async () => {
    const request = answersAt({});
    await expect(
      runCli(["register-jobs"], { CORE_SERVE_UNDER_PATHS: "1" }, silent, {
        request: asFetch(request),
      }),
    ).rejects.toThrow(REFUSAL);
    expect(request).not.toHaveBeenCalled();
  });

  it.each([
    ["changed", {}],
    ["all", { RELEASE_APPS_MODE: "all" }],
  ])(
    "plan in %s mode stops with the build's refusal before reading any live commit or writing output",
    async (_label, modeEnv) => {
      const dir = mkdtempSync(path.join(os.tmpdir(), "vercel-release-paths-"));
      try {
        const outputFile = path.join(dir, "github-output");
        const request = answersAt({});
        const logs: string[] = [];
        await expect(
          runCli(
            ["plan"],
            {
              RELEASE_SHA: sha,
              GITHUB_OUTPUT: outputFile,
              CORE_SERVE_UNDER_PATHS: "1",
              ...modeEnv,
            },
            (line: string) => logs.push(line),
            { request: asFetch(request), listChangedFiles: () => [] },
          ),
        ).rejects.toThrow(REFUSAL);
        expect(request).not.toHaveBeenCalled();
        expect(logs).toEqual([]);
        expect(existsSync(outputFile)).toBe(false);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    },
  );

  it.each([
    ["an app", "admin"],
    ["no app", ""],
  ])(
    "deploy with %s stops with the build's refusal before any Vercel or HTTP call",
    async (_label, releaseApps) => {
      const { call } = fakeVercel();
      const vercel = vercelApi(call);
      vi.stubGlobal("fetch", vercel);
      const request = answersAt({});
      const logs: string[] = [];
      await expect(
        runCli(
          ["deploy"],
          {
            VERCEL_TOKEN: "token-fixture",
            RELEASE_SUPABASE_PROJECT_REF: ref,
            RELEASE_SHA: sha,
            RELEASE_APPS: releaseApps,
            CORE_SERVE_UNDER_PATHS: "1",
          },
          (line: string) => logs.push(line),
          { request: asFetch(request), sleep: noSleep },
        ),
      ).rejects.toThrow(REFUSAL);
      expect(vercel).not.toHaveBeenCalled();
      expect(request).not.toHaveBeenCalled();
      expect(logs).toEqual([]);
    },
  );
});

describe("with the switch off the production steps read today's addresses", () => {
  const OFF: Array<[string, Record<string, string>]> = [
    ["unset", {}],
    ["empty", { CORE_SERVE_UNDER_PATHS: "" }],
    ["0", { CORE_SERVE_UNDER_PATHS: "0" }],
  ];

  it.each(OFF)(
    "plan reads /api/health at each production host (switch %s)",
    async (_label, switchEnv) => {
      const request = vi.fn(
        async (_input: URL | RequestInfo, _init?: RequestInit) =>
          new Response(
            JSON.stringify({ observability: { release: { commit: sha } } }),
            { status: 200 },
          ),
      );
      await runCli(["plan"], { RELEASE_SHA: sha, ...switchEnv }, silent, {
        request: asFetch(request),
        listChangedFiles: () => [],
      });
      expect(request.mock.calls.map(([input]) => String(input))).toEqual([
        "https://admin.asymmetric.al/api/health",
        "https://donor.asymmetric.al/api/health",
        "https://missionary.asymmetric.al/api/health",
      ]);
    },
  );

  it.each(OFF)(
    "deployRelease checks the staged and the live deployment at the root (switch %s)",
    async (_label, switchEnv) => {
      const { call } = fakeVercel();
      const identified = healthy({
        release: { commit: sha, deploymentId: "dpl_1" },
      });
      const request = answersAt({
        "https://admin-1.vercel.app/api/health/migrations": identified,
        "https://admin.asymmetric.al/api/health/migrations": identified,
      });
      await deployRelease({
        apps: ["admin"],
        sha,
        projectRef: ref,
        env: { ...switchEnv },
        call,
        request: asFetch(request),
        sleep: noSleep,
        log: silent,
      });
      expect(urlsOf(request)).toEqual([
        "https://admin-1.vercel.app/api/health/migrations",
        "https://admin.asymmetric.al/api/health/migrations",
      ]);
    },
  );

  it.each(OFF)(
    "register-jobs sends PUT https://admin.asymmetric.al/api/inngest (switch %s)",
    async (_label, switchEnv) => {
      const request = vi.fn(
        async (_input: URL | RequestInfo, _init?: RequestInit) =>
          new Response(null, { status: 200 }),
      );
      await runCli(["register-jobs"], { ...switchEnv }, silent, {
        request: asFetch(request),
      });
      expect(
        request.mock.calls.map(([input, init]) => [
          init?.method,
          String(input),
        ]),
      ).toEqual([["PUT", "https://admin.asymmetric.al/api/inngest"]]);
    },
  );
});

describe("each caller puts the prefix it is given between the host and the path", () => {
  it("checkDeploymentHealth reads <origin><prefix>/api/health/migrations", async () => {
    const request = answersAt({
      "https://m-1.vercel.app/missionary/api/health/migrations": healthy(),
    });
    await checkDeploymentHealth({
      url: "https://m-1.vercel.app/elsewhere",
      pathPrefix: "/missionary",
      request: asFetch(request),
      sleep: noSleep,
      attempts: 1,
    });
    expect(urlsOf(request)).toEqual([
      "https://m-1.vercel.app/missionary/api/health/migrations",
    ]);
  });

  it("verifyLive reads the production host's <prefix>/api/health/migrations", async () => {
    const request = answersAt({
      "https://admin.asymmetric.al/admin/api/health/migrations": healthy({
        release: { commit: sha, deploymentId: "dpl_1" },
      }),
    });
    await verifyLive({
      app: "admin",
      sha,
      projectRef: ref,
      deploymentId: "dpl_1",
      pathPrefix: "/admin",
      request: asFetch(request),
      sleep: noSleep,
      attempts: 1,
    });
    expect(urlsOf(request)).toEqual([
      "https://admin.asymmetric.al/admin/api/health/migrations",
    ]);
  });

  it("readLiveCommit reads <host><prefix>/api/health, and a miss there is only 'live commit unknown'", async () => {
    const answered = vi.fn(
      async (_input: URL | RequestInfo, _init?: RequestInit) =>
        new Response(
          JSON.stringify({ observability: { release: { commit: sha } } }),
          { status: 200 },
        ),
    );
    await expect(
      readLiveCommit({
        app: "admin",
        pathPrefix: "/admin",
        request: asFetch(answered),
      }),
    ).resolves.toBe(sha);
    expect(answered.mock.calls.map(([input]) => String(input))).toEqual([
      "https://admin.asymmetric.al/admin/api/health",
    ]);

    const missed = answersAt({});
    await expect(
      readLiveCommit({
        app: "missionary",
        pathPrefix: "/missionary",
        request: asFetch(missed),
      }),
    ).resolves.toBeNull();
    expect(urlsOf(missed)).toEqual([
      "https://missionary.asymmetric.al/missionary/api/health",
    ]);
  });

  it("registerJobFunctions sends PUT <admin host><prefix>/api/inngest", async () => {
    const request = vi.fn(
      async (_input: URL | RequestInfo, _init?: RequestInit) =>
        new Response(null, { status: 200 }),
    );
    await registerJobFunctions({
      pathPrefix: "/admin",
      request: asFetch(request),
    });
    expect(
      request.mock.calls.map(([input, init]) => [init?.method, String(input)]),
    ).toEqual([["PUT", "https://admin.asymmetric.al/admin/api/inngest"]]);
  });
});

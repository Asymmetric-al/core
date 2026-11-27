import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

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
  TEAM,
  BYPASS_SECRETS,
  checkDeploymentHealth,
  deployRelease,
  readLiveRelease,
  registerJobFunctions,
  runCli,
  verifyLive,
} from "../../../../scripts/release/vercel-release.mjs";
import { EXPECTED_PROJECTS } from "../../../../scripts/verify/vercel-build-controls.mjs";

forbidNetwork();

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

function vercelThen(
  call: ReturnType<typeof fakeVercel>["call"],
  deployments: ReturnType<typeof answersAt>,
) {
  return vi.fn(async (input: URL | RequestInfo, init?: RequestInit) => {
    const url = new URL(String(input));
    if (url.host !== "api.vercel.com") return deployments(input, init);
    const body = await call(
      `${url.pathname}${url.search}`,
      init?.method ?? "GET",
      init?.body ? JSON.parse(String(init.body)) : undefined,
    );
    return body instanceof Response
      ? body
      : new Response(JSON.stringify(body), { status: 200 });
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

  it("deploy calls Vercel and checks the staged and live deployments with the given request and sleep", async () => {
    const { call, calls } = fakeVercel();
    const identified = healthy({
      release: { commit: sha, deploymentId: "dpl_1" },
    });
    const health = answersAt({
      "https://admin-1.vercel.app/api/health/migrations": [
        { status: 503, body: { status: "error" } },
        identified,
      ],
      "https://admin.asymmetric.al/api/health/migrations": identified,
    });
    const request = vercelThen(call, health);
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
    expect(health.mock.calls.map(([input]) => String(input))).toEqual([
      "https://admin-1.vercel.app/api/health/migrations",
      "https://admin-1.vercel.app/api/health/migrations",
      `https://${PRODUCTION_HOSTS.admin}/api/health/migrations`,
    ]);
    expect(calls.filter((c) => c.path.includes("/promote/"))).toHaveLength(1);
    expect(sleep).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["unset", {}],
    ["empty", { CORE_SERVE_UNDER_PATHS: "" }],
    ["0", { CORE_SERVE_UNDER_PATHS: "0" }],
  ])(
    "preflight reads each project through the given request, as before, with the switch %s",
    async (_label, switchEnv) => {
      const { call } = fakeVercel();
      const health = answersAt({});
      const request = vercelThen(call, health);
      const logs: string[] = [];
      await runCli(
        ["preflight"],
        { VERCEL_TOKEN: "token-fixture", ...switchEnv },
        (line: string) => logs.push(line),
        { request: asFetch(request) },
      );
      expect(
        request.mock.calls.map(([input, init]) => [
          init?.method,
          String(input),
          init?.redirect,
          init?.headers,
          init?.body,
        ]),
      ).toEqual(
        ["admin", "donor", "missionary"].map((app) => [
          "GET",
          `https://api.vercel.com/v9/projects/${
            EXPECTED_PROJECTS.find((project) => project.key === app)!.projectId
          }?teamId=${TEAM}`,
          "error",
          {
            Authorization: "Bearer token-fixture",
            "Content-Type": "application/json",
          },
          undefined,
        ]),
      );
      expect(health).not.toHaveBeenCalled();
      expect(logs).toEqual([
        "Every project stages production deployments until promotion.",
      ]);
    },
  );
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
      const request = answersAt({
        [healthUrl]: healthy({
          release: { commit: sha, serveUnderPaths: true },
        }),
      });
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
    const request = answersAt({
      [healthUrl]: healthy({ release: { commit: sha, serveUnderPaths: true } }),
    });
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
      const request = answersAt({
        [healthUrl]: healthy({
          release: { commit: sha, serveUnderPaths: value === "1" },
        }),
      });
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

describe("production release selection and registration under paths", () => {
  it.each(["preflight", "plan", "deploy", "register-jobs"])(
    "refuses invalid switch before %s calls out",
    async (step) => {
      const request = answersAt({});
      await expect(
        runCli(
          [step],
          { RELEASE_SHA: sha, CORE_SERVE_UNDER_PATHS: "true" },
          silent,
          { request: asFetch(request) },
        ),
      ).rejects.toThrow("Invalid CORE_SERVE_UNDER_PATHS");
      expect(request).not.toHaveBeenCalled();
    },
  );
  it("registers on the admin project under its prefix", async () => {
    const url = "https://admin.asymmetric.al/admin/api/inngest";
    const request = answersAt({ [url]: { status: 200, body: {} } });
    await runCli(["register-jobs"], { CORE_SERVE_UNDER_PATHS: "1" }, silent, {
      request: asFetch(request),
    });
    expect(urlsOf(request)).toEqual([url]);
    expect(request.mock.calls[0][1]?.method).toBe("PUT");
  });
  it.each(["preflight", "deploy"])(
    "%s without a token still stops on the token when the switch is unset",
    async (step) => {
      const request = answersAt({});
      await expect(
        runCli([step], {}, silent, { request: asFetch(request) }),
      ).rejects.toThrow("VERCEL_TOKEN is not set.");
      expect(request).not.toHaveBeenCalled();
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
    "plan reads authenticated migration health at each production host (D-18, recovery in either mode, switch %s)",
    async (_label, switchEnv) => {
      const request = vi.fn(
        async (_input: URL | RequestInfo, _init?: RequestInit) =>
          new Response(
            JSON.stringify({ release: { commit: sha }, status: "ok" }),
            { status: 200 },
          ),
      );
      await runCli(["plan"], { RELEASE_SHA: sha, ...switchEnv }, silent, {
        request: asFetch(request),
        listChangedFiles: () => [],
      });
      expect(request.mock.calls.map(([input]) => String(input))).toEqual([
        "https://admin.asymmetric.al/api/health/migrations",
        "https://donor.asymmetric.al/api/health/migrations",
        "https://missionary.asymmetric.al/api/health/migrations",
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

  it("reads the protected live commit and state under the dashboard prefix", async () => {
    const url = "https://admin.asymmetric.al/admin/api/health/migrations";
    const release = {
      commit: sha,
      deploymentId: "dpl_live",
      serveUnderPaths: true,
    };
    const request = answersAt({ [url]: healthy({ release }) });
    await expect(
      readLiveRelease({
        app: "admin",
        pathPrefix: "/admin",
        bypassSecret: "fixture",
        request: asFetch(request),
      }),
    ).resolves.toMatchObject(release);
    expect(urlsOf(request)).toEqual([url]);
    expect(request.mock.calls[0][1]?.headers).toEqual({
      "x-vercel-protection-bypass": "fixture",
    });
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

const releaseApps = ["admin", "donor", "missionary"] as const;

describe("release state convergence", () => {
  it.each([
    ["1", [true, true, false], ["admin", "donor", "missionary"]],
    ["1", [true, undefined, true], ["admin", "donor", "missionary"]],
    ["1", [true, true, "unreadable"], ["admin", "donor", "missionary"]],
    ["0", [false, true, false], ["admin", "donor", "missionary"]],
    ["0", [undefined, undefined, undefined], ["donor"]],
    ["0", ["unreadable", false, false], ["admin"]],
  ] as const)(
    "mode %s and live states %j select %j",
    async (mode, states, builds) => {
      const logs: string[] = [];
      const env = { RELEASE_SHA: sha, CORE_SERVE_UNDER_PATHS: mode } as Record<
        string,
        string
      >;
      const answers: Record<string, Answer> = {};
      for (const [index, app] of releaseApps.entries()) {
        env[BYPASS_SECRETS[app]] = app;
        const prefix = mode === "1" && app !== "donor" ? `/${app}` : "";
        const url = `https://${PRODUCTION_HOSTS[app]}${prefix}/api/health/migrations`;
        if (states[index] !== "unreadable")
          answers[url] = healthy({
            release: {
              commit:
                states.every((v) => v === undefined) && app === "donor"
                  ? "b".repeat(40)
                  : sha,
              deploymentId: `dpl_${app}`,
              serveUnderPaths: states[index],
            },
          });
      }
      const request = answersAt(answers);
      await runCli(["plan"], env, (line: string) => logs.push(line), {
        request: asFetch(request),
        listChangedFiles: (live: string) =>
          live === sha ? [] : ["apps/donor/app/page.tsx"],
      });
      expect(request.mock.calls).toHaveLength(3);
      for (const [index, app] of releaseApps.entries()) {
        expect(request.mock.calls[index][1]?.headers).toMatchObject({
          "x-vercel-protection-bypass": app,
        });
        expect(logs[index]).toContain(
          `${app}: ${builds.some((v) => v === app) ? "build" : "skip"}`,
        );
        expect(logs[index]).toContain(
          `serveUnderPaths=${states[index] ?? "absent"}`,
        );
        if (states[index] !== "unreadable")
          expect(logs[index]).toContain(`dpl_${app}`);
      }
    },
  );

  it.each([
    ["1", {}, ["dpl_2", "dpl_1", "dpl_3"], null],
    ["0", { dpl_3: 500 }, ["dpl_1", "dpl_3"], "missionary: not promoted"],
    ["1", { dpl_1: "transport" }, ["dpl_2", "dpl_1"], "admin: outcome unknown"],
  ] as const)(
    "orders promotions and stops on the first failed call, mode %s, %j",
    async (mode, failures, expected, reason) => {
      const { call, calls } = fakeVercel({ promoteAnswers: { ...failures } });
      const answers: Record<string, Answer> = {};
      releaseApps.forEach((app, i) => {
        const prefix = mode === "1" && app !== "donor" ? `/${app}` : "";
        for (const host of [
          PRODUCTION_HOSTS[app],
          `${app}-${i + 1}.vercel.app`,
        ]) {
          answers[`https://${host}${prefix}/api/health/migrations`] = healthy({
            release: {
              commit: sha,
              deploymentId: `dpl_${i + 1}`,
              serveUnderPaths: mode === "1",
            },
          });
        }
      });
      const health = answersAt(answers);
      const run = runCli(
        ["deploy"],
        {
          CORE_SERVE_UNDER_PATHS: mode,
          RELEASE_SHA: sha,
          RELEASE_SUPABASE_PROJECT_REF: ref,
          RELEASE_APPS: releaseApps.join(","),
          VERCEL_TOKEN: "fixture",
        },
        silent,
        { request: asFetch(vercelThen(call, health)), sleep: noSleep },
      );
      if (reason) {
        const error = await run.then(
          () => null,
          (err: Error) => err,
        );
        expect(error?.message).toMatch(/^promotion stopped part way:/);
        expect(error?.message).toContain(reason);
        expect(error?.message).toContain(
          mode === "1" ? "donor: promoted dpl_2" : "admin: promoted dpl_1",
        );
        expect(error?.message).toContain(
          mode === "1" ? "missionary: not attempted" : "donor: not attempted",
        );
        expect(error?.message).not.toContain("private");
        expect(urlsOf(health)).toHaveLength(3);
      } else {
        await run;
      }
      expect(
        calls
          .filter((c) => c.path.includes("/promote/"))
          .map((c) => c.path.match(/\/promote\/(dpl_\w+)/)?.[1]),
      ).toEqual(expected);
      expect(calls.some((c) => /rollback|alias/.test(c.path))).toBe(false);
    },
  );

  it.each([false, undefined])(
    "stops before any promotion when donor has the wrong or missing built state (%s)",
    async (state) => {
      const { call, calls } = fakeVercel();
      const health = answersAt({
        "https://admin-1.vercel.app/admin/api/health/migrations": healthy({
          release: {
            commit: sha,
            deploymentId: "dpl_1",
            serveUnderPaths: true,
          },
        }),
        "https://donor-2.vercel.app/api/health/migrations": healthy({
          release: {
            commit: sha,
            deploymentId: "dpl_2",
            serveUnderPaths: state,
          },
        }),
      });
      await expect(
        deployRelease({
          apps: ["admin", "donor"],
          sha,
          projectRef: ref,
          env: { CORE_SERVE_UNDER_PATHS: "1" },
          call,
          request: asFetch(health),
          sleep: noSleep,
          log: silent,
        }),
      ).rejects.toThrow(/serveUnderPaths/);
      expect(calls.filter((c) => c.path.includes("/promote/"))).toEqual([]);
    },
  );
});

it("passes the configured state to deployment steps and each existing bypass to plan", () => {
  const source = readFileSync(".github/workflows/release.yml", "utf8");
  const job = source.slice(
    source.indexOf("    timeout-minutes: 150"),
    source.indexOf("\n  marker:"),
  );
  expect(job.split("    steps:")[0]).toContain(
    "CORE_SERVE_UNDER_PATHS: ${{ vars.CORE_SERVE_UNDER_PATHS }}",
  );
  const plan = job.slice(
    job.indexOf("        id: plan"),
    job.indexOf(" run: node scripts/release/vercel-release.mjs plan"),
  );
  for (const name of Object.values(BYPASS_SECRETS))
    expect(plan).toContain(name + ": ${{ secrets." + name + " }}");
});

it("exits 1 with a sanitized part-way recovery instruction on the CLI", () => {
  const project = EXPECTED_PROJECTS.find((p) => p.key === "admin")!.projectId;
  const preload = `
    let built;
    globalThis.fetch = async (input, init) => {
      const url = new URL(input);
      if (url.pathname.includes("/promote/")) return new Response("private failure", {status: 502});
      if (url.pathname.startsWith("/v9/projects/")) return Response.json({id:${JSON.stringify(project)},autoAssignCustomDomains:false,link:{productionBranch:"production"}});
      if (init?.method === "POST") {
        built = JSON.parse(init.body);
        return Response.json({id:"dpl_check",readyState:"QUEUED"});
      }
      if (url.pathname.startsWith("/v13/deployments/")) return Response.json({id:"dpl_check",projectId:built.project,target:"production",gitSource:built.gitSource,readyState:"READY",url:"admin-check.vercel.app"});
      if (url.hostname === "admin-check.vercel.app") return Response.json({status:"ok",database:{supabaseProjectRef:${JSON.stringify(ref)}},release:{commit:${JSON.stringify(sha)},deploymentId:"dpl_check",serveUnderPaths:false}});
      throw new Error("unexpected call");
    };
  `;
  const result = spawnSync(
    process.execPath,
    [
      "--import",
      "data:text/javascript," + encodeURIComponent(preload),
      "scripts/release/vercel-release.mjs",
      "deploy",
    ],
    {
      encoding: "utf8",
      env: {
        RELEASE_APPS: "admin",
        RELEASE_SHA: sha,
        RELEASE_SUPABASE_PROJECT_REF: ref,
        VERCEL_TOKEN: "fixture",
        CORE_SERVE_UNDER_PATHS: "0",
      },
    },
  );
  expect(result.status).toBe(1);
  expect(result.stderr.trim().split("\n").at(-1)).toMatch(
    /^vercel-release: promotion stopped part way:/,
  );
  expect(result.stderr).toContain(
    "Dispatch Release anew from production, operation release, the same apps value; plan builds all three if their switch states differ. Do not roll back. See docs/ops/release-job.md, If a promotion fails part way.",
  );
  expect(result.stderr).not.toContain("private failure");
});

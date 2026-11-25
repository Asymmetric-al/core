import { describe, expect, it, vi } from "vitest";

import {
  PRODUCTION_HOSTS,
  runCli,
} from "../../../../scripts/release/vercel-release.mjs";
import {
  PROJECT_REF as ref,
  RELEASE_SHA as sha,
  fakeVercel,
  forbidNetwork,
  healthy,
  noSleep,
  silent,
} from "./support/vercel-release-fixtures";

forbidNetwork();

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

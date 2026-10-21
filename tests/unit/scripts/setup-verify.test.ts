import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

const verifier = path.resolve("scripts/setup-verify.mjs");
const roots = new Set<string>();
const publicKey = "sb_publishable_synthetic-setup-fixture";
const legacyKey = (role: string) =>
  [
    Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
      "base64url",
    ),
    Buffer.from(JSON.stringify({ role, iss: "supabase" })).toString(
      "base64url",
    ),
    "synthetic-not-a-signature",
  ].join(".");

afterEach(() => {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
  roots.clear();
});

function runSetup({
  key = publicKey,
  url = "https://fixture.supabase.co/",
  health = 200,
  settings = 200,
  localEnv,
}: {
  key?: string;
  url?: string;
  health?: number;
  settings?: number;
  localEnv?: string;
} = {}) {
  const root = mkdtempSync(path.join(tmpdir(), "core-setup-verify-"));
  roots.add(root);
  const calls = path.join(root, "requests.jsonl");
  const preload = path.join(root, "fetch.mjs");
  writeFileSync(
    preload,
    `
import { appendFileSync } from "node:fs";
globalThis.fetch = async (url, options = {}) => {
  const target = new URL(url);
  appendFileSync(${JSON.stringify(calls)}, JSON.stringify({ path: target.pathname, headers: options.headers ?? {}, redirect: options.redirect }) + "\\n");
  const status = target.pathname.endsWith("/auth/v1/health") ? (options.headers?.apikey ? ${health} : 401) : target.pathname.endsWith("/auth/v1/settings") ? ${settings} : target.pathname.endsWith("/rest/v1/") ? 406 : 404;
  return new Response(JSON.stringify({ external: {}, disable_signup: false }), { status, headers: { "Content-Type": "application/json" } });
};
`,
  );
  if (localEnv) writeFileSync(path.join(root, ".env.local"), localEnv);
  const result = spawnSync(
    process.execPath,
    ["--import", pathToFileURL(preload).href, verifier],
    {
      cwd: root,
      encoding: "utf8",
      env: {
        PATH: process.env.PATH,
        NEXT_PUBLIC_SUPABASE_URL: url,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: key,
      },
    },
  );
  return {
    ...result,
    output: result.stdout + result.stderr,
    requests: existsSync(calls)
      ? readFileSync(calls, "utf8")
          .trim()
          .split("\n")
          .map((line) => JSON.parse(line))
      : [],
  };
}

describe("setup verification with current Supabase public keys", () => {
  it("accepts publishable keys through Auth without requiring the disabled REST schema endpoint", () => {
    const result = runSetup();
    expect(result.status, result.output).toBe(0);
    expect(result.requests.map((request) => request.path)).toEqual([
      "/auth/v1/health",
      "/auth/v1/settings",
    ]);
    expect(result.requests[0].headers).toEqual({ apikey: publicKey });
    expect(result.requests[1].headers).toEqual({ apikey: publicKey });
    expect(result.output).not.toContain(publicKey);
    expect(result.output).not.toContain("does not look like");
  });

  it("keeps supported legacy anon JWTs usable without treating the API key as a user session", () => {
    const key = legacyKey("anon");
    const result = runSetup({ key });
    expect(result.status, result.output).toBe(0);
    expect(result.requests[1].headers).toEqual({ apikey: key });
    expect(result.output).not.toContain(key);
  });

  it.each(["sb_secret_synthetic-private-fixture", legacyKey("service_role")])(
    "rejects privileged public configuration before any request",
    (key) => {
      const result = runSetup({ key });
      expect(result.status).not.toBe(0);
      expect(result.requests).toEqual([]);
      expect(result.output).not.toContain(key);
      expect(result.output).toMatch(/secret|privileged/i);
    },
  );

  it.each([401, 403])(
    "rejects a public key denied by Auth with HTTP%s",
    (settings) => {
      const result = runSetup({ settings });
      expect(result.status).not.toBe(0);
      expect(result.output).not.toContain("Verification passed");
      expect(result.output).toContain(String(settings));
      expect(result.output).not.toContain(publicKey);
    },
  );

  it("fails when Auth health is unavailable even when the key is accepted", () => {
    const result = runSetup({ health: 503, key: legacyKey("anon") });
    expect(result.status).not.toBe(0);
    expect(result.output).not.toContain("Verification passed");
    expect(result.output).toContain("503");
  });

  it("preserves explicit process configuration over local fixture files", () => {
    const result = runSetup({
      localEnv:
        "NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_secret_local-fixture\nNEXT_PUBLIC_SUPABASE_URL=https://unused.invalid\n",
    });
    expect(result.status, result.output).toBe(0);
    expect(result.requests[1].headers).toEqual({ apikey: publicKey });
  });

  it("supports loopback gateways with a base path", () => {
    const result = runSetup({ url: "http://127.0.0.1:54321/gateway/" });
    expect(result.status, result.output).toBe(0);
    expect(result.requests.map((request) => request.path)).toEqual([
      "/gateway/auth/v1/health",
      "/gateway/auth/v1/settings",
    ]);
  });

  it.each([
    "https://private:credential@fixture.supabase.co",
    "https://fixture.supabase.co/?token=private-query",
    "https://fixture.supabase.co/#private-fragment",
  ])("rejects credential-bearing URLs without printing their values", (url) => {
    const result = runSetup({ url, key: legacyKey("anon") });
    expect(result.status).not.toBe(0);
    expect(result.requests).toEqual([]);
    expect(result.output).not.toContain(url);
  });
});

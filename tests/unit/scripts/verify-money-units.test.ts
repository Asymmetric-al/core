/**
 * #2419: scripts/verify-money-units.ts requires SUPABASE_SERVICE_ROLE_KEY and
 * never falls back to the anon key. Runs the script as a subprocess from an
 * empty temp cwd with a minimal explicit env, so developer .env files and the
 * Vitest process env cannot leak in. A local REST stub records requests.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { AddressInfo } from "node:net";

import { afterAll, describe, expect, it } from "vitest";

const ROOT = fileURLToPath(new URL("../../../", import.meta.url));
const SCRIPT = path.join(ROOT, "scripts/verify-money-units.ts");
const KEY = "SUPABASE_SERVICE_ROLE_KEY";
const ANON = "NEXT_PUBLIC_SUPABASE_ANON_KEY";
const SERVICE_VALUE = "svc-value-unit-2419";
const ANON_VALUE = "anon-value-unit-2419";

type Run = {
  status: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
  requests: { path: string; apikey?: string; authorization?: string }[];
};

const dirs: string[] = [];
afterAll(() => {
  for (const dir of dirs.splice(0))
    rmSync(dir, { recursive: true, force: true });
});

async function run(
  env: Record<string, string>,
  files: Record<string, string> = {},
  withUrl = true,
): Promise<Run> {
  const requests: Run["requests"] = [];
  const server = createServer((req, res) => {
    requests.push({
      path: req.url ?? "",
      apikey: req.headers.apikey as string | undefined,
      authorization: req.headers.authorization,
    });
    res.writeHead(200, { "content-type": "application/json" });
    res.end("[]");
  });
  await new Promise<void>((resolve) =>
    server.listen(0, "127.0.0.1", () => resolve()),
  );
  const { port } = server.address() as AddressInfo;

  const cwd = mkdtempSync(path.join(tmpdir(), "verify-money-units-"));
  dirs.push(cwd);
  for (const [name, content] of Object.entries(files))
    writeFileSync(path.join(cwd, name), content);

  const childEnv: Record<string, string> = {
    PATH: process.env.PATH ?? "",
    HOME: cwd,
    ...env,
  };
  if (withUrl) childEnv.NEXT_PUBLIC_SUPABASE_URL = `http://127.0.0.1:${port}`;

  try {
    return await new Promise<Run>((resolve, reject) => {
      const child = spawn("bun", [SCRIPT], {
        cwd,
        env: childEnv,
        shell: false,
        stdio: ["ignore", "pipe", "pipe"],
      });
      let stdout = "";
      let stderr = "";
      child.stdout.on("data", (d: Buffer) => (stdout += d.toString("utf8")));
      child.stderr.on("data", (d: Buffer) => (stderr += d.toString("utf8")));
      const timer = setTimeout(() => child.kill("SIGKILL"), 45_000);
      child.on("error", (error) => {
        clearTimeout(timer);
        reject(error);
      });
      child.on("close", (status, signal) => {
        clearTimeout(timer);
        resolve({ status, signal, stdout, stderr, requests: [...requests] });
      });
    });
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

describe("verify-money-units: SUPABASE_SERVICE_ROLE_KEY is required", () => {
  const missing: [string, Record<string, string>, Record<string, string>][] = [
    ["unset with anon key in env", { [ANON]: ANON_VALUE }, {}],
    ["empty", { [KEY]: "", [ANON]: ANON_VALUE }, {}],
    ["whitespace-only", { [KEY]: " \t ", [ANON]: ANON_VALUE }, {}],
    [
      "unset with anon key in cwd .env",
      {},
      { ".env": `${ANON}=${ANON_VALUE}\n` },
    ],
  ];

  it.each(missing)(
    "%s: exits non-zero before any request with a clear error",
    async (_label, env, files) => {
      const r = await run(env, files);
      expect(r.signal).toBeNull();
      expect(r.status).toBe(1);
      expect(r.requests).toEqual([]);
      expect(r.stderr).toContain(KEY);
      expect(r.stderr).toMatch(/required/i);
      expect(r.stderr).not.toMatch(/preferred|optional/i);
      const out = `${r.stdout}${r.stderr}`;
      expect(out).not.toMatch(/ANON_KEY/);
      expect(out).not.toContain(ANON_VALUE);
    },
  );

  it("keeps the NEXT_PUBLIC_SUPABASE_URL check", async () => {
    const r = await run({ [KEY]: SERVICE_VALUE }, {}, false);
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("NEXT_PUBLIC_SUPABASE_URL");
    expect(`${r.stdout}${r.stderr}`).not.toContain(SERVICE_VALUE);
  });

  it("authenticates every request with the service-role key only", async () => {
    const r = await run({ [KEY]: SERVICE_VALUE, [ANON]: ANON_VALUE });
    expect(r.status).toBe(0);
    expect(r.requests).toHaveLength(8);
    for (const q of r.requests) {
      expect(q.apikey).toBe(SERVICE_VALUE);
      expect(q.authorization).toBe(`Bearer ${SERVICE_VALUE}`);
    }
    const out = `${r.stdout}${r.stderr}`;
    expect(out).not.toContain(SERVICE_VALUE);
    expect(out).not.toContain(ANON_VALUE);
    expect(out).not.toMatch(/ANON_KEY/);
    expect(r.stdout).toContain(`Auth key in use: ${KEY}`);
  });
});

/**
 * #2419 acceptance harness. Runs scripts/verify-money-units.ts as a real
 * subprocess (`bun <script>`) from a fresh temp cwd with an explicit, minimal
 * environment, so neither the developer's .env/.env.local nor the Vitest
 * process env (which sets NEXT_PUBLIC_SUPABASE_ANON_KEY) can leak in. The
 * Supabase REST API is the system boundary: a local HTTP stub records every
 * request the script makes and serves per-table fixtures.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { IncomingMessage } from "node:http";
import type { AddressInfo } from "node:net";

export const ROOT = fileURLToPath(new URL("../../../../", import.meta.url));
export const SCRIPT_REL = "scripts/verify-money-units.ts";
export const SCRIPT = path.join(ROOT, SCRIPT_REL);
export const KEY_VAR = "SUPABASE_SERVICE_ROLE_KEY";
export const ANON_VAR = "NEXT_PUBLIC_SUPABASE_ANON_KEY";
export const URL_VAR = "NEXT_PUBLIC_SUPABASE_URL";

/** Distinctive sentinels so any echo of a key value is detectable. */
export const SERVICE_SENTINEL = "svc-sentinel-2419-7f3a9c";
export const ANON_SENTINEL = "anon-sentinel-2419-b81d04";

/** The eight tables the script samples (base 2a4f70a8, MONEY_COLUMNS). */
export const TABLES = [
  "campaigns",
  "donations",
  "donor_activities",
  "donor_pledges",
  "donors",
  "funds",
  "missionaries",
  "pledge_charge_attempts",
];

export type Fixture =
  | { status: 200; rows: Record<string, unknown>[] }
  | { status: number; body: string };

export type Recorded = {
  table: string;
  search: string;
  apikey: string | undefined;
  authorization: string | undefined;
};

export type RunResult = {
  status: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
  requests: Recorded[];
};

const tempDirs: string[] = [];
export const removeTempDirs = () => {
  for (const dir of tempDirs.splice(0))
    rmSync(dir, { recursive: true, force: true });
};

type RunOptions = {
  /** Env vars for the child, beyond PATH/HOME/TMPDIR. `undefined` = unset. */
  env: Record<string, string | undefined>;
  /** Point NEXT_PUBLIC_SUPABASE_URL at the stub (default true). */
  withUrl?: boolean;
  /** Files written into the temp cwd before the run (e.g. ".env.local"). */
  files?: Record<string, string>;
  /** Per-table responses; unlisted tables answer 200 []. */
  fixtures?: Record<string, Fixture>;
};

export async function runScript(opts: RunOptions): Promise<RunResult> {
  const requests: Recorded[] = [];
  const server = createServer((req: IncomingMessage, res) => {
    const url = new URL(req.url ?? "/", "http://stub.invalid");
    const table = url.pathname.replace(/^\/rest\/v1\//, "");
    requests.push({
      table,
      search: url.search,
      apikey: req.headers.apikey as string | undefined,
      authorization: req.headers.authorization,
    });
    const fx: Fixture = opts.fixtures?.[table] ?? { status: 200, rows: [] };
    if ("rows" in fx) {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(fx.rows));
    } else {
      res.writeHead(fx.status, { "content-type": "application/json" });
      res.end(fx.body);
    }
  });
  await new Promise<void>((resolve) =>
    server.listen(0, "127.0.0.1", () => resolve()),
  );
  const { port } = server.address() as AddressInfo;

  const cwd = mkdtempSync(path.join(tmpdir(), "issue-2419-"));
  tempDirs.push(cwd);
  for (const [name, content] of Object.entries(opts.files ?? {}))
    writeFileSync(path.join(cwd, name), content);

  const env: Record<string, string> = {
    PATH: process.env.PATH ?? "",
    HOME: cwd,
  };
  if (process.env.TMPDIR) env.TMPDIR = process.env.TMPDIR;
  if (opts.withUrl !== false) env[URL_VAR] = `http://127.0.0.1:${port}`;
  for (const [k, v] of Object.entries(opts.env))
    if (v === undefined) delete env[k];
    else env[k] = v;

  try {
    return await new Promise<RunResult>((resolve, reject) => {
      const child = spawn("bun", [SCRIPT], {
        cwd,
        env,
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

/** Lines the script printed to stdout, without trailing whitespace. */
export const lines = (text: string) =>
  text.split(/\r?\n/).map((l) => l.trimEnd());

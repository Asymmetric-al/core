import { execFile as execFileCallback } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { afterEach, describe, expect, it } from "vitest";

const execFile = promisify(execFileCallback);
const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
const scriptPath = fileURLToPath(
  new URL("../../scripts/verify/data-boundary-check.sh", import.meta.url),
);

type RunResult = {
  code: number;
  stdout: string;
  stderr: string;
};

const createdAppDirs: string[] = [];

function uniqueFixtureName() {
  return `__data_boundary_fixture_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function createFixtureApp(files: Record<string, string>) {
  const appDir = join(repoRoot, "apps", uniqueFixtureName());
  createdAppDirs.push(appDir);

  const writtenFiles = await Promise.all(
    Object.entries(files).map(async ([relativePath, contents]) => {
      const filePath = join(appDir, relativePath);
      await mkdir(dirname(filePath), { recursive: true });
      await writeFile(filePath, contents);
      return filePath;
    }),
  );

  return writtenFiles.map((filePath) => relative(repoRoot, filePath));
}

function toRunResult(error: unknown): RunResult {
  if (!error || typeof error !== "object") {
    return { code: 1, stdout: "", stderr: "" };
  }

  const failedRun = error as {
    code?: number | string;
    stdout?: string;
    stderr?: string;
  };

  return {
    code:
      typeof failedRun.code === "number"
        ? failedRun.code
        : Number(failedRun.code ?? 1),
    stdout: failedRun.stdout ?? "",
    stderr: failedRun.stderr ?? "",
  };
}

async function runBoundaryCheck(): Promise<RunResult> {
  try {
    const { stdout, stderr } = await execFile("bash", [scriptPath], {
      cwd: join(repoRoot, "tests"),
      maxBuffer: 1024 * 1024,
    });

    return { code: 0, stdout, stderr };
  } catch (error) {
    return toRunResult(error);
  }
}

describe.sequential("scripts/verify/data-boundary-check.sh", () => {
  afterEach(async () => {
    await Promise.all(
      createdAppDirs
        .splice(0)
        .map((appDir) => rm(appDir, { recursive: true, force: true })),
    );
  });

  it("allows approved health route exceptions", async () => {
    const [healthRoutePath] = await createFixtureApp({
      "app/api/health/route.ts": [
        'import { createClient } from "@asym/database/supabase/server";',
        "",
        "export async function GET() {",
        "  const supabase = await createClient();",
        "  return Response.json({ ok: Boolean(supabase) });",
        "}",
      ].join("\n"),
    });

    const result = await runBoundaryCheck();

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Data access boundary check passed");
    expect(result.stdout).not.toContain(healthRoutePath);
  });

  it("fails when a standard route handler imports the server Supabase wrapper", async () => {
    const [routePath] = await createFixtureApp({
      "app/api/posts/route.ts": [
        'import { createClient } from "@asym/database/supabase/server";',
        "",
        "export async function GET() {",
        "  return Response.json({ ok: Boolean(await createClient()) });",
        "}",
      ].join("\n"),
    });

    const result = await runBoundaryCheck();

    expect(result.code).toBe(1);
    expect(result.stdout).toContain(
      "Data access boundary violations detected in apps/*/app/api/**/*.ts:",
    );
    expect(result.stdout).toContain(routePath);
    expect(result.stdout).toContain(
      "Route handlers under apps/*/app/api/ must be thin re-exports",
    );
  });

  it("fails when a standard route handler imports the raw Supabase SDK", async () => {
    const [routePath] = await createFixtureApp({
      "app/api/donations/route.ts": [
        'import { createClient } from "@supabase/supabase-js";',
        "",
        "export async function POST() {",
        "  return Response.json({ ok: Boolean(createClient) });",
        "}",
      ].join("\n"),
    });

    const result = await runBoundaryCheck();

    expect(result.code).toBe(1);
    expect(result.stdout).toContain(routePath);
    expect(result.stdout).toContain('@supabase/supabase-js";');
  });
});

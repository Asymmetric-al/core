/**
 * Which test files Vitest itself runs for a `vitest` argument list
 * (./vitest-run-files.mjs, one child process per list), and the arguments the
 * unit runner hands Vitest. Tests use them to check selection against Vitest's
 * own behaviour instead of a re-implementation of it.
 */
import { spawn } from "node:child_process";
import path from "node:path";

import { runUnitTests } from "../../../../scripts/verify/unit-tests.mjs";

const REPO_ROOT = path.resolve(import.meta.dirname, "../../../..");
const RESOLVER = path.join(import.meta.dirname, "vitest-run-files.mjs");
const RESULT_MARKER = "vitest-run-files:";

/**
 * The arguments `bun run test:unit <args>` passes to the Vitest CLI, starting
 * with "run". Linux by default, as on GitHub's runners.
 */
export function unitRunnerVitestArgs(
  args: string[],
  platform: NodeJS.Platform = "linux",
): string[] {
  let vitestArgs: string[] = [];
  runUnitTests(
    platform,
    (_command: string, commandArgs: string[]) => {
      // The last call is Vitest (on Windows the Bun guard comes first).
      vitestArgs = commandArgs.slice(1);
      return { status: 0 };
    },
    args,
  );
  return vitestArgs;
}

function resolveOne(args: string[]): Promise<string[]> {
  // The child is a fresh Vitest, not part of this test run.
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([name]) => !name.startsWith("VITEST")),
  );
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [RESOLVER, JSON.stringify(args)], {
      cwd: REPO_ROOT,
      env,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      const line = stdout
        .split("\n")
        .find((candidate) => candidate.startsWith(RESULT_MARKER));
      if (code !== 0 || line === undefined)
        reject(
          new Error(
            `vitest-run-files ${JSON.stringify(args)} exited ${code}: ${stderr || stdout}`,
          ),
        );
      else resolve(JSON.parse(line.slice(RESULT_MARKER.length)) as string[]);
    });
  });
}

/** Resolves each argument list, a few child processes at a time. */
export async function filesVitestRuns(
  argumentLists: string[][],
  concurrency = 3,
): Promise<string[][]> {
  const results: string[][] = [];
  let next = 0;
  const worker = async () => {
    while (next < argumentLists.length) {
      const index = next;
      next += 1;
      results[index] = await resolveOne(argumentLists[index]!);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(concurrency, argumentLists.length) }, worker),
  );
  return results;
}

import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const root = fileURLToPath(new URL("../../../", import.meta.url));
export const launcher = join(root, "tooling/quality/lint.mts");
export const timeout = 120_000;
export const bin = (name: string) =>
  `${name}${process.platform === "win32" ? ".exe" : ""}`;

export function removeFixture(parent: string, directory: string) {
  if (dirname(resolve(directory)) !== resolve(parent))
    throw new Error(`Unexpected fixture: ${directory}`);
  rmSync(directory, { recursive: true, force: true });
}

export function invoke(
  args: string[],
  cwd = root,
  script = launcher,
  backendPath?: string,
) {
  const command =
    backendPath === undefined
      ? [script, ...args]
      : [
          "--input-type=module",
          "-e",
          `import {pathToFileURL} from 'node:url'; const [file, backendPath, ...args] = process.argv.slice(1); process.exitCode = (await import(pathToFileURL(file))).run(args, {backendPath});`,
          "--",
          script,
          backendPath,
          ...args,
        ];
  const result = spawnSync(process.execPath, command, {
    cwd,
    encoding: "utf8",
    shell: false,
    timeout: timeout - 10_000,
    env: {
      ...process.env,
      CORE_LINT_PARALLEL: "1",
      OXLINT_TSGOLINT_PATH: "inherited-invalid",
      TSRS_FAST: "1",
      TSRS_FIXTURE_POISON: "unexpected",
      OXLINT_TSGOLINT_FIXTURE_POISON: "unexpected",
    },
  });
  if (result.error) throw result.error;
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
    output: result.stdout + result.stderr,
  };
}

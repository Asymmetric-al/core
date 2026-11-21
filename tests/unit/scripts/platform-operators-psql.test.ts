/**
 * AL-2675 (WP2c, part 1), review 4650094359 on #2741: psql asks for a
 * password at the terminal, not on standard input, so with a terminal attached
 * the operator script (scripts/platform/operators.mjs) would wait there when a
 * database URL carries no password. It starts psql with --no-password, so a
 * missing password fails at once. A stand-in psql records the arguments the
 * script gives it.
 */
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterAll, describe, expect, it } from "vitest";

describe.skipIf(process.platform === "win32")(
  "the operator script's psql",
  () => {
    const dir = mkdtempSync(path.join(tmpdir(), "operators-psql-"));
    const psql = path.join(dir, "psql");
    const argsFile = path.join(dir, "args");
    writeFileSync(
      psql,
      `#!/bin/sh\nfor a in "$@"; do printf '%s\\n' "$a"; done > '${argsFile}'\ncat > /dev/null\n`,
    );
    chmodSync(psql, 0o755);
    afterAll(() => rmSync(dir, { recursive: true, force: true }));

    it("starts psql with --no-password, so a URL without a password fails instead of waiting at a terminal", () => {
      const result = spawnSync(
        process.execPath,
        ["scripts/platform/operators.mjs", "list"],
        {
          encoding: "utf8",
          env: {
            PATH: process.env.PATH,
            OPERATORS_DATABASE_URL:
              "postgresql://postgres@127.0.0.1:54329/postgres",
            PSQL_BIN: psql,
          },
        },
      );
      expect(result.status, result.stderr).toBe(0);
      const args = readFileSync(argsFile, "utf8").split("\n");
      expect(args).toContain("--no-password");
    });
  },
);

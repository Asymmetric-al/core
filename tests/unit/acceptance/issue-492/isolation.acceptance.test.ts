/** #492 done criteria 13, 14, 15 (static parts): not wired, names never authorize, no tables (spec r1). Owned by Acceptance. */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

import { describe, expect, it } from "vitest";

import { CAP_DIR, MODULES, load, read } from "./harness";

const git = (cmd: string) =>
  spawnSync("git", cmd.split(" "), { encoding: "utf8", maxBuffer: 1 << 28 })
    .stdout.split("\n")
    .filter(Boolean);
const SPEC =
  /(?:\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*|^\s*import\s+)["']([^"']+)["']/gm;

describe("#492 criterion 13: not wired", () => {
  it("criterion 13: nothing in packages/** or apps/** outside packages/auth/capabilities imports it", () => {
    expect(existsSync(CAP_DIR), `${CAP_DIR} must exist`).toBe(true);
    const files = git("ls-files -co --exclude-standard packages apps").filter(
      (f) => /\.(m|c)?[jt]sx?$/.test(f) && !f.startsWith(`${CAP_DIR}/`),
    );
    expect(files.length).toBeGreaterThan(100);
    const wired = files.filter((f) =>
      [...read(f).matchAll(SPEC)].some(([, s]) =>
        s!.startsWith(".")
          ? `${normalize(join(dirname(f), s!))}/`.startsWith(`${CAP_DIR}/`)
          : /^@asym\/auth\/capabilities(\/|$)/.test(s!),
      ),
    );
    expect(wired).toEqual([]);
  });
});

describe("#492 criterion 14: names never authorize", () => {
  const BANNED = [
    /\brole\s*[!=]==|[!=]==\s*[\w.?]*\brole\b/,
    /\.profileRole\b/,
    /\b(hasRole|hasAnyRole|canAccessDashboard)\s*\(/,
  ];
  it.each(MODULES)(
    "criterion 14: %s.ts has no name-based authorization",
    (m) => {
      const file = `${CAP_DIR}/${m}.ts`;
      expect(existsSync(file), file).toBe(true);
      for (const re of BANNED) expect(read(file), file).not.toMatch(re);
    },
  );
});

describe("#492 criterion 15: no capability tables", () => {
  it("criterion 15: the registry is code; the table names appear only in docs", async () => {
    const { CAPABILITY_REGISTRY } = await load("registry");
    expect(Object.keys(CAPABILITY_REGISTRY)).toHaveLength(18);
    const tables = "permission_capabilities|role_capability_grants";
    const self = ":!tests/unit/acceptance/issue-492/**";
    const hits = git(`grep --untracked -lE ${tables} -- . :!docs/** ${self}`);
    expect(hits).toEqual([]);
  });
});

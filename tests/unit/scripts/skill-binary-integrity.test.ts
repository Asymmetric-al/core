import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const binaryProbe = Buffer.concat([
  pngSignature,
  Buffer.from([0, 1, 13, 10, 2]),
]);
const env = Object.fromEntries(
  Object.entries(process.env).filter(([name]) => !name.startsWith("GIT_")),
);

describe("skill binary integrity", () => {
  it.each([".agents", ".cursor", ".claude"])(
    "preserves binary bytes through Git's %s attribute filter",
    (runtime) => {
      const raw = spawnSync("git", ["hash-object", "--stdin"], {
        cwd: root,
        env,
        input: binaryProbe,
        encoding: "utf8",
      });
      expect(raw.status, raw.stderr).toBe(0);
      for (const extension of ["png", "zip", "woff2"]) {
        const filtered = spawnSync(
          "git",
          [
            "hash-object",
            `--path=${runtime}/skills/sample/asset.${extension}`,
            "--stdin",
          ],
          { cwd: root, env, input: binaryProbe, encoding: "utf8" },
        );
        expect(filtered.status, filtered.stderr).toBe(0);
        expect(filtered.stdout, `${runtime} ${extension}`).toBe(raw.stdout);
      }
    },
  );

  it("retains valid PNG bytes for both referenced shadcn icons in every mirror", () => {
    for (const runtime of [".agents", ".cursor", ".claude"]) {
      for (const name of ["shadcn.png", "shadcn-small.png"]) {
        const bytes = readFileSync(
          path.join(root, runtime, "skills/shadcn/assets", name),
        );
        expect(bytes.subarray(0, 8), `${runtime} ${name}`).toEqual(
          pngSignature,
        );
      }
    }
  });
});

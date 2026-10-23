import { spawnSync } from "node:child_process";
import {
  chmod,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const repo = process.cwd();
const roots: string[] = [];
const environment = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_")),
);

afterEach(async () => {
  for (const root of roots.splice(0))
    await rm(root, { recursive: true, force: true });
});

describe("reviewed Impeccable launcher line endings", () => {
  it.each(["CRLF", "CR", "LF", "mixed"])(
    "publishes LF launcher bytes from a %s canonical checkout without changing other assets",
    async (form) => {
      await mkdir(path.join(repo, ".tmp"), { recursive: true });
      const root = await mkdtemp(path.join(repo, ".tmp/impeccable-newlines-"));
      roots.push(root);
      await mkdir(path.join(root, "scripts"));
      await cp(
        path.join(repo, "scripts/sync-agent-skills.mjs"),
        path.join(root, "scripts/sync-agent-skills.mjs"),
      );
      await cp(path.join(repo, "scripts/lib"), path.join(root, "scripts/lib"), {
        recursive: true,
      });
      const canonical = path.join(root, "docs/ai/skills/impeccable");
      const expected = Buffer.from(
        "@echo off\necho imported > IMPORTED_CODE_RAN\n",
      );
      const unchanged = new Map([
        [
          "SKILL.md",
          Buffer.from("---\nname: impeccable\ndescription: Fixture\n---\n"),
        ],
        [
          "scripts/impeccable",
          Buffer.from("#!/bin/sh\nprintf imported > IMPORTED_CODE_RAN\n"),
        ],
        ["scripts/ordinary.cmd", Buffer.from("@echo off\r\necho retained\r\n")],
        ["references/source.md.raw", Buffer.from("raw source\r\n\r\n")],
        [
          "references/UPSTREAM-LICENSE",
          Buffer.from("MIT\r\nOriginal rights notice.\r\n"),
        ],
        [
          "assets/probe.png",
          Buffer.from([137, 80, 78, 71, 13, 10, 0, 255, 13, 10]),
        ],
      ]);
      for (const [relative, bytes] of unchanged) {
        const file = path.join(canonical, relative);
        await mkdir(path.dirname(file), { recursive: true });
        await writeFile(file, bytes);
      }
      await chmod(path.join(canonical, "scripts/impeccable"), 0o755);
      await writeFile(
        path.join(canonical, "scripts/impeccable.cmd"),
        form === "CRLF"
          ? expected.toString().replaceAll("\n", "\r\n")
          : form === "CR"
            ? expected.toString().replaceAll("\n", "\r")
            : form === "mixed"
              ? expected.toString().replace("\n", "\r\n").replace(/\n$/, "\r")
              : expected,
      );
      const sync = () =>
        spawnSync(process.execPath, ["scripts/sync-agent-skills.mjs"], {
          cwd: root,
          encoding: "utf8",
          env: environment,
        });
      for (let pass = 0; pass < 2; pass++) {
        const result = sync();
        expect(result.status, result.stdout + result.stderr).toBe(0);
        for (const prefix of ["docs/ai", ".agents", ".cursor", ".claude"]) {
          const skill = path.join(root, prefix, "skills/impeccable");
          expect(
            await readFile(path.join(skill, "scripts/impeccable.cmd")),
            prefix,
          ).toEqual(expected);
          for (const [relative, bytes] of unchanged)
            expect(
              await readFile(path.join(skill, relative)),
              prefix + "/" + relative,
            ).toEqual(bytes);
        }
      }
      await expect(
        readFile(path.join(root, "IMPORTED_CODE_RAN")),
      ).rejects.toMatchObject({ code: "ENOENT" });
    },
  );

  it("checks out the reviewed launcher with LF in canonical and all runtime locations", () => {
    for (const prefix of ["docs/ai", ".agents", ".cursor", ".claude"]) {
      const file = prefix + "/skills/impeccable/scripts/impeccable.cmd";
      const attributes = spawnSync(
        "git",
        ["check-attr", "text", "eol", "--", file],
        { cwd: repo, encoding: "utf8", env: environment },
      );
      expect(attributes.status, attributes.stderr).toBe(0);
      expect(attributes.stdout, file).toContain(file + ": text: set");
      expect(attributes.stdout, file).toContain(file + ": eol: lf");
    }
  });
});

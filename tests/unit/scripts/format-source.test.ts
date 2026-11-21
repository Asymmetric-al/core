import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { expect, it } from "vitest";
import { formatSource } from "../../../scripts/lib/format-source.mts";

it("uses only trusted options; managed content keeps its package order", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "managed-format-"));
  try {
    const marker = path.join(root, "executed");
    const probe = `import fs from 'node:fs'; fs.writeFileSync(${JSON.stringify(marker)}, 'bad');`;
    await writeFile(path.join(root, "plugin.mjs"), probe);
    await writeFile(
      path.join(root, "oxfmt.config.mts"),
      'import "./plugin.mjs"; export default { semi:false };',
    );
    const file = path.join(root, "package.json");
    const input = '{"dependencies":{"z":"1","a":"2"},"name":"demo"}';
    const managed = await formatSource(file, input, "managed");
    expect(managed).toContain("\n");
    expect(Object.keys(JSON.parse(managed).dependencies)).toEqual(["z", "a"]);
    expect(
      Object.keys(
        JSON.parse(await formatSource(file, input, "trusted")).dependencies,
      ),
    ).toEqual(["a", "z"]);
    await expect(readFile(marker)).rejects.toMatchObject({ code: "ENOENT" });
    for (const profile of ["trusted", "managed"] as const)
      await expect(
        formatSource("sample.ts", "export const =", profile),
      ).rejects.toThrow(/sample.ts/);
    await cp(
      "scripts/lib/format-source.mts",
      path.join(root, "format-source.mts"),
    );
    await cp(
      "scripts/lib/format-options.mts",
      path.join(root, "format-options.mts"),
    );
    const missing = spawnSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        'import {formatSource} from "./format-source.mts"; await formatSource("probe.js", "1", "trusted");',
      ],
      { cwd: root, encoding: "utf8" },
    );
    expect(missing.status).toBe(1);
    expect(missing.stderr).toMatch(/oxfmt/i);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

import { existsSync } from "node:fs";
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  FALLBACK_DIRECTORY,
  resolveInstalledNextDocs,
  runNextDocsSync,
} from "../../../scripts/sync-next-docs.mjs";

const repo = process.cwd();
const roots: string[] = [];

async function tree(files: Record<string, string>) {
  const root = await mkdtemp(path.join(tmpdir(), "next-docs-sync-test-"));
  roots.push(root);
  for (const [relative, content] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
    await writeFile(path.join(root, relative), content);
  }
  return root;
}

async function snapshot(root: string, relative = ""): Promise<string[]> {
  const entries: string[] = [];
  for (const entry of await readdir(path.join(root, relative), {
    withFileTypes: true,
  })) {
    const child = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) entries.push(...(await snapshot(root, child)));
    else
      entries.push(
        child + "\n" + (await readFile(path.join(root, child), "utf8")),
      );
  }
  return entries.sort();
}

afterEach(async () => {
  for (const root of roots.splice(0))
    await rm(root, { recursive: true, force: true });
});

describe("Next.js fallback docs sync", () => {
  it("reports changed, missing and stale pages without writing in check mode", async () => {
    const installedRoot = await tree({
      "index.md": "# Index\n",
      "01-app/error.md": "error: unknown\n",
      "01-app/new-page.md": "new\n",
    });
    const fallbackRoot = await tree({
      "index.mdx": "# Index\n",
      "01-app/error.mdx": "error: Error\n",
      "01-app/removed.mdx": "gone upstream\n",
    });
    const before = await snapshot(fallbackRoot);

    const result = await runNextDocsSync({
      installedRoot,
      fallbackRoot,
      version: "0.0.0-test",
      write: false,
    });

    expect(result.ok).toBe(false);
    expect(result.changed).toEqual(["01-app/error.mdx"]);
    expect(result.missing).toEqual(["01-app/new-page.mdx"]);
    expect(result.stale).toEqual(["01-app/removed.mdx"]);
    expect(result.message).toContain("node scripts/sync-next-docs.mjs --write");
    expect(result.message).toContain("0.0.0-test");
    expect(await snapshot(fallbackRoot)).toEqual(before);
  });

  it("writes an exact mirror that keeps the .mdx extension", async () => {
    const installedRoot = await tree({
      "index.md": "# Index\n",
      "01-app/error.md": "error: unknown\n",
      "01-app/new-page.md": "new\n",
    });
    const fallbackRoot = await tree({
      "index.mdx": "# Index\n",
      "01-app/error.mdx": "error: Error\n",
      "01-app/removed.mdx": "gone upstream\n",
    });

    const written = await runNextDocsSync({
      installedRoot,
      fallbackRoot,
      version: "0.0.0-test",
      write: true,
    });

    expect(written.ok).toBe(true);
    expect(await snapshot(fallbackRoot)).toEqual([
      "01-app/error.mdx\nerror: unknown\n",
      "01-app/new-page.mdx\nnew\n",
      "index.mdx\n# Index\n",
    ]);
    const checked = await runNextDocsSync({
      installedRoot,
      fallbackRoot,
      version: "0.0.0-test",
      write: false,
    });
    expect(checked).toMatchObject({
      ok: true,
      changed: [],
      missing: [],
      stale: [],
      pages: 3,
    });
  });

  it("treats line-ending differences as equal and writes LF", async () => {
    const installedRoot = await tree({ "index.md": "one\r\ntwo\r\n" });
    const fallbackRoot = await tree({ "index.mdx": "one\ntwo\n" });

    expect(
      await runNextDocsSync({
        installedRoot,
        fallbackRoot,
        version: "0.0.0-test",
        write: false,
      }),
    ).toMatchObject({ ok: true });

    await writeFile(path.join(fallbackRoot, "index.mdx"), "stale\n");
    await runNextDocsSync({
      installedRoot,
      fallbackRoot,
      version: "0.0.0-test",
      write: true,
    });
    expect(await readFile(path.join(fallbackRoot, "index.mdx"), "utf8")).toBe(
      "one\ntwo\n",
    );
  });

  // Windows and default macOS checkouts resolve both spellings of a case-only
  // rename to one physical file, which keeps the spelling it was created with.
  // This file system behaves that way on any host and records each operation.
  function caseInsensitiveFileSystem(fallbackRoot: string) {
    const operations: string[] = [];
    const physical = async (file: string) => {
      const directory = path.dirname(file);
      const name = path.basename(file).toLowerCase();
      const match = existsSync(directory)
        ? (await readdir(directory)).find(
            (entry) => entry.toLowerCase() === name,
          )
        : undefined;
      return path.join(directory, match ?? path.basename(file));
    };
    const label = (file: string) =>
      path.relative(fallbackRoot, file).split(path.sep).join("/");
    return {
      operations,
      fileSystem: {
        mkdir,
        rm: async (file: string) => {
          operations.push("rm " + label(file));
          await rm(await physical(file));
        },
        writeFile: async (file: string, data: string, encoding: "utf8") => {
          operations.push("write " + label(file));
          await writeFile(await physical(file), data, encoding);
        },
      },
    };
  }

  it("removes the stale spelling before writing a case-only rename", async () => {
    const installedRoot = await tree({
      "index.md": "# Index\n",
      "01-app/guide.md": "guide\n",
    });
    const fallbackRoot = await tree({
      "index.mdx": "# Index\n",
      "01-app/Guide.mdx": "old guide\n",
    });
    const { operations, fileSystem } = caseInsensitiveFileSystem(fallbackRoot);

    const result = await runNextDocsSync({
      installedRoot,
      fallbackRoot,
      version: "0.0.0-test",
      write: true,
      fileSystem,
    });

    expect(operations).toEqual([
      "rm 01-app/Guide.mdx",
      "write 01-app/guide.mdx",
    ]);
    expect(result.ok).toBe(true);
    expect(await snapshot(fallbackRoot)).toEqual([
      "01-app/guide.mdx\nguide\n",
      "index.mdx\n# Index\n",
    ]);
  });

  it("fails write mode when the rewritten fallback still does not match", async () => {
    const installedRoot = await tree({
      "index.md": "# Index\n",
      "01-app/new-page.md": "new\n",
    });
    const fallbackRoot = await tree({ "index.mdx": "# Index\n" });

    const result = await runNextDocsSync({
      installedRoot,
      fallbackRoot,
      version: "0.0.0-test",
      write: true,
      // A write that never lands, as when another spelling swallows it.
      fileSystem: { mkdir, rm, writeFile: async () => {} },
    });

    expect(result.ok).toBe(false);
    expect(result.missing).toEqual(["01-app/new-page.mdx"]);
    expect(result.message).toMatch(/still does not match/);
  });

  it("fails instead of mirroring an empty or missing install", async () => {
    const fallbackRoot = await tree({ "index.mdx": "# Index\n" });
    const before = await snapshot(fallbackRoot);

    await expect(
      runNextDocsSync({
        installedRoot: path.join(fallbackRoot, "does-not-exist"),
        fallbackRoot,
        version: "0.0.0-test",
        write: true,
      }),
    ).rejects.toThrow(/Installed Next\.js docs not found/);
    expect(await snapshot(fallbackRoot)).toEqual(before);
  });
});

describe("committed Next.js fallback", () => {
  const installed = resolveInstalledNextDocs(repo);

  // A worktree without dependencies has nothing to compare against. CI always
  // installs, so a missing install there must fail rather than skip the check.
  it("has an installed copy to compare against in CI", () => {
    if (!process.env.CI) return;
    expect(installed).not.toBeNull();
    expect(existsSync(installed!.docsRoot)).toBe(true);
  });

  it.runIf(installed !== null && existsSync(installed.docsRoot))(
    "matches the docs bundled with the installed next package",
    async () => {
      const result = await runNextDocsSync({
        installedRoot: installed!.docsRoot,
        fallbackRoot: path.join(repo, FALLBACK_DIRECTORY),
        version: installed!.version,
        write: false,
      });

      expect(result.message).toContain(installed!.version);
      expect(
        {
          changed: result.changed,
          missing: result.missing,
          stale: result.stale,
        },
        result.message,
      ).toEqual({ changed: [], missing: [], stale: [] });
    },
  );
});

import { readdirSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { expect, it } from "vitest";

/**
 * Web Studio calls Payload's server functions by name. A name the installed
 * Payload does not register answers 500 on every call, and a unit test that
 * mocks the server function cannot see it: Payload 4.0.0-beta.9 renamed
 * beta.3's `get-dashboard-documents` to `get-activity-widget-docs`, and the
 * overview's "Your documents" card failed on every Web Studio page after the
 * pin moved (AL-2675). Every name the admin app calls must be one the
 * installed `@payloadcms/ui` registers (`sharedServerFunctions`, from which
 * `handleServerFunctions` dispatches) or one of Web Studio's own
 * (`webStudioServerFunctions`).
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");
const SOURCES = ["apps/admin/src", "apps/admin/app/(payload)"];
const CALL = /\bserverFunction\(/g;
const NAMED_CALL = /\bserverFunction\(\s*\{\s*name:\s*["']([^"']+)["']/g;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx)$/.test(entry) ? [path] : [];
  });
}

/** Each server function name the admin app calls, with the files that call it. */
function calledNames() {
  const called = new Map<string, string[]>();
  const unnamed: string[] = [];
  for (const file of SOURCES.flatMap((dir) => sourceFiles(join(ROOT, dir)))) {
    const text = readFileSync(file, "utf8");
    const names = [...text.matchAll(NAMED_CALL)].map(([, name]) => name!);
    const where = relative(ROOT, file);
    // A call whose name is not written at the call cannot be checked here.
    if ((text.match(CALL)?.length ?? 0) > names.length) unnamed.push(where);
    for (const name of names) {
      called.set(name, [...(called.get(name) ?? []), where]);
    }
  }
  return { called, unnamed };
}

/**
 * The keys of `sharedServerFunctions` in the `@payloadcms/ui` the admin app
 * resolves, found through the package's own export of its registry. The
 * module is read, not imported: its handlers load Payload's server views.
 */
function payloadServerFunctions(): Set<string> {
  const resolve = createRequire(join(ROOT, "apps/admin/package.json")).resolve;
  const text = readFileSync(
    resolve("@payloadcms/ui/utilities/serverFunctionRegistry"),
    "utf8",
  );
  const start = text.indexOf("sharedServerFunctions = {");
  expect(start).toBeGreaterThan(-1);
  const block = text.slice(start, text.indexOf("};", start));
  return new Set(
    [...block.matchAll(/^\s*['"]?([a-z][a-z0-9-]*)['"]?\s*:/gm)].map(
      ([, key]) => key!,
    ),
  );
}

it("reads the installed Payload's server function registry", () => {
  const registered = payloadServerFunctions();
  // A sample of beta.9's names, so a parse that finds nothing fails here.
  expect(registered).toContain("form-state");
  expect(registered).toContain("render-list");
});

it("calls only server functions that the installed Payload or Web Studio registers", async () => {
  const { webStudioServerFunctions } =
    await import("../../../../apps/admin/src/cms/web-studio-server-functions");
  const registered = new Set([
    ...payloadServerFunctions(),
    ...Object.keys(webStudioServerFunctions),
  ]);
  const { called, unnamed } = calledNames();
  expect(called.size).toBeGreaterThan(0);
  expect(unnamed).toEqual([]);
  const unknown = [...called].filter(([name]) => !registered.has(name));
  expect(Object.fromEntries(unknown)).toEqual({});
});

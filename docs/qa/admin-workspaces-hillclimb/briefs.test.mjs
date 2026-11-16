import assert from "node:assert/strict";
import * as crypto from "node:crypto";
import { readFileSync } from "node:fs";
import * as path from "node:path";
import test from "node:test";
import * as url from "node:url";
import { createContext, SourceTextModule, SyntheticModule } from "node:vm";

import * as modules from "./module-states.mjs";
import * as workspaces from "./workspace-states.mjs";

async function renderBriefs({
  existingBrief = false,
  written = new Map(),
} = {}) {
  const rows = ["intermediate", "small-tablet"].map((viewport) => ({
    state: "reports",
    viewport,
    axe: { violations: [], incompleteIds: ["color-contrast:1"] },
  }));
  const mocks = {
    "node:crypto": crypto,
    "node:path": path,
    "node:url": url,
    "node:fs": {
      existsSync: (file) =>
        file.endsWith("workspace-checks.json") ||
        file.endsWith("contribution-fund-correction--desktop.png") ||
        (existingBrief && file.endsWith("test-only-people-gpt-brief.md")),
      readFileSync: (file) =>
        written.get(file) ??
        (file.endsWith("workspace-checks.json")
          ? JSON.stringify(rows)
          : "Recorded verification only"),
      writeFileSync: (file, value) => written.set(file, value),
    },
    "./module-states.mjs": modules,
    "./workspace-states.mjs": workspaces,
  };
  const context = createContext({
    process: {
      argv: [
        "node",
        "write-briefs.mjs",
        "test-only",
        "A",
        "base",
        "B",
        "candidate",
        "verification.md",
      ],
      env: {},
    },
    console: { log() {} },
  });
  const sourceUrl = new URL("./write-briefs.mjs", import.meta.url);
  const entry = new SourceTextModule(readFileSync(sourceUrl, "utf8"), {
    context,
    initializeImportMeta(meta) {
      meta.url = sourceUrl.href;
    },
  });
  await entry.link((specifier) => {
    const exports = mocks[specifier];
    assert(exports, `Unexpected import ${specifier}`);
    return new SyntheticModule(
      Object.keys(exports),
      function () {
        for (const [name, value] of Object.entries(exports))
          this.setExport(name, value);
      },
      { context },
    );
  });
  await entry.evaluate();
  return { written, parts: entry.namespace.PARTS };
}

test("R01/R08: briefs use repaired names, Care plan and all declared check widths without changing evidence", async () => {
  const { written, parts } = await renderBriefs();
  const shell = parts.shell.parts.flatMap((part) => [...part.states]);
  const people = parts.people.parts.flatMap((part) => [...part.states]);
  assert(
    shell.includes("admin-staff-search") &&
      shell.includes("admin-staff-no-results"),
  );
  assert(
    people.includes("care-profile-plan") && people.includes("tasks-follow-ups"),
  );
  assert(
    people.includes("mobilize-unconnected") &&
      people.includes("events-unconnected"),
  );
  for (const entry of modules.UNAVAILABLE_MODULE_WORKFLOWS)
    assert(![...shell, ...people].includes(entry.name));
  assert.equal(written.size, 14);
  for (const [file, brief] of written) {
    assert(file.includes("test-only-") && file.endsWith("-brief.md"));
    assert(
      !/Capture conditions \(identical|same scripted steps run|captured as the page stands/i.test(
        brief,
      ),
    );
    assert.match(brief, /NOT_EXERCISED/);
    assert.match(brief, /no equivalent workflow/i);
    assert.match(brief, /product.*harness.*fixture/i);
    assert.match(brief, /crm-fund-correction/);
    assert.match(brief, /timeout/i);
    assert.match(brief, /not.*acceptance/i);
  }
  const tools = [...written.entries()].find(([file]) =>
    file.endsWith("-tools-gpt-brief.md"),
  )[1];
  assert.match(tools, /checks @intermediate:/);
  assert.match(tools, /checks @small-tablet:/);
  assert.match(tools, /incomplete.*color-contrast/i);
  const contributions = [...written.entries()].find(([file]) =>
    file.endsWith("-contributions-gpt-brief.md"),
  )[1];
  assert(!contributions.includes("contribution-fund-correction--desktop.png"));
});

test("R08: brief generation refuses any existing snapshot before writing any new derivative", async () => {
  const written = new Map();
  await assert.rejects(
    renderBriefs({ existingBrief: true, written }),
    /Refusing.*existing.*brief/i,
  );
  assert.equal(written.size, 0);
});

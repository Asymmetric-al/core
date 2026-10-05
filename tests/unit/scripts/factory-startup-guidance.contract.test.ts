import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../../..");
const canonical = "docs/ai/skills/samson-factory/SKILL.md";
const guide = "docs/guides/development/samson-codex-cloud.md";
const change = "openspec/changes/add-six-agent-codex-factory";
const read = (relative: string) =>
  readFileSync(path.join(root, relative), "utf8");
const normalized = (text: string) => text.replace(/\s+/g, " ");

// Read coordinator instructions only as contract data. Never execute them or
// snapshot the coordinator workflow; assertions select startup/safety clauses.
it.each([canonical, guide, `${change}/specs/agent-instruction-system/spec.md`])(
  "%s distinguishes read-only hosted validation and explicit local installation",
  (file) => {
    const text = normalized(read(file));
    expect(text).toMatch(/hosted.{0,180}read.only|read.only.{0,180}hosted/i);
    expect(text).toMatch(/local.{0,100}(?:install|CLI)/i);
    expect(text).toMatch(
      /(?:not|never|no|without).{0,140}(?:install.{0,60}(?:active\s+)?`?CODEX_HOME|(?:active\s+)?`?CODEX_HOME.{0,60}install)/i,
    );
    expect(text).toMatch(/(?:not|never|no|without).{0,100}local.{0,30}CLI/i);
    expect(text).toMatch(/BLOCKED|fail.closed/i);
    expect(text).toMatch(/1955/);
    expect(text).not.toMatch(
      /initialize the active runtime home once per coordinating chat/i,
    );
    expect(text).not.toMatch(
      /run the retained installer once per chat before verification or delegation/i,
    );
  },
);

it("retains the exact independent reproduction safeguard and applies it to final acceptance", () => {
  const text = normalized(read(canonical));
  expect(text).toContain(
    "Reviewers must inspect each command and its scripts before execution, then run it from the clean committed candidate only in a disposable, credential-free sandbox with network denied by default and writes limited to the candidate checkout. If that isolation is unavailable, report the missing evidence instead of executing the command. Configuration alone does not establish isolation. Missing required evidence is INCONCLUSIVE.",
  );
  expect(text).toContain(
    "Have Ezra confirm each criterion against the current committed candidate. Apply the same inspection and isolation conditions to documented reproduction commands required by acceptance.",
  );
  expect(text).toContain("Keep one writer active.");
  expect(text).toContain("Pause writers.");
  expect(text).toContain("Give Micaiah and Luke the same actual candidate SHA");
});

it("keeps fresh own-role context, protected expected-head root merge and same-worker closeout", () => {
  const text = normalized(
    [
      read(canonical),
      read(guide),
      read(`${change}/specs/agent-instruction-system/spec.md`),
    ].join("\n"),
  );
  expect(text).toMatch(/fresh.{0,100}(?:own.role|role.only|specialist)/i);
  expect(text).toMatch(
    /(?:root|David).{0,160}(?:merge|protected)|(?:merge|protected).{0,160}(?:root|David)/i,
  );
  expect(text).toMatch(/expected.head|match-head-commit/);
  expect(text).toMatch(
    /same.worker.{0,100}closeout|same.{0,30}(?:repair\s+)?worker.{0,100}closeout/i,
  );
});

it.each([".agents", ".claude", ".cursor"])(
  "%s Samson mirrors equal the canonical startup/safeguard bytes",
  (mirror) => {
    for (const relative of ["SKILL.md", "references/protocol.md"]) {
      expect(
        readFileSync(
          path.join(root, mirror, "skills/samson-factory", relative),
        ),
      ).toEqual(
        readFileSync(
          path.join(root, "docs/ai/skills/samson-factory", relative),
        ),
      );
    }
  },
);

it("keeps repository acceptance distinct from actual postmerge cloud publication and handoffs", () => {
  const text = normalized(
    [
      read(guide),
      read(`${change}/proposal.md`),
      read(`${change}/tasks.md`),
      read(`${change}/specs/agent-instruction-system/spec.md`),
    ].join("\n"),
  );
  expect(text).toMatch(/R1.{0,30}R5/);
  expect(text).toMatch(/H1.{0,30}H2/);
  expect(text).toMatch(/fresh.{0,100}(?:cloud|session|hosted)/i);
  expect(text).toMatch(/(?:actual|native).{0,100}(?:handoff|return)/i);
  expect(text).toMatch(/publish|publication|consumed/i);
});

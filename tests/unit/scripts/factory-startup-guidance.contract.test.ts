import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, it } from "vitest";

const root = path.resolve(import.meta.dirname, "../../..");
const canonical = "docs/ai/skills/samson-factory/SKILL.md";
const guide = "docs/guides/development/samson-codex-cloud.md";
const protocol = "docs/ai/skills/samson-factory/references/protocol.md";
const change = "openspec/changes/add-six-agent-codex-factory";
const spec = `${change}/specs/agent-instruction-system/spec.md`;
const read = (relative: string) =>
  readFileSync(path.join(root, relative), "utf8");
const normalized = (text: string) => text.replace(/\s+/g, " ");

it.each([canonical, protocol, guide, spec])(
  "%s binds reviewed role validation to the instructions actually consumed",
  (file) => {
    const text = normalized(read(file));
    expect(text).toMatch(/consumedRoleRoot/);
    expect(text).toMatch(
      /(?:explicit|required).{0,140}consumed.{0,100}(?:root|directory)/i,
    );
    expect(text).toMatch(/(?:compar|match|equal).{0,180}(?:consumed|handoff)/i);
    expect(text).toMatch(
      /(?:hash|sha256).{0,180}consumed|consumed.{0,180}(?:hash|sha256)/i,
    );
    expect(text).toMatch(
      /(?:own.role|developer_instructions).{0,180}(?:handoff|instructions)|handoff.{0,180}(?:own.role|developer_instructions)/i,
    );
    expect(text).toMatch(
      /(?:personal|copies).{0,180}(?:only|conditional).{0,180}(?:automatic|loader)|(?:only|conditional).{0,180}(?:automatic|loader).{0,180}(?:personal|copies)/i,
    );
    expect(text).toMatch(
      /(?:absent|missing|without|not required|unnecessary).{0,120}personal.{0,60}role|personal.{0,60}role.{0,120}(?:absent|missing|not required|unnecessary)/i,
    );
    expect(text).not.toMatch(
      /Confirm personal guidance\/protocol and role copies match/i,
    );
    expect(text).not.toMatch(
      /matching coordinator\/protocol and six role copies/i,
    );
    expect(text).not.toMatch(/all six own.role TOML sources\/copies/i);
  },
);

it("documents the validator's consumed-path and exact instruction outputs", () => {
  const text = normalized(read(guide));
  for (const name of [
    "consumedRoleRoot",
    "consumedPath",
    "roleInstructions",
    "developer_instructions",
    "requestedRoleSettings",
  ])
    expect(text).toContain(name);
  expect(text).toMatch(/sourceRoot/);
  expect(text).toMatch(
    /(?:exact|unchanged).{0,100}(?:parsed|instructions)|(?:parsed|instructions).{0,100}(?:exact|unchanged)/i,
  );
});

// Read coordinator instructions only as contract data. Never execute them or
// snapshot the coordinator workflow; assertions select startup/safety clauses.
it.each([canonical, guide, spec])(
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

it.each([canonical, guide, spec])(
  "%s retains fresh role context, protected root merge and same-worker closeout",
  (file) => {
    // Another document cannot supply a clause missing from this required one.
    const text = normalized(read(file));
    expect(text).toMatch(/fresh.{0,100}(?:own.role|role.only|specialist)/i);
    expect(text).toMatch(/stops? before merge/i);
    expect(text).toMatch(/David.{0,240}protected expected.head merge/i);
    expect(text).toMatch(
      /same.worker.{0,100}closeout|same.{0,30}(?:repair\s+)?worker.{0,100}closeout/i,
    );
  },
);

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

it.each([guide, spec, `${change}/proposal.md`, `${change}/tasks.md`])(
  "%s distinguishes repository acceptance from actual hosted qualification",
  (file) => {
    const text = normalized(read(file));
    expect(text).toMatch(
      file === `${change}/tasks.md`
        ? /R1.{0,30}R2.*R3.*R4.{0,30}R5/
        : /R1.{0,30}R5/,
    );
    expect(text).toMatch(/H1.{0,30}H2/);
    expect(text).toMatch(/fresh.{0,100}(?:cloud|session|hosted)/i);
    expect(text).toMatch(/(?:actual|native).{0,100}(?:handoff|return)/i);
    expect(text).toMatch(/publish|publication|consumed/i);
  },
);

it.each([guide, spec])(
  "%s requires six real role returns, consumed assets and publication evidence",
  (file) => {
    // Detailed operational requirements belong to the guide/spec, not summaries.
    const text = normalized(read(file));
    expect(text).toMatch(/(?:all six|six configured roles)/i);
    expect(text).toMatch(/native.{0,80}handoffs.{0,80}normal returns/i);
    expect(text).toMatch(/consumed.{0,100}hashes/i);
    expect(text).toMatch(/publication evidence/i);
    expect(text).toMatch(
      /(?:not|do not).{0,40}(?:auto.closed|close).{0,80}H1.{0,30}H2/i,
    );
  },
);

it("canonical guidance keeps postmerge qualification and the H1–H2 issue-close boundary", () => {
  const text = normalized(read(canonical));
  expect(text).toMatch(
    /repository delivery.{0,100}separate from postmerge hosted qualification/i,
  );
  expect(text).toMatch(/do not auto.close the issue before H1.{0,30}H2 pass/i);
});

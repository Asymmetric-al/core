import { describe, expect, it } from "vitest";

import {
  feedbackWait,
  roleNodes,
  roundStages,
} from "../../../scripts/archon-factory/pack/deliver/scripts/claim-logic.mjs";
import { ROUTES } from "../../../scripts/archon-factory/pack/.shared/workitem.mjs";

// claim's stage flags per route. I1: a review round re-runs freeze, both
// first-pass reviews, seal, assess/adjudicate and final, without scope,
// define or build, so claim emits do_build "yes" (the gate after-scope and
// after-define pass through) and nothing AI-related before freeze.

describe("roundStages", () => {
  it.each([
    [
      "initial",
      { do_scope: "yes", do_define: "yes", do_build: "yes", do_feedback: "no" },
    ],
    [
      "repair",
      { do_scope: "no", do_define: "no", do_build: "yes", do_feedback: "no" },
    ],
    [
      "oracle",
      { do_scope: "no", do_define: "yes", do_build: "yes", do_feedback: "no" },
    ],
    [
      "review",
      { do_scope: "no", do_define: "no", do_build: "yes", do_feedback: "no" },
    ],
    [
      "feedback",
      { do_scope: "no", do_define: "no", do_build: "no", do_feedback: "yes" },
    ],
    [
      "deliver",
      { do_scope: "no", do_define: "no", do_build: "no", do_feedback: "yes" },
    ],
  ])("runs the %s route's stages", (route, flags) => {
    expect(roundStages(route)).toEqual(flags);
  });

  it("knows every route the work item can schedule", () => {
    expect(ROUTES.filter((route) => roundStages(route) === null)).toEqual([]);
  });

  it("refuses an unknown route", () => {
    expect(roundStages("deploy")).toBeNull();
  });
});

describe("feedbackWait", () => {
  const NOW = Date.parse("2026-11-11T10:00:00.000Z");
  it("waits out the check interval after the last round", () => {
    expect(
      feedbackWait({
        lastAt: "2026-11-11T09:55:00.000Z",
        nowMs: NOW,
        checkWaitMs: 600_000,
      }),
    ).toBe("2026-11-11T10:05:00.000Z");
  });

  it.each([
    ["the interval has passed", "2026-11-11T09:40:00.000Z"],
    ["less than fifteen seconds remain", "2026-11-11T09:50:10.000Z"],
  ])("does not wait when %s", (_label, lastAt) => {
    expect(feedbackWait({ lastAt, nowMs: NOW, checkWaitMs: 600_000 })).toBe("");
  });

  it("waits a full interval when no previous round is recorded", () => {
    expect(
      feedbackWait({ lastAt: undefined, nowMs: NOW, checkWaitMs: 600_000 }),
    ).toBe("2026-11-11T10:10:00.000Z");
  });
});

// Boundary #5 (gap S5.10/S6.10): the writers' run_check workspace (Ezra in
// define, Bezalel in build) mounts the clone's .git read-only, so a check
// command can neither commit, plant config nor move refs. The executor allows
// read-only mounts nested under the workspace target.
describe("roleNodes", () => {
  const where = {
    root: "/srv/core-factory/issues/12",
    repo: "/srv/core-factory/issues/12/repo",
  };
  const mirror = "/srv/core-factory/mirror.git";
  const materials = (role: string) =>
    `/srv/core-factory/runs/run-5/materials/${role}`;
  const brief = { source_paths: ["apps/x/**"], test_paths: ["tests/x/**"] };
  const nodes = roleNodes({ where, mirror, materials, brief });
  const writerCheck = {
    workspaceRoot: where.root,
    workspaceDirectory: where.repo,
    workspaceTarget: where.repo,
    mounts: [
      {
        source: `${mirror}/objects`,
        target: `${mirror}/objects`,
        readOnly: true,
      },
      {
        source: `${where.repo}/.git`,
        target: `${where.repo}/.git`,
        readOnly: true,
      },
    ],
  };

  it.each(["define", "build"])(
    "gives the %s writer a check workspace whose .git is read-only",
    (node) => {
      expect(nodes[node].check).toEqual(writerCheck);
    },
  );

  it("keeps each writer to its own paths", () => {
    expect({ define: nodes.define, build: nodes.build }).toEqual({
      define: {
        role: "ezra",
        read: [where.repo, materials("ezra")],
        write: [{ root: where.repo, globs: ["tests/x/**"] }],
        check: writerCheck,
      },
      build: {
        role: "bezalel",
        read: [where.repo, materials("bezalel")],
        write: [{ root: where.repo, globs: ["apps/x/**"] }],
        denyWrite: [{ root: where.repo, globs: ["tests/x/**"] }],
        check: writerCheck,
      },
    });
  });

  it("gives Samson's nodes no check workspace", () => {
    expect([nodes.scope, nodes.assess, nodes.dispose]).toEqual([
      { role: "samson", read: [where.repo, materials("scope")] },
      { role: "samson", read: [materials("assess")] },
      { role: "samson", read: [where.repo, materials("dispose")] },
    ]);
  });

  it("gives writers no paths when the brief names none", () => {
    const bare = roleNodes({ where, mirror, materials, brief: null });
    expect([bare.define.write, bare.build.write, bare.build.denyWrite]).toEqual(
      [
        [{ root: where.repo, globs: [] }],
        [{ root: where.repo, globs: [] }],
        [{ root: where.repo, globs: [] }],
      ],
    );
  });
});

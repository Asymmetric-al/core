import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { StateConflict } from "../../../scripts/archon-factory/pack/.shared/archon.mjs";
import { releaseInactiveReservations } from "../../../scripts/archon-factory/pack/.shared/reservations.mjs";
import {
  createAssignment,
  planClaim,
  planControl,
  planFinish,
} from "../../../scripts/archon-factory/pack/.shared/workitem.mjs";
import { reserveAreas } from "../../../scripts/archon-factory/pack/deliver/scripts/scope-logic.mjs";
import { releaseStaleReservations } from "../../../scripts/archon-factory/pack/select/scripts/intake-logic.mjs";

const fixture = vi.hoisted(() => ({
  round: null as any,
  emitted: [] as any[],
}));

vi.mock(
  "../../../scripts/archon-factory/pack/.shared/archon.mjs",
  async (importOriginal) => importOriginal(),
);

vi.mock("../../../scripts/archon-factory/pack/.shared/round.mjs", () => ({
  openRound: () => fixture.round,
  input: () => undefined,
  emit: (value: unknown) => fixture.emitted.push(value),
  workItem: (round: any) => round.archon.get(`core/issues/${round.issue}`),
  writeWorkItem: (round: any, plan: any) =>
    round.archon.put(plan.name, plan.value, {
      ifRevision: plan.ifRevision,
      lease: plan.lease,
    }),
  clipText: (value: string, size: number) => value.slice(0, size),
  renderAssignment: () => "Acceptance assignment",
}));

const NOW = "2026-11-11T16:00:00.000Z";
const POLICY = "c".repeat(64);
const RESERVATIONS = "core/reservations";
const EXIT = new Error("Script stopped before writers");
type Document = { name: string; revision: number; value: any; lease: any };

function assignment(issue = 12) {
  return createAssignment({
    issue,
    assignmentId: `a${issue}-reservation`,
    owner: "fixture-owner",
    profileDigest: "a".repeat(64),
    scopeRevision: "b".repeat(64),
    policyRevision: POLICY,
    endState: "PR_READY",
    by: "fixture",
    now: NOW,
  });
}

function store() {
  const documents = new Map<string, Document>();
  const archon = {
    get: vi.fn(async (name: string): Promise<Document> =>
      structuredClone(
        documents.get(name) ?? { name, revision: 0, value: null, lease: null },
      ),
    ),
    put: vi.fn(
      async (
        name: string,
        value: any,
        options: { ifRevision: number; lease?: string },
      ) => {
        const previous = documents.get(name) ?? {
          name,
          revision: 0,
          value: null,
          lease: null,
        };
        if (previous.revision !== options.ifRevision)
          throw new StateConflict("Concurrent revision", null);
        const document = {
          name,
          revision: previous.revision + 1,
          value: structuredClone(value),
          lease: options.lease === "release" ? null : previous.lease,
        };
        documents.set(name, document);
        return structuredClone(document);
      },
    ),
  };
  const apply = (plan: any) =>
    archon.put(plan.name, plan.value, {
      ifRevision: plan.ifRevision,
      lease: plan.lease,
    });
  return { archon, documents, apply };
}

async function claim(state: ReturnType<typeof store>, runId: string) {
  const document = await state.archon.get("core/issues/12");
  const receipt = await state.apply(
    planClaim(document, {
      runId,
      assignmentId: document.value.assignment.id,
      policyRevision: POLICY,
      now: NOW,
    }),
  );
  state.documents.get(receipt.name)!.lease = { runId, live: true };
}

let materials: string;

beforeEach(() => {
  fixture.emitted = [];
  materials = mkdtempSync(path.join(os.tmpdir(), "archon-reservation-"));
  writeFileSync(
    path.join(materials, "request.md"),
    "Repair the fixture safely.",
  );
  vi.spyOn(process, "exit").mockImplementation(() => {
    throw EXIT;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  rmSync(materials, { recursive: true, force: true });
});

function prepareRound(state: ReturnType<typeof store>, route = "repair") {
  const ledger = new Map<string, any>([
    ["claim", { route }],
    ["context", { changed: false, fingerprint: "fixture-context" }],
  ]);
  fixture.round = {
    issue: 12,
    assignment: "a12-reservation",
    runId: "retry-run",
    archon: state.archon,
    where: { repo: "/fixture/repo" },
    now: () => NOW,
    ledger: {
      read: (name: string) => ledger.get(name),
      write: (name: string, value: any) => ledger.set(name, value),
    },
    context: {
      read: () => ({ nodes: { define: {}, build: {} } }),
      write: vi.fn(),
    },
    git: {
      ok: vi.fn(async (args: string[]) =>
        args[0] === "rev-parse" ? "1".repeat(40) : "",
      ),
    },
    materials: () => materials.replaceAll("\\", "/"),
  };
  return ledger;
}

const FEEDBACK_RESUMES = [
  { terminal: "BLOCKED", action: "retry", route: "feedback" },
  { terminal: "BLOCKED", action: "retry", route: "deliver" },
  { terminal: "stopped", action: "reopen", route: "feedback" },
  { terminal: "stopped", action: "reopen", route: "deliver" },
  { terminal: "PR_READY", action: "reopen", route: "feedback" },
];

async function resumeFeedback(
  { terminal, action, route }: (typeof FEEDBACK_RESUMES)[number],
  competingHolder = false,
) {
  const state = store();
  await state.archon.put(
    "core/issues/12",
    {
      ...assignment(),
      route,
      pr: { number: 42, head: "1".repeat(40) },
      brief: {
        summary: "Fixture scope",
        source_paths: ["src/**"],
        test_paths: ["tests/**"],
        shared_areas: ["lockfile", "migrations"],
        contextFingerprint: "previous-context",
        repair: {
          acceptance: ["Retained acceptance correction"],
          implementation: [],
          source: "fixture",
        },
      },
    },
    { ifRevision: 0 },
  );
  await claim(state, "original-run");
  await reserveAreas(state.archon, {
    issue: 12,
    areas: ["lockfile", "migrations"],
  });
  await state.apply(
    planFinish(await state.archon.get("core/issues/12"), {
      runId: "original-run",
      now: NOW,
      outcome: terminal,
      blocker: { code: "fixture-check", detail: "Transient failure" },
    }),
  );
  expect(
    await releaseInactiveReservations(state.archon, { issues: [12] }),
  ).toMatchObject({ written: true, released: ["lockfile", "migrations"] });
  if (competingHolder)
    await reserveAreas(state.archon, { issue: 13, areas: ["lockfile"] });
  await state.apply(
    planControl(await state.archon.get("core/issues/12"), {
      action,
      requestId: "resume-feedback",
      by: "operator",
      now: NOW,
      installed: { policyRevision: POLICY },
    }),
  );
  await claim(state, "retry-run");
  const claimed = await state.archon.get("core/issues/12");
  expect(claimed.value.run.route).toBe(route);
  const ledger = prepareRound(state, claimed.value.run.route);
  ledger.set("context", { changed: true, fingerprint: "fixture-context" });
  return { state, ledger, claimed };
}

describe("reservation ownership across lifecycle and after-scope", () => {
  it.each(["repair", "feedback", "deliver"])(
    "never enables a resumed %s writer when reservation persistence fails",
    async (route) => {
      const state = store();
      await state.archon.put(
        "core/issues/12",
        {
          ...assignment(),
          route,
          brief: {
            summary: "Fixture scope",
            source_paths: ["src/**"],
            test_paths: ["tests/**"],
            shared_areas: ["lockfile"],
            repair: null,
          },
        },
        { ifRevision: 0 },
      );
      await claim(state, "retry-run");
      const ledger = prepareRound(state, route);
      state.archon.put.mockImplementationOnce(async () => {
        throw new Error("Reservation persistence unavailable");
      });
      vi.resetModules();

      await expect(
        import("../../../scripts/archon-factory/pack/deliver/scripts/after-scope.ts"),
      ).rejects.toThrow("Reservation persistence unavailable");
      expect(fixture.round.context.write).not.toHaveBeenCalled();
      expect(fixture.emitted).toEqual([]);
      expect(ledger.has("after-scope")).toBe(false);
      expect((await state.archon.get(RESERVATIONS)).value).toBeNull();
    },
  );

  it.each(FEEDBACK_RESUMES)(
    "reacquires $terminal $action $route before dispatch without starting acceptance or build",
    async (resume) => {
      const { state, ledger, claimed } = await resumeFeedback(resume);
      vi.resetModules();

      await import("../../../scripts/archon-factory/pack/deliver/scripts/after-scope.ts").catch(
        (error) => {
          if (error !== EXIT) throw error;
        },
      );

      expect(fixture.emitted.at(-1)).toMatchObject({
        proceed: "yes",
        define: "no",
        build: "no",
        ezra_assignment: "",
      });
      expect(ledger.get("after-scope")).toMatchObject({
        define: false,
        build: false,
      });
      expect(ledger.get("after-scope").acceptanceBaseline).toBeUndefined();
      expect(fixture.round.context.write).not.toHaveBeenCalled();
      expect(fixture.round.git.ok).not.toHaveBeenCalled();
      expect(await state.archon.get("core/issues/12")).toEqual(claimed);
      expect((await state.archon.get(RESERVATIONS)).value.areas).toEqual({
        lockfile: 12,
        migrations: 12,
      });
    },
  );

  it.each(FEEDBACK_RESUMES)(
    "parks $terminal $action $route without dispatch when a different issue holds its released area",
    async (resume) => {
      const { state, ledger, claimed } = await resumeFeedback(resume, true);
      vi.resetModules();

      await expect(
        import("../../../scripts/archon-factory/pack/deliver/scripts/after-scope.ts"),
      ).rejects.toBe(EXIT);

      expect(fixture.emitted.at(-1)).toMatchObject({
        proceed: "no",
        define: "no",
        build: "no",
        ezra_assignment: "",
      });
      expect(ledger.get("after-scope")).toMatchObject({
        stopped: true,
        parked: {
          code: "area-reserved",
          areas: ["lockfile", "migrations"],
          holders: { lockfile: 13 },
        },
      });
      expect(fixture.round.context.write).not.toHaveBeenCalled();
      expect(fixture.round.git.ok).not.toHaveBeenCalled();
      expect(await state.archon.get("core/issues/12")).toEqual(claimed);
      expect((await state.archon.get(RESERVATIONS)).value.areas).toEqual({
        lockfile: 13,
      });
    },
  );

  it("reacquires before enabling writers when stale cleanup wins the first CAS", async () => {
    const state = store();
    await state.archon.put(
      "core/issues/12",
      {
        ...assignment(),
        status: "BLOCKED",
        route: null,
        blocker: { route: "repair" },
        brief: {
          summary: "Fixture scope",
          source_paths: ["src/**"],
          test_paths: ["tests/**"],
          shared_areas: ["lockfile"],
          repair: null,
        },
      },
      { ifRevision: 0 },
    );
    await reserveAreas(state.archon, { issue: 12, areas: ["lockfile"] });
    const originalPut = state.archon.put.getMockImplementation()!;
    state.archon.put.mockImplementationOnce(async (name, value, options) => {
      await state.apply(
        planControl(await state.archon.get("core/issues/12"), {
          action: "retry",
          requestId: "retry-cleanup-first",
          by: "operator",
          now: NOW,
          installed: { policyRevision: POLICY },
        }),
      );
      await claim(state, "retry-run");
      let receipt: Document | undefined;
      state.archon.put.mockImplementationOnce(
        async (acquiredName, acquiredValue, acquiredOptions) => {
          receipt = await originalPut(name, value, options);
          return originalPut(acquiredName, acquiredValue, acquiredOptions);
        },
      );
      prepareRound(state);
      vi.resetModules();
      await import("../../../scripts/archon-factory/pack/deliver/scripts/after-scope.ts");
      expect(receipt).toBeDefined();
      return receipt!;
    });

    expect(await releaseInactiveReservations(state.archon)).toMatchObject({
      written: true,
      released: ["lockfile"],
    });
    expect(fixture.emitted.at(-1)).toMatchObject({ build: "yes" });
    expect(fixture.round.context.write).toHaveBeenCalledOnce();
    expect((await state.archon.get(RESERVATIONS)).value.areas).toEqual({
      lockfile: 12,
    });
    expect(
      await reserveAreas(state.archon, { issue: 13, areas: ["lockfile"] }),
    ).toMatchObject({ kind: "parked", holders: { lockfile: 12 } });
  });

  it("reacquires every recorded area before enabling a resumed repair writer", async () => {
    const state = store();
    await state.archon.put(
      "core/issues/12",
      {
        ...assignment(),
        route: "repair",
        brief: {
          summary: "Fixture scope",
          source_paths: ["src/**"],
          test_paths: ["tests/**"],
          shared_areas: ["lockfile", "migrations"],
          repair: null,
        },
      },
      { ifRevision: 0 },
    );
    await claim(state, "retry-run");
    prepareRound(state);
    fixture.round.context.write.mockImplementation(() => {
      expect(state.documents.get(RESERVATIONS)?.value.areas).toEqual({
        lockfile: 12,
        migrations: 12,
      });
    });
    vi.resetModules();
    await import("../../../scripts/archon-factory/pack/deliver/scripts/after-scope.ts");

    expect(fixture.emitted.at(-1)).toMatchObject({
      define: "no",
      build: "yes",
    });
    expect(fixture.round.context.write).toHaveBeenCalledOnce();
    expect(await releaseInactiveReservations(state.archon)).toMatchObject({
      noop: true,
      released: [],
    });
  });

  it("revalidates cleanup when the same holder reacquires between the fresh read and deletion CAS", async () => {
    const state = store();
    const listed = {
      ...assignment(),
      status: "BLOCKED",
      route: null,
      blocker: { route: "repair" },
    };
    await state.archon.put("core/issues/12", listed, { ifRevision: 0 });
    await reserveAreas(state.archon, { issue: 12, areas: ["lockfile"] });
    const originalPut = state.archon.put.getMockImplementation()!;
    state.archon.put.mockImplementationOnce(async (name, value, options) => {
      expect(name).toBe(RESERVATIONS);
      await state.apply(
        planControl(await state.archon.get("core/issues/12"), {
          action: "retry",
          requestId: "retry-before-delete",
          by: "operator",
          now: NOW,
          installed: { policyRevision: POLICY },
        }),
      );
      await claim(state, "retry-run");
      await reserveAreas(state.archon, { issue: 12, areas: ["lockfile"] });
      return originalPut(name, value, options);
    });

    const released = await releaseStaleReservations({
      archon: state.archon,
      items: new Map([[12, listed]]),
    });
    const competitor = await reserveAreas(state.archon, {
      issue: 13,
      areas: ["lockfile"],
    });

    expect({
      released,
      competitor,
      item: (await state.archon.get("core/issues/12")).value.status,
    }).toMatchObject({
      released: [],
      competitor: { kind: "parked", holders: { lockfile: 12 } },
      item: "active",
    });
  });

  it("keeps a restarted active holder when cleanup resumes from a terminal listing", async () => {
    const state = store();
    const listed = {
      ...assignment(),
      status: "BLOCKED",
      route: null,
      blocker: { route: "repair" },
    };
    await state.archon.put("core/issues/12", listed, { ifRevision: 0 });
    const items = new Map([[12, structuredClone(listed)]]);
    await state.apply(
      planControl(await state.archon.get("core/issues/12"), {
        action: "retry",
        requestId: "retry-stale-listing",
        by: "operator",
        now: NOW,
        installed: { policyRevision: POLICY },
      }),
    );
    await claim(state, "retry-run");
    await reserveAreas(state.archon, { issue: 12, areas: ["lockfile"] });

    const released = await releaseStaleReservations({
      archon: state.archon,
      items,
    });
    const competitor = await reserveAreas(state.archon, {
      issue: 13,
      areas: ["lockfile"],
    });

    expect({
      released,
      competitor,
      item: (await state.archon.get("core/issues/12")).value.status,
    }).toMatchObject({
      released: [],
      competitor: { kind: "parked", holders: { lockfile: 12 } },
      item: "active",
    });
  });

  it.each([
    { terminal: "BLOCKED", action: "retry", route: "repair" },
    { terminal: "BLOCKED", action: "retry", route: "oracle" },
    { terminal: "BLOCKED", action: "retry", route: "review" },
    { terminal: "stopped", action: "reopen", route: "repair" },
    { terminal: "stopped", action: "reopen", route: "oracle" },
    { terminal: "stopped", action: "reopen", route: "review" },
    { terminal: "PR_READY", action: "reopen", route: "repair" },
    { terminal: "PR_READY", action: "reopen", route: "oracle" },
    { terminal: "PR_READY", action: "reopen", route: "review" },
  ])(
    "parks $terminal $action on $route before writers when another issue acquired its released area",
    async ({ terminal, action, route }) => {
      const state = store();
      await state.archon.put(
        "core/issues/12",
        {
          ...assignment(),
          route,
          brief: {
            summary: "Fixture scope",
            source_paths: ["src/**"],
            test_paths: ["tests/**"],
            shared_areas: ["lockfile"],
            repair: null,
          },
        },
        { ifRevision: 0 },
      );
      await claim(state, "original-run");
      await reserveAreas(state.archon, { issue: 12, areas: ["lockfile"] });
      await state.apply(
        planFinish(await state.archon.get("core/issues/12"), {
          runId: "original-run",
          now: NOW,
          outcome: terminal,
          blocker: { code: "fixture-check", detail: "Transient failure" },
        }),
      );
      expect(
        await releaseInactiveReservations(state.archon, { issues: [12] }),
      ).toMatchObject({ written: true, released: ["lockfile"] });
      await reserveAreas(state.archon, { issue: 13, areas: ["lockfile"] });
      await state.apply(
        planControl(await state.archon.get("core/issues/12"), {
          action,
          requestId: "retry-fixture",
          by: "operator",
          now: NOW,
          installed: { policyRevision: POLICY },
        }),
      );
      await claim(state, "retry-run");
      const ledger = prepareRound(state, route);
      vi.resetModules();
      let failure: unknown;
      try {
        await import("../../../scripts/archon-factory/pack/deliver/scripts/after-scope.ts");
      } catch (error) {
        failure = error;
      }
      expect({
        failure,
        output: fixture.emitted.at(-1),
        ledger: ledger.get("after-scope"),
        scopedWriters: fixture.round.context.write.mock.calls.length,
        owner: (await state.archon.get(RESERVATIONS)).value.areas.lockfile,
      }).toMatchObject({
        failure: EXIT,
        output: { define: "no", build: "no" },
        ledger: {
          parked: {
            code: "area-reserved",
            areas: ["lockfile"],
            holders: { lockfile: 13 },
          },
        },
        scopedWriters: 0,
        owner: 13,
      });
    },
  );
});

describe("fresh ownership-aware reservation release", () => {
  it("preserves terminal cleanup holds after the native lease expires", async () => {
    const state = store();
    state.documents.set(RESERVATIONS, {
      name: RESERVATIONS,
      revision: 1,
      value: { v: 1, areas: { lockfile: 12 } },
      lease: null,
    });
    state.documents.set("core/issues/12", {
      name: "core/issues/12",
      revision: 1,
      value: {
        ...assignment(),
        status: "BLOCKED",
        cleanup: { receipt: { cleanupConfirmed: false } },
      },
      lease: { runId: "ended-run", live: false },
    });
    expect(await releaseInactiveReservations(state.archon)).toEqual({
      noop: true,
      released: [],
    });
    expect(state.documents.get(RESERVATIONS)!.value.areas).toEqual({
      lockfile: 12,
    });
  });

  it("releases terminal and missing holders while preserving live holders and document metadata", async () => {
    const state = store();
    await state.archon.put(
      "core/issues/12",
      { ...assignment(), status: "BLOCKED" },
      { ifRevision: 0 },
    );
    await state.archon.put(
      "core/issues/13",
      { ...assignment(13), status: "active" },
      { ifRevision: 0 },
    );
    await state.archon.put(
      RESERVATIONS,
      {
        v: 1,
        areas: { lockfile: 12, migrations: 13, documentation: 14 },
        marker: "preserve",
      },
      { ifRevision: 0 },
    );

    expect(await releaseInactiveReservations(state.archon)).toMatchObject({
      written: true,
      released: ["documentation", "lockfile"],
    });
    expect((await state.archon.get(RESERVATIONS)).value).toEqual({
      v: 1,
      areas: { migrations: 13 },
      marker: "preserve",
    });
  });

  it.each(["pending", "waiting", "active"])(
    "preserves a current %s holder even when its lease is absent",
    async (status) => {
      const state = store();
      await state.archon.put(
        "core/issues/12",
        { ...assignment(), status },
        { ifRevision: 0 },
      );
      await reserveAreas(state.archon, { issue: 12, areas: ["lockfile"] });
      state.archon.put.mockClear();

      expect(await releaseInactiveReservations(state.archon)).toMatchObject({
        noop: true,
        released: [],
      });
      expect(state.archon.put).not.toHaveBeenCalled();
    },
  );

  it.each(["BLOCKED", "stopped", "PR_READY", "MERGED"])(
    "preserves a terminal %s holder while a live lease remains",
    async (status) => {
      const state = store();
      await state.archon.put(
        "core/issues/12",
        { ...assignment(), status },
        { ifRevision: 0 },
      );
      state.documents.get("core/issues/12")!.lease = {
        runId: "still-live",
        live: true,
      };
      await reserveAreas(state.archon, { issue: 12, areas: ["lockfile"] });

      expect(await releaseInactiveReservations(state.archon)).toMatchObject({
        noop: true,
        released: [],
      });
      expect((await state.archon.get(RESERVATIONS)).value.areas).toEqual({
        lockfile: 12,
      });
    },
  );

  it.each([
    { status: "unknown" },
    { ...assignment(), issue: 99, status: "BLOCKED" },
    { ...assignment(), assignment: null, status: "BLOCKED" },
  ])(
    "keeps malformed or mismatched holder evidence rather than treating it as absent",
    async (value) => {
      const state = store();
      await state.archon.put("core/issues/12", value, { ifRevision: 0 });
      await reserveAreas(state.archon, { issue: 12, areas: ["lockfile"] });

      expect(await releaseInactiveReservations(state.archon)).toMatchObject({
        noop: true,
        released: [],
      });
      expect((await state.archon.get(RESERVATIONS)).value.areas).toEqual({
        lockfile: 12,
      });
    },
  );

  it("limits a terminal recorder's release to the requested issue", async () => {
    const state = store();
    await state.archon.put(
      "core/issues/12",
      { ...assignment(), status: "BLOCKED" },
      { ifRevision: 0 },
    );
    await state.archon.put(
      "core/issues/13",
      { ...assignment(13), status: "PR_READY" },
      { ifRevision: 0 },
    );
    await state.archon.put(
      RESERVATIONS,
      { v: 1, areas: { lockfile: 12, migrations: 13 } },
      { ifRevision: 0 },
    );

    expect(
      await releaseInactiveReservations(state.archon, { issues: [12] }),
    ).toMatchObject({ written: true, released: ["lockfile"] });
    expect((await state.archon.get(RESERVATIONS)).value.areas).toEqual({
      migrations: 13,
    });
    expect(
      state.archon.get.mock.calls.some(([name]) => name === "core/issues/13"),
    ).toBe(false);
  });

  it("preserves another owner who replaces the reservation before the release CAS", async () => {
    const state = store();
    await state.archon.put(
      "core/issues/12",
      { ...assignment(), status: "BLOCKED" },
      { ifRevision: 0 },
    );
    await state.archon.put(
      "core/issues/13",
      { ...assignment(13), status: "active" },
      { ifRevision: 0 },
    );
    await reserveAreas(state.archon, { issue: 12, areas: ["lockfile"] });
    const originalPut = state.archon.put.getMockImplementation()!;
    state.archon.put.mockImplementationOnce(async (name, value, options) => {
      await originalPut(
        RESERVATIONS,
        { v: 1, areas: { lockfile: 13 } },
        options,
      );
      return originalPut(name, value, options);
    });

    expect(
      await releaseInactiveReservations(state.archon, { issues: [12] }),
    ).toMatchObject({ noop: true, released: [] });
    expect((await state.archon.get(RESERVATIONS)).value.areas).toEqual({
      lockfile: 13,
    });
  });

  it("fails closed without releasing any area when a current holder cannot be read", async () => {
    const state = store();
    await state.archon.put(
      RESERVATIONS,
      { v: 1, areas: { lockfile: 12 } },
      { ifRevision: 0 },
    );
    const originalGet = state.archon.get.getMockImplementation()!;
    state.archon.get.mockImplementation(async (name) => {
      if (name === "core/issues/12") throw new Error("Holder read unavailable");
      return originalGet(name);
    });

    await expect(releaseInactiveReservations(state.archon)).rejects.toThrow(
      "Holder read unavailable",
    );
    expect(await releaseStaleReservations({ archon: state.archon })).toEqual(
      [],
    );
    expect((await state.archon.get(RESERVATIONS)).value.areas).toEqual({
      lockfile: 12,
    });
  });

  it("bounds conflict retries and re-reads the current holder on each attempt", async () => {
    const state = store();
    await state.archon.put(
      "core/issues/12",
      { ...assignment(), status: "BLOCKED" },
      { ifRevision: 0 },
    );
    await reserveAreas(state.archon, { issue: 12, areas: ["lockfile"] });
    state.archon.put.mockImplementation(async () => {
      throw new StateConflict("Persistent conflict", null);
    });
    state.archon.get.mockClear();

    expect(
      await releaseInactiveReservations(state.archon, { attempts: 3 }),
    ).toEqual({ conflict: true, released: [] });
    expect(
      state.archon.get.mock.calls.filter(([name]) => name === "core/issues/12"),
    ).toHaveLength(3);
    expect((await state.archon.get(RESERVATIONS)).value.areas).toEqual({
      lockfile: 12,
    });
  });

  it("leaves a missing reservation document untouched", async () => {
    const state = store();
    expect(await releaseInactiveReservations(state.archon)).toEqual({
      noop: true,
      released: [],
    });
    expect(state.archon.put).not.toHaveBeenCalled();
  });
});

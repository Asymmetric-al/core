import { describe, expect, it, vi } from "vitest";

import { buildFactoryConfig } from "../../../scripts/archon-factory/installation/install-logic.mjs";
import { validateConfig } from "../../../scripts/archon-factory/pack/.shared/config.mjs";
import { checkFactoryStorage } from "../../../scripts/archon-factory/pack/.shared/storage-policy.mjs";

const reserve = (amount: number | string) => ({
  minAvailableBytes: amount,
  minAvailableInodes: amount,
});
const policy = () => ({
  version: 1,
  reserves: {
    state: reserve(11),
    artifacts: reserve(22),
    checkout: reserve(33),
    cache: reserve(44),
  },
  additionalTargets: [] as any[],
});
const install = (existing: Record<string, unknown> = {}) =>
  buildFactoryConfig({
    existing,
    root: "/factory",
    control: "/factory/control",
    home: "/native/archon",
    archon: "/bin/archon",
    hostId: "fixture",
    port: 8181,
    image: `sha256:${"e".repeat(64)}`,
  });
const config = () => ({ ...install(), storage: policy() });
const context = (operation = "admission") => ({
  config: config(),
  operation,
  runId: "run-12",
  artifacts: "/external/artifacts/run-12",
  ...(operation === "admission"
    ? {}
    : {
        where: {
          root: "/checkouts/12",
          repo: "/checkouts/12/repo",
          outbox: "/checkouts/12/outbox.git",
        },
      }),
});
// The built-in targets fit one probe batch of 16; reserved extra mounts
// push a context into a second batch.
const batched = (operation = "admission") => {
  const current = context(operation);
  current.config.storage.additionalTargets = Array.from(
    { length: 8 },
    (_, index) => ({ path: `/extra/${index}`, ...reserve(55) }),
  );
  return current;
};
const mounted = (directory: string, id = 2) =>
  `${id} 1 8:${id} / ${directory} rw - ext4 /dev/fixture rw\n`;
const rootMount = "1 0 8:1 / / rw - ext4 /dev/root rw\n";
const ready = ({ operation }: { operation: string }) => ({
  ok: true,
  code: "STORAGE_READY",
  operation,
});

describe("explicit storage policy configuration and installation", () => {
  it("keeps legacy read-only configuration loadable without inventing thresholds", () => {
    const legacy = install();
    expect(validateConfig(legacy)).toBe(legacy);
    expect(legacy).not.toHaveProperty("storage");
  });

  it("preserves the exact operator policy across installation", () => {
    const storage = policy();
    expect(install({ storage }).storage).toEqual(storage);
  });

  it.each([
    undefined,
    0,
    -1,
    NaN,
    Infinity,
    0.5,
    Number.MAX_SAFE_INTEGER + 1,
    "0",
    "01",
    "1.5",
    " 1",
    "1GB",
    ((1n << 128n) + 1n).toString(),
  ])("refuses invalid explicit reserve %s", (amount) => {
    const candidate = config();
    candidate.storage.reserves.state.minAvailableBytes = amount as number;
    expect(() => validateConfig(candidate)).toThrow(/storage/);
  });

  it.each([
    null,
    {},
    { version: 1, reserves: {} },
    { ...policy(), enabled: false },
    { ...policy(), additionalTargets: [{ path: "/mnt/cache", ...reserve(0) }] },
  ])(
    "refuses a malformed policy instead of silently ignoring it",
    (storage) => {
      expect(() => validateConfig({ ...install(), storage })).toThrow(
        /storage/,
      );
    },
  );

  it("accepts exact large decimal reserves and explicitly reserved extra mounts", () => {
    const candidate = config();
    candidate.storage.reserves.state = reserve(((1n << 128n) - 1n).toString());
    candidate.storage.additionalTargets = [
      { path: "/other/cache", ...reserve("12345678901234567890") },
    ];
    expect(validateConfig(candidate)).toBe(candidate);
  });

  it.each([undefined, 0, -1, Infinity, "unknown", "0", "01"])(
    "refuses missing or invalid inode reserve %s independently of byte reserves",
    (amount) => {
      const candidate = config();
      candidate.storage.reserves.cache.minAvailableInodes = amount as number;
      expect(() => validateConfig(candidate)).toThrow(/storage/);
    },
  );

  it.each(
    [
      [{ path: "/mnt/cache/", ...reserve(1) }],
      [{ path: "/mnt/../cache", ...reserve(1) }],
      [{ path: "/mnt/cache", ...reserve(1), optional: true }],
      Array.from({ length: 17 }, (_unused, index) => ({
        path: `/mnt/${index}`,
        ...reserve(1),
      })),
    ].map((additionalTargets) => [additionalTargets]),
  )(
    "rejects ambiguous or unbounded additional target policy",
    (additionalTargets) => {
      expect(() =>
        validateConfig({
          ...config(),
          storage: { ...policy(), additionalTargets },
        }),
      ).toThrow(/storage/);
    },
  );
});

describe("storage target integration with the stable guard", () => {
  it("refuses missing policy without probing, even for a loadable legacy config", async () => {
    const check = vi.fn(ready);
    const readMountInfo = vi.fn(() => rootMount);
    expect(
      await checkFactoryStorage(
        { ...context(), config: install() },
        { check, readMountInfo },
      ),
    ).toEqual({ ok: false, code: "STORAGE_POLICY_MISSING" });
    expect(check).not.toHaveBeenCalled();
    expect(readMountInfo).not.toHaveBeenCalled();
  });

  it("refuses a malformed supplied policy at the writer boundary before reading mounts", async () => {
    const current = context();
    current.config.storage.reserves.artifacts.minAvailableInodes = 0;
    const check = vi.fn(ready);
    const readMountInfo = vi.fn(() => rootMount);
    expect(
      await checkFactoryStorage(current, { check, readMountInfo }),
    ).toEqual({ ok: false, code: "STORAGE_POLICY_INVALID" });
    expect(check).not.toHaveBeenCalled();
    expect(readMountInfo).not.toHaveBeenCalled();
  });

  it.each(["admission", "publish", "merge"])(
    "probes actual native, factory, cache and effective artifacts paths for %s",
    async (operation) => {
      const check = vi.fn(ready);
      expect(
        await checkFactoryStorage(context(operation), {
          check,
          readMountInfo: () => rootMount,
        }),
      ).toMatchObject({ ok: true, code: "STORAGE_READY", operation });
      const targets = check.mock.calls.flatMap(
        ([request]: any[]) => request.targets,
      );
      // The directories the service writes on VM 100 (observed 12 November
      // 2026): the engine keeps its store in ARCHON_HOME and every run's
      // artifacts, logs and workflow source under ARCHON_HOME/workspaces.
      expect(targets).toEqual(
        expect.arrayContaining([
          { path: "/native/archon", ...reserve(11) },
          { path: "/native/archon/workspaces", ...reserve(22) },
          { path: "/factory", ...reserve(11) },
          { path: "/factory/runs", ...reserve(11) },
          { path: "/factory/runs/run-12", ...reserve(11) },
          { path: "/factory/issues", ...reserve(33) },
          { path: "/factory/views", ...reserve(33) },
          { path: "/factory/locks", ...reserve(11) },
          { path: "/factory/mirror.git", ...reserve(33) },
          { path: "/factory/cache", ...reserve(44) },
          { path: "/external/artifacts/run-12", ...reserve(22) },
        ]),
      );
      // Never write-probed: the root-owned control folder the service cannot
      // write by design, engine paths that do not exist in the pinned
      // layout, and outbox or cache paths the factory does not use (each
      // issue has its own outbox; cache seeds live under cache/bun-seed).
      const probed = targets.map((target: { path: string }) => target.path);
      for (const never of [
        "/factory/control",
        "/native/archon/state",
        "/native/archon/artifacts",
        "/native/archon/artifacts/runs",
        "/native/archon/workflow-source",
        "/factory/outbox.git",
        "/factory/cache/bun",
      ])
        expect(probed).not.toContain(never);
      if (operation !== "admission")
        expect(targets).toEqual(
          expect.arrayContaining([
            { path: "/external/artifacts/run-12/round", ...reserve(22) },
            { path: "/checkouts/12", ...reserve(33) },
            { path: "/checkouts/12/repo", ...reserve(33) },
            { path: "/checkouts/12/outbox.git", ...reserve(33) },
          ]),
        );
      expect(
        check.mock.calls.every(
          ([request]: any[]) =>
            request.operation === operation && request.targets.length <= 16,
        ),
      ).toBe(true);
    },
  );

  it("probes child mounts rather than treating a parent filesystem as their evidence", async () => {
    const check = vi.fn(ready);
    const mounts =
      rootMount +
      mounted("/native/archon/state/child") +
      mounted("/factory/cache/bun/child", 3) +
      mounted("/checkouts/12/repo/node_modules", 4) +
      mounted("/external/artifacts/run-12/child", 5);
    expect(
      await checkFactoryStorage(context("publish"), {
        check,
        readMountInfo: () => mounts,
      }),
    ).toMatchObject({ ok: true });
    expect(
      check.mock.calls.flatMap(([request]: any[]) => request.targets),
    ).toEqual(
      expect.arrayContaining([
        { path: "/native/archon/state/child", ...reserve(11) },
        { path: "/factory/cache/bun/child", ...reserve(44) },
        { path: "/checkouts/12/repo/node_modules", ...reserve(33) },
        { path: "/external/artifacts/run-12/child", ...reserve(22) },
      ]),
    );
  });

  it("decodes mountinfo paths and uses the most-specific explicit reserve", async () => {
    const current = context();
    current.config.storage.additionalTargets = [
      { path: "/factory/cache/large cache", ...reserve(55) },
    ];
    const mounts = rootMount + mounted("/factory/cache/large\\040cache/nested");
    const check = vi.fn(ready);
    expect(
      await checkFactoryStorage(current, {
        check,
        readMountInfo: () => mounts,
      }),
    ).toMatchObject({ ok: true });
    expect(
      check.mock.calls.flatMap(([request]: any[]) => request.targets),
    ).toContainEqual({
      path: "/factory/cache/large cache/nested",
      ...reserve(55),
    });
  });

  it("refuses excessive child mounts rather than dropping writer targets", async () => {
    const mounts =
      rootMount +
      Array.from({ length: 64 }, (_unused, index) =>
        mounted(`/factory/cache/mount-${index}`, index + 2),
      ).join("");
    const check = vi.fn(ready);
    expect(
      await checkFactoryStorage(context(), {
        check,
        readMountInfo: () => mounts,
      }),
    ).toEqual({ ok: false, code: "STORAGE_TARGETS_EXCEEDED" });
    expect(check).not.toHaveBeenCalled();
  });

  it("fails closed when mount evidence is absent, malformed, or changes during probes", async () => {
    const check = vi.fn(ready);
    for (const mounts of [
      "",
      "not mountinfo",
      rootMount + mounted("relative"),
    ]) {
      expect(
        await checkFactoryStorage(context(), {
          check,
          readMountInfo: () => mounts,
        }),
      ).toEqual({ ok: false, code: "STORAGE_MOUNTS_UNAVAILABLE" });
    }
    expect(check).not.toHaveBeenCalled();
    const readMountInfo = vi
      .fn()
      .mockReturnValueOnce(rootMount)
      .mockReturnValue(rootMount + mounted("/factory/cache/bun/late"));
    expect(
      await checkFactoryStorage(context(), { check, readMountInfo }),
    ).toEqual({ ok: false, code: "STORAGE_MOUNTS_CHANGED" });
  });

  it("refuses unavailable mount reads without exposing raw filesystem errors", async () => {
    const check = vi.fn(ready);
    expect(
      await checkFactoryStorage(context(), {
        check,
        readMountInfo: () => {
          throw new Error("/private/mounts");
        },
      }),
    ).toEqual({ ok: false, code: "STORAGE_MOUNTS_UNAVAILABLE" });
    expect(check).not.toHaveBeenCalled();
  });

  it("refuses when final mount evidence becomes unavailable after successful probes", async () => {
    const readMountInfo = vi
      .fn()
      .mockReturnValueOnce(rootMount)
      .mockImplementation(() => {
        throw new Error("/private/mounts");
      });
    const check = vi.fn(ready);
    expect(
      await checkFactoryStorage(batched(), { check, readMountInfo }),
    ).toEqual({ ok: false, code: "STORAGE_MOUNTS_UNAVAILABLE" });
    expect(check).toHaveBeenCalledTimes(2);
  });

  it("notices a replacement ancestor mount while tolerating unrelated mount changes", async () => {
    const changedRoot = rootMount.replace("8:1", "8:7");
    const relevant = vi
      .fn()
      .mockReturnValueOnce(rootMount)
      .mockReturnValue(changedRoot);
    expect(
      await checkFactoryStorage(context(), {
        check: ready,
        readMountInfo: relevant,
      }),
    ).toEqual({ ok: false, code: "STORAGE_MOUNTS_CHANGED" });
    const unrelated = vi
      .fn()
      .mockReturnValueOnce(rootMount)
      .mockReturnValue(rootMount + mounted("/unrelated"));
    expect(
      await checkFactoryStorage(context(), {
        check: ready,
        readMountInfo: unrelated,
      }),
    ).toMatchObject({ ok: true, code: "STORAGE_READY" });
  });

  it.each([
    "STORAGE_DIRECTORY_UNAVAILABLE",
    "STORAGE_CAPACITY_INVALID",
    "STORAGE_INODES_LOW",
    "STORAGE_PROBE_FAILED",
    "STORAGE_PROBE_MISMATCH",
    "STORAGE_CLOSE_FAILED",
  ])(
    "propagates bounded %s evidence without paths or raw exceptions",
    async (code) => {
      const check = vi.fn().mockReturnValueOnce({
        ok: false,
        code,
        targetIndex: 1,
        detail: "/private/secret",
      });
      expect(
        await checkFactoryStorage(context(), {
          check,
          readMountInfo: () => rootMount,
        }),
      ).toEqual({
        ok: false,
        code,
        targetIndex: 1,
        role: "native-workspaces",
      });
      expect(check).toHaveBeenCalledOnce();
    },
  );

  it("does not authorize on a prior successful batch, opaque success, or thrown IO", async () => {
    const check = vi.fn().mockImplementationOnce(ready).mockReturnValue({
      ok: false,
      code: "STORAGE_BYTES_LOW",
      targetIndex: 0,
    });
    expect(
      await checkFactoryStorage(batched("merge"), {
        check,
        readMountInfo: () => rootMount,
      }),
    ).toMatchObject({ ok: false, code: "STORAGE_BYTES_LOW", targetIndex: 16 });
    for (const result of [
      null,
      { ok: true },
      { ok: true, code: "STORAGE_READY", operation: "other" },
      { ok: false, code: "/private/error" },
    ]) {
      expect(
        await checkFactoryStorage(context(), {
          check: () => result,
          readMountInfo: () => rootMount,
        }),
      ).toEqual({ ok: false, code: "STORAGE_IO_UNAVAILABLE" });
    }
    expect(
      await checkFactoryStorage(context(), {
        check: () => {
          throw new Error("/private/error");
        },
        readMountInfo: () => rootMount,
      }),
    ).toEqual({ ok: false, code: "STORAGE_IO_UNAVAILABLE" });
  });

  it.each([-1, 16, 0.5])(
    "refuses a malformed target index %s instead of emitting an unbounded role",
    async (targetIndex) => {
      expect(
        await checkFactoryStorage(context(), {
          check: () => ({
            ok: false,
            code: "STORAGE_PROBE_FAILED",
            targetIndex,
          }),
          readMountInfo: () => rootMount,
        }),
      ).toEqual({ ok: false, code: "STORAGE_IO_UNAVAILABLE" });
    },
  );

  it("preserves a finite capability refusal without requiring a target index", async () => {
    expect(
      await checkFactoryStorage(context(), {
        check: () => ({
          ok: false,
          code: "STORAGE_NOFOLLOW_UNAVAILABLE",
          detail: "/private/runtime",
        }),
        readMountInfo: () => rootMount,
      }),
    ).toEqual({ ok: false, code: "STORAGE_NOFOLLOW_UNAVAILABLE" });
  });

  it.each([
    { runId: "../escape" },
    { artifacts: undefined },
    { artifacts: "/external/../escape" },
    { operation: "read" },
    { operation: "merge", where: undefined },
  ])(
    "refuses incomplete or noncanonical actual writer context",
    async (change) => {
      const check = vi.fn(ready);
      expect(
        await checkFactoryStorage(
          { ...context(), ...change },
          { check, readMountInfo: () => rootMount },
        ),
      ).toEqual({ ok: false, code: "STORAGE_CONTEXT_INVALID" });
      expect(check).not.toHaveBeenCalled();
    },
  );

  it("resamples every call and snapshots reserves before awaiting probes", async () => {
    const current = batched();
    const check = vi.fn().mockImplementation(async (request) => {
      current.config.storage.reserves.artifacts.minAvailableBytes = 1;
      return ready(request);
    });
    const readMountInfo = vi.fn(() => rootMount);
    await checkFactoryStorage(current, { check, readMountInfo });
    expect(
      check.mock.calls.flatMap(([request]: any[]) => request.targets),
    ).toContainEqual({ path: current.artifacts, ...reserve(22) });
    await checkFactoryStorage(batched(), { check, readMountInfo });
    expect(readMountInfo).toHaveBeenCalledTimes(4);
    expect(check).toHaveBeenCalledTimes(4);
  });
});

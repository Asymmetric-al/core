import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import os from "node:os";
import path from "node:path";
import { PassThrough } from "node:stream";

import { afterEach, expect, it, vi } from "vitest";

import { createCleanupReconciler } from "../../../scripts/archon-factory/pack/.shared/cleanup-reconciliation.mjs";
import { confirmedCleanup } from "../../../scripts/archon-factory/pack/.shared/cleanup-state.mjs";

import type { spawn as nodeSpawn } from "node:child_process";

const roots: string[] = [];
const runId = "run-cleanup-12345678";
const assignment = "assignment-12";
const issue = 12;
const labels = {
  "core.archon.executor": "candidate-check",
  "core.archon.attempt": "01234567-89ab-4cde-8fab-0123456789ab",
  "core.archon.run": runId,
  "core.archon.issue": "12",
};

afterEach(() => {
  for (const root of roots.splice(0))
    rmSync(root, { recursive: true, force: true });
});

function fixture() {
  const root = realpathSync(
    mkdtempSync(path.join(os.tmpdir(), "archon-cleanup-reconciliation-")),
  );
  roots.push(root);
  const artifactsDir = path.join(root, "artifacts", runId);
  mkdirSync(artifactsDir, { recursive: true });
  const trusted = {
    dockerExecutable: path.join(root, "operator-docker"),
    artifactsDir,
    runId,
    assignment,
    issue,
  };
  const receipt = {
    labels: { ...labels },
    stdout: "unchanged original check output",
    cleanupConfirmed: false,
    reusable: false,
  };
  const cleanup = { runId, assignment, issue, step: "freeze", receipt };
  return {
    root,
    trusted,
    request: { cleanup, labels: { ...labels }, runId, assignment, issue },
  };
}

function artifactFixture() {
  const base = fixture();
  const { receipt, ...identity } = base.request.cleanup;
  const content = Buffer.from(JSON.stringify(receipt, null, 2) + "\n");
  const file = path.join(
    base.trusted.artifactsDir,
    "round",
    "cleanup-state.json",
  );
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, content);
  const receiptReference = {
    path: file,
    bytes: content.byteLength,
    sha256: createHash("sha256").update(content).digest("hex"),
    labels: { ...labels },
  };
  return {
    ...base,
    content,
    file,
    request: { ...base.request, cleanup: { ...identity, receiptReference } },
  };
}

type DockerStep = {
  operation: "ps" | "rm";
  stdout?: string;
  code?: number | null;
  error?: Error;
  signal?: string | null;
  interrupted?: boolean;
};

function dockerTransport(steps: DockerStep[]) {
  const calls: { executable: string; args: string[]; options: unknown }[] = [];
  const spawn = vi.fn(
    (executable: string, args: string[], options: unknown) => {
      calls.push({ executable, args, options });
      const child = Object.assign(new EventEmitter(), {
        stdout: new PassThrough(),
        stderr: new PassThrough(),
        kill: vi.fn(() => true),
      });
      queueMicrotask(() => {
        const step = steps.shift();
        if (!step || step.operation !== args[4]) {
          child.emit("error", new Error("Missing Docker command evidence"));
          return;
        }
        if (step.error) {
          child.emit("error", step.error);
          return;
        }
        if (step.interrupted) child.kill();
        child.stdout.end(step.stdout ?? "");
        child.stderr.end();
        child.emit(
          "close",
          step.code === undefined ? 0 : step.code,
          step.signal ?? null,
        );
      });
      return child;
    },
  );
  return { spawn: spawn as unknown as typeof nodeSpawn, calls };
}

it("confirms exact inline ownership only after the executor proves an empty workload", async () => {
  const { trusted, request } = fixture();
  const original = structuredClone(request.cleanup);
  const docker = dockerTransport([{ operation: "ps" }]);
  const evidence = await createCleanupReconciler(trusted, {
    spawn: docker.spawn,
  })(request);
  expect(evidence).toEqual({
    ok: true,
    found: [],
    remaining: [],
    labels,
    cleanupConfirmed: true,
    reusable: true,
  });
  expect(confirmedCleanup(request.cleanup, { confirmed: true, evidence })).toBe(
    true,
  );
  expect(request.cleanup).toEqual(original);
  expect(docker.calls).toHaveLength(1);
  expect(docker.calls[0]).toMatchObject({
    executable: trusted.dockerExecutable,
    options: { shell: false, env: {} },
  });
  expect(docker.calls[0].args.slice(4)).toEqual([
    "ps",
    "--all",
    "--quiet",
    "--no-trunc",
    "--filter",
    "label=core.archon.executor=candidate-check",
    "--filter",
    "label=core.archon.attempt=01234567-89ab-4cde-8fab-0123456789ab",
    "--filter",
    `label=core.archon.run=${runId}`,
    "--filter",
    "label=core.archon.issue=12",
  ]);
});

it("confirms a byte-exact referenced receipt under the trusted artifacts root without rewriting it", async () => {
  const { trusted, request, content, file } = artifactFixture();
  const original = structuredClone(request.cleanup);
  const docker = dockerTransport([{ operation: "ps" }]);
  const evidence = await createCleanupReconciler(trusted, {
    spawn: docker.spawn,
  })(request);
  expect(evidence).toEqual({
    ok: true,
    found: [],
    remaining: [],
    labels,
    cleanupConfirmed: true,
    reusable: true,
    receiptSha256: request.cleanup.receiptReference.sha256,
  });
  expect(confirmedCleanup(request.cleanup, { confirmed: true, evidence })).toBe(
    true,
  );
  expect(readFileSync(file)).toEqual(content);
  expect(request.cleanup).toEqual(original);
  expect(docker.calls).toHaveLength(1);
});

it.each([
  { code: 1, signal: null },
  { code: null, signal: null },
  { code: 0, signal: "SIGTERM" },
  { code: 0, interrupted: true },
])(
  "never upgrades failed or partial removal command evidence into reusable ownership: %j",
  async (completion) => {
    const { trusted, request } = fixture();
    const containerId = "d".repeat(64);
    const docker = dockerTransport([
      { operation: "ps", stdout: containerId },
      { operation: "rm", stdout: containerId, ...completion },
      { operation: "ps" },
    ]);
    const evidence = await createCleanupReconciler(trusted, {
      spawn: docker.spawn,
    })(request);
    expect(evidence).toMatchObject({
      ok: false,
      cleanupConfirmed: false,
      reusable: false,
    });
    expect(
      confirmedCleanup(request.cleanup, { confirmed: true, evidence }),
    ).toBe(false);
  },
);

it("confirms successful removal only after the exact-label executor relists no survivors", async () => {
  const { trusted, request } = fixture();
  const containerId = "d".repeat(64);
  const docker = dockerTransport([
    { operation: "ps", stdout: containerId },
    { operation: "rm", stdout: containerId },
    { operation: "ps" },
  ]);
  const evidence = await createCleanupReconciler(trusted, {
    spawn: docker.spawn,
  })(request);
  expect(evidence).toMatchObject({
    ok: true,
    found: [containerId],
    remaining: [],
    cleanupConfirmed: true,
    reusable: true,
    labels,
  });
  expect(docker.calls.map((call) => call.args[4])).toEqual(["ps", "rm", "ps"]);
  expect(docker.calls[1].args.slice(4)).toEqual([
    "rm",
    "--force",
    "--volumes",
    containerId,
  ]);
  expect(confirmedCleanup(request.cleanup, { confirmed: true, evidence })).toBe(
    true,
  );
});

it.each(
  (
    [
      [],
      [{ operation: "ps", code: 1 }],
      [{ operation: "ps", code: null }],
      [{ operation: "ps", code: 0, signal: "SIGTERM" }],
      [{ operation: "ps", stdout: "truncated-container-id" }],
      [{ operation: "ps", error: new Error("Docker unavailable") }],
      [{ operation: "ps", stdout: "d".repeat(64) }, { operation: "rm" }],
      [
        { operation: "ps", stdout: "d".repeat(64) },
        { operation: "rm" },
        { operation: "ps", stdout: "d".repeat(64) },
      ],
      [
        { operation: "ps", stdout: "d".repeat(64) },
        { operation: "rm", error: new Error("remove unavailable") },
        { operation: "ps" },
      ],
      [
        { operation: "ps", stdout: "d".repeat(64) },
        { operation: "rm", stdout: "x".repeat(1_048_577) },
        { operation: "ps" },
      ],
    ] satisfies DockerStep[][]
  ).map((steps) => ({ steps })),
)(
  "fails closed on missing, partial, failed or surviving executor evidence: %#",
  async ({ steps }) => {
    const { trusted, request } = fixture();
    const docker = dockerTransport([...steps]);
    const evidence = await createCleanupReconciler(trusted, {
      spawn: docker.spawn,
    })(request);
    expect(evidence).toMatchObject({
      ok: false,
      cleanupConfirmed: false,
      reusable: false,
    });
    expect(
      confirmedCleanup(request.cleanup, { confirmed: true, evidence }),
    ).toBe(false);
  },
);

it.each([
  { runId: "run-another-12345678" },
  { assignment: "other-assignment" },
  { issue: 13 },
  { issue: "12" },
])(
  "rejects a mismatched callback or cleanup identity before Docker: %j",
  async (changed) => {
    const { trusted, request } = fixture();
    const docker = dockerTransport([{ operation: "ps" }]);
    const reconcile = createCleanupReconciler(trusted, { spawn: docker.spawn });
    for (const invalid of [
      { ...request, ...changed },
      { ...request, cleanup: { ...request.cleanup, ...changed } },
    ]) {
      expect(await reconcile(invalid)).toMatchObject({
        ok: false,
        cleanupConfirmed: false,
        reusable: false,
      });
    }
    expect(docker.calls).toHaveLength(0);
  },
);

it.each([
  null,
  {},
  { "core.archon.run": runId },
  { ...labels, "unexpected.label": "extra" },
  { ...labels, "core.archon.executor": "other-executor" },
  { ...labels, "core.archon.attempt": "partial-attempt" },
  { ...labels, "core.archon.attempt": "01234567-89AB-4CDE-8FAB-0123456789AB" },
  { ...labels, "core.archon.run": "run-other-12345678" },
  { ...labels, "core.archon.issue": "13" },
  { ...labels, "core.archon.issue": 12 },
])(
  "requires exactly all full valid labels matching owned identity before Docker: %j",
  async (invalidLabels) => {
    const { trusted, request } = fixture();
    const docker = dockerTransport([{ operation: "ps" }]);
    const evidence = await createCleanupReconciler(trusted, {
      spawn: docker.spawn,
    })({
      ...request,
      labels: invalidLabels,
      cleanup: {
        ...request.cleanup,
        receipt: { ...request.cleanup.receipt, labels: invalidLabels },
      },
    });
    expect(evidence).toMatchObject({
      ok: false,
      cleanupConfirmed: false,
      reusable: false,
    });
    expect(docker.calls).toHaveLength(0);
  },
);

it("does not substitute independently supplied labels for the receipt labels", async () => {
  const { trusted, request } = fixture();
  const docker = dockerTransport([{ operation: "ps" }]);
  const evidence = await createCleanupReconciler(trusted, {
    spawn: docker.spawn,
  })({
    ...request,
    labels: {
      ...labels,
      "core.archon.attempt": "fedcba98-7654-4321-aaaa-0123456789ab",
    },
  });
  expect(evidence.ok).toBe(false);
  expect(docker.calls).toHaveLength(0);
});

it.each([
  { sha256: "f".repeat(64) },
  { sha256: "not-a-sha256" },
  { bytes: 1 },
  { bytes: 0 },
  { bytes: 1.5 },
  { path: "round/cleanup-state.json" },
])(
  "rejects altered receipt reference metadata before Docker: %j",
  async (changed) => {
    const { trusted, request, content, file } = artifactFixture();
    const docker = dockerTransport([{ operation: "ps" }]);
    const evidence = await createCleanupReconciler(trusted, {
      spawn: docker.spawn,
    })({
      ...request,
      cleanup: {
        ...request.cleanup,
        receiptReference: { ...request.cleanup.receiptReference, ...changed },
      },
    });
    expect(evidence).toMatchObject({
      ok: false,
      cleanupConfirmed: false,
      reusable: false,
    });
    expect(readFileSync(file)).toEqual(content);
    expect(docker.calls).toHaveLength(0);
  },
);

it.each(["outside", "sibling-prefix", "other-run", "other-file"])(
  "rejects a correctly hashed receipt at an untrusted artifact path: %s",
  async (location) => {
    const { root, trusted, request, content } = artifactFixture();
    const file =
      location === "outside"
        ? path.join(root, "cleanup-state.json")
        : location === "sibling-prefix"
          ? path.join(
              `${trusted.artifactsDir}-other`,
              "round",
              "cleanup-state.json",
            )
          : location === "other-run"
            ? path.join(
                root,
                "artifacts",
                "run-other-12345678",
                "round",
                "cleanup-state.json",
              )
            : path.join(trusted.artifactsDir, "round", "other-receipt.json");
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, content);
    const docker = dockerTransport([{ operation: "ps" }]);
    const evidence = await createCleanupReconciler(trusted, {
      spawn: docker.spawn,
    })({
      ...request,
      cleanup: {
        ...request.cleanup,
        receiptReference: { ...request.cleanup.receiptReference, path: file },
      },
    });
    expect(evidence.ok).toBe(false);
    expect(readFileSync(file)).toEqual(content);
    expect(docker.calls).toHaveLength(0);
  },
);

it.each(["missing", "directory", "symlink", "round-symlink", "root-symlink"])(
  "requires a no-follow regular artifact through real trusted directories: %s",
  async (kind) => {
    const { root, trusted, request, content, file } = artifactFixture();
    if (kind === "round-symlink" || kind === "root-symlink") {
      const directory =
        kind === "root-symlink" ? trusted.artifactsDir : path.dirname(file);
      const target = path.join(root, "redirected");
      renameSync(directory, target);
      symlinkSync(target, directory, "junction");
    } else {
      rmSync(file);
      if (kind === "directory") mkdirSync(file);
      if (kind === "symlink") {
        const target = path.join(root, "original-receipt.json");
        writeFileSync(target, content);
        symlinkSync(target, file, "file");
      }
    }
    const docker = dockerTransport([{ operation: "ps" }]);
    const evidence = await createCleanupReconciler(trusted, {
      spawn: docker.spawn,
    })(request);
    expect(evidence).toMatchObject({
      ok: false,
      cleanupConfirmed: false,
      reusable: false,
    });
    expect(docker.calls).toHaveLength(0);
  },
);

it.each([
  { labels: { ...labels, "core.archon.issue": "13" } },
  { labels: { "core.archon.run": runId } },
  { labels: { ...labels, extra: "label" } },
  { receipt: { labels } },
  null,
])(
  "checks top-level receipt labels even when the artifact hash is correct: %j",
  async (receipt) => {
    const { trusted, request, file } = artifactFixture();
    const content = Buffer.from(JSON.stringify(receipt));
    writeFileSync(file, content);
    const reference = {
      ...request.cleanup.receiptReference,
      bytes: content.byteLength,
      sha256: createHash("sha256").update(content).digest("hex"),
    };
    const docker = dockerTransport([{ operation: "ps" }]);
    const evidence = await createCleanupReconciler(trusted, {
      spawn: docker.spawn,
    })({
      ...request,
      cleanup: { ...request.cleanup, receiptReference: reference },
    });
    expect(evidence.ok).toBe(false);
    expect(readFileSync(file)).toEqual(content);
    expect(docker.calls).toHaveLength(0);
  },
);

it("refuses ambiguous inline and referenced evidence", async () => {
  const { trusted, request } = artifactFixture();
  const docker = dockerTransport([{ operation: "ps" }]);
  const evidence = await createCleanupReconciler(trusted, {
    spawn: docker.spawn,
  })({ ...request, cleanup: { ...request.cleanup, receipt: { labels } } });
  expect(evidence.ok).toBe(false);
  expect(docker.calls).toHaveLength(0);
});

it.each([undefined, "relative/artifacts"])(
  "fails closed when the trusted run artifact root is unavailable: %s",
  async (artifactsDir) => {
    const { trusted, request } = artifactFixture();
    const docker = dockerTransport([{ operation: "ps" }]);
    const evidence = await createCleanupReconciler(
      { ...trusted, artifactsDir },
      { spawn: docker.spawn },
    )(request);
    expect(evidence.ok).toBe(false);
    expect(docker.calls).toHaveLength(0);
  },
);

it("rejects hash-correct malformed JSON without losing the original artifact", async () => {
  const { trusted, request, file } = artifactFixture();
  const content = Buffer.from("{ malformed receipt");
  writeFileSync(file, content);
  const receiptReference = {
    ...request.cleanup.receiptReference,
    bytes: content.byteLength,
    sha256: createHash("sha256").update(content).digest("hex"),
  };
  const docker = dockerTransport([{ operation: "ps" }]);
  const evidence = await createCleanupReconciler(trusted, {
    spawn: docker.spawn,
  })({ ...request, cleanup: { ...request.cleanup, receiptReference } });
  expect(evidence.ok).toBe(false);
  expect(readFileSync(file)).toEqual(content);
  expect(docker.calls).toHaveLength(0);
});

it("does not accept request-controlled executable or artifact roots in place of trusted bindings", async () => {
  const { trusted, request } = artifactFixture();
  const docker = dockerTransport([{ operation: "ps" }]);
  const originalExecutable = trusted.dockerExecutable;
  const reconcile = createCleanupReconciler(trusted, { spawn: docker.spawn });
  trusted.dockerExecutable = path.join(
    trusted.artifactsDir,
    "candidate-docker",
  );
  trusted.artifactsDir = path.join(trusted.artifactsDir, "candidate-root");
  const evidence = await reconcile({
    ...request,
    dockerExecutable: trusted.dockerExecutable,
    artifactsDir: trusted.artifactsDir,
  });
  expect(evidence.ok).toBe(true);
  expect(docker.calls[0].executable).toBe(originalExecutable);
});

it("fails closed when the Docker transport throws", async () => {
  const { trusted, request } = fixture();
  const spawn = vi.fn(() => {
    throw new Error("Docker executable unavailable");
  });
  const evidence = await createCleanupReconciler(trusted, { spawn })(request);
  expect(evidence).toMatchObject({
    ok: false,
    cleanupConfirmed: false,
    reusable: false,
  });
});

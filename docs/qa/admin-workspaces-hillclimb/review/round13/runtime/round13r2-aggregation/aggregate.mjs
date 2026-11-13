import { createHash } from "node:crypto";
import {
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const FROZEN_SHA256 =
  "27f02a8d3a628389a0dfd71be0c31d2fd0884f1044925c725df786e5a72abec0";
const HERE = dirname(fileURLToPath(import.meta.url));
const QA_ROOT = resolve(HERE, "../../../..");
const REPO_ROOT = resolve(QA_ROOT, "../../..");
const OWNERS = {
  core: ["crm", "contributions"],
  studio: ["studio"],
  "shell-people": ["shell", "people"],
  "support-tools": ["support", "tools"],
};
const ROW_STATES = new Set([
  "crm-records",
  "crm-notes",
  "crm-relationships",
  "contributions",
  "studio-pages",
  "studio-ministry-updates",
  "studio-missionaries",
]);
const SHA256 = /^[a-f0-9]{64}$/;
const object = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const stable = (value) =>
  JSON.stringify(value, (_, entry) =>
    object(entry)
      ? Object.fromEntries(
          Object.keys(entry)
            .sort()
            .map((key) => [key, entry[key]]),
        )
      : entry,
  );
const jsonBytes = (value) => Buffer.from(JSON.stringify(value, null, 2) + "\n");
const slash = (value) => value.split(sep).join("/");
const pair = (state, viewport) => `${state}@${viewport}`;

function requireEvidence(condition, code, message) {
  if (!condition) throw Object.assign(new Error(message), { code });
}

function exact(actual, expected, label) {
  requireEvidence(
    new Set(actual).size === actual.length,
    "DUPLICATE",
    `${label}: duplicate key`,
  );
  const missing = expected.filter((key) => !actual.includes(key));
  const extra = actual.filter((key) => !expected.includes(key));
  requireEvidence(
    !missing.length && !extra.length,
    "EXACT_SET",
    `${label}: missing [${missing.join(", ")}]; extra [${extra.join(", ")}]`,
  );
}

function timestamp(value, label) {
  requireEvidence(
    typeof value === "string" &&
      /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,7})?(?:Z|\+00:00)$/.test(
        value,
      ) &&
      Number.isFinite(Date.parse(value)),
    "TIMESTAMP",
    `${label}: an explicit ISO UTC timestamp is required`,
  );
  return Date.parse(value);
}

function inside(file, root) {
  const child = relative(root, file);
  return (
    child === "" ||
    (!isAbsolute(child) && child !== ".." && !child.startsWith(`..${sep}`))
  );
}

function safePath(file, root, directory = false) {
  requireEvidence(
    typeof file === "string" &&
      isAbsolute(file) &&
      inside(resolve(file), resolve(root)),
    "PATH_BOUNDARY",
    `Path must be absolute and inside ${root}`,
  );
  let cursor = resolve(file);
  for (;;) {
    const info = lstatSync(cursor);
    requireEvidence(
      !info.isSymbolicLink(),
      "SYMLINK",
      `Symbolic link/junction refused: ${cursor}`,
    );
    const parent = dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }
  const actual = realpathSync(file);
  requireEvidence(
    inside(actual, realpathSync(root)),
    "PATH_BOUNDARY",
    `Resolved path escapes ${root}`,
  );
  const info = lstatSync(actual);
  requireEvidence(
    directory ? info.isDirectory() : info.isFile(),
    "FILE_TYPE",
    `Unexpected file type: ${file}`,
  );
  return actual;
}

export function parseEvidenceJson(bytes, label = "JSON") {
  const text = new TextDecoder("utf-8", { fatal: true })
    .decode(bytes)
    .replace(/^\uFEFF/, "");
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    throw Object.assign(new Error(`${label}: invalid JSON`), {
      code: "JSON_SCHEMA",
    });
  }
  const tokens =
    text.match(
      /"(?:\\.|[^"\\])*"|[{}\[\]:,]|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null/g,
    ) ?? [];
  let offset = 0;
  const visit = () => {
    const token = tokens[offset++];
    if (token === "{") {
      const keys = new Set();
      while (tokens[offset] !== "}") {
        const key = JSON.parse(tokens[offset++]);
        requireEvidence(
          !keys.has(key),
          "DUPLICATE_JSON_KEY",
          `${label}: repeated property ${key}`,
        );
        keys.add(key);
        offset++;
        visit();
        if (tokens[offset] !== ",") break;
        offset++;
      }
      offset++;
    } else if (token === "[") {
      while (tokens[offset] !== "]") {
        visit();
        if (tokens[offset] !== ",") break;
        offset++;
      }
      offset++;
    }
  };
  visit();
  return value;
}

function filesBelow(directory) {
  const files = [];
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const target = join(current, entry.name);
      requireEvidence(
        !entry.isSymbolicLink(),
        "SYMLINK",
        `Symbolic link/junction refused: ${target}`,
      );
      if (entry.isDirectory()) walk(target);
      else {
        requireEvidence(
          entry.isFile(),
          "FILE_TYPE",
          `Not a regular evidence file: ${target}`,
        );
        files.push(slash(relative(directory, target)));
      }
    }
  };
  walk(directory);
  return files.sort();
}

function sourceIdentity(context) {
  const manifestBytes = readFileSync(
    safePath(context.manifestPath, context.repoRoot),
  );
  const manifest = parseEvidenceJson(manifestBytes, "freeze manifest");
  requireEvidence(
    digest(manifestBytes) === context.expectedManifestSha256 &&
      manifest.checkpoint === "round13r2",
    "FROZEN_IDENTITY",
    "Frozen round13r2 manifest does not match the pinned SHA-256",
  );
  const diffSha256 = digest(
    readFileSync(safePath(context.diffPath, context.repoRoot)),
  );
  requireEvidence(
    diffSha256 === manifest.diffSha256,
    "FROZEN_IDENTITY",
    "Frozen diff does not match its manifest",
  );
  requireEvidence(
    Array.isArray(manifest.files) && manifest.files.length > 0,
    "FROZEN_IDENTITY",
    "Manifest file inventory is absent",
  );
  const frozenPaths = new Set();
  for (const entry of manifest.files) {
    requireEvidence(
      object(entry) &&
        typeof entry.path === "string" &&
        entry.path.length > 0 &&
        !entry.path.includes("\\") &&
        !entry.path
          .split("/")
          .some(
            (part) =>
              !part || part === "." || part === ".." || part.includes(":"),
          ) &&
        !frozenPaths.has(entry.path) &&
        (entry.sha256 === "absent" || SHA256.test(entry.sha256)),
      "FROZEN_IDENTITY",
      "Invalid or duplicate path/hash in the pinned frozen inventory",
    );
    frozenPaths.add(entry.path);
    const file = resolve(context.repoRoot, entry.path);
    let info;
    try {
      info = lstatSync(file);
    } catch (failure) {
      if (failure.code !== "ENOENT") throw failure;
    }
    requireEvidence(
      entry.sha256 === "absent"
        ? !info
        : info?.isFile() &&
            digest(readFileSync(safePath(file, context.repoRoot))) ===
              entry.sha256,
      "FROZEN_SOURCE_DRIFT",
      `${entry.path}: current frozen-source bytes/absence do not match the pinned manifest; no Git discovery or refreeze was attempted`,
    );
  }
  const inputHashes = Object.fromEntries(
    context.inputPaths.map((file) => [
      slash(relative(context.repoRoot, file)),
      digest(readFileSync(safePath(file, context.repoRoot))),
    ]),
  );
  return {
    manifestSha256: digest(manifestBytes),
    diffSha256,
    batchPlanSha256: digest(
      readFileSync(safePath(context.planPath, context.repoRoot)),
    ),
    inputHashes,
    frozenFileCount: manifest.files.length,
  };
}

function catalogueEnvelope(context, plan) {
  requireEvidence(
    object(plan.areas) && Array.isArray(plan.viewports),
    "CATALOGUE_SCHEMA",
    "Plan areas/viewports are required",
  );
  exact(
    plan.viewports.map((viewport) => stable(viewport)),
    context.catalogue.viewports.map((viewport) => stable(viewport)),
    "viewport contract",
  );
  const states = context.catalogue.states;
  exact(
    states.map((state) => state.name),
    Object.values(plan.areas).flatMap((area) =>
      area.states.map((state) => state.name),
    ),
    "catalogue states",
  );
  exact(
    Object.keys(plan.areas),
    [...new Set(states.map((state) => state.area))],
    "catalogue areas",
  );
  const byArea = {};
  let batches = 0;
  for (const [area, definition] of Object.entries(plan.areas)) {
    const found = states.filter((state) => state.area === area);
    exact(
      definition.states.map((state) => state.name),
      found.map((state) => state.name),
      area,
    );
    for (const declared of definition.states) {
      const state = found.find((entry) => entry.name === declared.name);
      exact(declared.widths, state.widths, `${state.name} widths`);
      exact(
        state.widths,
        state.widths.filter((width) =>
          context.catalogue.viewports.some(
            (viewport) => viewport.name === width,
          ),
        ),
        `${state.name} known widths`,
      );
    }
    requireEvidence(
      Array.isArray(definition.batches) &&
        definition.batches.every(
          (batch) =>
            Array.isArray(batch) && batch.length > 0 && batch.length <= 4,
        ),
      "BATCH_PLAN",
      `${area}: invalid bounded batches`,
    );
    exact(
      definition.batches.flat(),
      found.map((state) => state.name),
      `${area} batch partition`,
    );
    batches += definition.batches.length;
    byArea[area] = {
      states: found.length,
      pairs: found.reduce((sum, state) => sum + state.widths.length, 0),
      fullPngs: found
        .filter((state) => state.full)
        .reduce((sum, state) => sum + state.widths.length, 0),
    };
  }
  const counts = {
    states: states.length,
    pairs: states.reduce((sum, state) => sum + state.widths.length, 0),
    pngs: states.reduce(
      (sum, state) => sum + state.widths.length * (state.full ? 2 : 1),
      0,
    ),
    batches,
  };
  requireEvidence(
    stable(counts) === stable(context.expectedCounts),
    "CATALOGUE_DRIFT",
    `Expected ${stable(context.expectedCounts)}, found ${stable(counts)}`,
  );
  return { counts, byArea };
}

export async function productionContext() {
  const required = [
    "workspace-states.mjs",
    "module-states.mjs",
    "capture-workspaces.mjs",
    "check-workspaces.mjs",
    "fixture-preflight.mjs",
    "harness-results.mjs",
    "route-errors.mjs",
    "studio-fixtures.mjs",
    "compose-sheets.mjs",
    "write-briefs.mjs",
    "freeze-checkpoint.mjs",
    ...filesBelow(join(QA_ROOT, "fixtures"))
      .filter((file) => /\.(?:mjs|ts|json)$/.test(file))
      .map((file) => `fixtures/${file}`),
  ];
  const inputPaths = [...new Set(required)].map((file) => join(QA_ROOT, file));
  const context = {
    repoRoot: REPO_ROOT,
    qaRoot: QA_ROOT,
    runtimeRoot: resolve(HERE, ".."),
    manifestPath: join(QA_ROOT, "snapshots/round13r2-manifest.json"),
    diffPath: join(QA_ROOT, "snapshots/round13r2.diff"),
    planPath: resolve(HERE, "../refreeze/bounded-batch-plan.json"),
    expectedManifestSha256: FROZEN_SHA256,
    inputPaths,
    expectedCounts: { states: 131, pairs: 234, pngs: 319, batches: 36 },
  };
  context.identity = sourceIdentity(context);
  const workspace = await import(
    pathToFileURL(join(QA_ROOT, "workspace-states.mjs")).href
  );
  const modules = await import(
    pathToFileURL(join(QA_ROOT, "module-states.mjs")).href
  );
  context.catalogue = {
    viewports: workspace.VIEWPORTS,
    states: [
      ...workspace.createStates({}),
      ...modules.createModuleStates(),
    ].map((state) => ({
      name: state.name,
      area: state.area,
      widths: state.widths,
      full: Boolean(state.full),
      dialog: Boolean(state.dialog),
      setup: Boolean(state.setup),
      routePath:
        typeof state.route === "string" ? state.route.split("?")[0] : null,
    })),
  };
  const plan = parseEvidenceJson(readFileSync(context.planPath));
  context.envelope = catalogueEnvelope(context, plan);
  return context;
}

function pngDimensions(bytes, label) {
  requireEvidence(
    bytes.length >= 57 &&
      bytes
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
    "PNG_INVALID",
    `${label}: invalid PNG signature/length`,
  );
  let offset = 8;
  let dimensions;
  let imageData = false;
  let ended = false;
  while (offset + 12 <= bytes.length) {
    const size = bytes.readUInt32BE(offset);
    requireEvidence(
      size <= bytes.length - offset - 12,
      "PNG_INVALID",
      `${label}: truncated chunk`,
    );
    const body = bytes.subarray(offset + 4, offset + 8 + size);
    let checksum = 0xffffffff;
    for (const byte of body) {
      checksum ^= byte;
      for (let bit = 0; bit < 8; bit++)
        checksum = (checksum >>> 1) ^ (checksum & 1 ? 0xedb88320 : 0);
    }
    requireEvidence(
      (checksum ^ 0xffffffff) >>> 0 === bytes.readUInt32BE(offset + 8 + size),
      "PNG_INVALID",
      `${label}: chunk CRC mismatch`,
    );
    const kind = body.subarray(0, 4).toString("ascii");
    if (!dimensions) {
      requireEvidence(
        kind === "IHDR" && size === 13,
        "PNG_INVALID",
        `${label}: missing IHDR`,
      );
      dimensions = {
        width: body.readUInt32BE(4),
        height: body.readUInt32BE(8),
      };
      requireEvidence(
        dimensions.width > 0 && dimensions.height > 0,
        "PNG_INVALID",
        `${label}: empty image`,
      );
    } else
      requireEvidence(
        kind !== "IHDR",
        "PNG_INVALID",
        `${label}: repeated IHDR`,
      );
    if (kind === "IDAT" && size > 0) imageData = true;
    offset += size + 12;
    if (kind === "IEND") {
      ended = size === 0 && offset === bytes.length;
      break;
    }
  }
  requireEvidence(
    imageData && ended,
    "PNG_INVALID",
    `${label}: missing data/IEND or trailing bytes`,
  );
  return dimensions;
}

function validateMeasurement(row, state, viewport, phase, warn) {
  const label = `${state.name}@${viewport}`;
  const common = [
    "path",
    "horizontalOverflow",
    "dialog",
    "unexpectedRouteErrorHeadings",
  ];
  const fields =
    phase === "capture"
      ? [
          ...common,
          "scrollHeight",
          "focusableInMain",
          "h1",
          "tables",
          "reuiGrids",
          "tableRows",
        ]
      : [
          ...common,
          "state",
          "viewport",
          "h1Count",
          "renderedTableRows",
          "renderedMobileRows",
          "keyboard",
          "dialogFocus",
          "axe",
        ];
  requireEvidence(
    object(row),
    "MEASUREMENT_SCHEMA",
    `${label}: expected an object`,
  );
  exact(Object.keys(row), fields, `${label} ${phase} fields`);
  requireEvidence(
    typeof row.path === "string" &&
      row.path.startsWith("/") &&
      !row.path.startsWith("//") &&
      !/\/(?:sign-in|login)(?:[/?]|$)/i.test(row.path),
    "SEMANTIC_ROUTE",
    `${label}: missing/invalid path or authentication page`,
  );
  if (state.routePath)
    requireEvidence(
      row.path.split("?")[0] === state.routePath,
      "SEMANTIC_ROUTE",
      `${label}: observed route is not the catalogue route`,
    );
  requireEvidence(
    typeof row.horizontalOverflow === "boolean" &&
      Array.isArray(row.unexpectedRouteErrorHeadings) &&
      row.unexpectedRouteErrorHeadings.every(
        (heading) => typeof heading === "string",
      ),
    "MEASUREMENT_SCHEMA",
    `${label}: invalid overflow/error fields`,
  );
  requireEvidence(
    row.unexpectedRouteErrorHeadings.length === 0,
    "SEMANTIC_ROUTE_ERROR",
    `${label}: unexpected route-boundary error`,
  );
  if (row.horizontalOverflow) warn("OVERFLOW", label);
  requireEvidence(
    !state.dialog || object(row.dialog),
    "SEMANTIC_DIALOG_MISSING",
    `${label}: intended catalogue dialog was not observed`,
  );
  if (row.dialog !== null) {
    requireEvidence(
      object(row.dialog),
      "MEASUREMENT_SCHEMA",
      `${label}: invalid dialog`,
    );
    exact(
      Object.keys(row.dialog),
      phase === "capture"
        ? ["name", "width", "overflowX"]
        : ["name", "contained", "width", "internalOverflowX"],
      `${label} dialog`,
    );
    requireEvidence(
      (row.dialog.name === null || typeof row.dialog.name === "string") &&
        Number.isFinite(row.dialog.width) &&
        row.dialog.width >= 0,
      "MEASUREMENT_SCHEMA",
      `${label}: invalid dialog name/width`,
    );
    for (const key of phase === "capture"
      ? ["overflowX"]
      : ["contained", "internalOverflowX"])
      requireEvidence(
        typeof row.dialog[key] === "boolean",
        "MEASUREMENT_SCHEMA",
        `${label}: invalid dialog ${key}`,
      );
    if (!row.dialog.name?.trim()) warn("DIALOG_NAME", label);
    if (
      row.dialog.overflowX ||
      row.dialog.internalOverflowX ||
      row.dialog.contained === false
    )
      warn("DIALOG_GEOMETRY", label);
  }
  for (const key of phase === "capture"
    ? ["scrollHeight", "focusableInMain", "tables", "reuiGrids", "tableRows"]
    : ["h1Count", "renderedTableRows", "renderedMobileRows"])
    requireEvidence(
      Number.isSafeInteger(row[key]) && row[key] >= 0,
      "MEASUREMENT_SCHEMA",
      `${label}: invalid ${key}`,
    );
  if (phase === "capture") {
    requireEvidence(
      Array.isArray(row.h1) &&
        row.h1.every((heading) => typeof heading === "string"),
      "MEASUREMENT_SCHEMA",
      `${label}: invalid h1 array`,
    );
    return;
  }
  requireEvidence(
    row.state === state.name &&
      row.viewport === viewport &&
      object(row.axe) &&
      Array.isArray(row.axe.violations) &&
      Array.isArray(row.axe.incompleteIds) &&
      row.axe.incompleteIds.every((entry) => typeof entry === "string"),
    "MEASUREMENT_SCHEMA",
    `${label}: invalid checker/axe row`,
  );
  exact(Object.keys(row.axe), ["violations", "incompleteIds"], `${label} axe`);
  for (const violation of row.axe.violations) {
    requireEvidence(
      object(violation),
      "MEASUREMENT_SCHEMA",
      `${label}: invalid violation`,
    );
    exact(
      Object.keys(violation),
      ["id", "impact", "nodes", "targets"],
      `${label} violation`,
    );
    requireEvidence(
      typeof violation.id === "string" &&
        violation.id.length > 0 &&
        [null, "minor", "moderate", "serious", "critical"].includes(
          violation.impact,
        ) &&
        Number.isSafeInteger(violation.nodes) &&
        violation.nodes > 0 &&
        Array.isArray(violation.targets) &&
        violation.targets.every((target) => typeof target === "string"),
      "MEASUREMENT_SCHEMA",
      `${label}: invalid violation fields`,
    );
  }
  if (row.axe.violations.length)
    warn(
      "AXE_VIOLATIONS",
      `${label}: ${row.axe.violations.map((entry) => entry.id).join(", ")}`,
    );
  if (row.axe.incompleteIds.length)
    warn("AXE_INCOMPLETE", `${label}: ${row.axe.incompleteIds.join(", ")}`);
  requireEvidence(
    Boolean(row.keyboard) === (ROW_STATES.has(state.name) && !row.dialog),
    "MEASUREMENT_SCHEMA",
    `${label}: missing or unexpected keyboard probe`,
  );
  if (row.keyboard !== null) {
    const keyboard = row.keyboard;
    requireEvidence(
      object(keyboard) &&
        typeof keyboard.reachedRow === "boolean" &&
        Number.isSafeInteger(keyboard.tabStops) &&
        keyboard.tabStops >= 0,
      "MEASUREMENT_SCHEMA",
      `${label}: invalid keyboard probe`,
    );
    exact(
      Object.keys(keyboard),
      keyboard.reachedRow
        ? ["reachedRow", "tabStops", "firstRowControl", "arrowDownMovesRow"]
        : ["reachedRow", "tabStops"],
      `${label} keyboard`,
    );
    if (keyboard.reachedRow)
      requireEvidence(
        typeof keyboard.firstRowControl === "string" &&
          typeof keyboard.arrowDownMovesRow === "boolean",
        "MEASUREMENT_SCHEMA",
        `${label}: invalid row focus fields`,
      );
    if (!keyboard.reachedRow || !keyboard.arrowDownMovesRow)
      warn("KEYBOARD_FINDING", label);
  }
  requireEvidence(
    Boolean(row.dialogFocus) === Boolean(row.dialog),
    "MEASUREMENT_SCHEMA",
    `${label}: missing or unexpected dialog focus probe`,
  );
  if (row.dialogFocus !== null) {
    const focus = row.dialogFocus;
    requireEvidence(
      object(focus),
      "MEASUREMENT_SCHEMA",
      `${label}: invalid dialog focus`,
    );
    exact(
      Object.keys(focus),
      ["tabEscapes", "escapedTo", "closedByEscape"],
      `${label} dialog focus`,
    );
    requireEvidence(
      Number.isSafeInteger(focus.tabEscapes) &&
        focus.tabEscapes >= 0 &&
        focus.tabEscapes <= 12 &&
        Array.isArray(focus.escapedTo) &&
        focus.escapedTo.every((target) => typeof target === "string") &&
        typeof focus.closedByEscape === "boolean",
      "MEASUREMENT_SCHEMA",
      `${label}: invalid dialog focus fields`,
    );
    if (focus.tabEscapes || !focus.closedByEscape)
      warn("DIALOG_FOCUS_FINDING", label);
  }
}

export function validateInputs(inputs, context) {
  const report = {
    schemaVersion: 1,
    status: "REJECTED",
    validatorSha256: digest(readFileSync(fileURLToPath(import.meta.url))),
    errors: [],
    warnings: [],
    invocations: [],
    sourceFiles: [],
  };
  const sources = new Map();
  const copies = new Map();
  const metrics = {};
  const checks = [];
  const ownership = { capture: new Map(), check: new Map() };
  const directories = new Set();
  const ids = new Set();
  const bundles = new Set();
  const times = [];
  const warn = (code, message) => report.warnings.push({ code, message });
  const error = (failure, invocationId) =>
    report.errors.push({
      code: failure.code ?? "READ_OR_SCHEMA_FAILURE",
      message: failure.message,
      ...(invocationId ? { invocationId } : {}),
    });
  const track = (reference, root, owner, destination) => {
    requireEvidence(
      object(reference) && SHA256.test(reference.sha256),
      "HASH_REQUIRED",
      `${owner}: explicit file SHA-256 required`,
    );
    const file = safePath(reference.path, root);
    requireEvidence(
      lstatSync(file).size <= 128 * 1024 * 1024,
      "FILE_SIZE",
      `${file}: file exceeds 128 MiB safety limit`,
    );
    const bytes = readFileSync(file);
    requireEvidence(
      digest(bytes) === reference.sha256,
      "HASH_MISMATCH",
      `${file}: bytes differ from the declared finished inventory`,
    );
    const previous = sources.get(file);
    requireEvidence(
      !previous || previous.owner === owner,
      "DUPLICATE_PROVENANCE",
      `${file}: a source file is reused by different invocations`,
    );
    const entry = { path: file, sha256: reference.sha256, owner };
    sources.set(file, entry);
    if (destination) {
      requireEvidence(
        !copies.has(destination),
        "DUPLICATE_OWNERSHIP",
        `${destination}: duplicate assembly destination`,
      );
      copies.set(destination, entry);
    }
    return bytes;
  };
  try {
    requireEvidence(
      object(inputs) && inputs.schemaVersion === 1,
      "INPUT_SCHEMA",
      "schemaVersion: 1 is required",
    );
    requireEvidence(
      inputs.round === "round13r2" &&
        typeof inputs.runId === "string" &&
        /^[a-zA-Z0-9][a-zA-Z0-9._-]+$/.test(inputs.runId),
      "INPUT_SCHEMA",
      "Explicit round13r2 runId is required",
    );
    requireEvidence(
      typeof inputs.repoRoot === "string" &&
        isAbsolute(inputs.repoRoot) &&
        resolve(inputs.repoRoot) === realpathSync(context.repoRoot),
      "WRONG_REPOSITORY",
      "Inputs must identify this exact r12 checkout",
    );
    const identity = sourceIdentity(context);
    requireEvidence(
      stable(inputs.identity) === stable(identity),
      "SOURCE_IDENTITY",
      "Input identity differs from the pinned manifest/diff, batch plan or current harness inputs",
    );
    if (context.identity)
      requireEvidence(
        stable(context.identity) === stable(identity),
        "SOURCE_DRIFT",
        "Inputs changed while loading the catalogue",
      );
    const plan = parseEvidenceJson(readFileSync(context.planPath));
    report.catalogue = catalogueEnvelope(context, plan);
    report.round = inputs.round;
    report.runId = inputs.runId;
    report.identity = identity;
    report.inputsSha256 = digest(stable(inputs));
    const started = timestamp(inputs.window?.startedAtUtc, "collection start");
    const finished = timestamp(
      inputs.window?.finishedAtUtc,
      "collection finish",
    );
    requireEvidence(
      started < finished &&
        finished <= Date.now() &&
        finished - started <= 8 * 60 * 60 * 1000,
      "COLLECTION_WINDOW",
      "A finished, at-most-eight-hour collection window is required",
    );
    const attestation = parseEvidenceJson(
      track(
        inputs.runtimeAttestation,
        context.runtimeRoot,
        "root-runtime",
        ".aggregation/runtime-attestation.json",
      ),
    );
    requireEvidence(
      attestation.schemaVersion === 1 &&
        attestation.round === "round13r2" &&
        resolve(attestation.repoRoot) === realpathSync(context.repoRoot) &&
        attestation.manifestSha256 === identity.manifestSha256,
      "RUNTIME_ATTESTATION",
      "Root runtime attestation has the wrong source identity",
    );
    requireEvidence(
      [
        "sourceUnchanged",
        "scratchCmsExclusive",
        "mainUnavailableData",
        "noPrivilegedOrProviderEffects",
      ].every((key) => attestation[key] === true) &&
        typeof attestation.buildStartCacheIdentity === "string" &&
        attestation.buildStartCacheIdentity.trim().length > 0 &&
        typeof attestation.decision === "string" &&
        attestation.decision.trim().length > 0,
      "RUNTIME_ATTESTATION",
      "Root must attest the unchanged unavailable-data runtime, cache identity, disposable CMS exclusivity and effect boundaries",
    );
    requireEvidence(
      timestamp(attestation.evidenceNotBeforeUtc, "root freshness cutoff") <=
        started,
      "STALE_COLLECTION",
      "The collection predates root's attested round13r2 freshness cutoff",
    );
    const base = new URL(attestation.baseUrl);
    requireEvidence(
      base.protocol === "http:" &&
        ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname) &&
        !base.username &&
        !base.password &&
        !base.search &&
        !base.hash &&
        base.pathname === "/",
      "RUNTIME_ATTESTATION",
      "Only an explicitly attested local HTTP runtime is eligible",
    );
    requireEvidence(
      ["bounded-batches", "explicit-finished-partitions"].includes(
        attestation.collectionPolicy,
      ) && typeof attestation.allowCollectorOverlap === "boolean",
      "ROOT_SCHEDULE_DECISION",
      "Root must state the collection partition/overlap policy",
    );
    if (
      attestation.collectionPolicy === "explicit-finished-partitions" ||
      attestation.allowCollectorOverlap
    )
      warn(
        "ROOT_SCHEDULE_EXCEPTION",
        `Root-attested departure from the sequential 72-invocation plan: ${attestation.decision}`,
      );
    requireEvidence(
      Array.isArray(inputs.invocations) && inputs.invocations.length > 0,
      "INVOCATIONS_REQUIRED",
      "Explicit FINISHED capture/check directories are required; no discovery or live polling is supported",
    );
    for (const invocation of inputs.invocations) {
      try {
        requireEvidence(
          object(invocation) &&
            typeof invocation.id === "string" &&
            /^[a-zA-Z0-9][a-zA-Z0-9._-]+$/.test(invocation.id) &&
            !ids.has(invocation.id),
          "DUPLICATE_INVOCATION",
          "Each invocation needs a unique safe id",
        );
        ids.add(invocation.id);
        requireEvidence(
          Object.hasOwn(OWNERS, invocation.collector) &&
            ["capture", "check"].includes(invocation.phase),
          "INVOCATION_SCHEMA",
          `${invocation.id}: invalid collector/phase`,
        );
        const root = join(
          context.runtimeRoot,
          `round13r2-${invocation.collector}`,
        );
        const directory = safePath(invocation.directory, root, true);
        requireEvidence(
          !directories.has(directory),
          "DUPLICATE_DIRECTORY",
          `${directory}: an invocation directory cannot be reused`,
        );
        directories.add(directory);
        requireEvidence(
          Array.isArray(invocation.states) && invocation.states.length > 0,
          "INVOCATION_SCHEMA",
          `${invocation.id}: selected states are required`,
        );
        exact(
          invocation.states,
          [...new Set(invocation.states)],
          `${invocation.id} states`,
        );
        const selected = invocation.states.map((name) => {
          const state = context.catalogue.states.find(
            (entry) => entry.name === name,
          );
          requireEvidence(
            state && OWNERS[invocation.collector].includes(state.area),
            "WRONG_COLLECTOR",
            `${name}: collector does not own this catalogue state`,
          );
          requireEvidence(
            !ownership[invocation.phase].has(name),
            "DUPLICATE_OWNERSHIP",
            `${name}: duplicate ${invocation.phase} ownership`,
          );
          ownership[invocation.phase].set(name, invocation.id);
          return state;
        });
        if (attestation.collectionPolicy === "bounded-batches")
          requireEvidence(
            Object.values(plan.areas).some((area) =>
              area.batches.some(
                (batch) =>
                  stable([...batch].sort()) ===
                  stable([...invocation.states].sort()),
              ),
            ),
            "BATCH_PLAN",
            `${invocation.id}: states do not match one unchanged bounded batch`,
          );
        const references = {};
        for (const role of [
          "result",
          "proof",
          "stdout",
          "stderr",
          "before",
          "after",
        ]) {
          const referenceRoot =
            ["before", "after"].includes(role) &&
            typeof invocation[role]?.path === "string" &&
            inside(
              resolve(invocation[role].path),
              join(context.runtimeRoot, "round13r2-aggregation"),
            )
              ? join(context.runtimeRoot, "round13r2-aggregation")
              : root;
          if (referenceRoot !== root)
            warn(
              "ROOT_NORMALIZED_SOURCE_SEAL",
              `${invocation.id}: ${role} is a root-normalized adapter; root must verify the retained original records actually establish its source/time/runtime assertions`,
            );
          references[role] = track(
            invocation[role],
            referenceRoot,
            invocation.id,
            `.aggregation/provenance/${invocation.id}/${role}.${["stdout", "stderr"].includes(role) ? "log" : "json"}`,
          );
        }
        const result = parseEvidenceJson(
          references.result,
          "invocation result",
        );
        const start = timestamp(result.startedAtUtc, `${invocation.id} start`);
        const end = timestamp(result.finishedAtUtc, `${invocation.id} end`);
        requireEvidence(
          result.tag === invocation.id &&
            Number.isSafeInteger(result.pid) &&
            result.pid > 0 &&
            result.timedOut === false &&
            result.exitCode === 0,
          "INVOCATION_NOT_FINISHED",
          `${invocation.id}: successful termination, PID and matching tag are required`,
        );
        requireEvidence(
          start >= started &&
            end <= finished &&
            start < end &&
            end - start <= 1200000,
          "INVOCATION_WINDOW",
          `${invocation.id}: invalid, stale or over-budget invocation interval`,
        );
        requireEvidence(
          Array.isArray(result.argv) &&
            result.argv.length >= 3 &&
            result.argv.length <= 4 &&
            result.argv.every((argument) => typeof argument === "string"),
          "ARGV_PROVENANCE",
          `${invocation.id}: missing exact collector argv`,
        );
        requireEvidence(
          resolve(result.argv[0]) ===
            resolve(context.qaRoot, `${invocation.phase}-workspaces.mjs`) &&
            resolve(result.argv[1]) === directory,
          "ARGV_PROVENANCE",
          `${invocation.id}: runner/output directory does not match`,
        );
        const areas = result.argv[2].split(",");
        exact(
          areas,
          [...new Set(selected.map((state) => state.area))],
          `${invocation.id} argv areas`,
        );
        exact(
          result.argv[3]?.split(",") ??
            context.catalogue.states
              .filter((state) => areas.includes(state.area))
              .map((state) => state.name),
          invocation.states,
          `${invocation.id} argv states`,
        );
        for (const stage of ["before", "after"]) {
          const seal = parseEvidenceJson(
            references[stage],
            `${invocation.id} ${stage}`,
          );
          requireEvidence(
            Array.isArray(seal.originalEvidence) &&
              seal.originalEvidence.length > 0,
            "SOURCE_PROVENANCE",
            `${invocation.id}: ${stage} must retain original contemporaneous source/freeze records, not just a newly written assertion`,
          );
          for (const [index, reference] of seal.originalEvidence.entries()) {
            track(
              reference,
              root,
              invocation.id,
              `.aggregation/provenance/${invocation.id}/${stage}-original-${index}.evidence`,
            );
          }
          const observed = timestamp(
            seal.observedAtUtc,
            `${invocation.id} ${stage}`,
          );
          requireEvidence(
            seal.schemaVersion === 1 &&
              seal.invocationId === invocation.id &&
              seal.stage === stage &&
              resolve(seal.repoRoot) === realpathSync(context.repoRoot) &&
              stable(seal.identity) === stable(identity) &&
              seal.runtimeAttestationSha256 ===
                inputs.runtimeAttestation.sha256,
            "SOURCE_PROVENANCE",
            `${invocation.id}: ${stage} source seal is missing or identifies different inputs/runtime`,
          );
          requireEvidence(
            observed >= started &&
              observed <= finished &&
              (stage === "before" ? observed <= start : observed >= end),
            "SOURCE_PROVENANCE",
            `${invocation.id}: source observations do not bracket this invocation`,
          );
          requireEvidence(
            seal.freezeExitCode === 0 &&
              seal.freezeVerification?.name === "round13r2" &&
              seal.freezeVerification.files === identity.frozenFileCount &&
              Array.isArray(seal.freezeVerification.mismatches) &&
              seal.freezeVerification.mismatches.length === 0 &&
              Array.isArray(seal.freezeVerification.extra) &&
              seal.freezeVerification.extra.length === 0,
            "FREEZE_PROVENANCE",
            `${invocation.id}: successful original freeze verification is required`,
          );
        }
        const proof = parseEvidenceJson(
          references.proof,
          `${invocation.id} fixture proof`,
        );
        const verified = timestamp(
          proof.verifiedAt,
          `${invocation.id} preflight`,
        );
        requireEvidence(
          resolve(proof.repoRoot) === realpathSync(context.repoRoot) &&
            proof.typecheck === "passed" &&
            SHA256.test(proof.bundleSha256) &&
            typeof proof.verification === "string" &&
            /^verify-fixtures: all [1-9]\d* checks passed\b/.test(
              proof.verification,
            ) &&
            verified >= start &&
            verified <= end,
          "FIXTURE_PROVENANCE",
          `${invocation.id}: missing, stale, wrong-checkout or unsuccessful per-invocation preflight`,
        );
        bundles.add(proof.bundleSha256);
        requireEvidence(
          object(invocation.files),
          "INVENTORY_REQUIRED",
          `${invocation.id}: immutable finished file inventory is required`,
        );
        for (const name of Object.keys(invocation.files))
          requireEvidence(
            name.length > 0 &&
              !name.includes("\\") &&
              !name
                .split("/")
                .some(
                  (part) =>
                    !part ||
                    part === "." ||
                    part === ".." ||
                    part.includes(":"),
                ),
            "PATH_BOUNDARY",
            `${invocation.id}: unsafe relative inventory path`,
          );
        exact(
          filesBelow(directory),
          Object.keys(invocation.files),
          `${invocation.id} finished directory files`,
        );
        const dataName =
          invocation.phase === "capture"
            ? "page-metrics.json"
            : "workspace-checks.json";
        requireEvidence(
          Object.hasOwn(invocation.files, dataName) &&
            Object.hasOwn(invocation.files, "fixture-proof.json") &&
            !Object.hasOwn(
              invocation.files,
              invocation.phase === "capture"
                ? "workspace-checks.json"
                : "page-metrics.json",
            ),
          "INVENTORY_REQUIRED",
          `${invocation.id}: dedicated single-invocation metrics/checks and fixture proof are required`,
        );
        const expectedPngs =
          invocation.phase === "capture"
            ? selected.flatMap((state) =>
                state.widths.flatMap((viewport) => [
                  `${state.name}--${viewport}.png`,
                  ...(state.full
                    ? [`${state.name}--${viewport}-full.png`]
                    : []),
                ]),
              )
            : [];
        exact(
          Object.keys(invocation.files).filter((file) => /\.png$/i.test(file)),
          expectedPngs,
          `${invocation.id} PNGs`,
        );
        const output = {};
        for (const [name, hash] of Object.entries(invocation.files))
          output[name] = track(
            { path: join(directory, name), sha256: hash },
            root,
            invocation.id,
            /\.png$/.test(name)
              ? name
              : `.aggregation/provenance/${invocation.id}/output/${name}`,
          );
        requireEvidence(
          digest(output["fixture-proof.json"]) === digest(references.proof),
          "FIXTURE_PROVENANCE",
          `${invocation.id}: saved proof is not this output's original fixture proof`,
        );
        const data = parseEvidenceJson(
          output[dataName],
          `${invocation.id} ${dataName}`,
        );
        const expectedPairs = selected.flatMap((state) =>
          state.widths.map((viewport) => pair(state.name, viewport)),
        );
        if (invocation.phase === "capture") {
          requireEvidence(
            object(data),
            "MEASUREMENT_SCHEMA",
            `${invocation.id}: page metrics must be an object`,
          );
          exact(
            Object.keys(data),
            invocation.states,
            `${invocation.id} metric states`,
          );
          for (const state of selected) {
            requireEvidence(
              object(data[state.name]),
              "MEASUREMENT_SCHEMA",
              `${state.name}: metrics widths must be an object`,
            );
            exact(
              Object.keys(data[state.name]),
              state.widths,
              `${state.name} metric widths`,
            );
            for (const viewport of state.widths) {
              validateMeasurement(
                data[state.name][viewport],
                state,
                viewport,
                "capture",
                warn,
              );
              const dimensions = context.catalogue.viewports.find(
                (entry) => entry.name === viewport,
              );
              const png = pngDimensions(
                output[`${state.name}--${viewport}.png`],
                pair(state.name, viewport),
              );
              requireEvidence(
                png.width === dimensions.width &&
                  png.height === dimensions.height,
                "PNG_DIMENSIONS",
                `${pair(state.name, viewport)}: PNG does not match DPR-1 viewport dimensions`,
              );
              if (state.full) {
                const full = pngDimensions(
                  output[`${state.name}--${viewport}-full.png`],
                  `${pair(state.name, viewport)} full`,
                );
                requireEvidence(
                  full.width >= dimensions.width &&
                    full.height >= dimensions.height,
                  "PNG_DIMENSIONS",
                  `${pair(state.name, viewport)}: full-page PNG is smaller than the viewport`,
                );
                if (full.width !== dimensions.width)
                  warn("FULL_PAGE_WIDTH", pair(state.name, viewport));
              }
            }
            metrics[state.name] = data[state.name];
          }
        } else {
          requireEvidence(
            Array.isArray(data),
            "MEASUREMENT_SCHEMA",
            `${invocation.id}: workspace checks must be an array`,
          );
          exact(
            data.map((row) => pair(row.state, row.viewport)),
            expectedPairs,
            `${invocation.id} check pairs`,
          );
          for (const row of data)
            validateMeasurement(
              row,
              selected.find((state) => state.name === row.state),
              row.viewport,
              "check",
              warn,
            );
          checks.push(...data);
        }
        const stdout = new TextDecoder("utf-8", { fatal: true })
          .decode(references.stdout)
          .replace(/^\uFEFF/, "")
          .split(/\r?\n/)
          .filter((line) => line.trim());
        const stderr = new TextDecoder("utf-8", { fatal: true })
          .decode(references.stderr)
          .replace(/^\uFEFF/, "")
          .trim();
        requireEvidence(
          !stderr,
          /setup missing|triggers not found|captured as-is|disabled|loading|unresolved|not settled|route error|cleanup|did not finish|not ready/i.test(
            stderr,
          )
            ? "SEMANTIC_SETUP_LOG"
            : "UNCLASSIFIED_STDERR",
          `${invocation.id}: stderr is nonempty; root must inspect the original, not waive it via exit 0`,
        );
        const observed = [];
        let wrote = 0;
        for (const line of stdout) {
          const capture = /^captured ([a-z0-9-]+) in \d+s$/.exec(line);
          const check =
            /^([a-z0-9-]+) @([a-z-]+): axe (\d+)(?: \(([^)\r\n]*)\))?, overflow (true|false), rows (\d+)\/(\d+)(?:, (kbd|dialog) (.+))?$/.exec(
              line,
            );
          if (invocation.phase === "capture" && capture)
            observed.push(capture[1]);
          else if (invocation.phase === "check" && check) {
            const row = data.find(
              (entry) =>
                entry.state === check[1] && entry.viewport === check[2],
            );
            requireEvidence(
              row &&
                row.axe.violations.length === Number(check[3]) &&
                row.axe.violations.map((entry) => entry.id).join(",") ===
                  (check[4] ?? "") &&
                String(row.horizontalOverflow) === check[5] &&
                row.renderedTableRows === Number(check[6]) &&
                row.renderedMobileRows === Number(check[7]),
              "LOG_DATA_MISMATCH",
              `${invocation.id}: check stdout does not match the sealed JSON row`,
            );
            const probe = row.keyboard
              ? "kbd"
              : row.dialogFocus
                ? "dialog"
                : undefined;
            requireEvidence(
              check[8] === probe &&
                (!probe ||
                  stable(
                    parseEvidenceJson(Buffer.from(check[9]), "logged probe"),
                  ) ===
                    stable(probe === "kbd" ? row.keyboard : row.dialogFocus)),
              "LOG_DATA_MISMATCH",
              `${invocation.id}: logged keyboard/dialog probe differs from the sealed JSON`,
            );
            observed.push(pair(check[1], check[2]));
          } else if (
            line.startsWith("wrote ") &&
            resolve(line.slice(6)) === join(directory, dataName)
          )
            wrote++;
          else
            throw Object.assign(
              new Error(
                `${invocation.id}: unexpected stdout; inspect original log for setup/semantic warnings`,
              ),
              { code: "SEMANTIC_SETUP_LOG" },
            );
        }
        exact(
          observed,
          invocation.phase === "capture" ? invocation.states : expectedPairs,
          `${invocation.id} log completions`,
        );
        requireEvidence(
          wrote === 1,
          "LOG_COMPLETION",
          `${invocation.id}: exactly one final output completion line is required`,
        );
        times.push({ id: invocation.id, start, end });
        report.invocations.push({
          id: invocation.id,
          collector: invocation.collector,
          phase: invocation.phase,
          directory,
          states: invocation.states,
          pairs: expectedPairs.length,
          startedAtUtc: result.startedAtUtc,
          finishedAtUtc: result.finishedAtUtc,
          bundleSha256: proof.bundleSha256,
        });
      } catch (failure) {
        error(failure, invocation?.id);
      }
    }
    for (const phase of ["capture", "check"])
      exact(
        [...ownership[phase].keys()],
        context.catalogue.states.map((state) => state.name),
        `${phase} ownership`,
      );
    requireEvidence(
      bundles.size === 1,
      "FIXTURE_BUNDLE_DRIFT",
      "All accepted invocations must identify one common regenerated fixture bundle",
    );
    if (attestation.collectionPolicy === "bounded-batches")
      requireEvidence(
        inputs.invocations.length === report.catalogue.counts.batches * 2,
        "INVOCATION_COUNT",
        "The bounded plan requires exactly 36 capture and 36 check invocations",
      );
    if (!attestation.allowCollectorOverlap)
      for (let index = 0; index < times.length; index++)
        for (const other of times.slice(index + 1))
          requireEvidence(
            times[index].end <= other.start || other.end <= times[index].start,
            "COLLECTOR_OVERLAP",
            `${times[index].id} and ${other.id} overlap without root attestation`,
          );
    requireEvidence(
      stable(sourceIdentity(context)) === stable(identity),
      "SOURCE_DRIFT",
      "Manifest/diff/plan/harness inputs changed during offline validation",
    );
    for (const source of sources.values())
      requireEvidence(
        digest(readFileSync(safePath(source.path, context.repoRoot))) ===
          source.sha256,
        "SOURCE_DRIFT",
        `${source.path}: source evidence changed during validation`,
      );
    exact(
      Object.keys(metrics),
      context.catalogue.states.map((state) => state.name),
      "final metric states",
    );
    exact(
      checks.map((row) => pair(row.state, row.viewport)),
      context.catalogue.states.flatMap((state) =>
        state.widths.map((viewport) => pair(state.name, viewport)),
      ),
      "final check pairs",
    );
    report.manualSemanticPairs = context.catalogue.states
      .filter((state) => state.setup)
      .flatMap((state) =>
        state.widths.map((viewport) => pair(state.name, viewport)),
      );
    warn(
      "OFFLINE_LIMITS",
      "Hashes, logs, supplied source seals and root attestation are checked, not independently authenticated. No runtime, pixels, full keyboard/a11y, tenant/provider or live-journey qualification is established.",
    );
  } catch (failure) {
    error(failure);
  }
  report.sourceFiles = [...sources.values()].sort((first, second) =>
    first.path.localeCompare(second.path),
  );
  report.status = report.errors.length ? "REJECTED" : "VALIDATED";
  report.validationSha256 = digest(stable(report));
  return { report, snapshot: { copies, metrics, checks, inputs, context } };
}

export function assemble(
  validation,
  authorization,
  workingDirectory = process.cwd(),
) {
  requireEvidence(
    validation?.report?.status === "VALIDATED" &&
      SHA256.test(authorization) &&
      authorization === validation.report.validationSha256,
    "ROOT_AUTHORIZATION",
    "Explicit root authorization must name the exact successful validation SHA-256, including its warnings",
  );
  const { context, inputs } = validation.snapshot;
  requireEvidence(
    realpathSync(workingDirectory) === realpathSync(context.repoRoot),
    "ROOT_AUTHORIZATION",
    "Assembly must be invoked from the exact repository root",
  );
  const refreshed = validateInputs(inputs, context);
  requireEvidence(
    refreshed.report.status === "VALIDATED" &&
      refreshed.report.validationSha256 === authorization,
    "SOURCE_DRIFT",
    "Validation changed before assembly; stop and obtain a new root decision",
  );
  const destination = join(context.qaRoot, "candidate-13r2");
  safePath(context.qaRoot, context.repoRoot, true);
  let present = true;
  try {
    lstatSync(destination);
  } catch (failure) {
    if (failure.code === "ENOENT") present = false;
    else throw failure;
  }
  requireEvidence(
    !present,
    "DESTINATION_EXISTS",
    "candidate-13r2 already exists (including a symlink or partial attempt); never merge, clear or overwrite it",
  );
  mkdirSync(destination);
  const written = {};
  const emit = (name, bytes) => {
    const target = resolve(destination, name);
    requireEvidence(
      inside(target, destination) && target !== destination,
      "PATH_BOUNDARY",
      "Assembly path escapes the new candidate",
    );
    mkdirSync(dirname(target), { recursive: true });
    safePath(dirname(target), destination, true);
    writeFileSync(target, bytes, { flag: "wx", flush: true });
    requireEvidence(
      digest(readFileSync(target)) === digest(bytes),
      "COPY_HASH_MISMATCH",
      `Written bytes differ: ${name}`,
    );
    written[name] = digest(bytes);
  };
  emit(
    "INCOMPLETE.json",
    jsonBytes({
      status: "INCOMPLETE",
      validationSha256: authorization,
      instruction:
        "Preserve this partial attempt. No automatic cleanup, resume or merge is allowed.",
    }),
  );
  for (const [name, source] of refreshed.snapshot.copies) {
    const bytes = readFileSync(safePath(source.path, context.repoRoot));
    requireEvidence(
      digest(bytes) === source.sha256,
      "SOURCE_DRIFT",
      `${source.path}: source changed before copying`,
    );
    emit(name, bytes);
  }
  emit("page-metrics.json", jsonBytes(refreshed.snapshot.metrics));
  emit("workspace-checks.json", jsonBytes(refreshed.snapshot.checks));
  emit(".aggregation/inputs.json", jsonBytes(inputs));
  emit(".aggregation/validation.json", jsonBytes(refreshed.report));
  for (const source of refreshed.report.sourceFiles)
    requireEvidence(
      digest(readFileSync(safePath(source.path, context.repoRoot))) ===
        source.sha256,
      "SOURCE_DRIFT",
      `${source.path}: source changed during assembly`,
    );
  requireEvidence(
    stable(sourceIdentity(context)) === stable(refreshed.report.identity),
    "SOURCE_DRIFT",
    "Pinned source inputs changed during assembly",
  );
  for (const [name, hash] of Object.entries(written))
    requireEvidence(
      digest(readFileSync(join(destination, name))) === hash,
      "COPY_HASH_MISMATCH",
      `${name}: destination changed during assembly`,
    );
  const receipt = {
    schemaVersion: 1,
    status: "ASSEMBLED",
    round: "round13r2",
    runId: inputs.runId,
    validationSha256: authorization,
    identity: refreshed.report.identity,
    destination,
    catalogue: refreshed.report.catalogue,
    warnings: refreshed.report.warnings,
    originalSourceFiles: refreshed.report.sourceFiles,
    files: Object.fromEntries(
      Object.entries(written).filter(([name]) => name !== "INCOMPLETE.json"),
    ),
    limitation:
      "Offline completeness only. All individual original proofs/logs/JSON are retained under .aggregation/provenance; no single fixture-proof.json represents the entire run. No sheets, briefs, ledger, freeze or readiness verdict are produced.",
  };
  emit("aggregation-receipt.json", jsonBytes(receipt));
  unlinkSync(join(destination, "INCOMPLETE.json"));
  return receipt;
}

async function main(argv) {
  if (argv.length === 1 && argv[0] === "--help") {
    console.log(
      "Offline only: node aggregate.mjs --catalogue | --inputs <absolute finished-inputs.json> [--assemble-from-root <validationSha256>]. Validation is read-only. Assembly requires root CWD and an absent candidate-13r2; it never resumes or merges.",
    );
    return;
  }
  requireEvidence(
    (argv.length === 1 && argv[0] === "--catalogue") ||
      ((argv.length === 2 || argv.length === 4) &&
        argv[0] === "--inputs" &&
        isAbsolute(argv[1]) &&
        (argv.length === 2 || argv[2] === "--assemble-from-root")),
    "USAGE",
    "Use --help; only explicit absolute finished inputs are accepted. No discovery/live collector command exists.",
  );
  const context = await productionContext();
  if (argv[0] === "--catalogue") {
    console.log(
      JSON.stringify(
        {
          mode: "CATALOGUE_ONLY",
          ...context.envelope,
          identity: context.identity,
          catalogue: context.catalogue,
        },
        null,
        2,
      ),
    );
    return;
  }
  const inputPath = safePath(argv[1], resolve(HERE, ".."));
  const inputBytes = readFileSync(inputPath);
  const inputs = parseEvidenceJson(inputBytes, "finished inputs");
  const validation = validateInputs(inputs, context);
  if (validation.report.status !== "VALIDATED") {
    console.log(JSON.stringify(validation.report, null, 2));
    process.exitCode = 1;
    return;
  }
  requireEvidence(
    readFileSync(inputPath).equals(inputBytes),
    "SOURCE_DRIFT",
    "The finished-input adapter changed during validation",
  );
  const output =
    argv.length === 4 ? assemble(validation, argv[3]) : validation.report;
  console.log(JSON.stringify(output, null, 2));
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main(process.argv.slice(2)).catch((failure) => {
    console.log(
      JSON.stringify(
        {
          schemaVersion: 1,
          status: "REJECTED",
          errors: [
            {
              code: failure.code ?? "READ_OR_SCHEMA_FAILURE",
              message: failure.message,
            },
          ],
        },
        null,
        2,
      ),
    );
    process.exitCode = 1;
  });
}

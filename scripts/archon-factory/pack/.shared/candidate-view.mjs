import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstat, mkdir, mkdtemp, realpath, writeFile } from "node:fs/promises";
import path from "node:path";

const shaPattern = /^[a-f0-9]{40}$/;
const identifier = /^[a-z0-9][a-z0-9._-]{0,79}$/;
const roles = new Set(["ezra", "bezalel", "micaiah", "luke", "agabus"]);
// Limits. Core's own tree is 23,812 files and 405 MB (12 November 2026), so
// objects are read in bounded batches rather than through one buffer.
const LIMITS = Object.freeze({
  maxFileBytes: 67_108_864, // one tracked file
  maxViewBytes: 2_147_483_648, // every file of one view
  batchBytes: 134_217_728, // file bytes read from one Git process
});
// Room for the headers Git writes around the entries of one read.
const headerBytes = 16_777_216;

function limitsOf(overrides = {}) {
  const limits = { ...LIMITS };
  for (const [name, value] of Object.entries(overrides ?? {})) {
    if (!Object.hasOwn(LIMITS, name) || !Number.isSafeInteger(value))
      throw new Error("Unsupported candidate view limit");
    if (value < 1 || value > LIMITS[name])
      throw new Error("Unsupported candidate view limit");
    limits[name] = value;
  }
  return limits;
}

async function directory(value) {
  if (typeof value !== "string" || !path.isAbsolute(value))
    throw new Error("Absolute real directory required");
  const resolved = await realpath(value);
  if (
    !(await lstat(value)).isDirectory() ||
    (await lstat(value)).isSymbolicLink() ||
    path.relative(path.resolve(value), resolved) !== "" ||
    resolved === path.parse(resolved).root
  )
    throw new Error("Dedicated real directory required");
  return resolved;
}

function parseTree(buffer) {
  const entries = [];
  const paths = new Map();
  for (const record of new TextDecoder("utf-8", { fatal: true })
    .decode(buffer)
    .split("\0")) {
    if (!record) continue;
    const match = /^(100644|100755) blob ([a-f0-9]{40})\t(.+)$/.exec(record);
    if (!match) throw new Error("Unsupported candidate tree mode or path");
    const [, mode, objectId, relativePath] = match;
    const segments = relativePath.split("/");
    if (
      /[\u0000-\u001f\u007f\\:*?"<>|]/.test(relativePath) ||
      segments.some(
        (segment) =>
          !segment ||
          segment === "." ||
          segment === ".." ||
          segment.toLowerCase() === ".git" ||
          /[. ]$/.test(segment) ||
          /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(segment),
      )
    )
      throw new Error("Unsafe or colliding candidate path");
    for (let depth = 1; depth <= segments.length; depth++) {
      const prefix = segments.slice(0, depth).join("/");
      const kind = depth === segments.length ? "file" : "directory";
      const previous = paths.get(prefix.toLowerCase());
      if (
        previous &&
        (previous.prefix !== prefix ||
          previous.kind !== kind ||
          kind === "file")
      )
        throw new Error("Unsafe or colliding candidate path");
      paths.set(prefix.toLowerCase(), { prefix, kind });
    }
    entries.push({ mode, objectId, relativePath });
    if (entries.length > 100_000)
      throw new Error("Candidate file limit exceeded");
  }
  return entries;
}

// `overrides` can only lower a limit (tests and qualification use it).
export async function prepareCandidateView(input, overrides) {
  const limits = limitsOf(overrides);
  if (
    !input ||
    !shaPattern.test(input.candidateSha ?? "") ||
    !shaPattern.test(input.baseSha ?? "") ||
    !roles.has(input.role) ||
    !identifier.test(input.assignmentId ?? "") ||
    !identifier.test(input.attemptId ?? "") ||
    typeof input.gitExecutable !== "string" ||
    !path.isAbsolute(input.gitExecutable) ||
    /[\0\r\n]/.test(input.gitExecutable)
  )
    throw new Error(
      "Pinned candidate/base, specialist and assignment identities required",
    );
  const repository = await directory(input.repositoryDirectory);
  const root = await directory(input.disposableRoot);
  for (const [parent, child] of [
    [repository, root],
    [root, repository],
  ]) {
    const relative = path.relative(parent, child);
    if (
      !relative ||
      (!relative.startsWith(".." + path.sep) &&
        relative !== ".." &&
        !path.isAbsolute(relative))
    )
      throw new Error("Disposable root and source repository must be disjoint");
  }
  const environment = {
    PATH: process.env.PATH,
    ...(process.env.SystemRoot ? { SystemRoot: process.env.SystemRoot } : {}),
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_CONFIG_GLOBAL: "/dev/null",
    GIT_NO_REPLACE_OBJECTS: "1",
    GIT_NO_LAZY_FETCH: "1",
    GIT_OPTIONAL_LOCKS: "0",
    GIT_TERMINAL_PROMPT: "0",
  };
  const git = (args, stdin) => {
    const result = spawnSync(
      input.gitExecutable,
      ["--no-replace-objects", "-C", repository, ...args],
      {
        env: environment,
        shell: false,
        windowsHide: true,
        timeout: 30_000,
        killSignal: "SIGKILL",
        maxBuffer: limits.batchBytes + headerBytes,
        input: stdin,
      },
    );
    if (result.error || result.status !== 0 || result.signal)
      throw new Error(
        "Candidate object read failed; no checkout code was executed",
      );
    return result.stdout;
  };
  const topLevel = await directory(
    git(["rev-parse", "--show-toplevel"]).toString().trim(),
  );
  if (path.relative(repository, topLevel) !== "")
    throw new Error(
      "Source repository must be its actual Git top-level directory",
    );
  for (const revision of [input.candidateSha, input.baseSha]) {
    if (
      git(["rev-parse", "--verify", revision + "^{commit}"])
        .toString()
        .trim() !== revision
    )
      throw new Error("Exact commit identity required");
  }
  try {
    git(["merge-base", "--is-ancestor", input.baseSha, input.candidateSha]);
  } catch {
    throw new Error(
      "Base must be an available ancestor of the exact candidate",
    );
  }
  const tree = git(["ls-tree", "-rz", "--full-tree", input.candidateSha]);
  const entries = parseTree(tree);
  const ids = (list) => list.map((entry) => entry.objectId).join("\n") + "\n";
  // Sizes first, so a view past a limit is refused before anything is written.
  const content = createHash("sha256");
  const batches = [];
  let total = 0;
  if (entries.length) {
    const sizes = git(["cat-file", "--batch-check"], ids(entries))
      .toString("ascii")
      .split("\n");
    if (sizes.length !== entries.length + 1 || sizes.at(-1) !== "")
      throw new Error("Candidate object identity mismatch");
    let batch;
    for (const [index, entry] of entries.entries()) {
      const match = /^([a-f0-9]{40}) blob (\d+)$/.exec(sizes[index]);
      if (!match || match[1] !== entry.objectId)
        throw new Error("Candidate object identity mismatch");
      const size = Number(match[2]);
      total += size;
      if (
        !Number.isSafeInteger(size) ||
        size > limits.maxFileBytes ||
        total > limits.maxViewBytes
      )
        throw new Error("Candidate object size mismatch or limit exceeded");
      if (!batch || batch.bytes + size > limits.batchBytes) {
        batch = { bytes: 0, entries: [] };
        batches.push(batch);
      }
      batch.bytes += size;
      batch.entries.push({ ...entry, size });
      content.update(
        JSON.stringify([entry.relativePath, entry.mode, entry.objectId]) + "\n",
      );
    }
  }
  const workspaceDirectory = await mkdtemp(path.join(root, `${input.role}-`));
  try {
    for (const batch of batches) {
      const objects = git(["cat-file", "--batch"], ids(batch.entries));
      let offset = 0;
      for (const entry of batch.entries) {
        const end = objects.indexOf(10, offset);
        if (
          end < offset ||
          objects.subarray(offset, end).toString("ascii") !==
            `${entry.objectId} blob ${entry.size}`
        )
          throw new Error("Candidate object identity mismatch");
        offset = end + 1;
        if (objects[offset + entry.size] !== 10)
          throw new Error("Candidate object size mismatch or limit exceeded");
        const bytes = objects.subarray(offset, offset + entry.size);
        if (
          createHash("sha1")
            .update(`blob ${entry.size}\0`)
            .update(bytes)
            .digest("hex") !== entry.objectId
        )
          throw new Error("Candidate blob digest mismatch");
        const destination = path.join(
          workspaceDirectory,
          ...entry.relativePath.split("/"),
        );
        await mkdir(path.dirname(destination), {
          recursive: true,
          mode: 0o700,
        });
        await writeFile(destination, bytes, {
          flag: "wx",
          mode: entry.mode === "100755" ? 0o755 : 0o644,
        });
        offset += entry.size + 1;
      }
      if (offset !== objects.length)
        throw new Error("Unexpected candidate object trailing bytes");
    }
  } catch (error) {
    // Nothing is retried or removed: a partial view is evidence.
    throw new Error(
      `Candidate preparation incomplete; preserve and reconcile ${workspaceDirectory}`,
      { cause: error },
    );
  }
  return {
    assignmentId: input.assignmentId,
    attemptId: input.attemptId,
    role: input.role,
    candidateSha: input.candidateSha,
    baseSha: input.baseSha,
    workspaceDirectory,
    fileCount: entries.length,
    contentDigest: content.digest("hex"),
    isolationQualified: false,
  };
}

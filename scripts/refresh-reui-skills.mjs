#!/usr/bin/env node

import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import {
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const bundleUrl = "https://mcp.reui.io/api/skills/download";
const maxBundleBytes = 5 * 1024 * 1024;
const begin = "<!-- BEGIN:core-reui-overlay -->";
const end = "<!-- END:core-reui-overlay -->";
const provenancePath = "references/upstream.md";
const manifestPath = "references/upstream-manifest.json";
const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function options(args) {
  const result = {};
  for (const arg of args) {
    const match = /^--(bundle|output)=(.+)$/.exec(arg);
    if (!match || result[match[1]]) {
      throw new Error(
        "Usage: skills:refresh-reui [--bundle=<local-json>] [--output=<new-directory>]",
      );
    }
    result[match[1]] = path.resolve(match[2]);
  }
  return result;
}

function validatePath(value) {
  if (
    typeof value !== "string" ||
    !/^[A-Za-z0-9._/-]+$/.test(value) ||
    value
      .split("/")
      .some(
        (part) =>
          !part ||
          part.endsWith(".") ||
          /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part),
      ) ||
    path.posix.isAbsolute(value)
  ) {
    throw new Error("Bundle contains an unsafe file path");
  }
  return value;
}

function assertDirectorySpellings(filePaths) {
  const directorySpellings = new Map();
  for (const filePath of filePaths) {
    const segments = filePath.split("/");
    for (let index = 1; index < segments.length; index++) {
      const directory = segments.slice(0, index).join("/");
      const portableDirectory = directory.toLowerCase();
      const spelling = directorySpellings.get(portableDirectory);
      if (spelling && spelling !== directory) {
        throw new Error("ReUI inventory contains directory case aliases");
      }
      directorySpellings.set(portableDirectory, directory);
    }
  }
}

function validateBundle(bytes) {
  if (bytes.length > maxBundleBytes)
    throw new Error("ReUI bundle exceeds the size limit");
  const bundle = JSON.parse(bytes.toString("utf8"));
  if (
    !bundle ||
    typeof bundle.version !== "string" ||
    !/^[A-Za-z0-9._-]{1,80}$/.test(bundle.version) ||
    !Array.isArray(bundle.files) ||
    !bundle.files.length ||
    bundle.files.length > 256
  ) {
    throw new Error("ReUI bundle must contain a version and file inventory");
  }
  const files = new Map();
  const portablePaths = new Set();
  for (const file of bundle.files) {
    if (
      !file ||
      typeof file.content !== "string" ||
      Object.keys(file).some((key) => !["path", "content"].includes(key))
    ) {
      throw new Error("ReUI bundle entries must be regular text files");
    }
    const filePath = validatePath(file.path);
    if (
      !filePath.endsWith(".md") ||
      [provenancePath, manifestPath].includes(filePath.toLowerCase())
    ) {
      throw new Error(
        "ReUI bundle contains an unsupported or reserved file path",
      );
    }
    const portablePath = filePath.toLowerCase();
    if (portablePaths.has(portablePath))
      throw new Error("ReUI bundle contains duplicate file paths");
    portablePaths.add(portablePath);
    if (file.content.includes(begin) || file.content.includes(end)) {
      throw new Error("Upstream bundle must not contain Core overlay markers");
    }
    files.set(filePath, file.content);
  }
  assertDirectorySpellings(files.keys());
  for (const filePath of portablePaths) {
    const segments = filePath.split("/");
    for (let index = 1; index < segments.length; index++) {
      if (portablePaths.has(segments.slice(0, index).join("/"))) {
        throw new Error(
          "ReUI bundle contains conflicting file and directory paths",
        );
      }
    }
  }
  if (
    !files.has("SKILL.md") ||
    !/^name: reui\s*$/m.test(frontmatter(files.get("SKILL.md")))
  ) {
    throw new Error("ReUI bundle is missing the reui skill entrypoint");
  }
  return { version: bundle.version, files };
}

function frontmatter(content) {
  const match = /^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.exec(content);
  if (!match)
    throw new Error("ReUI skill or provenance frontmatter is missing");
  return match[0];
}

async function assertRealDirectories(directory) {
  const absolute = path.resolve(directory);
  const root = path.parse(absolute).root;
  let current = root;
  for (const segment of [
    "",
    ...absolute.slice(root.length).split(path.sep),
  ].filter((part, index) => part || index === 0)) {
    current = path.join(current, segment);
    const stat = await lstat(current);
    if (!stat.isDirectory() || stat.isSymbolicLink()) {
      throw new Error(
        "Refusing a symlink or non-directory in the canonical or staging path",
      );
    }
  }
}

async function readCanonical(directory, prefix = "") {
  const files = new Map();
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = validatePath(prefix + entry.name);
    const absolute = path.join(directory, entry.name);
    const stat = await lstat(absolute);
    if (stat.isSymbolicLink() || (!stat.isFile() && !stat.isDirectory())) {
      throw new Error(
        "Refusing a symlink or special file in the canonical ReUI skill",
      );
    }
    if (stat.isDirectory()) {
      for (const [name, bytes] of await readCanonical(absolute, `${relative}/`))
        files.set(name, bytes);
    } else {
      files.set(relative, await readFile(absolute));
    }
  }
  return files;
}

function overlay(content) {
  const starts = content.split(begin).length - 1;
  const ends = content.split(end).length - 1;
  if (!starts && !ends) return null;
  if (
    starts !== 1 ||
    ends !== 1 ||
    content.indexOf(end) < content.indexOf(begin)
  ) {
    throw new Error("Core overlay markers are malformed or duplicated");
  }
  return content.slice(
    content.indexOf(begin),
    content.indexOf(end) + end.length,
  );
}

function preserveOverlay(filePath, fresh, current) {
  const preserved = overlay(current);
  if (filePath === "SKILL.md") {
    if (!preserved)
      throw new Error("Canonical ReUI skill is missing its Core overlay");
    return `${frontmatter(current).trimEnd()}\n\n${preserved}\n\n${fresh.slice(frontmatter(fresh).length).trimStart()}`;
  }
  if (!preserved) return fresh;
  const title = /^# [^\r\n]+(?:\r?\n|$)/.exec(fresh);
  if (!title)
    throw new Error(
      "Updated ReUI file has no heading for its preserved Core overlay",
    );
  return `${title[0].trimEnd()}\n\n${preserved}\n\n${fresh.slice(title[0].length).trimStart()}`;
}

function updateProvenance(content, fields) {
  let header = frontmatter(content);
  const body = content.slice(header.length);
  for (const [key, value] of Object.entries(fields)) {
    const pattern = new RegExp(`^${key}: .*$`, "gm");
    if ((header.match(pattern) ?? []).length !== 1) {
      throw new Error(
        `Canonical ReUI provenance must contain exactly one ${key} field`,
      );
    }
    header = header.replace(pattern, `${key}: ${value}`);
  }
  return header + body;
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function assertScratchDestination(destination) {
  const protectedTrees = [
    "docs/ai/skills",
    ".agents/skills",
    ".claude/skills",
    ".cursor/skills",
  ];
  const assertOutside = (protectedTree, candidate) => {
    // Case aliases must stay protected on case-insensitive filesystems too.
    const fromProtected = path.relative(
      protectedTree.toLowerCase(),
      candidate.toLowerCase(),
    );
    if (
      !fromProtected ||
      (!fromProtected.startsWith(`..${path.sep}`) &&
        fromProtected !== ".." &&
        !path.isAbsolute(fromProtected))
    ) {
      throw new Error("Refusing to stage inside a protected skill tree");
    }
  };
  for (const relative of protectedTrees) {
    assertOutside(path.join(repoRoot, relative), destination);
  }
  const physicalRoot = await realpath(repoRoot);
  const physicalDestination = path.join(
    await realpath(path.dirname(destination)),
    path.basename(destination),
  );
  for (const relative of protectedTrees) {
    const protectedTree = await realpath(path.join(repoRoot, relative)).catch(
      (error) => {
        if (error.code !== "ENOENT") throw error;
        return path.join(physicalRoot, relative);
      },
    );
    assertOutside(protectedTree, physicalDestination);
  }
}

async function downloadBundle() {
  try {
    // curl honors this environment's HTTP(S)_PROXY/NO_PROXY without leaking
    // credentials or executing ReUI's remote installer.
    const { stdout } = await promisify(execFile)(
      "curl",
      [
        "--fail",
        "--silent",
        "--show-error",
        "--location",
        "--proto",
        "=https",
        "--proto-redir",
        "=https",
        "--max-time",
        "45",
        "--max-filesize",
        String(maxBundleBytes),
        bundleUrl,
      ],
      {
        shell: false,
        timeout: 50_000,
        maxBuffer: maxBundleBytes,
        encoding: "buffer",
      },
    );
    return stdout;
  } catch {
    throw new Error(
      "Unable to download the public ReUI skill bundle; verify curl and network/proxy access or use --bundle=<local-json>",
    );
  }
}

async function main() {
  const args = options(process.argv.slice(2));
  const bytes = args.bundle
    ? await readFile(args.bundle)
    : await downloadBundle();
  const bundle = validateBundle(bytes);
  const canonicalPath = path.join(repoRoot, "docs/ai/skills/reui");
  await assertRealDirectories(canonicalPath);
  const currentFiles = await readCanonical(canonicalPath);
  const previous = JSON.parse(
    currentFiles.get(manifestPath)?.toString("utf8") ?? "null",
  );
  if (
    !previous ||
    !previous.files ||
    typeof previous.files !== "object" ||
    Array.isArray(previous.files)
  ) {
    throw new Error(
      "Canonical ReUI upstream manifest is missing its file inventory",
    );
  }
  const previousPaths = new Set(Object.keys(previous.files).map(validatePath));
  const staged = new Map();
  for (const [filePath, fresh] of bundle.files) {
    if (currentFiles.has(filePath) && !previousPaths.has(filePath)) {
      throw new Error(
        "Updated ReUI bundle collides with a Core-owned local reference",
      );
    }
    const current = currentFiles.get(filePath)?.toString("utf8");
    staged.set(
      filePath,
      current ? preserveOverlay(filePath, fresh, current) : fresh,
    );
  }
  for (const [filePath, content] of currentFiles) {
    if (previousPaths.has(filePath)) {
      if (!bundle.files.has(filePath) && overlay(content.toString("utf8"))) {
        throw new Error(
          "An upstream file with a Core overlay was removed; reconcile it manually before staging",
        );
      }
    } else if (!bundle.files.has(filePath)) {
      if (!filePath.startsWith("references/")) {
        throw new Error(
          "Untracked canonical ReUI file requires manual reconciliation",
        );
      }
      staged.set(filePath, content);
    }
  }
  if (!currentFiles.has("SKILL.md"))
    throw new Error("Canonical ReUI entrypoint is missing");
  const stagedAt = new Date().toISOString();
  const bundleSha256 = sha256(bytes);
  const manifest = {
    ...previous,
    source: bundleUrl,
    version: bundle.version,
    bundleSha256,
    stagedAt,
    reviewStatus: "pending",
    inputSource: args.bundle ? "local-file" : bundleUrl,
    files: Object.fromEntries(
      [...bundle.files].map(([filePath, content]) => [
        filePath,
        {
          sha256: sha256(content),
          bytes: Buffer.byteLength(content),
        },
      ]),
    ),
  };
  delete manifest.reviewedAt;
  staged.set(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  if (!currentFiles.has(provenancePath))
    throw new Error("Canonical ReUI provenance is missing");
  staged.set(
    provenancePath,
    updateProvenance(currentFiles.get(provenancePath).toString("utf8"), {
      upstream_version: bundle.version,
      bundle_sha256: bundleSha256,
      last_refreshed: stagedAt.slice(0, 10),
    }),
  );

  const portableStagedPaths = new Set(
    [...staged.keys()].map((filePath) => filePath.toLowerCase()),
  );
  if (portableStagedPaths.size !== staged.size) {
    throw new Error("ReUI stage contains duplicate file paths");
  }
  assertDirectorySpellings(staged.keys());

  let destination;
  if (args.output) {
    await assertScratchDestination(args.output);
    await assertRealDirectories(path.dirname(args.output));
    await mkdir(args.output); // Never reuse or remove an occupied destination.
    destination = args.output;
  } else {
    const temporaryRoot = await realpath(os.tmpdir());
    await assertScratchDestination(temporaryRoot);
    await assertRealDirectories(temporaryRoot);
    destination = await mkdtemp(path.join(temporaryRoot, "core-reui-skills-"));
  }
  try {
    for (const [filePath, content] of staged) {
      const absolute = path.join(destination, filePath);
      await mkdir(path.dirname(absolute), { recursive: true });
      await assertRealDirectories(path.dirname(absolute));
      await writeFile(absolute, content, { flag: "wx" });
    }
  } catch (error) {
    try {
      await rm(destination, { recursive: true, force: true });
    } catch {
      throw new Error(
        `ReUI staging failed and cleanup was incomplete; inspect ${destination}`,
        { cause: error },
      );
    }
    throw error;
  }
  console.log(
    `Staged ReUI ${bundle.version} (${bundle.files.size} upstream files).`,
  );
  console.log(`Candidate: ${destination}`);
  console.log(`Bundle SHA-256: ${bundleSha256}`);
  console.log(
    "Review the candidate and reconcile the entrypoint adjustments described in references/upstream.md before canonical promotion. Mark the manifest reviewed after review, then run skills:sync and skills:verify.",
  );
}

main().catch((error) => {
  console.error(`ReUI skill refresh failed: ${error.message}`);
  process.exitCode = 1;
});

import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const parserRoot = path.join(
  path.dirname(require.resolve("@fission-ai/openspec")),
  "core/parsers",
);
const { extractRequirementsSection, parseDeltaSpec } = await import(
  pathToFileURL(path.join(parserRoot, "requirement-blocks.js"))
);
const { buildCodeFenceMask, extractRequirementBody } = await import(
  pathToFileURL(path.join(parserRoot, "requirement-text.js"))
);
const defaultRepoRoot = fileURLToPath(new URL("../../", import.meta.url));
const segmenter = new Intl.Segmenter("en", { granularity: "sentence" });

function contractPath(capability) {
  if (!/^[a-z0-9]+(?:[-/][a-z0-9]+)*$/.test(capability))
    throw new Error(`Invalid capability: ${capability}`);
  return `openspec/contracts/${capability}.md`;
}

// Wrapping prose does not change a contract; fenced examples retain exact bytes.
export function normalizeContractBody(body) {
  const lines = body.replace(/\r\n?/g, "\n").trim().split("\n");
  const mask = buildCodeFenceMask(lines);
  return lines
    .map((line, index) =>
      mask[index] ? `\n${line}\n` : line.trim().replace(/\s+/g, " "),
    )
    .filter(Boolean)
    .join(" ")
    .trim();
}

export function contractDigest(capability, name, body) {
  return createHash("sha256")
    .update(
      JSON.stringify([capability, name, body.replace(/\r\n?/g, "\n").trim()]),
    )
    .digest("hex")
    .slice(0, 20);
}

async function safeContractFile(repoRoot, capability) {
  const root = await realpath(repoRoot);
  const parts = contractPath(capability).split("/");
  let current = root;
  for (const part of parts) {
    current = path.join(current, part);
    try {
      if ((await lstat(current)).isSymbolicLink())
        throw new Error(
          `Contract target must remain inside the repository; symlink rejected: ${current}`,
        );
    } catch (error) {
      if (error.code === "ENOENT") break;
      throw error;
    }
  }
  return path.join(root, ...parts);
}

export function requirementBlocks(content) {
  const plan = parseDeltaSpec(content);
  return Object.values(plan.sectionPresence).some(Boolean)
    ? [...plan.added, ...plan.modified]
    : extractRequirementsSection(content).bodyBlocks;
}

export function splitRequirement(block) {
  const lines = block.raw.split("\n");
  const mask = buildCodeFenceMask(lines);
  let end = lines.findIndex(
    (line, index) => index > 0 && !mask[index] && /^#{1,6}\s/.test(line),
  );
  if (end < 0) end = lines.length;
  return {
    body: lines.slice(1, end).join("\n").trim(),
    scenarios: lines.slice(end).join("\n").trimEnd(),
  };
}

function activeText(content) {
  const lines = content.split("\n");
  const mask = buildCodeFenceMask(lines);
  return lines
    .map((line, index) =>
      mask[index] || /^(?: {4}|\t)/.test(line) ? "" : line,
    )
    .join("\n")
    .replace(/<!--[\s\S]*?(?:-->|$)/g, (match) => match.replace(/[^\n]/g, ""));
}

export async function readContracts(repoRoot, capability) {
  const relative = contractPath(capability);
  let content;
  try {
    content = await readFile(
      await safeContractFile(repoRoot, capability),
      "utf8",
    );
  } catch (error) {
    if (error.code === "ENOENT") return new Map();
    throw error;
  }
  const entries = new Map();
  const pattern =
    /<!-- BEGIN CONTRACT (\{[^\n]+\}) -->\n\n([\s\S]*?)\n\n<!-- END CONTRACT -->/g;
  for (const match of content.matchAll(pattern)) {
    const metadata = JSON.parse(match[1]);
    if (
      typeof metadata.name !== "string" ||
      metadata.id !== contractDigest(capability, metadata.name, match[2]) ||
      entries.has(metadata.id)
    )
      throw new Error(
        `Contract digest changed or duplicated: ${relative}#${metadata.id}`,
      );
    if (
      !activeText(content.slice(0, match.index))
        .trimEnd()
        .endsWith(
          `\n\n<a id="contract-${metadata.id}"></a>\n\n## ${metadata.name}`,
        )
    )
      throw new Error(
        `Missing or inactive contract anchor: ${relative}#${metadata.id}`,
      );
    entries.set(metadata.id, { ...metadata, body: match[2] });
  }
  if ((content.match(/<!-- BEGIN CONTRACT/g) ?? []).length !== entries.size)
    throw new Error(`Malformed contract sections: ${relative}`);
  return entries;
}

function renderContracts(capability, entries) {
  const header = `# ${capability} normative contract clauses\n\nA section is binding only when the matching requirement unconditionally references\nit. A proposed or historical section does not become accepted by residing here.\nThe reference, requirement identity, scenarios, and normal source-authority rules\nform one contract. Preserve all clauses; see openspec/contracts/README.md.\n\n`;
  return (
    header +
    [...entries.values()]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map(
        ({ id, name, body }) =>
          `<!-- prettier-ignore-start -->\n\n<a id="contract-${id}"></a>\n\n## ${name}\n\n<!-- BEGIN CONTRACT ${JSON.stringify({ id, name })} -->\n\n${body}\n\n<!-- END CONTRACT -->\n\n<!-- prettier-ignore-end -->\n`,
      )
      .join("\n")
  );
}

function reference(capability, id) {
  return `Every clause in \`${contractPath(capability)}#contract-${id}\` MUST apply without exception.`;
}

export async function verifyContractReferences(
  repoRoot,
  capability,
  content,
  { allowLegacyInline = false } = {},
) {
  const entries = await readContracts(repoRoot, capability);
  const backedNames = new Set([...entries.values()].map((entry) => entry.name));
  for (const block of requirementBlocks(content)) {
    const { body } = splitRequirement(block);
    const refs = [...body.matchAll(/`(openspec\/contracts\/[^`]+)`/g)];
    const visible = activeText(body);
    const bindings = visible
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim().replace(/\s+/g, " "))
      .map((paragraph) =>
        paragraph.match(
          /^Every clause in `(openspec\/contracts\/[^`]+)` MUST apply without exception\.$/,
        ),
      )
      .filter(Boolean);
    const expected = backedNames.has(block.name) && !allowLegacyInline;
    if (!expected && !refs.length && !body.includes("openspec/contracts/"))
      continue;
    if (bindings.length !== 1 || refs.length !== 1)
      throw new Error(
        `Contract reference must be one unconditional active paragraph: ${capability}/${block.name}`,
      );
    for (const [, target] of bindings) {
      const match = target.match(
        /^(openspec\/contracts\/[a-z0-9/-]+\.md)#contract-([a-f0-9]{20})$/,
      );
      if (!match || match[1] !== contractPath(capability))
        throw new Error(`Contract capability mismatch: ${target}`);
      const entry = entries.get(match[2]);
      if (!entry || entry.name !== block.name)
        throw new Error(
          `Missing or misidentified contract: ${target} (${block.name})`,
        );
    }
  }
}

export async function renderContractView({
  repoRoot = defaultRepoRoot,
  capability,
  content,
  write = false,
}) {
  const entries = await readContracts(repoRoot, capability);
  const summaries = JSON.parse(
    await readFile(
      new URL("../../openspec/contracts/summaries.json", import.meta.url),
      "utf8",
    ),
  );
  let changed = false;
  let compact = content;
  for (const block of requirementBlocks(content)) {
    const description = extractRequirementBody(block.raw.split("\n").slice(1));
    const { body, scenarios } = splitRequirement(block);
    const backed = [...entries.values()].some(
      (entry) => entry.name === block.name,
    );
    if (
      description.length <= 500 &&
      (!backed || body.includes("openspec/contracts/"))
    )
      continue;
    const id = contractDigest(capability, block.name, body);
    const pointer = reference(capability, id);
    const first = [
      ...segmenter.segment(description.replace(/\s+/g, " ")),
    ][0]?.segment.trim();
    const summary = summaries[block.name] ?? first;
    if (!summary || `${summary}\n${pointer}`.length > 500)
      throw new Error(
        `Concise observable summary required: ${capability}/${block.name}`,
      );
    if (!entries.has(id)) {
      if (!write)
        throw new Error(
          `Missing generated contract: ${contractPath(capability)}#contract-${id}`,
        );
      if (/<!-- (?:BEGIN|END) CONTRACT/.test(body))
        throw new Error("Nested contract markers are unsupported");
      entries.set(id, { id, name: block.name, body });
      changed = true;
    }
    const replacement = `${block.headerLine}\n\n${summary}\n\n${pointer}${scenarios ? `\n\n${scenarios}` : ""}`;
    compact = compact.replace(block.raw, () => replacement);
  }
  if (changed) {
    const file = await safeContractFile(repoRoot, capability);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, renderContracts(capability, entries));
  }
  await verifyContractReferences(repoRoot, capability, compact);
  return compact;
}

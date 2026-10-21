import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { format, resolveConfig } from "prettier";

// Documentation projection only. Canonical requirement/story/acceptance text
// lives in the five Markdown volumes; this never executes research evidence.
const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = path.resolve(dir, "../../../..");
const main = path.resolve(dir, "../phase-28-missionary-workspace-depth.md");
const change = path.join(
  root,
  "openspec/changes/add-missionary-workspace-depth",
);
const files = [
  "proof.md",
  "relationships.md",
  "finance-stewardship.md",
  "communications.md",
  "coaching-resources.md",
];
const write = process.argv.includes("--write");
const hash = (text) => crypto.createHash("sha256").update(text).digest("hex");
const flat = (text) => text.replace(/\s+/g, " ").trim();
const records = [];
const sources = {};
const ids = new Set();
for (const file of files) {
  const source = fs.readFileSync(path.join(dir, file), "utf8");
  sources[file] = hash(source);
  const headers = [...source.matchAll(/^## (REQ28-([A-Z]\d{2})) — (.+)$/gm)];
  if (!headers.length) throw new Error("Missing requirement headers: " + file);
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    const chunk = source
      .slice(
        header.index + header[0].length,
        headers[i + 1]?.index ?? source.length,
      )
      .trim();
    const story = chunk.match(
      /\*\*Story (US28-[A-Z]\d{2}):\*\*\s*([\s\S]*?)(?=\n\s*\n)/,
    );
    const basis = chunk.match(
      /\*\*Decision basis:\*\*\s*([\s\S]*?)(?=\n\s*\n)/,
    );
    if (!story || !basis || story[1] !== "US28-" + header[2])
      throw new Error("Invalid story/basis: " + header[1]);
    const acceptance = [];
    const lines = chunk.split("\n");
    for (let j = 0; j < lines.length; j++) {
      const match = lines[j].match(
        /^- \*\*(AC28-[A-Z]\d{2}-\d{2}):\*\*\s*(.*)$/,
      );
      if (!match) continue;
      let text = match[2];
      while (j + 1 < lines.length && /^\s+\S/.test(lines[j + 1]))
        text += " " + lines[++j].trim();
      if (!match[1].startsWith("AC28-" + header[2] + "-"))
        throw new Error("Wrong acceptance parent: " + match[1]);
      acceptance.push({ id: match[1], text: flat(text) });
    }
    if (!acceptance.length) throw new Error("No acceptance: " + header[1]);
    for (const id of [header[1], story[1], ...acceptance.map((x) => x.id)]) {
      if (ids.has(id)) throw new Error("Duplicate ID: " + id);
      ids.add(id);
    }
    const normStart = chunk.indexOf(basis[0]) + basis[0].length;
    const normEnd = chunk.search(/^- \*\*AC28-/m);
    const contract = chunk.slice(normStart, normEnd).trim();
    if (!contract) throw new Error("No contract: " + header[1]);
    records.push({
      requirement: header[1],
      story: story[1],
      title: header[3],
      text: flat(story[2]),
      basis: flat(basis[1]),
      source: file,
      contract,
      acceptance,
    });
  }
}

const expandDecisions = (basis, prefix = "D", max = 50) => {
  const found = new Set();
  for (const match of basis.matchAll(
    new RegExp(
      "\\b" + prefix + "(\\d+)(?:\\s*[–—-]\\s*" + prefix + "?(\\d+))?",
      "g",
    ),
  )) {
    const a = Number(match[1]),
      b = Number(match[2] ?? a);
    for (let n = a; n <= b; n++)
      if (n >= 1 && n <= max)
        found.add(prefix + (prefix === "C" ? String(n).padStart(2, "0") : n));
  }
  return [...found];
};
const decisions = Object.fromEntries(
  Array.from({ length: 50 }, (_, i) => ["D" + (i + 1), []]),
);
for (const r of records)
  for (const d of expandDecisions(r.basis)) decisions[d].push(r.requirement);
const uncovered = Object.entries(decisions)
  .filter(([, r]) => !r.length)
  .map(([d]) => d);
if (uncovered.length)
  throw new Error("Uncovered decisions: " + uncovered.join(", "));

const completeness = Object.fromEntries(
  Array.from({ length: 20 }, (_, i) => [
    "C" + String(i + 1).padStart(2, "0"),
    [],
  ]),
);
for (const r of records) {
  // Only completeness-qualified bases count; decision-local Cxx clauses are not
  // the whole-phase completeness register. Common proof stories carry all 20.
  if (r.source === "proof.md" && /completeness/i.test(r.basis)) {
    for (const c of expandDecisions(r.basis, "C", 20))
      completeness[c].push(r.requirement);
  }
}
const missingCompleteness = Object.entries(completeness)
  .filter(([, r]) => !r.length)
  .map(([c]) => c);
if (missingCompleteness.length)
  throw new Error("Uncovered completeness: " + missingCompleteness.join(", "));

const storyLines = records
  .map(
    (r, i) =>
      i +
      1 +
      ". **" +
      r.story +
      ".** " +
      r.text +
      "\n   Requirement: " +
      r.requirement +
      ". Acceptance: " +
      r.acceptance.map((a) => a.id).join(", ") +
      ".",
  )
  .join("\n\n");
const beforeMain = fs.readFileSync(main, "utf8");
const marker =
  /<!-- BEGIN GENERATED STORIES -->[\s\S]*?<!-- END GENERATED STORIES -->/;
if (!marker.test(beforeMain)) throw new Error("Missing main story markers");
const mainText = beforeMain.replace(
  marker,
  "<!-- BEGIN GENERATED STORIES -->\n\n" +
    storyLines +
    "\n\n<!-- END GENERATED STORIES -->",
);

let spec =
  "# Phase 28 missionary workspace behavioral projection\n\n> Generated from the canonical Phase 28 domain/proof volumes. The full normative contracts, owner reconciliation and common safeguards remain binding. Regenerate through the specification renderer; do not edit independently.\n\n## ADDED Requirements\n";
for (const r of records) {
  spec +=
    "\n### Requirement: " +
    r.requirement +
    " — " +
    r.title +
    "\n\nThe system SHALL satisfy this contract and the common safeguards in the canonical specification.\n\n" +
    r.contract +
    "\n\n";
  spec +=
    "Story: " +
    r.story +
    ". Source: " +
    r.source +
    ". Decision basis: " +
    r.basis +
    "\n";
  for (const a of r.acceptance) {
    const gwt = a.text.match(/^Given (.*?), when (.*?), then (.*)$/i);
    const outcome = gwt
      ? "- **GIVEN** " +
        gwt[1] +
        "\n- **WHEN** " +
        gwt[2] +
        "\n- **THEN** " +
        gwt[3]
      : "- **THEN** " + a.text;
    spec += "\n#### Scenario: " + a.id + "\n\n" + outcome + "\n";
  }
}
const trace = {
  version: "phase28-spec-2026-10-18-v1",
  authority:
    "Five canonical Markdown volumes own stories, requirements and acceptance; this is a derived trace.",
  counts: {
    stories: records.length,
    requirements: records.length,
    acceptance: records.reduce((n, r) => n + r.acceptance.length, 0),
  },
  sourceSha256: sources,
  decisions,
  completeness,
  requirements: records.map(({ contract, ...r }) => r),
  proofStatus:
    "All acceptance is future implementation qualification; document generation establishes no runtime success.",
};
const outputs = new Map([
  [main, mainText],
  [path.join(dir, "traceability.json"), JSON.stringify(trace, null, 2) + "\n"],
  [path.join(change, "specs/missionary-workspace-depth/spec.md"), spec],
]);
let stale = false;
for (const [file, raw] of outputs) {
  const config = await resolveConfig(file);
  const text = await format(raw, { ...config, filepath: file });
  if (write) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text);
  } else if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== text) {
    console.error("Stale projection: " + path.relative(root, file));
    stale = true;
  }
}
if (stale) process.exitCode = 1;
else
  console.log(
    JSON.stringify({
      ...trace.counts,
      decisions: Object.keys(decisions).length,
      mode: write ? "write" : "check",
    }),
  );

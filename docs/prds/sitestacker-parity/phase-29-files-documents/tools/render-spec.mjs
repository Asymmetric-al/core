import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { format, resolveConfig } from "prettier";
import { renderContractView } from "../../../../../scripts/lib/openspec-contracts.mjs";

// Same canonical-volume/full-contract projection boundary as Phase 28.
// This is document verification. No source evidence is executed as code.
const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const root = path.resolve(dir, "../../../..");
const main = path.resolve(dir, "../phase-29-files-documents.md");
const change = path.join(root, "openspec/changes/add-files-documents");
const volumes = [
  "proof.md",
  "request-access.md",
  "collection-review.md",
  "organization-and-review-tools.md",
  "custody-and-integration.md",
  "records-policies.md",
];
const write = process.argv.includes("--write");
const hash = (text) => crypto.createHash("sha256").update(text).digest("hex");
const flat = (text) => text.replace(/\s+/g, " ").trim();
const records = [],
  ids = new Set(),
  sourceSha256 = {};
for (const file of volumes) {
  const source = fs.readFileSync(path.join(dir, file), "utf8");
  sourceSha256[file] = hash(source);
  const headers = [...source.matchAll(/^## (REQ29-([A-Z]\d{2,3})) — (.+)$/gm)];
  if (!headers.length) throw new Error(`No requirements: ${file}`);
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i];
    const chunk = source
      .slice(h.index + h[0].length, headers[i + 1]?.index ?? source.length)
      .trim();
    const story = chunk.match(
      /\*\*Story (US29-[A-Z]\d{2,3}):\*\*\s*([\s\S]*?)(?=\n\s*\n)/,
    );
    const basis = chunk.match(
      /\*\*Decision basis:\*\*\s*([\s\S]*?)(?=\n\s*\n)/,
    );
    if (!story || !basis || story[1] !== `US29-${h[2]}`)
      throw new Error(`Story/basis mismatch: ${h[1]}`);
    const matches = [
      ...chunk.matchAll(
        /^- \*\*(AC29-[A-Z]\d{2,3}-\d{2,3}):\*\*\s*(.*(?:\n[ \t]+\S.*)*)/gm,
      ),
    ];
    const acceptance = matches.map((a) => ({ id: a[1], text: flat(a[2]) }));
    if (!acceptance.length) throw new Error(`No acceptance: ${h[1]}`);
    for (const a of acceptance)
      if (!a.id.startsWith(`AC29-${h[2]}-`) || !a.text)
        throw new Error(`Invalid acceptance ${a.id}`);
    for (const id of [h[1], story[1], ...acceptance.map((a) => a.id)]) {
      if (ids.has(id)) throw new Error(`Duplicate ${id}`);
      ids.add(id);
    }
    const contract =
      chunk
        .slice(chunk.indexOf(basis[0]) + basis[0].length, matches[0].index)
        .trim() ||
      "Every acceptance outcome below is normative and applies alongside the complete common safeguards and exact cited source-owner contract.";
    records.push({
      requirement: h[1],
      story: story[1],
      title: h[3],
      text: flat(story[2]),
      basis: flat(basis[1]),
      source: file,
      contract,
      acceptance,
    });
  }
}
// Genuine full text and accepted outcomes remain in the generated contract view.
let projection =
  "# Phase 29 Files and Documents behavioral projection\n\n## Purpose\n\nGenerated from six canonical Markdown volumes. Every common safeguard and complete owner contract remains binding; story summaries do not narrow them. No implementation qualification is claimed.\n\n## ADDED Requirements\n";
for (const r of records) {
  // Nested source headings are presentation, not OpenSpec requirement boundaries.
  // Keep their complete text inside this requirement's unconditional contract.
  const projectedContract = r.contract.replace(/^#{1,6}\s+(.+)$/gm, "**$1**");
  projection += `\n### Requirement: ${r.requirement} — ${r.title}\n\nThe system SHALL satisfy this complete contract and REQ29-P01–P18 common safeguards.\n\n${projectedContract}\n\nStory: ${r.story}. Source: ${r.source}. Decision basis: ${r.basis}\n`;
  for (const a of r.acceptance) {
    const gwt = a.text.match(/^Given (.*?), when (.*?), then (.*)$/i);
    projection +=
      `\n#### Scenario: ${a.id}\n\n` +
      (gwt
        ? `- **GIVEN** ${gwt[1]}\n- **WHEN** ${gwt[2]}\n- **THEN** ${gwt[3]}`
        : `- **THEN** ${a.text}`) +
      "\n";
  }
}
const decisions = Object.fromEntries(
  Array.from({ length: 67 }, (_, i) => [
    `Q${String(i + 1).padStart(2, "0")}`,
    [],
  ]),
);
for (const r of records) {
  for (const m of r.basis.matchAll(
    /\bQ(\d{1,2})(?:\s*[–—-]\s*Q?(\d{1,2}))?/g,
  )) {
    for (let q = Number(m[1]); q <= Number(m[2] ?? m[1]); q++)
      if (decisions[`Q${String(q).padStart(2, "0")}`])
        decisions[`Q${String(q).padStart(2, "0")}`].push(r.requirement);
  }
}
const missing = Object.entries(decisions)
  .filter(([, v]) => !v.length)
  .map(([k]) => k);
if (missing.length) throw new Error(`Unmapped decision: ${missing.join(", ")}`);
const lines = records
  .map(
    (r, i) =>
      `${i + 1}. **${r.story}.** ${r.text}\n   [${r.requirement}](phase-29-files-documents/${r.source}#${r.requirement.toLowerCase()}--${r.title
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .replace(
          /\s/g,
          "-",
        )}). Acceptance: ${r.acceptance[0].id} through ${r.acceptance.at(-1).id}.`,
  )
  .join("\n\n");
const marker =
  /<!-- BEGIN GENERATED STORIES -->[\s\S]*?<!-- END GENERATED STORIES -->/;
const before = fs.readFileSync(main, "utf8");
if (!marker.test(before)) throw new Error("Missing story markers");
const trace = {
  version: 1,
  authority:
    "Six canonical Markdown volumes own the full requirements and acceptance; this is a derived index, not independent authority.",
  counts: {
    requirements: records.length,
    stories: records.length,
    acceptance: records.reduce((n, r) => n + r.acceptance.length, 0),
  },
  sourceSha256,
  decisions,
  requirements: records.map(({ contract, ...r }) => r),
  proofStatus:
    "Future implementation qualification. No runtime/native/provider/user result is claimed.",
};
const outputs = new Map([
  [
    main,
    before.replace(
      marker,
      `<!-- BEGIN GENERATED STORIES -->\n\n${lines}\n\n<!-- END GENERATED STORIES -->`,
    ),
  ],
  [path.join(dir, "traceability.json"), JSON.stringify(trace, null, 2) + "\n"],
  [path.join(change, "specs/files-documents/spec.md"), projection],
]);
let stale = false;
for (const [file, raw] of outputs) {
  const config = await resolveConfig(file);
  let text = await format(raw, { ...config, filepath: file });
  if (file.endsWith("/specs/files-documents/spec.md")) {
    text = await renderContractView({
      repoRoot: root,
      capability: "files-documents",
      content: text,
      write,
    });
    text = await format(text, { ...config, filepath: file });
  }
  if (write) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, text);
  } else if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== text) {
    console.error(`Stale: ${path.relative(root, file)}`);
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

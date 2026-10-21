import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const base = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repo = path.resolve(base, "../../../..");
const write = process.argv.includes("--write");
const volumes = ["partnerships", "requests", "context", "assignments", "proof"];
const stories = JSON.parse(
  await readFile(path.join(base, "stories.json"), "utf8"),
);
const requirements = new Map();
const acceptance = new Map();
function fail(message) {
  throw new Error(message);
}
function add(map, id, value) {
  if (map.has(id)) fail(`Duplicate definition: ${id}`);
  map.set(id, value);
}
for (const volume of volumes) {
  const source = await readFile(path.join(base, `${volume}.md`), "utf8");
  const lines = source.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const req = lines[i].match(/^#{2,5}\s+(REQ27-[A-Z]\d+)\s+[—–-]\s+(.+)$/);
    if (req) add(requirements, req[1], { volume, title: req[2] });
    const heading = lines[i].match(
      /^(#{2,5})\s+(AC27-[A-Z]\d+-\d+)(?:\s+.*)?$/,
    );
    const inline = lines[i].match(
      /^\s*-\s+\*\*(AC27-[A-Z]\d+-\d+):?\*\*:?\s*(.*)$/,
    );
    if (heading) {
      const body = [];
      let j = i + 1;
      for (; j < lines.length && !/^#{1,5}\s/.test(lines[j]); j++)
        body.push(lines[j]);
      add(acceptance, heading[2], { volume, text: body.join("\n").trim() });
    } else if (inline) {
      const body = [inline[2]];
      let j = i + 1;
      for (
        ;
        j < lines.length &&
        lines[j].trim() &&
        !/^\s*-|^#|^Trace:/.test(lines[j]);
        j++
      )
        body.push(lines[j]);
      add(acceptance, inline[1], { volume, text: body.join("\n").trim() });
    }
  }
}
const usedR = new Set();
const usedA = new Set();
const seenS = new Set();
for (const story of stories) {
  if (seenS.has(story.id)) fail(`Duplicate story ${story.id}`);
  seenS.add(story.id);
  if (!story.requirements.length || !story.acceptance.length)
    fail(`Unverifiable story ${story.id}`);
  for (const id of story.requirements) {
    if (!requirements.has(id)) fail(`${story.id}: missing ${id}`);
    usedR.add(id);
  }
  for (const id of story.acceptance) {
    if (!acceptance.has(id)) fail(`${story.id}: missing ${id}`);
    usedA.add(id);
  }
}
for (const id of requirements.keys())
  if (!usedR.has(id)) fail(`Uncovered requirement ${id}`);
for (const id of acceptance.keys())
  if (!usedA.has(id)) fail(`Uncovered acceptance ${id}`);
const storyText = stories
  .map(
    (s, i) =>
      `${i + 1}. **${s.id}.** ${s.text}\n   Requirements: ${s.requirements.join(", ")}. Acceptance: ${s.acceptance.join(", ")}.`,
  )
  .join("\n\n");
const mainFile = path.resolve(base, "../phase-27-donor-development.md");
const main = await readFile(mainFile, "utf8");
const pattern =
  /<!-- BEGIN GENERATED STORIES -->[\s\S]*?<!-- END GENERATED STORIES -->/;
if (!pattern.test(main)) fail("Missing generated story markers");
const updated = main.replace(
  pattern,
  `<!-- BEGIN GENERATED STORIES -->\n\n${storyText}\n\n<!-- END GENERATED STORIES -->`,
);
const out = [
  "# Phase 27 donor-development behavioral projection",
  "",
  "## Purpose",
  "",
  "Generated from the canonical Phase 27 story registry and normative volumes. Regenerate with its render-spec tool; do not edit independently. Complete REQ27 contracts and operating controls remain binding alongside these observable scenarios.",
  "",
  "## ADDED Requirements",
  "",
];
for (const s of stories) {
  out.push(
    `### Requirement: ${s.id} — ${s.title}`,
    "",
    `The system SHALL provide this observable outcome: ${s.text} The complete normative contracts are ${s.requirements.join(", ")}.`,
    "",
  );
  for (const id of s.acceptance) {
    const a = acceptance.get(id);
    out.push(`#### Scenario: ${s.id} ${id}`, "");
    if (
      /\*\*WHEN\*\*|^- WHEN/im.test(a.text) &&
      /\*\*THEN\*\*|^- THEN/im.test(a.text)
    )
      out.push(
        a.text
          .replace(
            /(?:^[ \t]*-[ \t]*)?\*\*(given|when|then|and)\*\*:?[ \t]*/gim,
            (_, keyword) => `\n- **${keyword.toUpperCase()}** `,
          )
          .trim(),
      );
    else
      out.push(
        `- **WHEN** the actor exercises this capability: ${s.feature.replace(/^to /, "")}.`,
        `- **THEN** ${a.text}`,
      );
    out.push("");
  }
}
const projection = out.join("\n");
const trace =
  JSON.stringify(
    {
      version: "phase27-ratified-spec-2026-10-11-v1",
      authority:
        "stories.json owns stories; normative Markdown volumes own requirements and acceptance; this index and OpenSpec are generated",
      counts: {
        stories: stories.length,
        requirements: requirements.size,
        acceptance: acceptance.size,
        projectedScenarios: stories.reduce(
          (n, s) => n + s.acceptance.length,
          0,
        ),
      },
      stories: stories.map((s) => ({
        id: s.id,
        requirements: s.requirements,
        acceptance: s.acceptance,
      })),
      requirements: Object.fromEntries(requirements),
      acceptance: Object.fromEntries(
        [...acceptance].map(([id, { volume }]) => [id, { volume }]),
      ),
    },
    null,
    2,
  ) + "\n";
const outputs = [
  [mainFile, updated],
  [
    path.join(
      repo,
      "openspec/changes/add-donor-development/specs/donor-development/spec.md",
    ),
    projection,
  ],
  [path.join(base, "traceability.json"), trace],
];
const { default: prettier } = await import("prettier");
const { renderContractView } = await import(
  path.join(repo, "scripts/lib/openspec-contracts.mjs")
);
const formatOptions = await prettier.resolveConfig(mainFile);
for (const [file, content] of outputs) {
  let formatted = await prettier.format(content, {
    ...formatOptions,
    filepath: file,
  });
  if (file.endsWith("/specs/donor-development/spec.md")) {
    formatted = await renderContractView({
      repoRoot: repo,
      capability: "donor-development",
      content: formatted,
      write,
    });
    formatted = await prettier.format(formatted, {
      ...formatOptions,
      filepath: file,
    });
  }
  if (write) await writeFile(file, formatted);
  else if ((await readFile(file, "utf8")) !== formatted)
    fail(`Generated content differs: ${path.relative(repo, file)}`);
}
console.log(
  JSON.stringify({
    mode: write ? "write" : "check",
    stories: stories.length,
    requirements: requirements.size,
    acceptance: acceptance.size,
    projectedScenarios: stories.reduce((n, s) => n + s.acceptance.length, 0),
  }),
);

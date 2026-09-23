#!/usr/bin/env node
// traceability.json stories and final trace mappings own these projections.
// No arguments checks without writing; --write explicitly regenerates them.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packetDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(packetDir, "../../../..");
const packetPath =
  "docs/prds/sitestacker-parity/phase-25-donor-dashboard-depth";
const sourcePath = `${packetPath}/traceability.json`;
const writeCommand = `node ${packetPath}/tools/render-stories.mjs --write`;
const marker = `<!-- Generated from ${sourcePath} stories and final trace mappings. Do not hand-edit; run ${writeCommand}. -->`;
const sectionHeading = "## User Stories\n\n";
const followingHeading = "\n## Implementation Decisions\n";

function read(relativePath) {
  return readFileSync(resolve(repoRoot, relativePath), "utf8");
}

function sourceRefs(story, finalTraces) {
  return [
    ...new Set([
      ...story.question_refs,
      ...finalTraces
        .filter((trace) => trace.stories.includes(story.id))
        .map((trace) => trace.id),
    ]),
  ];
}

function validateStories(stories, finalTraces) {
  const contractIds = new Set();
  for (const name of [
    "shared",
    "experience",
    "identity",
    "recurring",
    "financial",
  ]) {
    const contract = read(`${packetPath}/contracts/${name}.md`);
    for (const [, id] of contract.matchAll(
      /^## ((?:S|EX|IC|RC|D)\d{2}) — /gm,
    )) {
      if (contractIds.has(id))
        throw new Error(`Duplicate contract heading: ${id}`);
      contractIds.add(id);
    }
  }
  const lanes = {
    U: [60, "experience"],
    I: [40, "identity"],
    R: [68, "recurring"],
    D: [74, "financial"],
  };
  const expectedIds = new Set(
    Object.entries(lanes).flatMap(([prefix, [count]]) =>
      Array.from(
        { length: count },
        (_, index) => `${prefix}${String(index + 1).padStart(2, "0")}`,
      ),
    ),
  );
  if (!Array.isArray(stories) || stories.length !== expectedIds.size) {
    throw new Error(
      "Canonical stories must contain all 242 ratified US25 outcomes.",
    );
  }
  const isLine = (value) =>
    typeof value === "string" &&
    value.trim().length > 0 &&
    !/[\r\n]/.test(value);
  for (const story of stories) {
    if (!story || !expectedIds.delete(story.id)) {
      throw new Error(`Unknown or duplicate story ID: ${story?.id}`);
    }
    if (story.lane !== lanes[story.id[0]][1]) {
      throw new Error(`Invalid lane for US25-${story.id}.`);
    }
    for (const field of ["actor", "want", "benefit"]) {
      if (!isLine(story[field]))
        throw new Error(`US25-${story.id} needs a single-line ${field}.`);
    }
    for (const field of ["acceptance", "question_refs", "contract_refs"]) {
      if (
        !Array.isArray(story[field]) ||
        (field !== "question_refs" && story[field].length === 0) ||
        !story[field].every(isLine)
      ) {
        throw new Error(`US25-${story.id} has invalid ${field}.`);
      }
    }
    for (const [field, valid] of [
      ["question_refs", (ref) => /^Q(?:0[1-9]|[12]\d|30)$/.test(ref)],
      ["contract_refs", (ref) => contractIds.has(ref)],
    ]) {
      if (
        new Set(story[field]).size !== story[field].length ||
        !story[field].every(valid)
      ) {
        throw new Error(`US25-${story.id} has unknown or duplicate ${field}.`);
      }
    }
    if (sourceRefs(story, finalTraces).length === 0) {
      throw new Error(
        `US25-${story.id} needs a question or mapped final source.`,
      );
    }
  }
}

function storyText(story) {
  const article = /^[aeiou]/i.test(story.actor) ? "an" : "a";
  return `As ${article} ${story.actor}, I want ${story.want}, so that ${story.benefit}.`;
}

function renderAcceptance(stories, finalTraces) {
  const header = `# Phase25 — Independently verifiable story acceptance\n\n${marker}\n\nAll shared and referenced domain contracts apply. These are future proof obligations; none is marked executed by publication. Story IDs are stable and distinct from the source question/clause identifiers.\n\n`;
  return (
    header +
    stories
      .map((story) =>
        [
          `## US25-${story.id} — ${storyText(story)}`,
          "",
          `- Source: ${sourceRefs(story, finalTraces).join(", ")}; normative contract: ${story.contract_refs.join(", ")}.`,
          ...story.acceptance.map(
            (criterion, index) =>
              `- **AC${String(index + 1).padStart(2, "0")}:** ${criterion}`,
          ),
        ].join("\n"),
      )
      .join("\n\n") +
    "\n"
  );
}

function renderPrd(current, stories) {
  const start = current.indexOf(sectionHeading);
  const end = current.indexOf(followingHeading, start + sectionHeading.length);
  if (
    start < 0 ||
    end < 0 ||
    current.indexOf(sectionHeading, start + 1) >= 0 ||
    current.indexOf(followingHeading, end + 1) >= 0
  ) {
    throw new Error(
      "PRD must have one User Stories section followed by one Implementation Decisions section.",
    );
  }
  const section =
    `${sectionHeading}${marker}\n\nEach story is independently verifiable using its matching **US25** acceptance entry and referenced normative sections. The acceptance entry states observable outcomes and negative boundaries; the shared contract applies without creating a separate feature or permission.\n\n` +
    stories
      .map(
        (story, index) =>
          `${index + 1}. ${storyText(story)} **US25-${story.id}**`,
      )
      .join("\n") +
    "\n";
  return current.slice(0, start) + section + current.slice(end);
}

function renderOpenSpec(stories) {
  const header = `## Purpose\n\nProvide one coherent donor self-service experience that preserves exact source authority, privacy, financial truth, accessible task completion and recoverable outcomes across the accepted Phase25 jobs.\n\n${marker}\n\n## ADDED Requirements\n\n`;
  return (
    header +
    stories
      .map((story) =>
        [
          `### Requirement: US25-${story.id} ${story.want[0].toUpperCase()}${story.want.slice(1)}`,
          "",
          `The system SHALL support the following observable outcome for the ${story.actor}: ${story.want}, so that ${story.benefit}. The exact shared and domain contract sections ${story.contract_refs.join(", ")} define the applicable source and scope limits.`,
          "",
          `#### Scenario: US25-${story.id} independently verifiable outcome`,
          "",
          "- **GIVEN** the story's admitted actor/context and specified positive, negative or failure fixture",
          "- **WHEN** the actor attempts the described task at its qualified application or owner boundary",
          ...story.acceptance.map(
            (criterion, index) =>
              `- **${index === 0 ? "THEN" : "AND"}** ${criterion}`,
          ),
        ].join("\n"),
      )
      .join("\n\n") +
    "\n"
  );
}

function main() {
  const args = process.argv.slice(2);
  if (
    args.length > 1 ||
    (args.length === 1 && !["--check", "--write"].includes(args[0]))
  ) {
    throw new Error(
      "Usage: render-stories.mjs [--check | --write] (default: --check)",
    );
  }
  const { stories, traces } = JSON.parse(read(sourcePath));
  if (!Array.isArray(traces))
    throw new Error("Canonical traces must be an array.");
  const finalTraces = traces.filter((trace) =>
    trace.id?.startsWith("P25.FINAL."),
  );
  for (const trace of finalTraces) {
    if (
      !/^P25\.FINAL\.[A-Z0-9-]+$/.test(trace.id) ||
      !Array.isArray(trace.stories) ||
      !Array.isArray(trace.source_references) ||
      trace.source_references.length === 0
    ) {
      throw new Error(`Invalid final source trace: ${trace.id}`);
    }
  }
  validateStories(stories, finalTraces);
  const prdPath = `${packetPath}.md`;
  const projections = new Map([
    [`${packetPath}/acceptance.md`, renderAcceptance(stories, finalTraces)],
    [prdPath, renderPrd(read(prdPath), stories)],
    [
      "openspec/changes/add-donor-dashboard-depth/specs/donor-dashboard-depth/spec.md",
      renderOpenSpec(stories),
    ],
  ]);
  const drift = [];
  for (const [path, expected] of projections) {
    let current;
    try {
      current = read(path);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    if (current !== expected) drift.push(path);
  }
  if (args[0] === "--write") {
    for (const path of drift)
      writeFileSync(resolve(repoRoot, path), projections.get(path));
    console.log(
      `Phase25: generated ${drift.length} changed projections from ${stories.length} canonical stories.`,
    );
  } else if (drift.length > 0) {
    throw new Error(
      `Story projection drift:\n${drift.map((path) => `- ${path}`).join("\n")}\nEdit ${sourcePath} stories or final trace mappings, then run:\n${writeCommand}`,
    );
  } else {
    console.log(
      `Phase25: all 3 projections match ${stories.length} canonical stories.`,
    );
  }
}

try {
  main();
} catch (error) {
  console.error(`Phase25: ${error.message}`);
  process.exitCode = 1;
}

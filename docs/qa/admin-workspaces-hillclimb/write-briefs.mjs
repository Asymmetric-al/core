// Writes the council review briefs for one comparison round: one brief per
// area and reviewer, with identical evidence and counterbalanced order
// (reviewer "claude" sees A first, "gpt" sees B first; next round swaps).
//
// Usage:
//   node docs/qa/admin-workspaces-hillclimb/write-briefs.mjs <round> <dirA> <labelA> <dirB> <labelB> <verification.md> [swap]
// Expects comparison sheets in comparisons/<round>-ab/ and <round>-ba/
// (compose-sheets.mjs with A left and with B left).
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { UNAVAILABLE_MODULE_WORKFLOWS } from "./module-states.mjs";
import { UNAVAILABLE_WORKSPACE_WORKFLOWS } from "./workspace-states.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..", "..");
const [round, dirA, labelA, dirB, labelB, verificationPath, swap] =
  process.argv.slice(2);
if (!verificationPath) {
  throw new Error(
    "usage: write-briefs.mjs <round> <dirA> <labelA> <dirB> <labelB> <verification.md> [swap]",
  );
}

/** Reviewable parts per area and the states that evidence each. */
export const PARTS = {
  crm: {
    title: "CRM",
    parts: [
      {
        name: "Records workspace",
        states: [
          "crm-records",
          "crm-kanban",
          "crm-search",
          "crm-view-options",
          "crm-row-menu",
        ],
      },
      {
        name: "Record drawer and gift history",
        states: [
          "crm-drawer",
          "crm-drawer-properties",
          "crm-drawer-gifts",
          "crm-gift-views-menu",
          "crm-gift-row-menu",
          "crm-resend-receipt",
        ],
      },
      {
        name: "Notes",
        states: [
          "crm-notes",
          "crm-note-detail",
          "crm-note-long",
          "crm-notes-empty",
        ],
      },
      {
        name: "Relationships",
        states: [
          "crm-relationships",
          "crm-relationships-more",
          "crm-relationship-detail",
        ],
      },
      {
        name: "Loading, empty and error states",
        states: ["crm-empty", "crm-error", "crm-notes-empty"],
      },
    ],
  },
  contributions: {
    title: "Contributions",
    parts: [
      {
        name: "Contributions hub",
        states: [
          "contributions",
          "contributions-cards",
          "contributions-filter",
          "contributions-row-menu",
          "contributions-selection",
        ],
      },
      { name: "Contribution detail sheet", states: ["contribution-sheet"] },
      {
        name: "Gift operations",
        states: [
          "contribution-refund",
          "contribution-send-receipt",
          "contributions-send-receipts",
        ],
      },
      { name: "Correction approvals", states: ["contribution-correction"] },
      {
        name: "Unexercised Hub correction entrypoint",
        states: ["contribution-fund-correction"],
      },
      {
        name: "Empty and error states",
        states: ["contributions-empty", "contributions-error"],
      },
    ],
  },
  studio: {
    title: "Web Studio",
    parts: [
      {
        name: "Shell and dashboard",
        states: ["studio-dashboard", "studio-nav-mobile", "studio-account"],
      },
      {
        name: "Collection lists",
        states: [
          "studio-pages",
          "studio-ministry-updates",
          "studio-media",
          "studio-navigation",
          "studio-page-templates",
          "studio-missionary-profiles",
          "studio-giving-pages",
          "studio-project-pages",
          "studio-users",
          "studio-tenants",
          "studio-pages-trash",
          "studio-pages-filters",
          "studio-pages-view-menu",
          "studio-pages-sort-menu",
          "studio-giving-pages-sort-menu",
          "studio-pages-filtered-empty",
          "studio-pages-grouped",
          "studio-pages-group-menu",
          "studio-pages-selected",
          "studio-pages-bulk-publish",
          "studio-pages-tenant-filter",
        ],
      },
      {
        name: "Document workspace",
        states: [
          "studio-page-edit",
          "studio-page-settings",
          "studio-page-versions",
          "studio-page-api",
          "studio-page-create",
          "studio-update-edit",
          "studio-navigation-edit",
          "studio-media-edit",
          "studio-giving-edit",
          "studio-page-edit-details",
          "studio-page-edit-preview-menu",
        ],
      },
      {
        name: "Template gallery",
        states: ["studio-templates", "studio-templates-error"],
      },
      {
        name: "Missionaries hub",
        states: ["studio-missionaries", "studio-missionaries-status-error"],
      },
      {
        name: "Create flows",
        states: [
          "studio-new-page",
          "studio-new-giving",
          "studio-new-project",
          "studio-new-update",
          "studio-new-page-errors",
          "studio-new-page-template-picker",
          "studio-new-template",
          "studio-new-giving-errors",
        ],
      },
    ],
  },
  shell: {
    title: "Shell, home and administration",
    parts: [
      {
        name: "App shell: sidebar, header, search and profile menu",
        states: ["home", "home-search", "home-profile-menu", "home-mobile-nav"],
      },
      { name: "Home", states: ["home"] },
      {
        name: "Administration and read-only staff directory",
        states: [
          "admin",
          "admin-staff-directory",
          "admin-staff-search",
          "admin-staff-no-results",
          "admin-eve",
        ],
      },
      {
        name: "Settings and system pages",
        states: ["email-delivery", "about", "sign", "no-access"],
      },
    ],
  },
  people: {
    title:
      "People modules (Member Care, Mobilize, Events, Ministry Updates, Tasks)",
    parts: [
      {
        name: "Member Care",
        states: [
          "care",
          "care-directory",
          "care-profile",
          "care-profile-thread",
          "care-profile-plan",
          "care-settings",
        ],
      },
      {
        name: "Unconnected Mobilize and connected locations",
        states: [
          "mobilize-unconnected",
          "locations",
          "locations-list",
          "locations-add",
        ],
      },
      {
        name: "Unconnected Events",
        states: ["events-unconnected"],
      },
      { name: "Ministry Updates", states: ["feed", "org-updates"] },
      {
        name: "Tasks: linked follow-ups, not team to-dos",
        states: ["tasks-follow-ups"],
      },
    ],
  },
  support: {
    title: "Support Hub",
    parts: [
      {
        name: "Inbox",
        states: ["support-inbox", "support-table", "support-conversation"],
      },
      {
        name: "Reports",
        states: ["support-reports", "support-reports-agents"],
      },
      {
        name: "Settings",
        states: [
          "support-settings-inbox",
          "support-settings-sla",
          "support-settings-labels",
          "support-settings-automations",
          "support-settings-notifications",
        ],
      },
    ],
  },
  tools: {
    title: "Tools (Reports, Automations, Workflow runs, studios)",
    parts: [
      { name: "Reports", states: ["reports"] },
      {
        name: "Automations and workflow runs",
        states: ["automations", "automations-failing", "workflows"],
      },
      {
        name: "Email and PDF studios",
        states: ["email-studio", "pdf-studio", "pdf-export-menu"],
      },
    ],
  },
};

const WIDTHS = ["desktop", "intermediate", "small-tablet", "mobile"];
const UNEXERCISED = [
  ...UNAVAILABLE_MODULE_WORKFLOWS,
  ...UNAVAILABLE_WORKSPACE_WORKFLOWS,
];
const rel = (path) => relative(repoRoot, path).replaceAll("\\", "/");
const sha = (path) =>
  createHash("sha256").update(readFileSync(path)).digest("hex").slice(0, 16);

function readJson(path, fallback) {
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : fallback;
}

const metricsA = readJson(join(dirA, "page-metrics.json"), {});
const metricsB = readJson(join(dirB, "page-metrics.json"), {});
const checksA = readJson(join(dirA, "workspace-checks.json"), []);
const checksB = readJson(join(dirB, "workspace-checks.json"), []);
const verification = readFileSync(verificationPath, "utf8");

function checkSummary(checks, state, viewport) {
  const row = checks.find((c) => c.state === state && c.viewport === viewport);
  if (!row) return "not run";
  const axe = row.axe.violations.length
    ? `axe ${row.axe.violations.map((v) => `${v.id}×${v.nodes}`).join(", ")}`
    : "axe 0";
  const parts = ["raw check, semantic qualification separate", axe];
  if (row.axe.incompleteIds?.length)
    parts.push(`incomplete ${row.axe.incompleteIds.join(", ")}`);
  if (row.unexpectedRouteErrorHeadings?.length)
    parts.push(
      `UNQUALIFIED route error: ${row.unexpectedRouteErrorHeadings.join("; ")}`,
    );
  if (row.horizontalOverflow) parts.push("page overflows horizontally");
  if (row.keyboard) {
    parts.push(
      row.keyboard.reachedRow
        ? `Tab reaches a row in ${row.keyboard.tabStops} stops; ArrowDown ${row.keyboard.arrowDownMovesRow ? "moves" : "does not move"} to the next row`
        : `Tab does not reach a row within ${row.keyboard.tabStops} stops`,
    );
  }
  if (row.dialogFocus) {
    parts.push(
      `dialog Tab escapes ${row.dialogFocus.tabEscapes}/12${row.dialogFocus.escapedTo.length ? ` (${row.dialogFocus.escapedTo.join("; ")})` : ""}, Escape ${row.dialogFocus.closedByEscape ? "closes" : "does not close"}`,
    );
  }
  if (row.dialog && !row.dialog.contained) parts.push("dialog not contained");
  parts.push(
    `rows ${row.renderedTableRows} table / ${row.renderedMobileRows} cards`,
  );
  return parts.join("; ");
}

function metricsSummary(metrics, state, width) {
  const m = metrics[state]?.[width];
  if (!m) return "not captured";
  return `height ${m.scrollHeight}px; ${m.tables} table(s), ${m.reuiGrids} ReUI grid(s), ${m.tableRows} body rows; ${m.focusableInMain} focusables in main; h1 ${JSON.stringify(m.h1)}${m.horizontalOverflow ? "; OVERFLOW" : ""}${m.dialog ? `; dialog "${(m.dialog.name ?? "").slice(0, 40)}" ${m.dialog.width}px` : ""}`;
}

function evidenceForState(state, firstIsA) {
  const unavailable = UNEXERCISED.find((entry) => entry.name === state);
  if (unavailable)
    return [
      `- NOT_EXERCISED: ${unavailable.reason} Historical named artifacts are not qualified workflow evidence.`,
    ];
  const lines = [];
  for (const width of WIDTHS) {
    const file = `${state}--${width}.png`;
    const a = join(dirA, file);
    const b = join(dirB, file);
    if (!existsSync(a) && !existsSync(b)) continue;
    const sheetDir = join(
      here,
      "comparisons",
      `${round}-${firstIsA ? "ab" : "ba"}`,
    );
    const sheet = join(sheetDir, file);
    const first = firstIsA ? ["A", a] : ["B", b];
    const second = firstIsA ? ["B", b] : ["A", a];
    lines.push(`- **${width}**`);
    if (existsSync(sheet)) {
      lines.push(
        `  - side by side (${firstIsA ? "A left, B right" : "B left, A right"}): \`${rel(sheet)}\``,
      );
    }
    for (const [label, path] of [first, second]) {
      if (!existsSync(path)) {
        lines.push(`  - ${label}: not captured at this width`);
        continue;
      }
      const full = path.replace(/\.png$/, "-full.png");
      lines.push(
        `  - ${label}: \`${rel(path)}\` (sha256 ${sha(path)})${existsSync(full) ? `; full page \`${rel(full)}\`` : ""}`,
      );
      const metrics = label === "A" ? metricsA : metricsB;
      lines.push(`    - measured: ${metricsSummary(metrics, state, width)}`);
    }
  }
  for (const viewport of WIDTHS) {
    const a = checkSummary(checksA, state, viewport);
    const b = checkSummary(checksB, state, viewport);
    if (a === "not run" && b === "not run") continue;
    const ordered = firstIsA ? [`A: ${a}`, `B: ${b}`] : [`B: ${b}`, `A: ${a}`];
    lines.push(`- checks @${viewport}: ${ordered.join(" | ")}`);
  }
  return lines;
}

function brief(areaKey, reviewer) {
  const area = PARTS[areaKey];
  const claudeFirstIsA = swap !== "swap";
  const firstIsA = reviewer === "claude" ? claudeFirstIsA : !claudeFirstIsA;
  const order = firstIsA ? "A, then B" : "B, then A";
  const out = [];
  out.push(`# ${area.title}: comparison ${round}`);
  out.push("");
  out.push(
    `You are an independent product-design and accessibility reviewer. Compare two versions of the Core Admin (Mission Control) **${area.title}** area and score each part of each version on its own merits. You review alone and read-only. Do not edit files, start or stop servers, run captures or spawn other agents. You may open the screenshots listed below (each is a PNG on disk), read the code at the paths given and run read-only commands such as \`git diff\`, \`git show\` and \`sha256sum\`.`,
  );
  out.push("");
  out.push(`- **A, ${labelA}:** \`${rel(dirA)}/\``);
  out.push(`- **B, ${labelB}:** \`${rel(dirB)}/\``);
  out.push(`- Evidence below lists ${order} for every state.`);
  out.push("");
  out.push("## What the area must do");
  out.push("");
  out.push(
    'Staff at a mission organisation use this area to do their daily work. Both versions must keep every existing feature, the required information, permissions and URL contracts. They must stay within Core\'s design system: shadcn `base-maia` on Base UI primitives, Zinc semantic tokens, shared components owned by `packages/ui`, and ReUI (vendored at `packages/ui/components/reui/`) for grids and tables. Money must be exact (amounts are stored in cents). A control that does nothing, or only says "coming soon", is a defect.',
  );
  out.push("");
  out.push("## Planned capture conditions and qualification limits");
  out.push("");
  out.push(
    "- Widths: 1440x1000 (desktop), 1024x900 (intermediate), 640x900 (small tablet) and 390x844 (mobile). DPR 1, forced light, reduced motion. Only the Next.js dev badge is hidden.",
  );
  out.push(
    `- Verify each invocation's separate product, harness/catalogue and fixture identities. Matching state names, files or count totals do not prove equivalent scripted steps or semantic qualification. ${
      process.env.BRIEF_SERVING ??
      "Serving/build/cache provenance is not established by this generator; consult the recorded invocation evidence."
    }`,
  );
  out.push(
    "- Planned browser data uses typed CRM/Contributions fixtures and module/studio fixtures. Require the invocation's actual fixture preflight, runtime and scratch-database provenance; do not infer loaded server data, equivalent data on A/B or tenant integration from this plan.",
  );
  out.push(
    "- Missing, hidden, disabled, rejected or ineffective triggers, readiness/settled timeouts and wrong panels leave the intended state UNQUALIFIED. An underlying page, generic heading or named PNG is not positive flyout evidence. Keep raw failed/interrupted artifacts and their exact termination/setup reasons separate; never infer exit 0 or completed checks.",
  );
  out.push(
    "- Staff search/no-results have no equivalent workflow in the old team dialogs. Staff directory, unconnected Mobilize/Events and linked Tasks follow-ups are changed-purpose base states, not feature-equivalent rekeys. Do not alias or rename old evidence, copy B into A, or promote baseline comparability.",
  );
  out.push(
    `- NOT_EXERCISED workflows: ${UNEXERCISED.map((entry) => `${entry.name}: ${entry.reason}`).join("; ")}`,
  );
  out.push(
    "- Optional crm-fund-correction is separately fixture-bound CRM form coverage, not the unavailable Hub entrypoint or default-catalogue replacement. Historical gift-menu/fund-correction failures remain failures; separately focused form successes cannot relabel them. Menu-open coverage never proves export or operation success.",
  );
  out.push(
    "- Preserve historical missing/provisional timeout partitions for CRM kanban, drawer, drawer properties and relationships-more, and the missing Email/PDF check rows. This generator neither closes those gaps nor assembles acceptance; source/unit guards are not runtime, visual or accessibility acceptance.",
  );
  out.push(
    "- Checks come from `check-workspaces.mjs`: axe WCAG 2A/AA/2.1AA, horizontal overflow, Tab reach and ArrowDown between rows, and dialog focus containment (12 Tabs, with Base UI focus guards counted as inside) plus Escape.",
  );
  out.push("");
  out.push("## Quality reference (fixed for every round)");
  out.push("");
  out.push(
    `- \`${rel(join(here, "references", "reui-c-data-grid-22-light.png"))}\`: the official preview of ReUI \`c-data-grid-22\` (CRUD admin data grid in a Card), the composition the grids are modelled on (https://reui.io/components/data-grid/c-data-grid-22). Use it to judge whether the grids reach a convincing level of polish, density and hierarchy, not only whether B improves on A. It shows presentation only: do not infer behaviour from it or treat its features as Core requirements.`,
  );
  out.push("");
  out.push("## Rubric");
  out.push("");
  out.push(
    "Score each part of each version from 0 to 10 in five categories: **task clarity**, **information hierarchy**, **readability**, **consistency and finish**, and **responsive usability**. Anchors: 6 = usable with friction; 8 = strong, with remaining weaknesses; 9 = polished, no substantive weakness found on inspection; 10 = exceptional. Use the whole scale honestly, and base every score on evidence you inspected. Hard requirements (features preserved, money correct, accessibility, the design system) outrank appearance.",
  );
  out.push("");
  out.push("## Required answer format");
  out.push("");
  out.push(
    "1. **Evidence inspected.** List the screenshot files you actually opened (open the images; do not infer their content from file names or this brief) and confirm the snapshot you reviewed (the B working tree at the frozen checkpoint named below). Missing essential evidence makes that part's assessment incomplete, not a pass.",
  );
  out.push(
    "2. **Per part.** For A and for B: the five category scores, each with a one-line reason, and their mean. Then which version better serves the stated tasks, or whether the difference is negligible, and why.",
  );
  out.push(
    "3. **Issues.** Substantive issues for each version, each with concrete evidence (a screenshot path and region, or `file:line`), marked blocking, important or polish. Call out regressions from A to B explicitly.",
  );
  out.push(
    "4. **Components.** Whether the adopted ReUI/shadcn components fit the task and are correctly integrated into Core (exact `base-maia`, Base UI `render` composition, semantic tokens, shared ownership in `packages/ui`, real data and behaviour rather than demo wiring).",
  );
  out.push(
    "5. **Tradeoffs and missing verification.** Cases where one version is better for one reason and worse for another, and anything you could not verify from the evidence.",
  );
  out.push(
    "6. **Verdict.** Overall preference, the highest-value remaining improvements for the better version (most valuable first), and whether any substantive in-scope issue remains (yes/no, with the issues). Do not average across parts or reviewers.",
  );
  out.push("");
  out.push("## Evidence by part");
  for (const part of area.parts) {
    out.push("");
    out.push(`### ${part.name}`);
    for (const state of part.states) {
      out.push("");
      out.push(`#### \`${state}\``);
      out.push(...evidenceForState(state, firstIsA));
    }
  }
  out.push("");
  out.push("## Code and verification");
  out.push("");
  out.push(verification.trim());
  out.push("");
  return out.join("\n");
}

// BRIEF_AREAS / BRIEF_REVIEWERS narrow a round (phase 2 runs one reviewer).
const AREAS = process.env.BRIEF_AREAS?.split(",") ?? Object.keys(PARTS);
const REVIEWERS = process.env.BRIEF_REVIEWERS?.split(",") ?? ["claude", "gpt"];
if (
  AREAS.some((area) => !Object.hasOwn(PARTS, area)) ||
  REVIEWERS.some((reviewer) => !["claude", "gpt"].includes(reviewer))
) {
  throw new Error("Unknown or empty brief area/reviewer selection");
}
const targets = AREAS.flatMap((areaKey) =>
  REVIEWERS.map((reviewer) => ({
    areaKey,
    reviewer,
    path: join(here, "snapshots", `${round}-${areaKey}-${reviewer}-brief.md`),
  })),
);
if (new Set(targets.map((target) => target.path)).size !== targets.length)
  throw new Error("Duplicate brief targets");
for (const target of targets) {
  if (existsSync(target.path))
    throw new Error(`Refusing to overwrite existing brief: ${target.path}`);
}
const written = [];
for (const { areaKey, reviewer, path } of targets) {
  writeFileSync(path, brief(areaKey, reviewer), { flag: "wx" });
  written.push(`${rel(path)} ${sha(path)}`);
}
console.log(written.join("\n"));

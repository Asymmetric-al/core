import { createHash } from "node:crypto";
import {
  constants,
  closeSync,
  fstatSync,
  lstatSync,
  openSync,
  readFileSync,
  readdirSync,
  realpathSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const base = "docs/prds/sitestacker-parity/";
const matrix = `${base}phase-24-multi-site-management-traceability.md`;
const prd = `${base}phase-24-multi-site-management.md`;
const log = `${base}phase-24-multi-site-management-decision-log.md`;
const catalogPath = `${base}phase-24-authority-contract.json`;
const change = "openspec/changes/add-multi-site-management/";
// Approved semantic catalog identity: intentional contract amendments update both files.
// Founder-approved authority members, preserved from the ratified decision matrix.
// Compatible predecessor clauses may supplement these members, never replace them.
const approvedDecisionAuthorities = {
  D1: ["decision log D1"],
  D2: ["decision log D2"],
  D3: ["decision log D3"],
  D4: ["decision log D4"],
  D5: ["decision log D5"],
  D6: ["decision log D6"],
  D7: ["phase-24-d7-site-serving-and-giving-admission-adversarial-review.md"],
  D8: ["phase-24-d8-site-retirement-adversarial-review.md"],
  D9: ["phase-24-d9-retired-address-disposition-adversarial-review.md"],
  D10: ["phase-24-d10-issued-giving-address-reservation-adversarial-review.md"],
  D11: ["phase-24-d11-human-readable-giving-slug-adversarial-review.md"],
  D12: ["phase-24-d12-direct-giving-address-continuity-adversarial-review.md"],
  D13: [
    "phase-24-d13-authorized-giving-placement-convergence-adversarial-review.md",
  ],
  D14: ["phase-24-d14-independent-locale-giving-address-adversarial-review.md"],
  D15: ["phase-24-d15-explicit-site-locale-public-base-adversarial-review.md"],
  D16: ["phase-24-d16-locale-neutral-site-root-adversarial-review.md"],
  D17: ["phase-24-d17-private-default-site-locale-plan-adversarial-review.md"],
  D18: ["phase-24-d18-undated-default-site-locale-plan-adversarial-review.md"],
  D57: ["ADR-0185", "decision log D57"],
  D58: ["ADR-0185", "decision log D58"],
  D59: ["ADR-0186", "decision log D59"],
  D60: ["ADR-0030", "decision log D60"],
  D61: ["ADR-0061", "decision log D61"],
  D62: ["ADR-0061", "decision log D62"],
  D63: ["ADR-0061", "decision log D63"],
  D64: ["ADR-0061", "decision log D64"],
  D65: ["ADR-0013", "ADR-0017", "decision log D65"],
  D66: ["ADR-0187", "decision log D66"],
  D67: [
    "ADR-0188",
    "phase-24-d67-two-lane-source-governed-disposition-adversarial-review.md",
  ],
  D68: [
    "ADR-0189",
    "phase-24-d68-suggested-translation-sources-adversarial-review.md",
  ],
  D69: ["ADR-0190", "phase-24-d69-two-head-copy-sources-adversarial-review.md"],
  D70: [
    "ADR-0191",
    "phase-24-d70-revision-bound-copy-qualification-adversarial-review.md",
  ],
  D71: [
    "ADR-0192",
    "phase-24-d71-qualified-choices-visible-unavailable-list-adversarial-review.md",
  ],
  D72: [
    "ADR-0193",
    "phase-24-d72-primary-and-redirect-site-domains-adversarial-review.md",
  ],
  D73: [
    "ADR-0194",
    "phase-24-d73-explicit-former-primary-disposition-adversarial-review.md",
  ],
  D74: [
    "ADR-0195",
    "phase-24-d74-owner-cleared-domain-disconnection-adversarial-review.md",
  ],
  D75: [
    "ADR-0196",
    "phase-24-d75-fresh-proof-clean-start-domain-claim-adversarial-review.md",
  ],
  D76: [
    "ADR-0197",
    "phase-24-d76-prepared-same-tenant-site-domain-cutover-adversarial-review.md",
  ],
  D77: [
    "ADR-0198",
    "phase-24-d77-critical-path-exception-led-domain-move-route-adversarial-review.md",
  ],
  D78: [
    "ADR-0199",
    "phase-24-d78-owner-qualified-ordinary-page-successor-adversarial-review.md",
  ],
  D79: [
    "ADR-0200",
    "phase-24-d79-stable-page-purpose-continuity-adversarial-review.md",
  ],
  D80: [
    "ADR-0201",
    "phase-24-d80-material-purpose-new-page-adversarial-review.md",
  ],
  D81: [
    "ADR-0202",
    "phase-24-d81-atomic-material-page-handoff-adversarial-review.md",
  ],
  D82: [
    "ADR-0203",
    "phase-24-d82-atomic-draft-path-adoption-adversarial-review.md",
  ],
  D83: [
    "ADR-0204",
    "phase-24-d83-source-tree-draft-path-rederivation-adversarial-review.md",
  ],
  D84: [
    "ADR-0205",
    "phase-24-d84-reviewed-sibling-placement-adversarial-review.md",
  ],
};
const approvedPredecessors = [
  {
    issue: 479,
    excludedClauses: [
      "host and locale arrays on public.sites",
      "cms.sites shared UUID authority",
      "default-site fallback and provisioning authority",
    ],
  },
  {
    issue: 480,
    allowedClauses: ["currency-aware integer minor-unit Money semantics"],
  },
  {
    issue: 482,
    excludedClauses: [
      "public.sites primary_domain and alias_domains resolver authority",
    ],
    allowedClauses: [
      "unknown production host fails closed",
      "no Payload import in Giving",
    ],
  },
  {
    issue: 485,
    excludedClauses: ["mutable CMS Site FK and per-site slug ownership"],
  },
  {
    issue: 486,
    excludedClauses: ["mutable CMS edit-to-live branding authority"],
  },
  {
    issue: 487,
    excludedClauses: [
      "read-only domain locale currency and gated Site management direction",
    ],
  },
];
const approvedCatalog =
  "78375d7457e63feb27de6ca057691cb5dda7848768e936faca0a2cc0b2b144bc";
const compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const digest = (value) => createHash("sha256").update(value).digest("hex");
const decisions = [
  ...Array.from({ length: 18 }, (_, i) => `D${i + 1}`),
  ...Array.from({ length: 28 }, (_, i) => `D${i + 57}`),
];
const stories = Array.from(
  { length: 120 },
  (_, i) => `US24-${String(i + 1).padStart(3, "0")}`,
);

export function validatePhase24(root) {
  const diagnostics = [];
  const inputs = new Map();
  const directories = new Map();
  const add = (file, line, owner, token, code, field = "contract") =>
    diagnostics.push({
      file,
      line,
      column: 1,
      owner,
      field,
      token,
      code,
      correction:
        "Restore the exact approved owner target or explicitly amend the versioned authority contract.",
    });
  function confined(relative) {
    if (
      path.isAbsolute(relative) ||
      relative.split("/").some((p) => p === ".." || p === "")
    )
      throw new Error("path");
    let current = root;
    for (const segment of relative.split("/")) {
      current = path.join(current, segment);
      if (lstatSync(current).isSymbolicLink()) throw new Error("symlink");
    }
    return current;
  }
  function bytes(relative) {
    const fd = openSync(
      confined(relative),
      constants.O_RDONLY | constants.O_NOFOLLOW,
    );
    try {
      const before = fstatSync(fd);
      const selected = lstatSync(confined(relative));
      if (selected.dev !== before.dev || selected.ino !== before.ino)
        throw new Error("changed");
      if (!before.isFile() || before.size > 4 * 1024 * 1024)
        throw new Error("type-or-size");
      const text = readFileSync(fd, "utf8");
      const after = fstatSync(fd);
      if (
        before.size !== after.size ||
        before.mtimeNs !== after.mtimeNs ||
        before.mtimeMs !== after.mtimeMs
      )
        throw new Error("changed");
      return text;
    } finally {
      closeSync(fd);
    }
  }
  function read(
    relative,
    owner = relative,
    token = relative,
    file = relative,
    line = 1,
  ) {
    if (inputs.has(relative)) return inputs.get(relative);
    try {
      const text = bytes(relative);
      inputs.set(relative, text);
      return text;
    } catch {
      add(file, line, owner, token, "input-unavailable");
      return "";
    }
  }
  function list(relative) {
    try {
      const names = readdirSync(confined(relative)).sort(compare);
      directories.set(relative, names);
      return names;
    } catch {
      add(relative, 1, relative, relative, "directory-unavailable");
      return [];
    }
  }
  const source = read(matrix),
    prdText = read(prd),
    logText = read(log),
    design = read(`${change}design.md`),
    tasksText = read(`${change}tasks.md`);
  read(`${change}proposal.md`);
  read("docs/ai/document-authority.md");
  let catalog;
  try {
    const catalogText = read(catalogPath);
    catalog = JSON.parse(catalogText);
    // Walk JSON syntax independently of JSON.parse, which silently overwrites duplicate keys.
    const tokens = [
      ...catalogText.matchAll(
        /"(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null|[{}\[\]:,]/g,
      ),
    ];
    let cursor = 0;
    function value() {
      const token = tokens[cursor++];
      if (token?.[0] === "{") {
        const keys = new Set();
        while (tokens[cursor]?.[0] !== "}") {
          const keyToken = tokens[cursor++],
            key = JSON.parse(keyToken[0]);
          if (keys.has(key))
            add(
              catalogPath,
              catalogText.slice(0, keyToken.index).split("\n").length,
              "phase24-authority-v1",
              key,
              "duplicate-json-key",
            );
          keys.add(key);
          cursor++;
          value();
          if (tokens[cursor]?.[0] !== ",") break;
          cursor++;
        }
        cursor++;
      } else if (token?.[0] === "[") {
        while (tokens[cursor]?.[0] !== "]") {
          value();
          if (tokens[cursor]?.[0] !== ",") break;
          cursor++;
        }
        cursor++;
      }
    }
    value();
    function fields(object, allowed, owner) {
      if (!object || typeof object !== "object" || Array.isArray(object))
        throw new Error("schema");
      for (const key of Object.keys(object))
        if (!allowed.includes(key))
          add(catalogPath, 1, owner, key, "catalog-unknown-field");
      for (const key of allowed)
        if (!(key in object))
          add(catalogPath, 1, owner, key, "catalog-missing-field");
    }
    fields(
      catalog,
      [
        "schemaVersion",
        "contract",
        "proofs",
        "releases",
        "authorities",
        "predecessors",
      ],
      "phase24-authority-v1",
    );
    if (catalog.schemaVersion !== 1)
      add(
        catalogPath,
        1,
        "phase24-authority-v1",
        String(catalog.schemaVersion),
        "catalog-version",
      );
    function catalogOwners(entries) {
      const ids = new Set();
      for (const entry of entries) {
        if (ids.has(entry.id))
          add(catalogPath, 1, entry.id, entry.id, "duplicate-catalog-id");
        ids.add(entry.id);
        if (!Array.isArray(entry.owners)) continue;
        const owners = new Set();
        for (const owner of entry.owners) {
          if (![...decisions, ...stories].includes(owner))
            add(
              catalogPath,
              1,
              entry.id,
              String(owner),
              "catalog-owner-unknown",
            );
          if (owners.has(owner))
            add(
              catalogPath,
              1,
              entry.id,
              String(owner),
              "catalog-owner-duplicate",
            );
          owners.add(owner);
        }
      }
    }
    catalogOwners(catalog.proofs);
    catalogOwners(catalog.releases);
    for (const proof of catalog.proofs) {
      fields(proof, ["id", "owners", "validationKinds"], proof.id);
      if (!Array.isArray(proof.owners) || !Array.isArray(proof.validationKinds))
        throw new Error("schema");
      for (const kind of proof.validationKinds)
        if (!["deterministic", "manual", "provider"].includes(kind))
          add(catalogPath, 1, proof.id, kind, "validation-kind");
    }
    for (const release of catalog.releases)
      fields(release, ["id", "owners"], release.id);
    for (const predecessor of catalog.predecessors) {
      for (const key of Object.keys(predecessor))
        if (!["issue", "excludedClauses", "allowedClauses"].includes(key))
          add(
            catalogPath,
            1,
            `#${predecessor.issue}`,
            key,
            "catalog-unknown-field",
          );
    }
    if (digest(JSON.stringify(catalog)) !== approvedCatalog)
      add(
        catalogPath,
        1,
        "phase24-authority-v1",
        catalogPath,
        "catalog-unapproved",
      );
  } catch {
    add(catalogPath, 1, "phase24-authority-v1", catalogPath, "catalog-invalid");
    catalog = { proofs: [], releases: [], authorities: {} };
  }
  for (const issue of [479, 480, 482, 485, 486, 487]) {
    const entries = (catalog.predecessors ?? []).filter(
      (p) => p.issue === issue,
    );
    if (
      entries.length !== 1 ||
      (issue !== 480 && !entries[0]?.excludedClauses?.length) ||
      ([480, 482].includes(issue) && !entries[0]?.allowedClauses?.length)
    )
      add(catalogPath, 1, `#${issue}`, `#${issue}`, "predecessor-declaration");
  }
  for (const approved of approvedPredecessors) {
    const declared = (catalog.predecessors ?? []).find(
      (p) => p.issue === approved.issue,
    );
    for (const field of ["excludedClauses", "allowedClauses"]) {
      for (const clause of approved[field] ?? [])
        if (!declared?.[field]?.includes(clause))
          add(
            catalogPath,
            1,
            `#${approved.issue}`,
            clause,
            "predecessor-clause-missing",
            field,
          );
    }
  }
  const logHeadings = [...logText.matchAll(/^## (D\d+) [—-]/gm)];
  const logIds = logHeadings.map((match) => match[1]);
  // The scope-reset checkpoint preserves one declaration per D19-D55 ID as
  // cross-phase research, not launch authority. Bound archive identity and
  // location without freezing the historical prose or interpreting its intent.
  const historicalIds = new Set(
    Array.from({ length: 37 }, (_, index) => `D${index + 19}`),
  );
  const historyStart =
    logHeadings.find((match) => match[1] === "D18")?.index ?? -1;
  const historyEnd =
    logHeadings.find((match) => match[1] === "D57")?.index ?? -1;
  const preservedHistory =
    logText.includes("D19–D38 remain preserved") &&
    logText.includes("D39–D55 remain preserved");
  for (const match of logHeadings) {
    const historical =
      preservedHistory &&
      historicalIds.has(match[1]) &&
      logIds.filter((id) => id === match[1]).length === 1 &&
      match.index > historyStart &&
      match.index < historyEnd;
    if (!decisions.includes(match[1]) && !historical)
      add(
        log,
        logText.slice(0, match.index).split("\n").length,
        match[1],
        match[1],
        "decision-log-out-of-scope",
      );
  }
  for (const id of decisions)
    if (logIds.filter((x) => x === id).length !== 1)
      add(log, 1, id, id, "decision-log-completeness");
  const proofs = new Map((catalog.proofs ?? []).map((p) => [p.id, p]));
  const releases = new Map((catalog.releases ?? []).map((p) => [p.id, p]));
  const tasks = new Set();
  tasksText.split("\n").forEach((l, i) => {
    const m = l.match(/^\s*- \[[ x]\] (\d+\.\d+)\b/);
    if (m) {
      if (tasks.has(m[1]))
        add(`${change}tasks.md`, i + 1, m[1], m[1], "duplicate-task");
      tasks.add(m[1]);
    }
  });
  const specs = new Map();
  for (const cap of list(`${change}specs`.replace(/\/$/, ""))) {
    const file = `${change}specs/${cap}/spec.md`,
      text = read(file),
      requirements = new Map();
    let requirement;
    text.split("\n").forEach((l, i) => {
      let m = l.match(/^### Requirement: (.+)$/);
      if (m) {
        requirement = m[1];
        if (requirements.has(requirement))
          add(file, i + 1, requirement, requirement, "duplicate-requirement");
        requirements.set(requirement, {
          file,
          line: i + 1,
          scenarios: new Map(),
        });
      }
      m = l.match(/^#### Scenario: (.+)$/);
      if (m) {
        const r = requirements.get(requirement);
        if (!r) {
          add(file, i + 1, m[1], m[1], "orphan-scenario");
          return;
        }
        if (r.scenarios.has(m[1]))
          add(file, i + 1, requirement, m[1], "duplicate-scenario");
        r.scenarios.set(m[1], i + 1);
      }
    });
    specs.set(cap, requirements);
  }
  const seen = new Set(),
    coveredReq = new Set(),
    coveredScenarios = new Set();
  function members(value, separator, file, line, owner, field) {
    const parts = value.split(separator).map((s) => s.trim());
    const seenTokens = new Set();
    for (const p of parts) {
      if (!p || seenTokens.has(p))
        add(file, line, owner, p || owner, "invalid-list", field);
      seenTokens.add(p);
    }
    return parts;
  }
  const designPaths = new Set();
  const headingStack = [];
  for (const match of design.matchAll(/^(#{1,6}) (.+)$/gm)) {
    while (headingStack.length && headingStack.at(-1).level >= match[1].length)
      headingStack.pop();
    headingStack.push({ level: match[1].length, name: match[2] });
    for (let n = 0; n < headingStack.length; n++)
      designPaths.add(
        headingStack
          .slice(n)
          .map((h) => h.name)
          .join(" / "),
      );
  }
  const prdStories = [...prdText.matchAll(/^(\d+)\. As /gm)].map((m) =>
    Number(m[1]),
  );
  for (let n = 1; n <= 120; n++)
    if (prdStories.filter((x) => x === n).length !== 1)
      add(prd, 1, String(n), String(n), "story-completeness");
  for (const n of prdStories)
    if (n < 1 || n > 120)
      add(prd, 1, String(n), String(n), "story-out-of-scope");
  let normativeTable = false;
  source.split("\n").forEach((line, index) => {
    if (/^## (Founder Decision Matrix|User Story Matrix)/.test(line))
      normativeTable = true;
    else if (/^## /.test(line)) normativeTable = false;
    if (!/^\|\s*(?:D\d|US24-)/.test(line)) {
      if (
        normativeTable &&
        /^\|/.test(line) &&
        !/^\|\s*(?:Decision ID|Story ID|[- ]+\|)/.test(line)
      )
        add(
          matrix,
          index + 1,
          line.split("|")[1].trim(),
          line.split("|")[1].trim(),
          "orphan-row",
        );
      return;
    }
    const cells = line
        .split("|")
        .slice(1, -1)
        .map((s) => s.trim()),
      owner = cells[0],
      loc = index + 1;
    const fail = (token, code, field) =>
      add(matrix, loc, owner, token, code, field);
    if (cells.length !== 10) {
      fail(owner, "row-shape");
      return;
    }
    if (![...decisions, ...stories].includes(owner))
      fail(owner, "owner-out-of-scope");
    if (seen.has(owner)) fail(owner, "duplicate-owner");
    seen.add(owner);
    cells.forEach((c, i) => {
      if (!c) fail(owner, "missing-cell", String(i));
    });
    if (owner.startsWith("US24-")) {
      const expandedMembers = new Set();
      if (cells[1] !== "cross-cutting") {
        for (const token of members(
          cells[1],
          /,\s*/,
          matrix,
          loc,
          owner,
          "decisions",
        )) {
          const range = token.match(/^(D[1-9]\d*)[–-](D?[1-9]\d*)$/);
          let expanded = [token];
          if (range) {
            const first = range[1],
              last = range[2].startsWith("D") ? range[2] : `D${range[2]}`;
            if (
              !decisions.includes(first) ||
              !decisions.includes(last) ||
              Number(last.slice(1)) < Number(first.slice(1))
            )
              expanded = [];
            else
              expanded = Array.from(
                { length: Number(last.slice(1)) - Number(first.slice(1)) + 1 },
                (_, i) => `D${Number(first.slice(1)) + i}`,
              );
          }
          if (
            !expanded.length ||
            expanded.some((id) => !decisions.includes(id))
          )
            fail(token, "decision-reference");
          for (const id of expanded) {
            if (expandedMembers.has(id))
              fail(token, "decision-member-duplicate", "decisions");
            expandedMembers.add(id);
          }
        }
      }
      if (cells[2] !== `User Stories #${Number(owner.slice(5))}`)
        fail(cells[2], "prd-locus");
    } else {
      if (
        cells[2] !==
          "Decision traceability and applicable implementation section" ||
        !/^### Decision traceability$/m.test(prdText) ||
        !/^## Implementation Decisions$/m.test(prdText)
      )
        fail(cells[2], "prd-locus");
      const expected = approvedDecisionAuthorities[owner] ?? [];
      const declared = new Set();
      let predecessor;
      for (const clause of members(
        cells[1],
        /;\s*|\s+and\s+/,
        matrix,
        loc,
        owner,
        "authorities",
      )) {
        const issue = clause.match(/^#(\d+)\s+(.+)$/);
        if (issue) {
          predecessor = Number(issue[1]);
          const allowed =
            approvedPredecessors.find((p) => p.issue === predecessor)
              ?.allowedClauses ?? [];
          if (!allowed.includes(issue[2]))
            fail(`#${issue[1]}`, "predecessor-excluded");
          continue;
        }
        if (
          predecessor &&
          approvedPredecessors
            .find((p) => p.issue === predecessor)
            ?.allowedClauses?.includes(clause)
        )
          continue;
        predecessor = undefined;
        const adr = clause.match(/^ADR-(\d{4})((?:\/\d{4})*)$/);
        const logRef = clause.match(/^decision log (D\d+)$/);
        if (adr) {
          for (const id of [adr[1], ...adr[2].split("/").filter(Boolean)]) {
            const key = `ADR-${id}`,
              target = catalog.authorities?.[key];
            if (declared.has(key)) fail(key, "authority-duplicate");
            declared.add(key);
            if (!expected.includes(key)) fail(key, "authority-owner");
            if (!target) fail(key, "authority-unknown");
            else {
              const authority = read(target, owner, key, matrix, loc);
              if (
                authority &&
                !(key === "ADR-0061"
                  ? authority.startsWith(
                      "# Local-currency-first, proof-gated multicurrency accounting",
                    )
                  : authority.startsWith(`# ${key}:`))
              )
                fail(key, "authority-content");
              if (
                key === "ADR-0030" &&
                authority &&
                !authority.startsWith(
                  "# ADR-0030: Canonical message document and immutable presentation dependencies",
                )
              )
                fail(key, "message-authority-content");
            }
          }
        } else if (logRef) {
          declared.add(clause);
          if (
            !expected.includes(clause) ||
            logRef[1] !== owner ||
            !decisions.includes(logRef[1]) ||
            !new RegExp(`^## ${logRef[1]} [—-]`, "m").test(logText)
          )
            fail(logRef[1], "decision-authority");
        } else if (/^[a-z0-9-]+\.md$/.test(clause)) {
          declared.add(clause);
          if (!expected.includes(clause)) fail(clause, "authority-owner");
          else read(base + clause, owner, clause, matrix, loc);
        } else fail(clause, "authority-unknown");
      }
      for (const required of expected)
        if (!declared.has(required)) fail(required, "authority-required");
    }
    const caps = members(cells[3], ";", matrix, loc, owner, "capabilities"),
      reqs = members(cells[4], ";", matrix, loc, owner, "requirements");
    for (const cap of caps)
      if (!specs.has(cap)) fail(cap, "capability-unknown");
    const resolved = [];
    for (const req of reqs) {
      const owners = caps.filter((cap) => specs.get(cap)?.has(req));
      if (owners.length !== 1) fail(req, "requirement-owner");
      else {
        const cap = owners[0];
        resolved.push([cap, req, specs.get(cap).get(req)]);
        coveredReq.add(`${cap}/${req}`);
      }
    }
    for (const scenario of members(
      cells[5],
      ";",
      matrix,
      loc,
      owner,
      "scenarios",
    )) {
      const matches = resolved.filter(([, , r]) => r.scenarios.has(scenario));
      if (matches.length !== 1) fail(scenario, "scenario-owner");
      else
        coveredScenarios.add(`${matches[0][0]}/${matches[0][1]}/${scenario}`);
    }
    for (const locus of members(cells[6], ";", matrix, loc, owner, "design"))
      if (!designPaths.has(locus)) fail(locus, "design-locus");
    for (const task of members(cells[7], /,\s*/, matrix, loc, owner, "tasks"))
      if (!tasks.has(task)) fail(task, "task-unknown");
    const ids = members(cells[8], ";", matrix, loc, owner, "proofs");
    for (const id of ids) {
      const proof = proofs.get(id);
      if (!proof || !proof.owners.includes(owner))
        fail(id, "proof-unknown-or-remapped");
    }
    if (
      owner.startsWith("US24-") &&
      !ids.some((id) =>
        proofs.get(id)?.validationKinds.includes("deterministic"),
      )
    )
      fail(cells[8] || owner, "deterministic-proof-required");
    for (const proof of proofs.values())
      if (proof.owners.includes(owner) && !ids.includes(proof.id))
        fail(proof.id, "proof-obligation-missing");
    const releaseIds = members(cells[9], ";", matrix, loc, owner, "releases");
    for (const id of releaseIds)
      if (!releases.get(id)?.owners.includes(owner))
        fail(id, "release-unknown-or-remapped");
    for (const release of releases.values())
      if (release.owners.includes(owner) && !releaseIds.includes(release.id))
        fail(release.id, "release-obligation-missing");
  });
  for (const owner of [...decisions, ...stories])
    if (!seen.has(owner)) add(matrix, 1, owner, owner, "missing-owner");
  for (const [cap, reqs] of specs)
    for (const [name, r] of reqs) {
      if (!coveredReq.has(`${cap}/${name}`))
        add(r.file, r.line, name, name, "requirement-uncovered");
      for (const [scenario, line] of r.scenarios)
        if (!coveredScenarios.has(`${cap}/${name}/${scenario}`))
          add(r.file, line, name, scenario, "scenario-uncovered");
    }
  // Published tickets have a distinct canonical namespace. Historical issue numbers are not tickets.
  for (const [file, text] of inputs)
    if (file !== catalogPath)
      text.split("\n").forEach((l, i) => {
        for (const token of l.matchAll(
          /\bP24-[A-Za-z0-9-]+(?:[–—](?:P24-)?[A-Za-z0-9-]+)?/g,
        )) {
          if (!/^P24-\d/.test(token[0])) continue;
          const match = token[0].match(/^P24-(\d+)(?:[–-](?:P24-)?(\d+))?$/);
          const canonical = (n) =>
            Number(n) >= 1 &&
            Number(n) <= 126 &&
            n === String(Number(n)).padStart(2, "0");
          if (
            !match ||
            !canonical(match[1]) ||
            (match[2] &&
              (!canonical(match[2]) || Number(match[2]) < Number(match[1])))
          )
            add(
              file,
              i + 1,
              "implementation tickets",
              token[0],
              "ticket-invalid",
            );
        }
      });
  for (const [file, text] of inputs)
    try {
      if (bytes(file) !== text) add(file, 1, file, file, "source-changed");
    } catch {
      add(file, 1, file, file, "source-changed");
    }
  for (const [dir, names] of directories)
    try {
      if (
        JSON.stringify(readdirSync(confined(dir)).sort(compare)) !==
        JSON.stringify(names)
      )
        add(dir, 1, dir, dir, "source-changed");
    } catch {
      add(dir, 1, dir, dir, "source-changed");
    }
  diagnostics.sort(
    (a, b) =>
      compare(a.file, b.file) ||
      a.line - b.line ||
      a.column - b.column ||
      compare(a.code, b.code) ||
      compare(a.token, b.token),
  );
  const inputIdentity = digest(
    JSON.stringify(
      [...inputs]
        .sort(([a], [b]) => compare(a, b))
        .map(([file, text]) => [file, digest(text)]),
    ),
  );
  return {
    schemaVersion: 1,
    contract: "phase24-authority-v1",
    inputIdentity,
    outcome: diagnostics.length ? "invalid" : "valid",
    diagnostics,
  };
}

function main() {
  const args = process.argv.slice(2);
  let root = fileURLToPath(new URL("../../", import.meta.url)),
    json = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--json") json = true;
    else if (args[i] === "--root" && args[i + 1]) root = args[++i];
    else {
      console.log(
        JSON.stringify({
          schemaVersion: 1,
          outcome: "invalid",
          diagnostics: [
            {
              owner: "CLI",
              token: args[i],
              code: "usage",
              correction: "Use --root <checkout> --json",
            },
          ],
        }),
      );
      return 1;
    }
  }
  let result;
  try {
    result = validatePhase24(realpathSync(root));
  } catch {
    result = {
      schemaVersion: 1,
      outcome: "invalid",
      diagnostics: [
        {
          file: ".",
          line: 1,
          column: 1,
          owner: "checkout",
          token: "checkout",
          code: "root-unavailable",
          correction: "Select a readable repository checkout.",
        },
      ],
    };
  }
  console.log(
    json
      ? JSON.stringify(result)
      : result.outcome === "valid"
        ? "Phase 24 authority contract valid (46 decisions, 120 stories, 73 proofs, 18 releases)."
        : result.diagnostics
            .map(
              (d) =>
                `${d.file}:${d.line}:${d.column} ${d.owner}: ${d.code}: ${d.token}. ${d.correction}`,
            )
            .join("\n"),
  );
  return result.outcome === "valid" ? 0 : 1;
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  process.exitCode = main();

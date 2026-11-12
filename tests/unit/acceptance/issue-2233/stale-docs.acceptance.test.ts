/**
 * Acceptance tests for #2233 (docs-only follow-up to #2155 / PR #2220).
 * Owned by Acceptance. https://github.com/Asymmetric-al/core/issues/2233
 *
 * Documentation-only change (AGENTS.md TDD rule): deterministic structural
 * checks that read the two documents and compare them with their sources of
 * truth (.github/workflows/ci-integration.yml and
 * scripts/verify/backup-restore-proof.mjs). Base: develop 61b38df4.
 *
 * Scope ("nothing else changes") is a property of the #2233 diff, not of
 * every later revision of these documents. Acceptance verifies it once, at
 * verdict time, with `git diff 61b38df4 <candidate>` on the two files. This
 * suite therefore pins no historical digest: later reviewed edits (for example
 * correcting the stale inventory `line` values) do not need to re-pin it, and
 * every assertion below names the bullet, item or field it checks.
 */
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import * as W from "../../helpers/workflow-yaml";

const CII = ".github/workflows/ci-integration.yml";
const GUIDE = "docs/guides/development/code-review-and-ownership.md";
const INVENTORY =
  "docs/maintenance/modernization/runtime-infrastructure-inventory.json";
const RESTORE_SCRIPT = "scripts/verify/backup-restore-proof.mjs";

const jobs = W.workflowJobs(
  W.parseWorkflowSource(readFileSync(CII, "utf8")),
  CII,
);
const guide = readFileSync(GUIDE, "utf8");
const inventoryRaw = readFileSync(INVENTORY, "utf8");

const DIGEST =
  "sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24";
const ECR_IMAGE = `public.ecr.aws/docker/library/postgres:17.11-alpine@${DIGEST}`;
const ECR_UPSTREAM = "https://gallery.ecr.aws/docker/library/postgres";
const HUB_IMAGE = `postgres:17.11-alpine@${DIGEST}`;
const HUB_UPSTREAM = "https://hub.docker.com/_/postgres";

/* ------------------------------------------------------------------------ */
/* Guide: "What Each Gate Covers"                                           */
/* ------------------------------------------------------------------------ */

const GATES_HEADING = "## What Each Gate Covers";
const gatesSection = (() => {
  const start = guide.indexOf(GATES_HEADING);
  if (start < 0) return "";
  const next = guide.indexOf("\n## ", start + GATES_HEADING.length);
  return guide.slice(start, next < 0 ? undefined : next);
})();

/** Sub-bullet lines (`  - ...`) under the top-level `- \`gate\` covers:` bullet. */
const subBullets = (gate: string): string[] => {
  const lines = gatesSection.split("\n");
  const at = lines.findIndex((l) => l.trim() === `- \`${gate}\` covers:`);
  if (at < 0) return [];
  const out: string[] = [];
  for (const line of lines.slice(at + 1)) {
    if (/^- /.test(line) || line.trim() === "") break;
    if (/^ {2}- /.test(line)) out.push(line);
  }
  return out;
};

/** The job id each sub-bullet names: its leading backticked token. */
const coveredJobs = (gate: string) =>
  subBullets(gate).map((l) => /^ {2}- `([^`]+)`/.exec(l)?.[1] ?? l.trim());

describe("#2233 C1: the e2e-smoke-gate bullet lists every need of the gate", () => {
  it("lists `migrate`, `smoke` and `test-e2e-smoke`, in that order", () => {
    expect(coveredJobs("e2e-smoke-gate")).toEqual([
      "migrate",
      "smoke",
      "test-e2e-smoke",
    ]);
  });
  it("matches the e2e-smoke-gate `needs` in ci-integration.yml", () => {
    expect(coveredJobs("e2e-smoke-gate")).toEqual(
      W.needsList(jobs["e2e-smoke-gate"]!),
    );
  });
  it("keeps the `bun run test:e2e:smoke` command on the test-e2e-smoke item", () => {
    const item = subBullets("e2e-smoke-gate").find((l) =>
      l.startsWith("  - `test-e2e-smoke`"),
    );
    expect(item).toContain("`bun run test:e2e:smoke`");
  });
});

describe("#2233 C2: the integration-gate bullet still matches the workflow", () => {
  it("lists `migrate`, `smoke`, `e2e-smoke-gate` = integration-gate `needs`", () => {
    expect(coveredJobs("integration-gate")).toEqual(
      W.needsList(jobs["integration-gate"]!),
    );
  });
});

describe("#2233 C3: the gate section keeps its four gate bullets", () => {
  /*
   * Byte-level scope of the guide edit (only the integration-gate and
   * e2e-smoke-gate bullets change) is checked at verdict time against base
   * 61b38df4 with git diff, not pinned here.
   */
  it("'What Each Gate Covers' lists ci-gate, integration-gate, e2e-smoke-gate, e2e-gate, in that order", () => {
    const gates = gatesSection
      .split("\n")
      .map((l) => /^- `([^`]+)` covers:$/.exec(l.trimEnd())?.[1])
      .filter((g): g is string => g !== undefined);
    expect(gates, `top-level gate bullets under "${GATES_HEADING}"`).toEqual([
      "ci-gate",
      "integration-gate",
      "e2e-smoke-gate",
      "e2e-gate",
    ]);
  });
});

/* ------------------------------------------------------------------------ */
/* Inventory                                                                */
/* ------------------------------------------------------------------------ */

type Item = Record<string, unknown>;
type Inventory = { items: Item[] } & Record<string, unknown>;

const parseInventory = (): Inventory => JSON.parse(inventoryRaw) as Inventory;
const isCiPostgres = (i: Item) =>
  i.kind === "container-image" && i.sourcePath === CII;

describe("#2233 C4: the inventory stays valid JSON with the same shape", () => {
  it("parses as JSON", () => {
    expect(() => parseInventory()).not.toThrow();
  });
  it("keeps the same top-level keys and 76 items", () => {
    const inv = parseInventory();
    expect([Object.keys(inv), inv.items.length]).toEqual([
      [
        "schemaVersion",
        "capturedAt",
        "sourceBase",
        "owner",
        "scope",
        "items",
        "remainingCoverage",
      ],
      76,
    ]);
  });
});

describe("#2233 C5: the four ci-integration.yml postgres items name ECR Public", () => {
  it("exactly four ci-integration.yml container-image items exist", () => {
    expect(parseInventory().items.filter(isCiPostgres)).toHaveLength(4);
  });
  it("each selector is the pinned ECR Public image", () => {
    const selectors = parseInventory()
      .items.filter(isCiPostgres)
      .map((i) => i.selector);
    expect(selectors).toEqual(Array(4).fill(ECR_IMAGE));
  });
  it("each upstream is the ECR Public gallery page", () => {
    const upstreams = parseInventory()
      .items.filter(isCiPostgres)
      .map((i) => i.upstream);
    expect(upstreams).toEqual(Array(4).fill(ECR_UPSTREAM));
  });
  it("the selector is byte-identical to every postgres image in ci-integration.yml", () => {
    const workflowImages = Object.values(jobs).flatMap((job) =>
      Object.values((job.services ?? {}) as Record<string, Item>).map(
        (s) => s.image,
      ),
    );
    const selectors = parseInventory()
      .items.filter(isCiPostgres)
      .map((i) => i.selector);
    expect(new Set([...selectors, ...workflowImages])).toEqual(
      new Set([ECR_IMAGE]),
    );
  });
  it("no ci-integration.yml item mentions Docker Hub", () => {
    const ci = parseInventory().items.filter((i) => i.sourcePath === CII);
    expect(JSON.stringify(ci)).not.toMatch(/hub\.docker\.com|docker\.io/);
  });
});

describe("#2233 C6: the restore transport smoke item keeps Docker Hub", () => {
  const RESTORE_ITEM = {
    kind: "container-image",
    name: "postgres restore transport smoke",
    version: "17.11",
    sourcePath: RESTORE_SCRIPT,
    selector: HUB_IMAGE,
    upstream: HUB_UPSTREAM,
    owner: "Core operations maintainers",
    state: "implemented-awaiting-infrastructure-checkpoint-qualification",
    disposition: "upgraded",
    verification:
      "Three-row transport smoke is explicitly separate from representative migration/restore qualification.",
  };
  it("is unchanged from base 61b38df4", () => {
    const item = parseInventory().items.find(
      (i) => i.name === "postgres restore transport smoke",
    );
    expect(item).toStrictEqual(RESTORE_ITEM);
  });
  it("its selector still matches the image backup-restore-proof.mjs pulls", () => {
    const script = readFileSync(RESTORE_SCRIPT, "utf8");
    const pulled = /"([^"\s]*postgres:[^"\s]+@sha256:[0-9a-f]{64})"/.exec(
      script,
    )?.[1];
    expect(pulled).toBe(HUB_IMAGE);
  });
  it("is the only Docker Hub postgres reference left in the inventory", () => {
    const hub = parseInventory()
      .items.filter((i) => JSON.stringify(i).includes("hub.docker.com"))
      .map((i) => i.name);
    expect(hub).toEqual(["postgres restore transport smoke"]);
  });
});

describe("#2233 C7: the four CI postgres items stay consistent with their selector", () => {
  /*
   * Byte-level scope of the inventory edit (only selector and upstream of the
   * four ci-integration.yml postgres items change) is checked at verdict time
   * against base 61b38df4 with git diff, not pinned here. `line` is not
   * pinned: correcting those pointers later is a legitimate reviewed edit.
   */
  const ciItems = () =>
    parseInventory()
      .items.filter(isCiPostgres)
      .map((i) => ({ at: `${CII} item at line ${String(i.line)}`, i }));

  it("each is still named `postgres`", () => {
    for (const { at, i } of ciItems()) {
      expect(i.name, `${at}: name`).toBe("postgres");
    }
  });
  it("each `version` equals the tag version in its selector (17.11)", () => {
    for (const { at, i } of ciItems()) {
      const tag = /:(\d+\.\d+)-alpine@/.exec(String(i.selector))?.[1];
      expect([i.version, tag], `${at}: [version, selector tag]`).toEqual([
        "17.11",
        "17.11",
      ]);
    }
  });
  it("each keeps a positive integer `line`", () => {
    for (const { at, i } of ciItems()) {
      expect(
        Number.isInteger(i.line) && (i.line as number) > 0,
        `${at}: line`,
      ).toBe(true);
    }
  });
});

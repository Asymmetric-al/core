import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import * as inventory from "./catalogue-inventory.mjs";
import { createModuleStates } from "./module-states.mjs";
import { createStates } from "./workspace-states.mjs";

const proposal = JSON.parse(
  readFileSync(
    new URL(
      "./review/round13/runtime/round13r2-catalogue-reconciliation/proposed-inventory.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const states = createModuleStates();

test("R08: unknown, retired, zero-state and mismatched selections cannot silently succeed", () => {
  for (const selector of [
    { names: ["admin-team-manage"] },
    { names: ["mobilize-candidate"] },
    { names: ["does-not-exist"] },
    { areas: ["missing"] },
    { names: [] },
    { areas: [] },
    { names: ["care"], areas: ["shell"] },
    { names: ["home", "home"] },
    { areas: ["people", "people"] },
  ])
    assert.throws(
      () => inventory.selectStates(states, selector),
      /unknown|empty|duplicate|outside/i,
      JSON.stringify(selector),
    );
  assert.deepEqual(
    inventory
      .selectStates(states, { areas: " shell, people ", names: "home,care" })
      .map((entry) => entry.name),
    ["home", "care"],
  );
  assert.throws(() => inventory.selectStates([], {}), /empty/i);
});

test("R08: exact expected sets and bounded plans derive only from the real catalogue", () => {
  assert.equal(typeof inventory.expectedInventory, "function");
  assert.equal(typeof inventory.boundedPlan, "function");
  const expected = inventory.expectedInventory(states);
  assert.deepEqual(expected.requiredPairKeys, proposal.requiredPairKeys);
  assert.deepEqual(expected.requiredPngNames, proposal.requiredPngNames);
  assert.deepEqual(expected.census.total, {
    states: 44,
    pairs: 80,
    fullPngs: 53,
    totalPngs: 133,
    byViewport: { desktop: 43, intermediate: 7, "small-tablet": 7, mobile: 23 },
  });
  const plan = inventory.boundedPlan(states);
  assert.deepEqual(plan.batches, proposal.batches);
  assert.equal(plan.invocations.length, 28);
  assert(!plan.batches.some((batch) => batch.tag === "people-06"));
  for (const phase of ["capture", "check"]) {
    const names = plan.invocations
      .filter((entry) => entry.phase === phase)
      .flatMap((entry) => entry.states);
    assert.equal(new Set(names).size, 44);
    assert.deepEqual(
      names.slice().sort(),
      states.map((entry) => entry.name).sort(),
    );
  }
  assert(
    plan.batches.every(
      (batch) => batch.states.length >= 1 && batch.states.length <= 4,
    ),
  );
  const malformed = [
    [],
    [states[0], states[0]],
    [{ ...states[0], widths: [] }],
    [{ ...states[0], widths: ["desktop", "desktop"] }],
    [{ ...states[0], widths: ["unknown"] }],
  ];
  for (const entries of malformed) {
    assert.throws(
      () => inventory.expectedInventory(entries),
      /empty|duplicate|viewport/i,
    );
    assert.throws(
      () => inventory.boundedPlan(entries),
      /empty|duplicate|viewport/i,
    );
  }
});

test("R08/R10: conditional whole catalogue, identities and optional coverage never become acceptance", () => {
  const all = [...createStates({}), ...states];
  const expected = inventory.expectedInventory(all, {
    product: "root-controlled-product",
    harness: "separate-harness",
    fixture: "separate-fixture",
  });
  assert.deepEqual(expected.census.total, {
    states: 124,
    pairs: 227,
    fullPngs: 85,
    totalPngs: 312,
    byViewport: {
      desktop: 118,
      intermediate: 16,
      "small-tablet": 15,
      mobile: 78,
    },
  });
  assert.deepEqual(expected.inputIdentities, {
    product: "root-controlled-product",
    harness: "separate-harness",
    fixture: "separate-fixture",
  });
  assert.equal(
    expected.qualification,
    "EXPECTED_ONLY_NOT_COLLECTED_NOT_ACCEPTANCE",
  );
  assert.equal(
    inventory.expectedInventory(states).inputIdentities.product,
    "NOT_PROVIDED",
  );
  assert.equal(inventory.boundedPlan(all).invocations.length, 70);
  assert(
    !expected.requiredPairKeys.some((key) =>
      key.startsWith("crm-fund-correction@"),
    ),
  );
  assert(
    expected.requiredPairKeys.includes("contribution-fund-correction@mobile"),
  );
});

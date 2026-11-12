import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import * as modules from "./module-states.mjs";
import { createStates, VIEWPORTS } from "./workspace-states.mjs";

const proposal = JSON.parse(
  readFileSync(
    new URL(
      "./review/round13/runtime/round13r2-catalogue-reconciliation/proposed-inventory.json",
      import.meta.url,
    ),
    "utf8",
  ),
);

const shape = (state) => ({
  name: state.name,
  area: state.area,
  route: state.route,
  widths: state.widths,
  full: Boolean(state.full),
  freshPerWidth: Boolean(state.freshPerWidth),
  keepScroll: Boolean(state.keepScroll),
});

test("R01: real module catalogue matches all proposed states, widths and metadata", () => {
  const states = modules.createModuleStates();
  assert.deepEqual(states.map(shape), proposal.states.map(shape));
  assert.deepEqual(VIEWPORTS, proposal.viewports);
  const pairs = states.flatMap((state) =>
    state.widths.map((width) => `${state.name}@${width}`),
  );
  const pngs = states.flatMap((state) =>
    state.widths.flatMap((width) => [
      `${state.name}--${width}.png`,
      ...(state.full ? [`${state.name}--${width}-full.png`] : []),
    ]),
  );
  assert.equal(new Set(pairs).size, 80);
  assert.equal(new Set(pngs).size, 133);
  assert.deepEqual(pairs, proposal.requiredPairKeys);
  assert.deepEqual(pngs, proposal.requiredPngNames);
  for (const [area, expected] of Object.entries({
    shell: [13, 19, 11],
    people: [14, 27, 21],
    support: [10, 16, 13],
    tools: [7, 18, 8],
  })) {
    const selected = states.filter((state) => state.area === area);
    assert.deepEqual(
      [
        selected.length,
        selected.reduce((total, state) => total + state.widths.length, 0),
        selected.reduce(
          (total, state) => total + (state.full ? state.widths.length : 0),
          0,
        ),
      ],
      expected,
    );
  }
});

test("R01/R08: unavailable workflows stay explicit, not executable aliases", () => {
  assert.equal(modules.UNAVAILABLE_MODULE_WORKFLOWS?.length, 9);
  const states = modules.createModuleStates();
  for (const entry of modules.UNAVAILABLE_MODULE_WORKFLOWS) {
    assert.equal(entry.status, "NOT_EXERCISED");
    assert.equal(entry.equivalentWorkflow, false);
    assert(entry.reason);
    assert(!states.some((state) => state.name === entry.name));
  }
  assert.deepEqual(
    modules.UNAVAILABLE_MODULE_WORKFLOWS.map((entry) => entry.name).sort(),
    [
      "admin-team-manage",
      "admin-team-create",
      "mobilize-candidate",
      "mobilize-add",
      "events-venues",
      "events-speakers",
      "events-attendees",
      "tasks-drawer",
      "tasks-new",
    ].sort(),
  );
});

test("R01/R10: timeout and Hub entrypoint keys retain their original breadth", () => {
  const states = createStates({});
  for (const name of [
    "crm-kanban",
    "crm-drawer",
    "crm-drawer-properties",
    "crm-relationships-more",
    "contribution-fund-correction",
  ]) {
    assert.deepEqual(
      states.find((state) => state.name === name).widths,
      name === "crm-drawer-properties" ? ["desktop"] : ["desktop", "mobile"],
    );
  }
  assert(!states.some((state) => state.name === "crm-fund-correction"));
});

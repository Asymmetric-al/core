import { VIEWPORTS } from "./workspace-states.mjs";

const PEOPLE_BATCHES = [
  ["care", "care-directory", "care-profile", "care-profile-thread"],
  ["care-profile-plan", "care-settings", "mobilize-unconnected"],
  ["locations", "locations-list", "locations-add"],
  ["events-unconnected"],
  ["feed", "org-updates", "tasks-follow-ups"],
];

function validateStates(states) {
  if (!Array.isArray(states) || states.length === 0)
    throw new Error("Empty catalogue");
  const names = new Set();
  const widths = new Set(VIEWPORTS.map((viewport) => viewport.name));
  for (const state of states) {
    if (!state.name || !state.area) throw new Error("Empty state name or area");
    if (names.has(state.name))
      throw new Error(`Duplicate state: ${state.name}`);
    names.add(state.name);
    if (!Array.isArray(state.widths) || state.widths.length === 0)
      throw new Error(`Empty viewports: ${state.name}`);
    if (new Set(state.widths).size !== state.widths.length)
      throw new Error(`Duplicate viewport: ${state.name}`);
    for (const width of state.widths)
      if (!widths.has(width)) throw new Error(`Unknown viewport: ${width}`);
  }
}

function selection(value, available, label) {
  if (value === undefined) return null;
  const entries =
    typeof value === "string"
      ? value.split(",").map((entry) => entry.trim())
      : value;
  if (
    !Array.isArray(entries) ||
    entries.length === 0 ||
    entries.some((entry) => !entry)
  )
    throw new Error(`Empty ${label} selection`);
  if (new Set(entries).size !== entries.length)
    throw new Error(`Duplicate ${label} selection`);
  for (const entry of entries)
    if (!available.has(entry))
      throw new Error(`Unknown or retired ${label}: ${entry}`);
  return entries;
}

export function selectStates(states, { areas, names } = {}) {
  validateStates(states);
  const chosenAreas = selection(
    areas,
    new Set(states.map((state) => state.area)),
    "area",
  );
  const chosenNames = selection(
    names,
    new Set(states.map((state) => state.name)),
    "state",
  );
  if (
    chosenNames &&
    chosenAreas &&
    states.some(
      (state) =>
        chosenNames.includes(state.name) && !chosenAreas.includes(state.area),
    )
  ) {
    throw new Error("Named state is outside selected areas");
  }
  const chosen = states.filter(
    (state) =>
      (!chosenAreas || chosenAreas.includes(state.area)) &&
      (!chosenNames || chosenNames.includes(state.name)),
  );
  if (chosen.length === 0) throw new Error("Empty state selection");
  return chosen;
}

function census(states) {
  const byViewport = Object.fromEntries(
    VIEWPORTS.map((viewport) => [viewport.name, 0]),
  );
  let fullPngs = 0;
  for (const state of states) {
    for (const width of state.widths) byViewport[width] += 1;
    if (state.full) fullPngs += state.widths.length;
  }
  const pairs = Object.values(byViewport).reduce(
    (total, count) => total + count,
    0,
  );
  return {
    states: states.length,
    pairs,
    fullPngs,
    totalPngs: pairs + fullPngs,
    byViewport,
  };
}

export function expectedInventory(states, inputIdentities = {}) {
  validateStates(states);
  const areas = [...new Set(states.map((state) => state.area))];
  return {
    qualification: "EXPECTED_ONLY_NOT_COLLECTED_NOT_ACCEPTANCE",
    inputIdentities: Object.fromEntries(
      ["product", "harness", "fixture"].map((key) => [
        key,
        inputIdentities[key] ?? "NOT_PROVIDED",
      ]),
    ),
    viewports: VIEWPORTS.map((viewport) => ({ ...viewport })),
    requiredPairKeys: states.flatMap((state) =>
      state.widths.map((width) => `${state.name}@${width}`),
    ),
    requiredPngNames: states.flatMap((state) =>
      state.widths.flatMap((width) => [
        `${state.name}--${width}.png`,
        ...(state.full ? [`${state.name}--${width}-full.png`] : []),
      ]),
    ),
    unavailablePairKeys: states
      .filter((state) => state.qualification?.startsWith("NOT_EXERCISED"))
      .flatMap((state) =>
        state.widths.map((width) => `${state.name}@${width}`),
      ),
    census: {
      total: census(states),
      areas: Object.fromEntries(
        areas.map((area) => [
          area,
          census(states.filter((state) => state.area === area)),
        ]),
      ),
    },
  };
}

export function boundedPlan(states) {
  validateStates(states);
  const batches = [];
  for (const area of new Set(states.map((state) => state.area))) {
    const names = states
      .filter((state) => state.area === area)
      .map((state) => state.name);
    const groups =
      area === "people"
        ? PEOPLE_BATCHES.map((group) =>
            group.filter((name) => names.includes(name)),
          )
        : Array.from({ length: Math.ceil(names.length / 4) }, (_, index) =>
            names.slice(index * 4, index * 4 + 4),
          );
    if (groups.flat().length !== names.length)
      throw new Error(`Unknown state outside approved ${area} batches`);
    groups.forEach((group, index) => {
      if (group.length > 0)
        batches.push({
          tag: `${area}-${String(index + 1).padStart(2, "0")}`,
          area,
          states: group,
        });
    });
  }
  return {
    qualification: "PLAN_ONLY_NOT_EXECUTED",
    batches,
    invocations: batches.flatMap((batch) =>
      ["capture", "check"].map((phase) => ({ ...batch, phase })),
    ),
  };
}

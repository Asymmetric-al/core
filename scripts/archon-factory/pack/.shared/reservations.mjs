import { StateConflict } from "./archon.mjs";
import { hasUnconfirmedCleanup } from "./cleanup-state.mjs";
import {
  RESERVATIONS,
  TERMINAL,
  hasNativeFaultHold,
  issueDocument,
  validWorkItem,
} from "./workitem.mjs";

export async function releaseInactiveReservations(
  archon,
  { issues, attempts = 4 } = {},
) {
  const selected = issues === undefined ? null : new Set(issues.map(Number));
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const document = await archon.get(RESERVATIONS);
    const areas = document.value?.areas;
    if (!areas || typeof areas !== "object" || Array.isArray(areas))
      return { noop: true, released: [] };
    const holders = [...new Set(Object.values(areas).map(Number))].filter(
      (issue) =>
        Number.isSafeInteger(issue) &&
        issue > 0 &&
        (!selected || selected.has(issue)),
    );
    const inactive = new Set();
    for (const issue of holders) {
      const holder = await archon.get(issueDocument(issue));
      if (
        holder.lease?.live ||
        hasUnconfirmedCleanup(holder.value) ||
        hasNativeFaultHold(holder.value)
      )
        continue;
      if (
        holder.value === null ||
        (validWorkItem(holder.value) &&
          holder.value.issue === issue &&
          TERMINAL.has(holder.value.status))
      )
        inactive.add(issue);
    }
    const released = Object.keys(areas)
      .filter((area) => inactive.has(Number(areas[area])))
      .sort();
    if (!released.length) return { noop: true, released: [] };
    const next = { ...areas };
    for (const area of released) delete next[area];
    try {
      const receipt = await archon.put(
        RESERVATIONS,
        { ...document.value, v: 1, areas: next },
        { ifRevision: document.revision },
      );
      return { written: true, released, receipt };
    } catch (error) {
      if (!(error instanceof StateConflict)) throw error;
    }
  }
  return { conflict: true, released: [] };
}

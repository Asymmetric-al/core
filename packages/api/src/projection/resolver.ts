import { admits, reservedReceipts } from "./policy";
import { scopeSnapshot, subtract } from "./subtraction";
import { dataObject, qualified, snapshot } from "./validation";

import type { ProjectionInput, ProjectionResult } from "./types";

/** Pure synchronous policy intersection. Acquires no authority and performs no I/O. */
export function resolveProjection<
  Row extends Readonly<Record<string, unknown>>,
>(input: ProjectionInput<Row>): ProjectionResult<Row> {
  try {
    input = {
      ...input,
      row: snapshot(input.row, new Set(), true) as Row,
      auth: snapshot(input.auth) as ProjectionInput["auth"],
      scope: scopeSnapshot(input.scope),
    };
    if (
      !qualified(input) ||
      input.auth.kind !== "human" ||
      reservedReceipts.has(input.recordType)
    )
      return { kind: "refused" };
    const { policies } = input;
    if (
      !dataObject(policies) ||
      !["surface", "recordType", "get"].every((key) => {
        const descriptor = Object.getOwnPropertyDescriptor(policies, key);
        return descriptor && "value" in descriptor;
      }) ||
      policies.surface !== input.surface ||
      policies.recordType !== input.recordType ||
      !Object.hasOwn(policies, "get") ||
      typeof policies.get !== "function"
    )
      return { kind: "refused" };
    const removed = new Set<string>();
    if (!subtract(input, removed)) return { kind: "refused" };
    const projection: Record<string, unknown> = {};
    for (const key of Object.keys(input.row)) {
      if (!removed.has(key) && admits(policies, key, input.auth))
        projection[key] = input.row[key];
    }
    return { kind: "allowed", projection: projection as Partial<Row> };
  } catch {
    return { kind: "refused" };
  }
}

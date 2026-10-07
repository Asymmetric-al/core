import {
  dataObject,
  fieldKey,
  fields,
  reference,
  snapshot,
} from "./validation";

import type { ProjectionInput, RowScope } from "./types";

export function subtract(
  input: ProjectionInput,
  removed: Set<string>,
): boolean {
  const { scope, auth, row } = input;
  if (!scope) return false;
  const anonymity = scope.anonymity;
  if (anonymity.kind === "applicable") {
    if (
      !["named", "anonymous", "unknown_offline"].includes(anonymity.intent) ||
      !["identity_restricted", "finance"].includes(anonymity.audience) ||
      !fields(anonymity.identityFields) ||
      !fieldKey(anonymity.identityField) ||
      typeof anonymity.identityRequired !== "boolean"
    )
      return false;
    if (anonymity.identityRequired && !reference(row[anonymity.identityField]))
      return false;
    // A source cannot disguise a narrow purpose as finance handling.
    if (anonymity.audience === "finance" && input.surface !== "mission_control")
      return false;
    if (
      anonymity.intent !== "named" &&
      anonymity.audience === "identity_restricted"
    )
      for (const key of anonymity.identityFields) removed.add(key);
  }
  for (const restriction of [scope.flags, scope.state]) {
    if (restriction.kind === "not_applicable") continue;
    if (
      typeof restriction.refuse !== "boolean" ||
      !fields(restriction.removeFields) ||
      restriction.refuse
    )
      return false;
    for (const key of restriction.removeFields) removed.add(key);
  }
  if (
    scope.state.kind === "applicable" &&
    !["open", "settled", "locked"].includes(scope.state.value)
  )
    return false;
  const facts = Object.freeze({ row, binding: auth.binding });
  for (const predicate of scope.predicates) {
    const result = snapshot(predicate(facts));
    if (!dataObject(result)) return false;
    const keys = Object.keys(result);
    if (result.kind === "refuse") return false;
    if (result.kind === "retain" && keys.length === 1) continue;
    if (result.kind !== "remove" || keys.length !== 2 || !fields(result.fields))
      return false;
    for (const key of result.fields) removed.add(key);
  }
  return true;
}

/** All callback-visible data is copied/frozen. Functions remain subtractive trusted code. */
export function scopeSnapshot(
  scope: RowScope | undefined,
): RowScope | undefined {
  if (!scope) return undefined;
  const copy: Record<string, unknown> = Object.create(null) as Record<
    string,
    unknown
  >;
  for (const key of [
    "binding",
    "legalEntity",
    "ownership",
    "relationship",
    "anonymity",
    "flags",
    "state",
    "predicates",
  ] as const) {
    const descriptor = Object.getOwnPropertyDescriptor(scope, key);
    if (!descriptor || !("value" in descriptor))
      throw new Error("Missing scope fact");
    copy[key] =
      key === "predicates" && Array.isArray(descriptor.value)
        ? Object.freeze([...descriptor.value])
        : snapshot(descriptor.value);
  }
  return Object.freeze(copy) as RowScope;
}

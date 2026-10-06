import type { ProjectionBinding, ProjectionInput } from "./types";

const wholeKey = /^[a-z_][a-z0-9_]*$/;
const unsafeKeys = new Set(["__proto__", "constructor", "prototype"]);
export function fieldKey(value: unknown): value is string {
  return (
    typeof value === "string" && wholeKey.test(value) && !unsafeKeys.has(value)
  );
}
export function reference(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
export function fields(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every(fieldKey);
}
export function dataObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
const bindingKeys = [
  "contextRef",
  "contextRevision",
  "principalId",
  "tenantId",
  "purpose",
  "surface",
  "recordType",
  "recordId",
  "sourceRef",
  "sourceRevision",
] as const;
function validBinding(binding: ProjectionBinding): boolean {
  return (
    dataObject(binding) &&
    bindingKeys.every(
      (key) => Object.hasOwn(binding, key) && reference(binding[key]),
    ) &&
    (binding.operation === "read" || binding.operation === "bulk_export")
  );
}
export function sameBinding(
  left: ProjectionBinding,
  right: ProjectionBinding,
): boolean {
  return (
    validBinding(left) &&
    validBinding(right) &&
    bindingKeys.every((key) => left[key] === right[key]) &&
    left.operation === right.operation
  );
}

/** Required facts are checked before any policy field can be emitted. */
export function qualified(input: ProjectionInput): boolean {
  const { auth, scope, row } = input;
  if (
    !fieldKey(input.surface) ||
    !fieldKey(input.recordType) ||
    !dataObject(row) ||
    !dataObject(auth) ||
    auth.kind !== "human" ||
    !scope ||
    !sameBinding(auth.binding, scope.binding)
  )
    return false;
  const { binding, current, assignment, ceiling, legalEntities } = auth;
  if (
    binding.surface !== input.surface ||
    binding.recordType !== input.recordType ||
    row.id !== binding.recordId ||
    row.tenant_id !== binding.tenantId ||
    !current ||
    current.contextRevision !== binding.contextRevision ||
    current.sourceRevision !== binding.sourceRevision
  )
    return false;
  if (
    !assignment ||
    !reference(assignment.id) ||
    !reference(assignment.revision) ||
    assignment.revision !== assignment.currentRevision ||
    assignment.principalId !== binding.principalId ||
    assignment.tenantId !== binding.tenantId
  )
    return false;
  if (
    !ceiling ||
    ceiling.contextRef !== binding.contextRef ||
    ceiling.contextRevision !== binding.contextRevision ||
    !fields(ceiling.readableFields) ||
    !fields(ceiling.exportableFields)
  )
    return false;
  if (
    !legalEntities ||
    !reference(legalEntities.revision) ||
    legalEntities.revision !== legalEntities.currentRevision ||
    !Array.isArray(legalEntities.ids) ||
    !legalEntities.ids.every(reference)
  )
    return false;
  if (
    !Array.isArray(scope.predicates) ||
    !scope.predicates.every((predicate) => typeof predicate === "function")
  )
    return false;
  for (const restriction of [
    scope.legalEntity,
    scope.ownership,
    scope.relationship,
    scope.anonymity,
    scope.flags,
    scope.state,
  ]) {
    if (
      !dataObject(restriction) ||
      (restriction.kind !== "applicable" &&
        restriction.kind !== "not_applicable")
    )
      return false;
  }
  if (scope.legalEntity.kind === "applicable") {
    const entity = scope.legalEntity;
    if (
      !reference(entity.entityId) ||
      row.legal_entity_id !== entity.entityId ||
      entity.scopeRevision !== legalEntities.revision ||
      !legalEntities.ids.includes(entity.entityId)
    )
      return false;
  } else if (row.legal_entity_id !== undefined && row.legal_entity_id !== null)
    return false;
  if (
    scope.ownership.kind === "applicable" &&
    (!fieldKey(scope.ownership.ownerField) ||
      row[scope.ownership.ownerField] !== binding.principalId)
  )
    return false;
  if (
    scope.relationship.kind === "applicable" &&
    (scope.relationship.viewerId !== binding.principalId ||
      scope.relationship.recordId !== binding.recordId ||
      scope.relationship.related !== true)
  )
    return false;
  // Other dispositions are validated by the subtractive enforcement stage.
  return true;
}

/** Isolated frozen data for predicates: callbacks cannot mutate original private facts. */
export function snapshot(
  value: unknown,
  ancestors = new Set<object>(),
  allowRootPrototype = false,
): unknown {
  if (
    value === null ||
    ["string", "boolean", "undefined"].includes(typeof value)
  )
    return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (!dataObject(value) && !Array.isArray(value))
    throw new Error("Non-data fact");
  const object = value as object;
  const prototype = Object.getPrototypeOf(object);
  if (
    !allowRootPrototype &&
    prototype !== null &&
    prototype !== (Array.isArray(value) ? Array.prototype : Object.prototype)
  )
    throw new Error("Non-data prototype");
  if (ancestors.has(object)) throw new Error("Cyclic fact");
  ancestors.add(object);
  const copy: Record<string, unknown> | unknown[] = Array.isArray(value)
    ? []
    : (Object.create(null) as Record<string, unknown>);
  for (const key of Object.keys(object)) {
    const descriptor = Object.getOwnPropertyDescriptor(object, key);
    if (!descriptor || !("value" in descriptor))
      throw new Error("Accessor fact");
    Object.defineProperty(copy, key, {
      value: snapshot(descriptor.value, ancestors),
      enumerable: true,
      configurable: false,
      writable: false,
    });
  }
  ancestors.delete(object);
  return Object.freeze(copy);
}

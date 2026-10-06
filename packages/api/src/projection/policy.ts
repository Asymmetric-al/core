import { dataObject, fieldKey } from "./validation";
import { isSensitivityCategory } from "../field-policies/taxonomy";

import type { HumanProjectionContext } from "./types";
import type { FieldPolicyRow, FieldPolicySet } from "../field-policies/reader";

const processors = new Set([
  "stripe_charge_id",
  "stripe_customer_id",
  "stripe_subscription_id",
  "stripe_payment_intent_id",
  "stripe_payment_method_id",
  "stripe_refund_ids",
]);
const restricted = new Set(["internal", "care", "security"]);
export const reservedReceipts = new Set([
  "receipts",
  "gift_receipt_records",
  "contribution_receipt_snapshots",
]);
const policyKeys = [
  "recordType",
  "fieldKey",
  "surface",
  "tenantId",
  "visible",
  "editable",
  "exportable",
  "sensitivityCategory",
] as const;

function policySnapshot(value: unknown): FieldPolicyRow | undefined {
  if (!dataObject(value)) return undefined;
  const copy: Record<string, unknown> = {};
  for (const key of policyKeys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !("value" in descriptor)) return undefined;
    copy[key] = descriptor.value;
  }
  if (
    !isSensitivityCategory(copy.sensitivityCategory) ||
    [copy.visible, copy.editable, copy.exportable].some(
      (flag) => typeof flag !== "boolean",
    )
  )
    return undefined;
  return copy as FieldPolicyRow;
}

/** Loaded static ceiling must be stable. A changing lookup cannot produce admission. */
export function admits(
  policies: FieldPolicySet,
  key: string,
  auth: HumanProjectionContext,
): boolean {
  if (!fieldKey(key)) return false;
  const first = policySnapshot(policies.get(key));
  const second = policySnapshot(policies.get(key));
  if (
    !first ||
    !second ||
    policyKeys.some((part) => first[part] !== second[part])
  )
    return false;
  const { binding, ceiling } = auth;
  if (
    first.recordType !== binding.recordType ||
    first.surface !== binding.surface ||
    first.fieldKey !== key ||
    first.tenantId !== null
  )
    return false;
  const exporting =
    binding.operation === "bulk_export" || binding.surface === "export";
  if (
    (exporting || binding.surface !== "mission_control") &&
    restricted.has(first.sensitivityCategory)
  )
    return false;
  if (processors.has(key)) {
    const finance = ceiling.finance;
    if (
      exporting ||
      binding.surface !== "mission_control" ||
      !finance ||
      finance.kind !== "processor_identifier_read" ||
      finance.contextRef !== binding.contextRef ||
      finance.contextRevision !== binding.contextRevision ||
      finance.purpose !== binding.purpose
    )
      return false;
  }
  return exporting
    ? first.exportable && ceiling.exportableFields.includes(key)
    : first.visible && ceiling.readableFields.includes(key);
}

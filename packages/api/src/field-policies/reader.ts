import { createClient } from "@asym/database/supabase/server";

import {
  isSensitivityCategory,
  type SensitivityCategory,
  type Surface,
} from "./taxonomy";

export type FieldPolicyRow = Readonly<{
  recordType: string;
  fieldKey: string;
  surface: Surface;
  tenantId: string | null;
  visible: boolean;
  editable: boolean;
  exportable: boolean;
  sensitivityCategory: SensitivityCategory;
}>;
export type FieldPolicySet = Readonly<{
  surface: Surface;
  recordType: string;
  /** Missing, unclassified and dotted keys are denied, without a positive fallback. */
  get(fieldKey: string): FieldPolicyRow | undefined;
}>;
export type LoadFieldPoliciesInput = Readonly<{
  surface: Surface;
  recordType: string;
  /** Reserved; deliberately ignored until tenant override qualification. */
  tenantId?: string | null;
}>;

const reservedReceipts = new Set([
  "receipts",
  "gift_receipt_records",
  "contribution_receipt_snapshots",
]);
const processorIdentifiers = new Set([
  "stripe_charge_id",
  "stripe_customer_id",
  "stripe_subscription_id",
  "stripe_payment_intent_id",
  "stripe_payment_method_id",
  "stripe_refund_ids",
]);
const restrictedCategories = new Set<SensitivityCategory>([
  "internal",
  "care",
  "security",
]);
const wholeKey = /^[a-z_][a-z0-9_]*$/;

/** Returns a static ceiling, never actor authority. RLS remains a separate backup. */
export async function loadFieldPolicies({
  surface,
  recordType,
}: LoadFieldPoliciesInput): Promise<FieldPolicySet> {
  const rows = new Map<string, FieldPolicyRow>();
  const result: FieldPolicySet = Object.freeze({
    surface,
    recordType,
    get(fieldKey: string) {
      return wholeKey.test(fieldKey) ? rows.get(fieldKey) : undefined;
    },
  });
  if (!wholeKey.test(surface) || reservedReceipts.has(recordType))
    return result;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("field_policies")
    .select(
      "record_type,field_key,surface,tenant_id,visible,editable,exportable,sensitivity_category",
    )
    .eq("record_type", recordType)
    .eq("surface", surface)
    .is("tenant_id", null);
  if (error) throw new Error("Unable to load field policies");

  const duplicates = new Set<string>();
  for (const raw of data ?? []) {
    // Validate the boundary even if a privileged writer or malformed adapter supplied it.
    if (
      raw.record_type !== recordType ||
      raw.surface !== surface ||
      raw.tenant_id !== null ||
      typeof raw.field_key !== "string" ||
      !wholeKey.test(raw.field_key) ||
      !isSensitivityCategory(raw.sensitivity_category) ||
      typeof raw.visible !== "boolean" ||
      typeof raw.editable !== "boolean" ||
      typeof raw.exportable !== "boolean"
    )
      continue;
    const fieldKey: string = raw.field_key;
    if (rows.has(fieldKey) || duplicates.has(fieldKey)) {
      rows.delete(fieldKey);
      duplicates.add(fieldKey);
      continue;
    }
    const processor = processorIdentifiers.has(fieldKey);
    const deny =
      surface !== "mission_control" &&
      (processor || restrictedCategories.has(raw.sensitivity_category));
    rows.set(
      fieldKey,
      Object.freeze({
        recordType,
        fieldKey,
        surface,
        tenantId: null,
        visible: !deny && raw.visible,
        editable: !deny && fieldKey !== "stripe_refund_ids" && raw.editable,
        exportable: !deny && !processor && raw.exportable,
        sensitivityCategory: raw.sensitivity_category,
      }),
    );
  }
  return result;
}

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";
import type Stripe from "stripe";

/** One saved payment method, in the words the wallet shows. */
export interface WalletPaymentMethod {
  id: string;
  kind: "card" | "bank";
  /** Card brand ("Visa") or bank name. */
  brand: string;
  last4: string;
  expMonth: number | null;
  expYear: number | null;
  isDefault: boolean;
  /** Active or paused gifts linked to this method in local records. */
  recurringGiftIds: string[];
}

export type DonorWallet =
  | { status: "linked"; methods: WalletPaymentMethod[] }
  | { status: "not_linked"; methods: [] };

const CARD_BRANDS: Record<string, string> = {
  amex: "American Express",
  diners: "Diners Club",
  discover: "Discover",
  eftpos_au: "eftpos",
  jcb: "JCB",
  mastercard: "Mastercard",
  unionpay: "UnionPay",
  visa: "Visa",
};

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
}

function isMissingCustomer(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: unknown }).code === "resource_missing"
  );
}

function toWalletMethod(
  method: Stripe.PaymentMethod,
  defaultId: string | null,
  giftsByMethod: Map<string, string[]>,
): WalletPaymentMethod | null {
  const base = {
    id: method.id,
    isDefault: method.id === defaultId,
    recurringGiftIds: giftsByMethod.get(method.id) ?? [],
  };
  if (method.type === "card" && method.card) {
    return {
      ...base,
      kind: "card",
      brand: CARD_BRANDS[method.card.brand] ?? titleCase(method.card.brand),
      last4: method.card.last4,
      expMonth: method.card.exp_month,
      expYear: method.card.exp_year,
    };
  }
  if (method.type === "us_bank_account" && method.us_bank_account) {
    return {
      ...base,
      kind: "bank",
      brand: titleCase(method.us_bank_account.bank_name ?? "Bank account"),
      last4: method.us_bank_account.last4 ?? "",
      expMonth: null,
      expYear: null,
    };
  }
  return null;
}

async function listSavedMethods(stripe: Stripe, customerId: string) {
  const methods: Stripe.PaymentMethod[] = [];
  let cursor: string | undefined;
  for (;;) {
    const page = await stripe.customers.listPaymentMethods(customerId, {
      limit: 20,
      ...(cursor ? { starting_after: cursor } : {}),
    });
    methods.push(...page.data);
    if (!page.has_more) return methods;
    const last = page.data.at(-1);
    if (!last || last.id === cursor) {
      throw new Error("Unable to finish loading payment methods");
    }
    cursor = last.id;
  }
}

/**
 * The donor's saved payment methods, read from Stripe. Adding, removing and
 * choosing the default stay in Stripe's billing portal; this only reads.
 * Gift links reflect local records, not the subscription's current billing
 * overrides. Legacy Sources and unsupported method types are not displayed.
 */
export async function listDonorWallet({
  stripe,
  supabaseAdmin,
  donor,
  tenantId,
}: {
  stripe: Stripe;
  supabaseAdmin: AdminSupabaseClient;
  donor: { id: string; stripe_customer_id: string | null };
  tenantId: string;
}): Promise<DonorWallet> {
  const customerId = donor.stripe_customer_id;
  if (!customerId) return { status: "not_linked", methods: [] };

  let customer: Stripe.Customer | Stripe.DeletedCustomer;
  try {
    customer = await stripe.customers.retrieve(customerId);
  } catch (error) {
    if (isMissingCustomer(error)) return { status: "not_linked", methods: [] };
    throw error;
  }
  if (customer.deleted) {
    return { status: "not_linked", methods: [] };
  }

  const rawDefault = customer.invoice_settings?.default_payment_method;
  const defaultId =
    typeof rawDefault === "string" ? rawDefault : (rawDefault?.id ?? null);

  const [methods, { data: pledges, error }] = await Promise.all([
    listSavedMethods(stripe, customerId),
    supabaseAdmin
      .from("donor_pledges")
      .select("id, stripe_payment_method_id")
      .eq("donor_id", donor.id)
      .eq("tenant_id", tenantId)
      .in("status", ["active", "paused"]),
  ]);
  if (error) throw new Error(error.message);

  const giftsByMethod = new Map<string, string[]>();
  for (const pledge of (pledges ?? []) as Array<{
    id: string;
    stripe_payment_method_id: string | null;
  }>) {
    if (!pledge.stripe_payment_method_id) continue;
    const list = giftsByMethod.get(pledge.stripe_payment_method_id) ?? [];
    list.push(pledge.id);
    giftsByMethod.set(pledge.stripe_payment_method_id, list);
  }

  const walletMethods = methods
    .map((method) => toWalletMethod(method, defaultId, giftsByMethod))
    .filter((method): method is WalletPaymentMethod => method !== null)
    // Default first, then cards before bank accounts, otherwise Stripe's order.
    .sort(
      (a, b) =>
        Number(b.isDefault) - Number(a.isDefault) ||
        Number(a.kind === "bank") - Number(b.kind === "bank"),
    );

  return { status: "linked", methods: walletMethods };
}

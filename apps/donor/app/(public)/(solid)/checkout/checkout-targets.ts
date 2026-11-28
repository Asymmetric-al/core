const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type CheckoutSearchParams = Record<
  string,
  string | string[] | undefined
>;

export type CheckoutTarget =
  { kind: "fund"; id: string } | { kind: "missionary"; id: string };

export type CheckoutLink = {
  target: CheckoutTarget | null;
  amountCents: number | null;
  monthly: boolean;
  coverFees: boolean;
  sourceSiteId: string | null;
};

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() || null;

export function parseAmountCents(raw: string | null): number | null {
  if (!raw || !/^\d{1,8}(\.\d{1,2})?$/.test(raw)) return null;
  const cents = Math.round(Number(raw) * 100);
  return cents > 0 ? cents : null;
}

const PLAIN_AMOUNT = /^\d{1,8}(\.\d{0,2})?$/;
const GROUPED_AMOUNT = /^\d{1,3}(,\d{3}){1,2}(\.\d{0,2})?$/;

export function parseTypedAmount(text: string): number | null {
  const typed = text.trim().replace(/^\$/, "");
  if (!PLAIN_AMOUNT.test(typed) && !GROUPED_AMOUNT.test(typed)) return null;
  const cents = Math.round(Number(typed.replaceAll(",", "")) * 100);
  return cents > 0 && cents < 10_000_000_000 ? cents : null;
}

export function readCheckoutLink(params: CheckoutSearchParams): CheckoutLink {
  const missionary = first(params.missionary_id) ?? first(params.workerId);
  const fund = first(params.fund_id);
  const target: CheckoutTarget | null =
    missionary && UUID.test(missionary)
      ? { kind: "missionary", id: missionary.toLowerCase() }
      : fund && UUID.test(fund)
        ? { kind: "fund", id: fund.toLowerCase() }
        : null;
  const source = first(params.sourceSiteId);
  return {
    target,
    amountCents: parseAmountCents(first(params.amount)),
    monthly: first(params.frequency)?.toLowerCase() === "monthly",
    coverFees: first(params.coverFees) === "1",
    sourceSiteId: source && UUID.test(source) ? source.toLowerCase() : null,
  };
}

export function checkoutSurface(input: {
  hostSurface: "website" | "donor_account";
  isHome: boolean;
  sourceSiteId: string | null;
}): "website" | "donor_account" {
  return input.sourceSiteId && input.isHome
    ? "donor_account"
    : input.hostSurface;
}

export function checkoutPath(input: {
  target: CheckoutTarget | null;
  amountCents: number | null;
  coverFees: boolean;
  sourceSiteId: string | null;
}): string {
  const params = new URLSearchParams();
  if (input.target)
    params.set(
      input.target.kind === "fund" ? "fund_id" : "missionary_id",
      input.target.id,
    );
  if (input.amountCents)
    params.set("amount", (input.amountCents / 100).toFixed(2));
  params.set("coverFees", input.coverFees ? "1" : "0");
  if (input.sourceSiteId) params.set("sourceSiteId", input.sourceSiteId);
  return `/checkout?${params.toString()}`;
}

export function handOffHref(input: {
  homeHost: string;
  target: CheckoutTarget;
  amountCents: number | null;
  coverFees: boolean;
  sourceSiteId: string | null;
}): string {
  return `https://${input.homeHost}${checkoutPath(input)}`;
}

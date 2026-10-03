import { CURRENCY_METADATA, type CurrencyMetadata } from "./metadata";

export { CURRENCY_METADATA, type CurrencyMetadata } from "./metadata";

export class MoneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MoneyError";
  }
}

function metadata(code: string): CurrencyMetadata {
  const value = CURRENCY_METADATA[code.trim().toUpperCase()];
  if (!value) throw new MoneyError(`Unknown monetary currency: ${code}`);
  return value;
}

export function isSupportedCurrency(code: string): boolean {
  return Object.hasOwn(CURRENCY_METADATA, code.trim().toUpperCase());
}

export function minorUnitExponent(code: string): CurrencyMetadata["exponent"] {
  return metadata(code).exponent;
}

function checkedInteger(value: number): void {
  if (!Number.isSafeInteger(value)) {
    throw new MoneyError("Money must use safe integer minor units.");
  }
}

/** Plain decimal major units only: no binary multiplication or silent rounding. */
export function parseMoneyToMinorUnits(
  input: string | number,
  code: string,
): number {
  const exponent = minorUnitExponent(code);
  if (typeof input === "number" && !Number.isFinite(input)) {
    throw new MoneyError("Money must be finite.");
  }
  const decimal = String(input).trim();
  const match = /^([+-]?)(\d+)(?:\.(\d+))?$/.exec(decimal);
  if (!match) throw new MoneyError("Money must be a plain decimal amount.");
  const [, sign, whole, fraction = ""] = match;
  if (fraction.slice(exponent).replace(/0/g, "").length > 0) {
    throw new MoneyError(`Amount exceeds ${code} minor-unit precision.`);
  }
  const magnitude = BigInt(
    whole! + fraction.slice(0, exponent).padEnd(exponent, "0"),
  );
  const units = Number(sign === "-" ? -magnitude : magnitude);
  checkedInteger(units);
  return units;
}

/** Explicit locale affects presentation alone; retain exact decimal-string units. */
export function formatMoney(
  minorUnits: number,
  code: string,
  locale: string,
): string {
  checkedInteger(minorUnits);
  const { code: currency, exponent } = metadata(code);
  if (!locale?.trim())
    throw new MoneyError("Money formatting requires an explicit locale.");
  const digits = BigInt(minorUnits < 0 ? -minorUnits : minorUnits)
    .toString()
    .padStart(exponent + 1, "0");
  const major =
    exponent === 0
      ? digits
      : `${digits.slice(0, -exponent)}.${digits.slice(-exponent)}`;
  const decimal = `${minorUnits < 0 ? "-" : ""}${major}`;
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: exponent,
    maximumFractionDigits: exponent,
  });
  // ECMA-402 accepts exact decimal strings (ToIntlMathematicalValue). TypeScript's
  // lib still declares number|bigint; this assertion does not coerce the string.
  return formatter.format(decimal as unknown as number);
}

export function assertTransactable(
  code: string,
  tenantSettlementCurrency: string,
): void {
  const currency = metadata(code).code;
  const settlement = metadata(tenantSettlementCurrency).code;
  if (currency !== settlement) {
    throw new MoneyError(
      "Currency must match the independently resolved settlement currency.",
    );
  }
}

export type StripeMoneyOperation = "charge" | "payout";

function providerRules(code: string, operation: StripeMoneyOperation) {
  const value = metadata(code);
  if (operation !== "charge" && operation !== "payout")
    throw new MoneyError("Unknown provider money operation.");
  return {
    exponent:
      operation === "charge"
        ? value.stripeChargeExponent
        : value.stripePayoutExponent,
    multiple:
      operation === "charge"
        ? value.stripeChargeMultiple
        : value.stripePayoutMultiple,
    canonicalExponent: value.exponent,
  };
}

function convertUnits(
  units: number,
  fromExponent: number,
  toExponent: number,
): number {
  checkedInteger(units);
  const factor = 10n ** BigInt(Math.abs(toExponent - fromExponent));
  const integer = BigInt(units);
  if (fromExponent > toExponent && integer % factor !== 0n) {
    throw new MoneyError("Provider representation would lose minor units.");
  }
  const converted = Number(
    fromExponent > toExponent ? integer / factor : integer * factor,
  );
  checkedInteger(converted);
  return converted;
}

/** Representation validation only: not provider/route qualification or activation. */
export function toStripeMinorUnits(
  units: number,
  code: string,
  operation: StripeMoneyOperation,
): number {
  const rules = providerRules(code, operation);
  const providerUnits = convertUnits(
    units,
    rules.canonicalExponent,
    rules.exponent,
  );
  if (providerUnits % rules.multiple !== 0)
    throw new MoneyError("Amount violates provider minor-unit constraints.");
  return providerUnits;
}

export function fromStripeMinorUnits(
  units: number,
  code: string,
  operation: StripeMoneyOperation,
): number {
  const rules = providerRules(code, operation);
  checkedInteger(units);
  if (units % rules.multiple !== 0)
    throw new MoneyError("Amount violates provider minor-unit constraints.");
  return convertUnits(units, rules.exponent, rules.canonicalExponent);
}

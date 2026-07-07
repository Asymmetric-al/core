type CheckoutHrefInput = {
  amount?: number | string | null;
  frequency?: string | null;
  fundId?: string | null;
  missionaryId?: string | null;
  workerId?: string | null;
};

type WorkerCheckoutHrefInput = Omit<CheckoutHrefInput, "missionaryId"> & {
  missionaryId: string;
  workerId: string;
};

const GENERAL_CHECKOUT_ALIAS = "general";

const trimToNull = (value: string | null | undefined): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const appendParam = (
  params: URLSearchParams,
  key: string,
  value: number | string | null | undefined,
) => {
  if (typeof value === "number") {
    if (Number.isFinite(value)) {
      params.set(key, String(value));
    }
    return;
  }

  const trimmed = trimToNull(value);
  if (trimmed) {
    params.set(key, trimmed);
  }
};

export function resolveCheckoutFundId(
  fundIdOrAlias: string | null | undefined,
): string | null {
  const trimmed = trimToNull(fundIdOrAlias);
  if (!trimmed) return null;

  return isGeneralCheckoutAlias(trimmed) ? null : trimmed;
}

export function isGeneralCheckoutAlias(
  value: string | null | undefined,
): boolean {
  return trimToNull(value)?.toLowerCase() === GENERAL_CHECKOUT_ALIAS;
}

export function buildCheckoutHref({
  amount,
  frequency,
  fundId,
  missionaryId,
  workerId,
}: CheckoutHrefInput): string {
  const params = new URLSearchParams();

  appendParam(params, "workerId", workerId);
  appendParam(params, "missionary_id", missionaryId);
  if (isGeneralCheckoutAlias(fundId)) {
    appendParam(params, "fund", GENERAL_CHECKOUT_ALIAS);
  } else {
    appendParam(params, "fund_id", resolveCheckoutFundId(fundId));
  }
  appendParam(params, "amount", amount);
  appendParam(params, "frequency", frequency);

  const queryString = params.toString();
  return queryString ? `/checkout?${queryString}` : "/checkout";
}

export function buildWorkerCheckoutHref(
  input: WorkerCheckoutHrefInput,
): string {
  return buildCheckoutHref(input);
}

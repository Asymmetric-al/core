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

const LEGACY_GENERAL_FUND_ID = "40000000-0000-0000-0000-000000000007";

const LEGACY_FUND_ALIASES: Record<string, string> = {
  general: LEGACY_GENERAL_FUND_ID,
};

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

  return LEGACY_FUND_ALIASES[trimmed.toLowerCase()] ?? trimmed;
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
  appendParam(params, "fund_id", resolveCheckoutFundId(fundId));
  appendParam(params, "amount", amount);
  appendParam(params, "frequency", frequency);

  const queryString = params.toString();
  return queryString ? `/checkout?${queryString}` : "/checkout";
}

export function buildWorkerCheckoutHref(input: WorkerCheckoutHrefInput): string {
  return buildCheckoutHref(input);
}

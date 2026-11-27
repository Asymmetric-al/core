export const GIFT_KEY_STORAGE = "asym.checkout.gift-key.v1";
export const GIFT_PAYMENT_STORAGE = "asym.checkout.gift-payment.v1";
export const GIFT_KEY_WINDOW_MS = 30 * 60 * 1000;

export type GiftKeyInputs = {
  lines: Array<{ fundId?: string; missionaryId?: string; amountCents: number }>;
  coverFees: boolean;
  isAnonymous: boolean;
  surface: string;
};

type StoredKey = { key: string; digest: string; at: number };

export type StoredPayment = {
  key: string;
  clientSecret: string;
  account: string;
  publishableKey: string;
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function read<T>(storage: StorageLike | null, name: string): T | null {
  try {
    const raw = storage?.getItem(name);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(storage: StorageLike | null, name: string, value: unknown) {
  try {
    storage?.setItem(name, JSON.stringify(value));
  } catch {
    return;
  }
}

export async function digestGiftInputs(inputs: GiftKeyInputs): Promise<string> {
  const canonical = JSON.stringify({
    lines: inputs.lines.map((line) => [
      line.fundId ?? null,
      line.missionaryId ?? null,
      line.amountCents,
    ]),
    coverFees: inputs.coverFees,
    isAnonymous: inputs.isAnonymous,
    surface: inputs.surface,
  });
  const bytes = new TextEncoder().encode(canonical);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

export async function giftKeyFor(
  inputs: GiftKeyInputs,
  shared: StorageLike | null,
  now = Date.now(),
  newKey: () => string = () => crypto.randomUUID(),
): Promise<string> {
  const digest = await digestGiftInputs(inputs);
  const stored = read<StoredKey>(shared, GIFT_KEY_STORAGE);
  if (
    stored &&
    stored.digest === digest &&
    now - stored.at < GIFT_KEY_WINDOW_MS
  )
    return stored.key;
  const key = newKey();
  write(shared, GIFT_KEY_STORAGE, { key, digest, at: now });
  return key;
}

export function forgetGiftKey(
  shared: StorageLike | null,
  tab: StorageLike | null,
) {
  try {
    shared?.removeItem(GIFT_KEY_STORAGE);
    tab?.removeItem(GIFT_PAYMENT_STORAGE);
  } catch {
    return;
  }
}

export function rememberPayment(
  tab: StorageLike | null,
  payment: StoredPayment,
) {
  write(tab, GIFT_PAYMENT_STORAGE, payment);
}

export function rememberedPayment(
  tab: StorageLike | null,
): StoredPayment | null {
  return read<StoredPayment>(tab, GIFT_PAYMENT_STORAGE);
}

export function safeStorage(kind: "local" | "session"): StorageLike | null {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

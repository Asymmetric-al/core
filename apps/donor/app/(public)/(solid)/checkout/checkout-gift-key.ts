export const GIFT_KEY_STORAGE = "asym.checkout.gift-keys.v2";
export const GIFT_PAYMENT_STORAGE = "asym.checkout.gift-payment.v2";
export const GIFT_KEY_WINDOW_MS = 30 * 60 * 1000;

export type GiftKeyInputs = {
  lines: Array<{ fundId?: string; missionaryId?: string; amountCents: number }>;
  coverFees: boolean;
  isAnonymous: boolean;
  surface: string;
  mode: "guest" | "signed_in";
  contact: { email: string; firstName?: string; lastName?: string };
  sourceSiteId: string | null;
};

type StoredKeys = Record<string, { key: string; at: number }>;

export type StoredPayment = {
  key: string;
  clientSecret: string;
  account: string;
  publishableKey: string;
  target: { kind: "fund" | "missionary"; id: string } | null;
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

const trimmed = (value: string | undefined) => value?.trim() || null;

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
    mode: inputs.mode,
    contact: [
      inputs.contact.email.trim().toLowerCase() || null,
      trimmed(inputs.contact.firstName),
      trimmed(inputs.contact.lastName),
    ],
    sourceSiteId: inputs.sourceSiteId,
  });
  const bytes = new TextEncoder().encode(canonical);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}

function freshKeys(shared: StorageLike | null, now: number): StoredKeys {
  const stored = read<StoredKeys>(shared, GIFT_KEY_STORAGE);
  const kept: StoredKeys = {};
  if (!stored || typeof stored !== "object") return kept;
  for (const [digest, entry] of Object.entries(stored)) {
    if (
      entry &&
      typeof entry.key === "string" &&
      typeof entry.at === "number" &&
      now - entry.at < GIFT_KEY_WINDOW_MS
    )
      kept[digest] = entry;
  }
  return kept;
}

export async function giftKeyFor(
  inputs: GiftKeyInputs,
  shared: StorageLike | null,
  now = Date.now(),
  newKey: () => string = () => crypto.randomUUID(),
): Promise<{ key: string; reused: boolean }> {
  const digest = await digestGiftInputs(inputs);
  const keys = freshKeys(shared, now);
  const known = keys[digest];
  if (known) {
    write(shared, GIFT_KEY_STORAGE, keys);
    return { key: known.key, reused: true };
  }
  const key = newKey();
  write(shared, GIFT_KEY_STORAGE, { ...keys, [digest]: { key, at: now } });
  return { key, reused: false };
}

export function holdsAnyLiveKey(
  shared: StorageLike | null,
  now = Date.now(),
): boolean {
  return Object.keys(freshKeys(shared, now)).length > 0;
}

const SECRET_PARAMS = [
  "payment_intent",
  "payment_intent_client_secret",
  "redirect_status",
];

export function takeSecretFromAddress(): string | null {
  try {
    const url = new URL(window.location.href);
    const secret = url.searchParams.get("payment_intent_client_secret");
    if (!SECRET_PARAMS.some((name) => url.searchParams.has(name))) return null;
    for (const name of SECRET_PARAMS) url.searchParams.delete(name);
    window.history.replaceState(
      window.history.state,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
    return secret;
  } catch {
    return null;
  }
}

export function forgetGiftKey(
  shared: StorageLike | null,
  key: string,
  now = Date.now(),
) {
  const keys = freshKeys(shared, now);
  const kept = Object.fromEntries(
    Object.entries(keys).filter(([, entry]) => entry.key !== key),
  );
  write(shared, GIFT_KEY_STORAGE, kept);
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
  const held = read<StoredPayment>(tab, GIFT_PAYMENT_STORAGE);
  return held &&
    typeof held.key === "string" &&
    typeof held.clientSecret === "string" &&
    typeof held.account === "string" &&
    typeof held.publishableKey === "string"
    ? held
    : null;
}

export function forgetPayment(tab: StorageLike | null) {
  try {
    tab?.removeItem(GIFT_PAYMENT_STORAGE);
  } catch {
    return;
  }
}

export function safeStorage(kind: "local" | "session"): StorageLike | null {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

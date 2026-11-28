"use client";

import { quoteGiftProcessingFee } from "@asym/api/donate/fee-policy";
import { ownApiFetch } from "@asym/database/own-api";
import { formatCurrency } from "@asym/lib/utils";
import { Alert, AlertDescription } from "@asym/ui/components/shadcn/alert";
import { Button } from "@asym/ui/components/shadcn/button";
import { Card } from "@asym/ui/components/shadcn/card";
import { Checkbox } from "@asym/ui/components/shadcn/checkbox";
import { Field, FieldLabel } from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  forgetGiftKey,
  forgetPayment,
  giftKeyFor,
  holdsAnyLiveKey,
  rememberedPayment,
  rememberPayment,
  safeStorage,
  takeSecretFromAddress,
  type GiftKeyInputs,
  type StoredPayment,
} from "./checkout-gift-key";
import {
  checkoutPath,
  handOffHref,
  type CheckoutLink,
  type CheckoutTarget,
} from "./checkout-targets";
import { CheckoutTurnstile } from "./checkout-turnstile";
import {
  CHECKOUT_WORDS,
  FINAL_STATES,
  intakeRefusalWords,
  paymentStateNotice,
  type CheckoutNotice,
  type HeldPayment,
  type IntakeRefusal,
} from "./checkout-words";

export type CheckoutSurface = "website" | "donor_account";

export type CheckoutPageClientProps = {
  link: CheckoutLink;
  surface: CheckoutSurface;
  isHome: boolean;
  homeHost: string | null;
  siteId: string | null;
  turnstileSiteKey: string;
  signedInEmail?: string | null;
};

type Config =
  | { state: "idle" | "loading" | "unavailable" }
  | {
      state: "ready";
      publishableKey: string;
      account: string;
      wayBackHost: string | null;
    };

type Outcome = { notice: CheckoutNotice; final: boolean; signIn?: boolean };

type GuestInstead = { kind: "mode" } | { kind: "link"; href: string } | null;

const DEFAULT_CENTS = 2500;
const OPEN_STATES = new Set([
  "requires_payment_method",
  "requires_confirmation",
  "requires_action",
]);
const LOST: Outcome = {
  notice: { tone: "error", text: CHECKOUT_WORDS.lostConnection },
  final: false,
};

const say = (text: string, final = false): Outcome => ({
  notice: { tone: "error", text },
  final,
});

function outcomeOf(payment: HeldPayment): Outcome {
  return {
    notice: paymentStateNotice(payment),
    final: FINAL_STATES.has(payment.status),
  };
}

function targetLine(target: CheckoutTarget | null, amountCents: number) {
  return target?.kind === "missionary"
    ? { missionaryId: target.id, amountCents }
    : { fundId: target?.id ?? "", amountCents };
}

function feeCents(amountCents: number, coverFees: boolean) {
  if (!coverFees || amountCents <= 0) return 0;
  return quoteGiftProcessingFee({
    giftAmountCents: amountCents,
    coverFees: true,
    paymentMethod: "card",
  }).coverAmountCents;
}

export function parseTypedAmount(text: string): number | null {
  const cleaned = text.trim().replace(/^\$/, "").replace(/,/g, "");
  if (!/^\d{1,8}(\.\d{0,2})?$/.test(cleaned)) return null;
  const cents = Math.round(Number(cleaned) * 100);
  return cents > 0 ? cents : null;
}

const amountTextOf = (cents: number) => (cents / 100).toFixed(2);

function sameTarget(held: StoredPayment, target: CheckoutTarget | null) {
  return Boolean(
    target && held.target?.kind === target.kind && held.target.id === target.id,
  );
}

async function retrieve(
  stripe: Stripe | null,
  clientSecret: string,
): Promise<HeldPayment | null> {
  if (!stripe) return null;
  const result = (await stripe.retrievePaymentIntent(clientSecret)) as {
    paymentIntent?: HeldPayment;
  };
  return result.paymentIntent?.status ? result.paymentIntent : null;
}

async function readHeld(held: StoredPayment): Promise<HeldPayment | null> {
  const stripe = await loadStripe(held.publishableKey, {
    stripeAccount: held.account,
  });
  return retrieve(stripe, held.clientSecret);
}

function FinalView(props: {
  outcome: Outcome;
  wayBackHost: string | null;
  onAgain: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Alert role="status">
        <AlertDescription>{props.outcome.notice.text}</AlertDescription>
      </Alert>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" onClick={props.onAgain}>
          Give again
        </Button>
        {props.wayBackHost ? (
          <a
            className="text-sm underline"
            href={`https://${props.wayBackHost}`}
            rel="noreferrer"
          >
            Back to {props.wayBackHost}
          </a>
        ) : null}
      </div>
    </div>
  );
}

function GiveForm(props: {
  client: CheckoutPageClientProps;
  config: Extract<Config, { state: "ready" }>;
  amountCents: number;
  amountValid: boolean;
  coverFees: boolean;
  mode: "guest" | "signed_in";
  sourceSiteId: string | null;
  signInHref: string;
  guestInstead: GuestInstead;
  onGuest: () => void;
  heldOutcome: Outcome | null;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const total =
    props.amountCents + feeCents(props.amountCents, props.coverFees);
  const signedIn = props.mode === "signed_in";
  const shown = touched ? outcome : (outcome ?? props.heldOutcome);

  const freshChallenge = () => {
    setToken(null);
    setResetSignal((n) => n + 1);
  };

  const contactEmail = signedIn ? (props.client.signedInEmail ?? "") : email;
  const name = signedIn ? "" : `${firstName} ${lastName}`.trim();

  const giftInputs = (): GiftKeyInputs => ({
    lines: [targetLine(props.client.link.target, props.amountCents)],
    coverFees: props.coverFees,
    isAnonymous: anonymous,
    surface: props.client.surface,
    mode: props.mode,
    contact: signedIn
      ? { email: contactEmail }
      : { email, firstName, lastName },
    sourceSiteId: props.sourceSiteId,
  });

  const settle = (payment: HeldPayment, key: string) => {
    const result = outcomeOf(payment);
    if (result.final) forgetGiftKey(safeStorage("local"), key);
    setOutcome(result);
  };

  const confirmWith = async (clientSecret: string, key: string) => {
    if (!stripe || !elements) return setOutcome(LOST);
    const confirmed = (await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: window.location.href,
        payment_method_data: {
          billing_details: name
            ? { email: contactEmail, name }
            : { email: contactEmail },
        },
      },
      redirect: "if_required",
    })) as {
      error?: { type?: string; code?: string; message?: string };
      paymentIntent?: HeldPayment;
    };
    if (!confirmed.error)
      return settle(confirmed.paymentIntent ?? { status: "processing" }, key);
    const { code, type, message } = confirmed.error;
    if (code === "payment_intent_authentication_failure")
      return setOutcome(say(CHECKOUT_WORDS.cancelled));
    if (type === "card_error") return setOutcome(say(CHECKOUT_WORDS.declined));
    if (type === "validation_error")
      return setOutcome(say(message ?? CHECKOUT_WORDS.notStarted));
    const current = await retrieve(stripe, clientSecret).catch(() => null);
    if (current && FINAL_STATES.has(current.status))
      return settle(current, key);
    setOutcome(LOST);
  };

  const give = async () => {
    if (!stripe || !elements || busy || !props.amountValid) return;
    setBusy(true);
    setTouched(true);
    setOutcome(null);
    try {
      const submitted = (await elements.submit()) as {
        error?: { message?: string };
      };
      if (submitted.error) {
        setOutcome(say(submitted.error.message ?? CHECKOUT_WORDS.notStarted));
        return;
      }
      const tab = safeStorage("session");
      const shared = safeStorage("local");
      const { key, reused } = await giftKeyFor(giftInputs(), shared);
      const held = rememberedPayment(tab);
      if (held?.key === key && held.account === props.config.account) {
        const current = await retrieve(stripe, held.clientSecret);
        if (current && OPEN_STATES.has(current.status)) {
          await confirmWith(held.clientSecret, key);
          return;
        }
        if (current && FINAL_STATES.has(current.status)) {
          settle(current, key);
          return;
        }
      }
      if (!token) {
        setOutcome(say(CHECKOUT_WORDS.challenge));
        return;
      }
      const response = await ownApiFetch("/api/donate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          key,
          mode: props.mode,
          surface: props.client.surface,
          lines: [targetLine(props.client.link.target, props.amountCents)],
          coverFees: props.coverFees,
          paymentMethod: "card",
          isAnonymous: anonymous,
          contact: signedIn
            ? { email: contactEmail }
            : { email, firstName, lastName },
          challengeToken: token,
          ...(props.sourceSiteId ? { sourceSiteId: props.sourceSiteId } : {}),
        }),
      }).finally(freshChallenge);
      const answer = (await response.json().catch(() => ({}))) as Record<
        string,
        unknown
      >;
      if (!response.ok) {
        const refusal = { status: response.status, ...answer } as IntakeRefusal;
        if (refusal.error === "idempotency_key_reused") {
          if (held?.key === key) {
            const current = await readHeld(held).catch(() => null);
            if (current && FINAL_STATES.has(current.status)) {
              settle(current, key);
              return;
            }
            forgetPayment(tab);
          }
          forgetGiftKey(shared, key);
          setOutcome(say(CHECKOUT_WORDS.keyReused));
          return;
        }
        if (refusal.error === "gift_closed") forgetGiftKey(shared, key);
        const completed = refusal.error === "gift_already_completed";
        setOutcome({
          notice: {
            tone: completed ? "success" : "error",
            text: intakeRefusalWords(refusal, reused && held?.key !== key),
          },
          final: completed,
          signIn: response.status === 401,
        });
        return;
      }
      const clientSecret = String(answer.clientSecret);
      const account =
        typeof answer.connectedAccountId === "string"
          ? answer.connectedAccountId
          : props.config.account;
      rememberPayment(tab, {
        key,
        clientSecret,
        account,
        publishableKey: props.config.publishableKey,
        target: props.client.link.target,
      });
      if (account !== props.config.account) {
        setOutcome(say(CHECKOUT_WORDS.accountChanged));
        return;
      }
      await confirmWith(clientSecret, key);
    } catch {
      setOutcome(LOST);
    } finally {
      setBusy(false);
    }
  };

  if (shown?.final) {
    return (
      <FinalView
        outcome={shown}
        wayBackHost={props.config.wayBackHost}
        onAgain={() => {
          forgetPayment(safeStorage("session"));
          setTouched(true);
          setOutcome(null);
        }}
      />
    );
  }

  const guestButton =
    props.guestInstead?.kind === "mode" ? (
      <Button type="button" variant="link" onClick={props.onGuest}>
        Give as a guest instead
      </Button>
    ) : props.guestInstead?.kind === "link" ? (
      <a className="text-sm underline" href={props.guestInstead.href}>
        Give as a guest instead
      </a>
    ) : null;

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        void give();
      }}
    >
      {signedIn ? (
        <div className="flex flex-col items-start gap-2">
          <p className="text-sm">Giving as {props.client.signedInEmail}</p>
          {guestButton}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="checkout-email">Email</FieldLabel>
            <Input
              id="checkout-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="checkout-first-name">First name</FieldLabel>
            <Input
              id="checkout-first-name"
              autoComplete="given-name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="checkout-last-name">Last name</FieldLabel>
            <Input
              id="checkout-last-name"
              autoComplete="family-name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </Field>
        </div>
      )}
      <PaymentElement
        options={{
          wallets: { applePay: "never", googlePay: "never", link: "never" },
          fields: { billingDetails: { email: "never" } },
        }}
      />
      <div className="flex items-center gap-3">
        <Checkbox
          id="checkout-anonymous"
          aria-labelledby="checkout-anonymous-label"
          checked={anonymous}
          onCheckedChange={(checked) => setAnonymous(checked === true)}
        />
        <label
          id="checkout-anonymous-label"
          htmlFor="checkout-anonymous"
          className="text-sm"
        >
          Give anonymously to the missionary and the public
        </label>
      </div>
      <CheckoutTurnstile
        siteKey={props.client.turnstileSiteKey}
        onToken={setToken}
        resetSignal={resetSignal}
      />
      {shown ? (
        <Alert
          variant={shown.notice.tone === "error" ? "destructive" : "default"}
          role="alert"
        >
          <AlertDescription>{shown.notice.text}</AlertDescription>
          {shown.signIn ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Link className="text-sm underline" href={props.signInHref}>
                Sign in again
              </Link>
              {guestButton}
            </div>
          ) : null}
        </Alert>
      ) : null}
      <Button
        type="submit"
        disabled={busy || !stripe || !elements || !props.amountValid}
        aria-busy={busy}
      >
        {props.amountValid ? `Give ${formatCurrency(total / 100)}` : "Give"}
      </Button>
    </form>
  );
}

export function CheckoutPageClient(props: CheckoutPageClientProps) {
  const { link } = props;
  const accountSurface = props.surface === "donor_account";
  const sourceSiteId = accountSurface ? link.sourceSiteId : null;
  const [onceChosen, setOnceChosen] = useState(!link.monthly);
  const [amountText, setAmountText] = useState(
    amountTextOf(link.amountCents ?? DEFAULT_CENTS),
  );
  const [lastCents, setLastCents] = useState(link.amountCents ?? DEFAULT_CENTS);
  const typedCents = parseTypedAmount(amountText);
  const [coverFees, setCoverFees] = useState(link.coverFees);
  const [config, setConfig] = useState<Config>({
    state: link.target ? "loading" : "idle",
  });
  const [keyHeld, setKeyHeld] = useState(false);
  const [held, setHeld] = useState<Outcome | null>(null);
  const email = props.signedInEmail ?? null;
  const [mode, setMode] = useState<"guest" | "signed_in">(
    email && (props.isHome || accountSurface) ? "signed_in" : "guest",
  );

  useEffect(() => {
    takeSecretFromAddress();
    const stored = rememberedPayment(safeStorage("session"));
    if (!stored || !sameTarget(stored, link.target)) return;
    let active = true;
    void readHeld(stored)
      .then((payment) => {
        if (!active) return;
        if (!payment) return setHeld(LOST);
        if (FINAL_STATES.has(payment.status))
          forgetGiftKey(safeStorage("local"), stored.key);
        setHeld(outcomeOf(payment));
      })
      .catch(() => active && setHeld(LOST));
    return () => {
      active = false;
    };
  }, [link.target]);

  useEffect(() => {
    if (!link.target) return;
    let active = true;
    void ownApiFetch("/api/checkout/config", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        targets: [
          link.target.kind === "fund"
            ? { fundId: link.target.id }
            : { missionaryId: link.target.id },
        ],
        surface: props.surface,
        ...(sourceSiteId ? { sourceSiteId } : {}),
      }),
    })
      .then(async (response) => {
        const body = (await response.json().catch(() => ({}))) as Record<
          string,
          unknown
        >;
        if (!active) return;
        const ready =
          response.ok &&
          typeof body.publishableKey === "string" &&
          typeof body.connectedAccountId === "string";
        if (!ready) setKeyHeld(holdsAnyLiveKey(safeStorage("local")));
        setConfig(
          ready
            ? {
                state: "ready",
                publishableKey: body.publishableKey as string,
                account: body.connectedAccountId as string,
                wayBackHost:
                  typeof body.wayBackHost === "string"
                    ? body.wayBackHost
                    : null,
              }
            : { state: "unavailable" },
        );
      })
      .catch(() => active && setConfig({ state: "unavailable" }));
    return () => {
      active = false;
    };
  }, [link.target, sourceSiteId, props.surface]);

  const stripePromise = useMemo<Promise<Stripe | null> | null>(
    () =>
      config.state === "ready"
        ? loadStripe(config.publishableKey, {
            stripeAccount: config.account,
          }).catch(() => null)
        : null,
    [config],
  );

  const [stripeFailed, setStripeFailed] = useState(false);
  useEffect(() => {
    let active = true;
    void stripePromise?.then((stripe) => {
      if (active && !stripe) setStripeFailed(true);
    });
    return () => {
      active = false;
    };
  }, [stripePromise]);

  const cents = typedCents ?? lastCents;
  const total = cents + feeCents(cents, coverFees);
  const details = {
    target: link.target,
    amountCents: cents,
    coverFees,
  };
  const signInHref = `/login?next=${encodeURIComponent(
    checkoutPath({ ...details, sourceSiteId: link.sourceSiteId }),
  )}`;
  const wayBackHost = config.state === "ready" ? config.wayBackHost : null;
  const guestInstead: GuestInstead = !accountSurface
    ? { kind: "mode" }
    : wayBackHost && link.target
      ? {
          kind: "link",
          href: `https://${wayBackHost}${checkoutPath({ ...details, sourceSiteId: null })}`,
        }
      : null;
  const startAgain = () => {
    forgetPayment(safeStorage("session"));
    setHeld(null);
  };

  return (
    <div className="min-h-dvh bg-background pb-24 pt-24 font-sans">
      <div className="container mx-auto max-w-2xl px-4">
        <Card className="flex flex-col gap-6 p-6">
          <h1 className="text-2xl font-semibold tracking-tight">Give</h1>
          {!link.target ? (
            <Alert role="status">
              <AlertDescription>
                {CHECKOUT_WORDS.chooseDesignation}{" "}
                <Link className="underline" href="/workers">
                  See who you can support
                </Link>
              </AlertDescription>
            </Alert>
          ) : !onceChosen ? (
            <div className="flex flex-col gap-3">
              <Alert role="status">
                <AlertDescription>{CHECKOUT_WORDS.monthly}</AlertDescription>
              </Alert>
              <Button
                type="button"
                className="self-start"
                onClick={() => setOnceChosen(true)}
              >
                Give once instead
              </Button>
            </div>
          ) : held?.final ? (
            <FinalView
              outcome={held}
              wayBackHost={wayBackHost}
              onAgain={startAgain}
            />
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {CHECKOUT_WORDS.oneEntityNotice}
              </p>
              <Field>
                <FieldLabel htmlFor="checkout-amount">Amount (USD)</FieldLabel>
                <Input
                  id="checkout-amount"
                  inputMode="decimal"
                  value={amountText}
                  aria-invalid={typedCents === null}
                  onChange={(event) => {
                    setAmountText(event.target.value);
                    const next = parseTypedAmount(event.target.value);
                    if (next !== null) setLastCents(next);
                  }}
                  onBlur={() => {
                    if (typedCents !== null)
                      setAmountText(amountTextOf(typedCents));
                  }}
                />
              </Field>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="checkout-cover"
                  aria-labelledby="checkout-cover-label"
                  checked={coverFees}
                  onCheckedChange={(checked) => setCoverFees(checked === true)}
                />
                <label
                  id="checkout-cover-label"
                  htmlFor="checkout-cover"
                  className="text-sm"
                >
                  Add the card fee so the full amount reaches the ministry
                </label>
              </div>
              {props.surface === "website" &&
              !props.isHome &&
              props.homeHost ? (
                <a
                  className="self-start text-sm underline"
                  href={handOffHref({
                    homeHost: props.homeHost,
                    target: link.target,
                    amountCents: cents,
                    coverFees,
                    sourceSiteId: props.siteId,
                  })}
                >
                  Give signed in
                </a>
              ) : null}
              {config.state === "unavailable" ? (
                <Alert role="alert" variant="destructive">
                  <AlertDescription>
                    {held
                      ? held.notice.text
                      : keyHeld
                        ? CHECKOUT_WORDS.configUnavailableKeyHeld
                        : CHECKOUT_WORDS.configUnavailable}
                  </AlertDescription>
                </Alert>
              ) : accountSurface && mode !== "signed_in" ? (
                <Link
                  className="self-start text-sm underline"
                  href={signInHref}
                >
                  Sign in to give from your account
                </Link>
              ) : stripeFailed ? (
                <Alert role="alert" variant="destructive">
                  <AlertDescription>
                    {held
                      ? CHECKOUT_WORDS.lostConnection
                      : CHECKOUT_WORDS.configUnavailable}
                  </AlertDescription>
                </Alert>
              ) : config.state === "ready" && stripePromise ? (
                <Elements
                  stripe={stripePromise}
                  options={{
                    mode: "payment",
                    amount: total,
                    currency: "usd",
                    allowedPaymentMethodTypes: ["card"],
                  }}
                >
                  <GiveForm
                    client={{ ...props, signedInEmail: email }}
                    config={config}
                    amountCents={cents}
                    amountValid={typedCents !== null}
                    coverFees={coverFees}
                    mode={mode}
                    sourceSiteId={sourceSiteId}
                    signInHref={signInHref}
                    guestInstead={guestInstead}
                    onGuest={() => setMode("guest")}
                    heldOutcome={held}
                  />
                </Elements>
              ) : null}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

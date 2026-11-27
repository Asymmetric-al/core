"use client";

import { quoteGiftProcessingFee } from "@asym/api/donate/fee-policy";
import { ownApiFetch } from "@asym/database/own-api";
import { createBrowserClient } from "@asym/database/supabase";
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  forgetGiftKey,
  giftKeyFor,
  rememberedPayment,
  rememberPayment,
  safeStorage,
  GIFT_KEY_STORAGE,
} from "./checkout-gift-key";
import { handOffHref, type CheckoutLink } from "./checkout-targets";
import { CheckoutTurnstile } from "./checkout-turnstile";
import {
  CHECKOUT_WORDS,
  intakeRefusalWords,
  paymentStateNotice,
  type CheckoutNotice,
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

const FINAL_STATES = new Set(["succeeded", "processing", "canceled"]);

function targetLine(link: CheckoutLink, amountCents: number) {
  return link.target?.kind === "missionary"
    ? { missionaryId: link.target.id, amountCents }
    : { fundId: link.target?.id ?? "", amountCents };
}

function feeCents(amountCents: number, coverFees: boolean) {
  if (!coverFees || amountCents <= 0) return 0;
  return quoteGiftProcessingFee({
    giftAmountCents: amountCents,
    coverFees: true,
    paymentMethod: "card",
  }).coverAmountCents;
}

function loginHref() {
  const next = `${window.location.pathname}${window.location.search}`;
  return `/login?next=${encodeURIComponent(next)}`;
}

function GiveForm(props: {
  client: CheckoutPageClientProps;
  config: Extract<Config, { state: "ready" }>;
  amountCents: number;
  coverFees: boolean;
  mode: "guest" | "signed_in";
  onGuest: () => void;
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
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const heldChecked = useRef(false);
  const total =
    props.amountCents + feeCents(props.amountCents, props.coverFees);
  const signedIn = props.mode === "signed_in";

  const freshChallenge = () => setResetSignal((n) => n + 1);

  const readPayment = useCallback(
    async (clientSecret: string): Promise<Outcome | null> => {
      if (!stripe) return null;
      const result = (await stripe.retrievePaymentIntent(clientSecret)) as {
        paymentIntent?: { status: string };
      };
      const status = result.paymentIntent?.status;
      if (!status) return null;
      const final = FINAL_STATES.has(status);
      if (final) forgetGiftKey(safeStorage("local"), safeStorage("session"));
      return { notice: paymentStateNotice(status), final };
    },
    [stripe],
  );

  const give = async () => {
    if (!stripe || !elements || busy) return;
    setBusy(true);
    setOutcome(null);
    try {
      const submitted = (await elements.submit()) as {
        error?: { message?: string };
      };
      if (submitted.error) {
        setOutcome({
          notice: {
            tone: "error",
            text: submitted.error.message ?? CHECKOUT_WORDS.declined,
          },
          final: false,
        });
        return;
      }
      if (!token) {
        setOutcome({
          notice: { tone: "error", text: CHECKOUT_WORDS.challenge },
          final: false,
        });
        return;
      }
      const lines = [targetLine(props.client.link, props.amountCents)];
      const key = await giftKeyFor(
        {
          lines,
          coverFees: props.coverFees,
          isAnonymous: anonymous,
          surface: props.client.surface,
        },
        safeStorage("local"),
      );
      const response = await ownApiFetch("/api/donate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          key,
          mode: props.mode,
          surface: props.client.surface,
          lines,
          coverFees: props.coverFees,
          paymentMethod: "card",
          isAnonymous: anonymous,
          contact: signedIn
            ? { email: props.client.signedInEmail ?? "" }
            : { email, firstName, lastName },
          challengeToken: token,
          ...(props.client.link.sourceSiteId
            ? { sourceSiteId: props.client.link.sourceSiteId }
            : {}),
        }),
      });
      const answer = (await response.json().catch(() => ({}))) as Record<
        string,
        unknown
      >;
      if (!response.ok) {
        const refusal = { status: response.status, ...answer } as IntakeRefusal;
        const held = rememberedPayment(safeStorage("session"));
        const heldOutcome =
          refusal.error === "idempotency_key_reused" && held?.key === key
            ? await readPayment(held.clientSecret)
            : null;
        if (heldOutcome) {
          setOutcome(heldOutcome);
          return;
        }
        if (
          refusal.error === "idempotency_key_reused" ||
          refusal.error === "gift_closed"
        )
          safeStorage("local")?.removeItem(GIFT_KEY_STORAGE);
        if (
          [400, 429, 503].includes(response.status) ||
          refusal.error === "gift_closed"
        )
          freshChallenge();
        setOutcome({
          notice: {
            tone:
              refusal.error === "gift_already_completed" ? "success" : "error",
            text: intakeRefusalWords(refusal),
          },
          final: refusal.error === "gift_already_completed",
          signIn: response.status === 401,
        });
        return;
      }
      const clientSecret = String(answer.clientSecret);
      rememberPayment(safeStorage("session"), {
        key,
        clientSecret,
        account: props.config.account,
        publishableKey: props.config.publishableKey,
      });
      const name = signedIn ? "" : `${firstName} ${lastName}`.trim();
      const confirmed = (await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: window.location.href,
          payment_method_data: {
            billing_details: signedIn
              ? { email: props.client.signedInEmail ?? undefined }
              : { email, name },
          },
        },
        redirect: "if_required",
      })) as {
        error?: { type?: string; code?: string; message?: string };
        paymentIntent?: { status: string };
      };
      if (confirmed.error) {
        const code = confirmed.error.code ?? "";
        setOutcome({
          notice: {
            tone: "error",
            text:
              confirmed.error.type === "card_error" ||
              confirmed.error.type === "validation_error"
                ? CHECKOUT_WORDS.declined
                : code === "payment_intent_authentication_failure"
                  ? CHECKOUT_WORDS.cancelled
                  : CHECKOUT_WORDS.lostConnection,
          },
          final: false,
        });
        return;
      }
      const status = confirmed.paymentIntent?.status ?? "processing";
      if (FINAL_STATES.has(status))
        forgetGiftKey(safeStorage("local"), safeStorage("session"));
      setOutcome({
        notice: paymentStateNotice(status),
        final: FINAL_STATES.has(status),
      });
    } catch {
      setOutcome({
        notice: { tone: "error", text: CHECKOUT_WORDS.lostConnection },
        final: false,
      });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (heldChecked.current || !stripe) return;
    heldChecked.current = true;
    const held = rememberedPayment(safeStorage("session"));
    const shared = safeStorage("local")?.getItem(GIFT_KEY_STORAGE);
    if (!held || !shared || !shared.includes(held.key)) return;
    void readPayment(held.clientSecret).then(
      (heldOutcome) => heldOutcome && setOutcome(heldOutcome),
    );
  }, [stripe, readPayment]);

  if (outcome?.final) {
    return (
      <div className="flex flex-col gap-4">
        <Alert role="status">
          <AlertDescription>{outcome.notice.text}</AlertDescription>
        </Alert>
        {outcome.notice.tone === "success" ? (
          <p className="text-sm text-muted-foreground">
            {CHECKOUT_WORDS.claimOffer}
          </p>
        ) : null}
        {props.config.wayBackHost ? (
          <a
            className="text-sm underline"
            href={`https://${props.config.wayBackHost}`}
            rel="noreferrer"
          >
            Back to {props.config.wayBackHost}
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        void give();
      }}
    >
      {signedIn ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm">Giving as {props.client.signedInEmail}</p>
          <Button
            type="button"
            variant="link"
            className="self-start"
            onClick={props.onGuest}
          >
            Give as a guest instead
          </Button>
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
          wallets: { applePay: "never", googlePay: "never" },
          fields: { billingDetails: { name: "never", email: "never" } },
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
      {outcome ? (
        <Alert
          variant={outcome.notice.tone === "error" ? "destructive" : "default"}
          role="alert"
        >
          <AlertDescription>{outcome.notice.text}</AlertDescription>
          {outcome.signIn ? (
            <div className="mt-3 flex flex-wrap gap-3">
              <a className="text-sm underline" href={loginHref()}>
                Sign in again
              </a>
              <Button type="button" variant="link" onClick={props.onGuest}>
                Give as a guest instead
              </Button>
            </div>
          ) : null}
        </Alert>
      ) : null}
      <Button
        type="submit"
        disabled={busy || !stripe || !elements}
        aria-busy={busy}
      >
        Give {formatCurrency(total / 100)}
      </Button>
    </form>
  );
}

export function CheckoutPageClient(props: CheckoutPageClientProps) {
  const { link } = props;
  const [onceChosen, setOnceChosen] = useState(!link.monthly);
  const [amountCents, setAmountCents] = useState(link.amountCents ?? 2500);
  const [coverFees, setCoverFees] = useState(false);
  const [config, setConfig] = useState<Config>({
    state: link.target ? "loading" : "idle",
  });
  const [email, setEmail] = useState<string | null>(
    props.signedInEmail ?? null,
  );
  const [mode, setMode] = useState<"guest" | "signed_in">(
    props.signedInEmail && (props.isHome || props.surface === "donor_account")
      ? "signed_in"
      : "guest",
  );

  useEffect(() => {
    if (
      props.signedInEmail !== undefined ||
      !(props.isHome || props.surface === "donor_account")
    )
      return;
    let active = true;
    void createBrowserClient()
      .auth.getUser()
      .then(({ data }) => {
        if (!active || !data.user?.email) return;
        setEmail(data.user.email);
        setMode("signed_in");
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [props.signedInEmail, props.isHome, props.surface]);

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
        ...(link.sourceSiteId ? { sourceSiteId: link.sourceSiteId } : {}),
      }),
    })
      .then(async (response) => {
        const body = (await response.json().catch(() => ({}))) as Record<
          string,
          unknown
        >;
        if (!active) return;
        setConfig(
          response.ok &&
            typeof body.publishableKey === "string" &&
            typeof body.connectedAccountId === "string"
            ? {
                state: "ready",
                publishableKey: body.publishableKey,
                account: body.connectedAccountId,
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
  }, [link.target, link.sourceSiteId, props.surface]);

  const stripePromise = useMemo<Promise<Stripe | null> | null>(
    () =>
      config.state === "ready"
        ? loadStripe(config.publishableKey, { stripeAccount: config.account })
        : null,
    [config],
  );

  const total = amountCents + feeCents(amountCents, coverFees);
  const accountOnly = props.surface === "donor_account";

  return (
    <main className="min-h-dvh bg-background pb-24 pt-24 font-sans">
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
                  value={(amountCents / 100).toFixed(2)}
                  onChange={(event) => {
                    const cents = Math.round(Number(event.target.value) * 100);
                    if (Number.isFinite(cents) && cents >= 0)
                      setAmountCents(cents);
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
              props.homeHost &&
              link.target ? (
                <a
                  className="self-start text-sm underline"
                  href={handOffHref({
                    homeHost: props.homeHost,
                    target: link.target,
                    amountCents,
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
                    {CHECKOUT_WORDS.configUnavailable}
                  </AlertDescription>
                </Alert>
              ) : accountOnly && mode !== "signed_in" ? (
                <Link
                  className="self-start text-sm underline"
                  href="/login?next=%2Fcheckout"
                >
                  Sign in to give from your account
                </Link>
              ) : config.state === "ready" &&
                stripePromise &&
                amountCents > 0 ? (
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
                    amountCents={amountCents}
                    coverFees={coverFees}
                    mode={mode}
                    onGuest={() => setMode("guest")}
                  />
                </Elements>
              ) : null}
            </>
          )}
        </Card>
      </div>
    </main>
  );
}

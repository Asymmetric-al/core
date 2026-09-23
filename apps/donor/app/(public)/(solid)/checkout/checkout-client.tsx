"use client";

import { motion, AnimatePresence } from "@asym/lib/motion";
import {
  isGeneralCheckoutAlias,
  resolveCheckoutFundId,
} from "@asym/lib/payments/checkout-designations";
import { formatCurrency } from "@asym/lib/utils";
import { Alert, AlertDescription } from "@asym/ui/components/shadcn/alert";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@asym/ui/components/shadcn/input-group";
import { Label } from "@asym/ui/components/shadcn/label";
import { Separator } from "@asym/ui/components/shadcn/separator";
import { Switch } from "@asym/ui/components/shadcn/switch";
import { cn } from "@asym/ui/lib/utils";
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import {
  loadStripe,
  type Stripe,
  type StripeCardElement,
  type StripeElements,
} from "@stripe/stripe-js";
import {
  Check,
  Lock,
  ArrowRight,
  Heart,
  Loader2,
  Landmark,
  Wallet,
  Zap,
  Activity,
  Shield,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";

import {
  buildCheckoutRequestFingerprint,
  buildDonateRequestBody,
  interpretDonateResponse,
  isDonationInitialized,
  isStripeFinalCheckoutSuccess,
  normalizeCheckoutFrequency,
  quoteGuestGivingCheckoutFees,
  resolveCheckoutIdempotencyKey,
  resolveCheckoutMode,
  type CheckoutMode,
  type CheckoutFrequency,
  type CheckoutPaymentMethod,
  type ServerDonation,
} from "./checkout-donation";

import { getFieldWorkerById } from "@/lib/mock-data";

type Step = "config" | "details" | "payment" | "success";
type Frequency = CheckoutFrequency;
type PaymentMethod = CheckoutPaymentMethod;
type SearchParamInput = string | string[] | undefined;
type CheckoutPageSearchParams = {
  amount?: SearchParamInput;
  frequency?: SearchParamInput;
  fund?: SearchParamInput;
  fund_id?: SearchParamInput;
  missionary?: SearchParamInput;
  missionary_id?: SearchParamInput;
  workerId?: SearchParamInput;
};
type CheckoutSearchParams = {
  amount: string | null;
  frequency: Frequency | null;
  fundId: string | null;
  fundLabel: string | null;
  missionaryId: string | null;
  workerId: string | null;
};
type DonorInfo = {
  email: string;
  firstName: string;
  lastName: string;
};
type CheckoutState = {
  amount: number;
  coverFees: boolean;
  customAmount: string;
  donation: ServerDonation | null;
  donorInfo: DonorInfo;
  endDate: string;
  error: string | null;
  frequency: Frequency;
  hasEndDate: boolean;
  idempotencyFingerprint: string | null;
  idempotencyKey: string | null;
  isProcessing: boolean;
  paymentMethod: PaymentMethod;
  postalCode: string;
  startDate: string;
  step: Step;
  successSnapshot: PaymentSuccessSnapshot | null;
};
type CheckoutStripeOverride = {
  cardElement?: React.ReactNode;
  elements: StripeElements | null;
  mode: CheckoutMode;
  publishableKey?: string | null;
  stripe: Stripe | null;
};
type CheckoutRuntimeConfig =
  | {
      error: null;
      publishableKey: string | null;
      status: "ready";
      stripePromise: Promise<Stripe | null> | null;
    }
  | {
      error: string | null;
      publishableKey: null;
      status: "loading" | "error";
      stripePromise: null;
    };
type PaymentAttempt = {
  fingerprint: string;
  id: number;
  successSnapshot: PaymentSuccessSnapshot;
};
type PaymentSuccessSnapshot = Readonly<{
  donorInfo: Readonly<DonorInfo>;
  total: number;
  workerTitle: string;
}>;

const PRESET_AMOUNTS = [50, 100, 250, 500];
const PAYMENT_PROCESSING_MESSAGE =
  "Your contribution is still processing — we'll email your receipt once it's confirmed.";
const CHECKOUT_CONFIGURATION_ERROR =
  "Checkout configuration is incomplete. Please contact support before completing this contribution.";

const resolveSuccessWorkerTitle = (
  worker: { title?: string } | null | undefined,
): string => worker?.title || "our global mission";

const createPaymentSuccessSnapshot = ({
  donorInfo,
  total,
  workerTitle,
}: {
  donorInfo: DonorInfo;
  total: number;
  workerTitle: string;
}): PaymentSuccessSnapshot => ({
  donorInfo: {
    email: donorInfo.email,
    firstName: donorInfo.firstName,
    lastName: donorInfo.lastName,
  },
  total,
  workerTitle,
});

const readSearchParam = (value: SearchParamInput): string | null => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? null;
  return null;
};

const readDesignationSearchParam = (value: SearchParamInput): string | null => {
  const rawValue = readSearchParam(value);
  if (!rawValue) return null;

  const trimmedValue = rawValue.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
};

const normalizePublishableKey = (
  value: string | null | undefined,
): string | null => {
  if (typeof value !== "string") return null;
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
};

const readRuntimePublishableKey = (body: unknown): string | null => {
  if (!body || typeof body !== "object") return null;
  const value = (body as Record<string, unknown>).publishableKey;
  return typeof value === "string" ? normalizePublishableKey(value) : null;
};

const createReadyRuntimeConfig = (
  publishableKey: string | null | undefined,
): CheckoutRuntimeConfig => {
  const normalizedPublishableKey = normalizePublishableKey(publishableKey);

  return {
    error: null,
    publishableKey: normalizedPublishableKey,
    status: "ready",
    stripePromise: normalizedPublishableKey
      ? loadStripe(normalizedPublishableKey)
      : null,
  };
};

const createRuntimeConfigError = (
  message = CHECKOUT_CONFIGURATION_ERROR,
): CheckoutRuntimeConfig => ({
  error: message,
  publishableKey: null,
  status: "error",
  stripePromise: null,
});

const createRuntimeConfigFromPublishableKey = (
  publishableKey: string | null | undefined,
): CheckoutRuntimeConfig => {
  const normalizedPublishableKey = normalizePublishableKey(publishableKey);
  return normalizedPublishableKey
    ? createReadyRuntimeConfig(normalizedPublishableKey)
    : createRuntimeConfigError();
};

const readCheckoutFrequency = (value: SearchParamInput): Frequency | null => {
  return normalizeCheckoutFrequency(readSearchParam(value));
};

const normalizeCheckoutSearchParams = (
  searchParams: CheckoutPageSearchParams,
): CheckoutSearchParams => {
  const fundAlias = readDesignationSearchParam(searchParams.fund);
  const rawFundId = readDesignationSearchParam(searchParams.fund_id);
  const rawMissionaryId =
    readDesignationSearchParam(searchParams.missionary_id) ??
    readDesignationSearchParam(searchParams.missionary);

  return {
    amount: readSearchParam(searchParams.amount),
    frequency: readCheckoutFrequency(searchParams.frequency),
    fundId:
      resolveCheckoutFundId(rawFundId) ?? resolveCheckoutFundId(fundAlias),
    fundLabel: fundAlias,
    missionaryId: rawMissionaryId,
    workerId: readSearchParam(searchParams.workerId),
  };
};

interface SummaryCardProps {
  worker: { title?: string; image?: string } | null;
  amount: number;
  frequency: Frequency;
  coverFees: boolean;
  fees: number;
  total: number;
}

function SummaryCard({
  worker,
  amount,
  frequency,
  coverFees,
  fees,
  total,
}: SummaryCardProps) {
  return (
    <div className="bg-card rounded-3xl border border-border shadow-xl overflow-hidden sticky top-32">
      <div className="p-8 bg-muted/50 border-b border-border">
        <h3 className="text-xs font-semibold text-foreground/80 uppercase tracking-widest mb-6">
          Contribution Summary
        </h3>
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={worker?.image} />
            <AvatarFallback>GH</AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1 wrap-anywhere">
            <p className="text-xs font-semibold text-foreground uppercase tracking-widest">
              Supporting
            </p>
            <p className="text-xl font-semibold text-foreground font-display leading-tight">
              {worker?.title || "General Mission Fund"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Your gift</span>
            <span className="font-semibold text-foreground font-display">
              {formatCurrency(amount)}
            </span>
          </div>

          {coverFees && (
            <div className="flex justify-between items-center text-sm animate-in fade-in slide-in-from-top-2">
              <span className="text-muted-foreground font-medium flex items-center gap-2">
                <Zap className="size-3.5 text-foreground fill-current" /> Cover
                processing fees
              </span>
              <span className="font-semibold text-foreground font-display">
                {formatCurrency(fees)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">Frequency</span>
            <Badge variant="secondary">{frequency}</Badge>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between items-end pt-2">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Amount Due Today
            </span>
            <span className="block text-3xl font-semibold text-foreground font-display tracking-tighter">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      <div className="px-8 py-4 bg-primary flex flex-wrap gap-4 items-center justify-between text-xs font-semibold uppercase tracking-widest text-primary-foreground/80">
        <div className="flex items-center gap-2">
          <Shield className="size-3.5" /> Secure SSL
        </div>
        <div className="flex items-center gap-2">
          <Lock className="size-3.5" /> PCI Compliant
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ currentStep }: { currentStep: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: "config", label: "AMOUNT" },
    { key: "details", label: "DETAILS" },
    { key: "payment", label: "PAYMENT" },
  ];
  const currentIdx = steps.findIndex((s) => s.key === currentStep);

  return (
    <nav
      className="flex items-center justify-center gap-2 sm:gap-4 mb-20"
      aria-label="Checkout progress"
    >
      {steps.map((s, idx) => (
        <div key={s.key} className="flex items-center gap-2 sm:gap-4">
          <div className="flex flex-col items-center gap-2">
            <div
              className={cn(
                "h-1.5 rounded-full transition-colors duration-700 ease-[var(--ease-out-soft)]",
                currentIdx === idx
                  ? "bg-primary w-12"
                  : currentIdx > idx
                    ? "bg-primary w-6"
                    : "bg-muted w-6",
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                "text-xs font-semibold uppercase tracking-widest",
                currentIdx === idx
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {s.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className="h-px w-4 sm:w-8 bg-muted mb-6" aria-hidden="true" />
          )}
        </div>
      ))}
    </nav>
  );
}

function SuccessView({
  donorInfo,
  mode,
  total,
  workerTitle,
}: {
  donorInfo: DonorInfo;
  mode: CheckoutMode;
  total: number;
  workerTitle: string;
}) {
  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden text-center"
      >
        <div className="bg-primary px-6 py-12 sm:px-12 sm:pt-24 sm:pb-32 text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" aria-hidden="true">
            <div className="absolute top-0 right-0 size-64 bg-muted-foreground rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 size-64 bg-muted-foreground rounded-full blur-3xl" />
          </div>

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="size-24 bg-card rounded-4xl flex items-center justify-center mx-auto mb-10 shadow-xl"
          >
            <Check
              className="size-12 text-foreground"
              strokeWidth={3}
              aria-hidden="true"
            />
          </motion.div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold mb-4 font-display tracking-tighter">
            Contribution Confirmed.
          </h1>
          <p className="text-primary-foreground/80 font-semibold text-xs uppercase tracking-widest">
            Thank you for your support
          </p>
        </div>

        <div className="px-6 py-10 sm:px-16 sm:py-20 space-y-12">
          <div className="space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Total Contribution
            </p>
            <p className="text-4xl sm:text-7xl font-semibold text-foreground font-display tracking-tighter tabular-nums wrap-anywhere">
              {formatCurrency(total)}
            </p>
          </div>

          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-light tracking-tight break-words">
            A secure receipt has been sent to{" "}
            <span className="text-foreground font-semibold">
              {donorInfo.email}
            </span>
            . Your gift is being routed to{" "}
            <span className="text-foreground font-semibold">{workerTitle}</span>
            .
          </p>

          {mode === "test" && (
            <div
              role="status"
              className="inline-flex items-center gap-3 rounded-full bg-muted px-6 py-3 text-xs font-semibold uppercase tracking-widest text-foreground dark:bg-muted/10 dark:text-foreground"
            >
              <AlertTriangle className="size-3.5" aria-hidden="true" /> Test
              mode — no card charge collected
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/donor-dashboard"
              className={cn(
                buttonVariants({ variant: "maia", size: "lg" }),
                "sm:flex-1",
              )}
            >
              Enter Dashboard
            </Link>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "maia-outline", size: "lg" }),
                "sm:flex-1",
              )}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ConfigStep({
  amount,
  calculatedFees,
  coverFees,
  customAmount,
  onAmountSelect,
  onCoverFeesChange,
  onCustomAmountChange,
  onNext,
}: {
  amount: number;
  calculatedFees: number;
  coverFees: boolean;
  customAmount: string;
  onAmountSelect: (value: number) => void;
  onCoverFeesChange: (value: boolean) => void;
  onCustomAmountChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
}) {
  return (
    <motion.div
      key="config"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-12"
    >
      <header className="space-y-4">
        <span className="text-xs font-semibold text-foreground uppercase tracking-widest">
          Set Up Support
        </span>
        <h1 className="text-5xl md:text-7xl font-semibold text-foreground font-display tracking-tighter">
          Your Gift.
        </h1>
        <p className="text-2xl text-muted-foreground font-light tracking-tight">
          Configure the amount of your one-time gift.
        </p>
      </header>

      <div className="space-y-8">
        <div className="rounded-4xl border border-border bg-muted p-6">
          <p className="text-xs font-semibold text-foreground/80 uppercase tracking-widest">
            Contribution Frequency
          </p>
          <p className="mt-2 font-semibold text-foreground font-display">
            One-time gift
          </p>
        </div>

        <fieldset className="space-y-6">
          <legend className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Support Amount
          </legend>
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            role="radiogroup"
          >
            {PRESET_AMOUNTS.map((val) => (
              <button
                key={val}
                onClick={() => onAmountSelect(val)}
                role="radio"
                aria-checked={amount === val && !customAmount}
                className={cn(
                  "h-24 rounded-2xl border-2 font-semibold font-display text-2xl press-feedback",
                  amount === val && !customAmount
                    ? "border-primary bg-primary text-primary-foreground shadow-2xl ring-4 ring-ring/15"
                    : "border-border bg-muted text-foreground hover:border-border hover:bg-accent",
                )}
              >
                ${val}
              </button>
            ))}
          </div>

          <div className="mt-8">
            <Label className="sr-only" htmlFor="custom-amount">
              Custom amount
            </Label>
            <InputGroup>
              <InputGroupAddon aria-hidden="true">$</InputGroupAddon>
              <InputGroupInput
                id="custom-amount"
                type="text"
                inputMode="decimal"
                placeholder="Other Amount"
                value={customAmount}
                onChange={onCustomAmountChange}
              />
            </InputGroup>
          </div>
        </fieldset>

        <Field orientation="horizontal">
          <div
            className={cn(
              "size-14 shrink-0 rounded-2xl flex items-center justify-center transition-colors",
              coverFees ? "bg-primary/10" : "bg-muted",
            )}
          >
            <Heart
              className={cn(
                "size-6",
                coverFees
                  ? "text-primary fill-current"
                  : "text-muted-foreground",
              )}
              aria-hidden="true"
            />
          </div>
          <FieldLabel htmlFor="cover-processing-fees" className="grow">
            <FieldContent>
              <FieldTitle>Cover Processing Fees</FieldTitle>
              <FieldDescription className="mt-1 text-xs leading-relaxed">
                Add <strong>{formatCurrency(calculatedFees)}</strong> to help
                cover estimated processing costs.
              </FieldDescription>
            </FieldContent>
          </FieldLabel>
          <Switch
            id="cover-processing-fees"
            role="switch"
            aria-label="Cover processing fees"
            checked={coverFees}
            onCheckedChange={onCoverFeesChange}
          />
        </Field>
      </div>

      <Button
        variant="maia"
        onClick={onNext}
        disabled={amount <= 0}
        size="lg"
        className="w-full"
      >
        Next Step <ArrowRight data-icon="inline-end" aria-hidden="true" />
      </Button>
    </motion.div>
  );
}

function DetailsStep({
  donorInfo,
  onBack,
  onDonorInfoChange,
  onNext,
}: {
  donorInfo: DonorInfo;
  onBack: () => void;
  onDonorInfoChange: (patch: Partial<DonorInfo>) => void;
  onNext: () => void;
}) {
  return (
    <motion.div
      key="details"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-12"
    >
      <header className="space-y-4">
        <span className="text-xs font-semibold text-foreground uppercase tracking-widest">
          Donor Information
        </span>
        <h1 className="text-5xl md:text-7xl font-semibold text-foreground font-display tracking-tighter">
          Your Details.
        </h1>
        <p className="text-2xl text-muted-foreground font-light tracking-tight">
          Information for tax receipts and donation tracking.
        </p>
      </header>

      <div className="bg-muted p-6 sm:p-12 rounded-3xl border border-border space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <Label htmlFor="first-name">First Name</Label>
            <Input
              id="first-name"
              value={donorInfo.firstName}
              onChange={(e) => onDonorInfoChange({ firstName: e.target.value })}
              placeholder="Jane"
              autoComplete="given-name"
            />
          </div>
          <div className="space-y-4">
            <Label htmlFor="last-name">Last Name</Label>
            <Input
              id="last-name"
              value={donorInfo.lastName}
              onChange={(e) => onDonorInfoChange({ lastName: e.target.value })}
              placeholder="Doe"
              autoComplete="family-name"
            />
          </div>
        </div>
        <div className="space-y-4">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={donorInfo.email}
            onChange={(e) => onDonorInfoChange({ email: e.target.value })}
            placeholder="jane.doe@example.com"
            autoComplete="email"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <Button variant="outline" onClick={onBack} size="lg">
          Back
        </Button>
        <Button
          variant="maia"
          onClick={onNext}
          disabled={
            !donorInfo.firstName || !donorInfo.lastName || !donorInfo.email
          }
          size="lg"
          className="grow"
        >
          Continue to Payment
        </Button>
      </div>
    </motion.div>
  );
}

function PaymentStep({
  cardElement,
  elements,
  error,
  isProcessing,
  mode,
  onBack,
  onConfirmPayment,
  onPaymentMethodChange,
  onPostalCodeChange,
  paymentMethod,
  postalCode,
  stripe,
  total,
}: {
  cardElement?: React.ReactNode;
  elements: StripeElements | null;
  error: string | null;
  isProcessing: boolean;
  mode: CheckoutMode;
  onBack: () => void;
  onConfirmPayment: (
    stripe: Stripe | null,
    elements: StripeElements | null,
  ) => void;
  onPaymentMethodChange: (value: PaymentMethod) => void;
  onPostalCodeChange: (value: string) => void;
  paymentMethod: PaymentMethod;
  postalCode: string;
  stripe: Stripe | null;
  total: number;
}) {
  return (
    <motion.div
      key="payment"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-12"
    >
      <header className="space-y-4">
        <span className="text-xs font-semibold text-foreground uppercase tracking-widest">
          Payment Information
        </span>
        <h1 className="text-5xl md:text-7xl font-semibold text-foreground font-display tracking-tighter">
          Secure Payment.
        </h1>
        <p className="text-2xl text-muted-foreground font-light tracking-tight">
          Safely authorize your contribution.
        </p>
      </header>

      <div className="bg-muted p-6 sm:p-12 rounded-3xl border border-border space-y-10">
        <div
          className="grid grid-cols-3 gap-1 p-2 bg-card rounded-2xl border border-border"
          role="tablist"
        >
          <button
            role="tab"
            aria-selected={paymentMethod === "card"}
            disabled={isProcessing}
            onClick={() => {
              if (!isProcessing) onPaymentMethodChange("card");
            }}
            className={cn(
              "min-h-11 min-w-0 whitespace-normal wrap-anywhere px-1 py-2 text-xs font-medium rounded-xl transition-colors press-feedback outline-none focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
              paymentMethod === "card"
                ? "bg-primary text-primary-foreground shadow-xl"
                : "text-muted-foreground",
              isProcessing && "cursor-not-allowed opacity-60",
            )}
          >
            Card
          </button>
          <button
            role="tab"
            aria-selected={paymentMethod === "ach"}
            disabled={isProcessing}
            onClick={() => {
              if (!isProcessing) onPaymentMethodChange("ach");
            }}
            className={cn(
              "min-h-11 min-w-0 whitespace-normal wrap-anywhere px-1 py-2 text-xs font-medium rounded-xl transition-colors press-feedback outline-none focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
              paymentMethod === "ach"
                ? "bg-primary text-primary-foreground shadow-xl"
                : "text-muted-foreground",
              isProcessing && "cursor-not-allowed opacity-60",
            )}
          >
            Bank
          </button>
          <button
            role="tab"
            aria-selected={paymentMethod === "wallet"}
            disabled={isProcessing}
            onClick={() => {
              if (!isProcessing) onPaymentMethodChange("wallet");
            }}
            className={cn(
              "min-h-11 min-w-0 whitespace-normal wrap-anywhere px-1 py-2 text-xs font-medium rounded-xl transition-colors press-feedback outline-none focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
              paymentMethod === "wallet"
                ? "bg-primary text-primary-foreground shadow-xl"
                : "text-muted-foreground",
              isProcessing && "cursor-not-allowed opacity-60",
            )}
          >
            Apple/Google
          </button>
        </div>

        <div className="min-h-75 flex flex-col justify-center" role="tabpanel">
          <AnimatePresence mode="wait">
            {paymentMethod === "card" && (
              <motion.div
                key="card"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="space-y-3" data-testid="stripe-card-panel">
                  <p className="text-xs font-semibold text-foreground/80 uppercase tracking-widest pl-2">
                    Card Details
                  </p>
                  {mode === "live" ? (
                    <div className="bg-card rounded-2xl border border-border p-4 sm:p-8 shadow-sm">
                      {cardElement ?? (
                        <CardElement options={{ hidePostalCode: true }} />
                      )}
                    </div>
                  ) : (
                    <div
                      role="status"
                      className="rounded-4xl border border-dashed border-border bg-card p-8 text-sm font-medium leading-relaxed text-foreground"
                    >
                      Test mode does not collect card details. Configure a
                      Stripe publishable key to mount live Elements.
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" defaultValue="United States" disabled />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="postal-code">Postal Code</Label>
                    <Input
                      id="postal-code"
                      placeholder="12345"
                      autoComplete="postal-code"
                      disabled={isProcessing}
                      inputMode="numeric"
                      onChange={(event) =>
                        onPostalCodeChange(event.target.value)
                      }
                      value={postalCode}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {paymentMethod === "ach" && (
              <motion.div
                key="ach"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-12 text-center"
              >
                <div className="size-24 bg-muted rounded-4xl flex items-center justify-center mx-auto">
                  <Landmark
                    className="size-10 text-foreground"
                    aria-hidden="true"
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold font-display">
                    Instant Bank Link
                  </h3>
                  <p className="text-foreground/80 max-w-sm mx-auto leading-relaxed">
                    Securely connect your bank account via Stripe Financial
                    Connections to maximize your impact with 0% credit card
                    fees.
                  </p>
                </div>
                <Button variant="maia" size="lg">
                  Connect Securely
                </Button>
              </motion.div>
            )}

            {paymentMethod === "wallet" && (
              <motion.div
                key="wallet"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center h-full min-h-75"
              >
                <Button variant="maia" size="lg">
                  <Wallet data-icon="inline-start" aria-hidden="true" /> Pay
                  with Apple Pay
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {mode === "test" && (
        <div
          role="status"
          className="flex items-start gap-4 rounded-3xl border border-border bg-muted p-6 text-left dark:border-border/30 dark:bg-muted/10"
        >
          <AlertTriangle
            className="size-5 shrink-0 text-foreground dark:text-foreground"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-foreground dark:text-foreground">
              Test mode — card capture disabled
            </p>
            <p className="text-sm font-medium leading-relaxed text-foreground/80 dark:text-foreground/80">
              Live card processing needs Stripe credentials that aren&apos;t
              configured yet. Your contribution is recorded server-side; the
              card charge is not collected in this mode.
            </p>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive" aria-live="assertive">
          <AlertTriangle aria-hidden="true" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-6">
        <Button
          variant="maia-outline"
          onClick={onBack}
          disabled={isProcessing}
          size="lg"
        >
          Back
        </Button>
        <Button
          variant="maia"
          onClick={() => onConfirmPayment(stripe, elements)}
          disabled={isProcessing}
          size="lg"
          className="grow"
        >
          {isProcessing ? (
            <Loader2 className="animate-spin" aria-label="Processing payment" />
          ) : (
            `Confirm ${formatCurrency(total)}`
          )}
        </Button>
      </div>
    </motion.div>
  );
}

function StripePaymentStep(
  props: Omit<React.ComponentProps<typeof PaymentStep>, "elements" | "stripe">,
) {
  const stripe = useStripe();
  const elements = useElements();

  return <PaymentStep {...props} elements={elements} stripe={stripe} />;
}

function CheckoutConfigurationState({
  message,
  title,
}: {
  message: string;
  title: string;
}) {
  return (
    <div
      role="status"
      className="flex min-h-90 flex-col items-center justify-center gap-6 rounded-3xl border border-border bg-muted p-12 text-center"
    >
      <Loader2
        className="size-8 animate-spin text-muted-foreground"
        aria-hidden="true"
      />
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-semibold text-foreground">
          {title}
        </h2>
        <p className="max-w-md text-sm font-medium leading-relaxed text-foreground/80">
          {message}
        </p>
      </div>
    </div>
  );
}

function CheckoutConfigurationError({ message }: { message: string | null }) {
  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <span className="text-xs font-semibold text-foreground uppercase tracking-widest">
          Payment Information
        </span>
        <h1 className="text-5xl md:text-7xl font-semibold text-foreground font-display tracking-tighter">
          Secure Payment.
        </h1>
        <p className="text-2xl text-muted-foreground font-light tracking-tight">
          Safely authorize your contribution.
        </p>
      </header>

      <Alert variant="destructive">
        <AlertTriangle aria-hidden="true" />
        <AlertDescription>
          {message ??
            "Checkout configuration could not be loaded. Please refresh and try again."}
        </AlertDescription>
      </Alert>
    </div>
  );
}

function CheckoutContent({
  searchParams,
  stripeOverride,
}: {
  searchParams: CheckoutSearchParams;
  stripeOverride?: CheckoutStripeOverride;
}) {
  const workerId = searchParams.workerId;
  const missionaryId = searchParams.missionaryId;
  const initialAmount = searchParams.amount;
  const worker = workerId ? getFieldWorkerById(workerId) : null;
  const fundId = searchParams.fundId;
  const hasGeneralGivingTarget = isGeneralCheckoutAlias(searchParams.fundLabel);
  const hasGivingTarget = Boolean(
    missionaryId || fundId || hasGeneralGivingTarget,
  );
  const [runtimeConfig, setRuntimeConfig] = useState<CheckoutRuntimeConfig>(
    () =>
      stripeOverride
        ? createReadyRuntimeConfig(stripeOverride.publishableKey)
        : {
            error: null,
            publishableKey: null,
            status: "loading",
            stripePromise: null,
          },
  );
  const [checkoutState, setCheckoutState] = useState<CheckoutState>(() => ({
    amount: initialAmount ? Number(initialAmount) : 100,
    coverFees: false,
    customAmount: "",
    donation: null,
    donorInfo: {
      email: "",
      firstName: "",
      lastName: "",
    },
    endDate: "",
    error: null,
    frequency: "one-time",
    hasEndDate: false,
    idempotencyFingerprint: null,
    idempotencyKey: null,
    isProcessing: false,
    paymentMethod: "card",
    postalCode: "",
    startDate: "",
    step: "config",
    successSnapshot: null,
  }));
  const {
    amount,
    coverFees,
    customAmount,
    donation,
    donorInfo,
    endDate,
    error,
    frequency,
    hasEndDate,
    isProcessing,
    paymentMethod,
    postalCode,
    startDate,
    step,
    successSnapshot,
  } = checkoutState;
  const checkoutStateRef = useRef(checkoutState);
  const activePaymentAttemptRef = useRef<PaymentAttempt | null>(null);
  const paymentAttemptIdRef = useRef(0);
  const runtimeConfigAbortRef = useRef<AbortController | null>(null);
  const runtimeConfigRequestedRef = useRef(false);
  const setStep = (value: Step) =>
    setCheckoutState((prev) => ({ ...prev, step: value }));
  const setAmount = (value: number) =>
    setCheckoutState((prev) => ({ ...prev, amount: value }));
  const setCustomAmount = (value: string) =>
    setCheckoutState((prev) => ({ ...prev, customAmount: value }));
  const setCoverFees = (value: boolean) =>
    setCheckoutState((prev) => ({ ...prev, coverFees: value }));
  const setPaymentMethod = (value: PaymentMethod) =>
    setCheckoutState((prev) =>
      prev.isProcessing ? prev : { ...prev, paymentMethod: value },
    );
  const setDonorInfo = (value: DonorInfo) =>
    setCheckoutState((prev) => ({ ...prev, donorInfo: value }));
  const setPostalCode = (value: string) =>
    setCheckoutState((prev) => ({ ...prev, postalCode: value }));

  const feeQuote = useMemo(
    () =>
      quoteGuestGivingCheckoutFees({
        giftAmount: amount,
        coverFees,
        paymentMethod,
      }),
    [amount, coverFees, paymentMethod],
  );
  const calculatedFees = feeQuote.coverAmount;
  const total = feeQuote.chargedAmount;
  const mountedPublishableKey = stripeOverride
    ? normalizePublishableKey(stripeOverride.publishableKey)
    : runtimeConfig.status === "ready"
      ? runtimeConfig.publishableKey
      : null;
  const checkoutMode =
    stripeOverride?.mode ?? resolveCheckoutMode(mountedPublishableKey);
  const mountedPublishableKeyRef = useRef(mountedPublishableKey);
  mountedPublishableKeyRef.current = mountedPublishableKey;
  const currentRequestFingerprint = useMemo(
    () =>
      buildCheckoutRequestFingerprint({
        amount,
        coverFees,
        currency: "usd",
        donorEmail: donorInfo.email,
        donorFirstName: donorInfo.firstName,
        donorLastName: donorInfo.lastName,
        endDate: hasEndDate ? endDate : "",
        frequency,
        fundId,
        missionaryId,
        paymentMethod,
        postalCode,
        startDate,
      }),
    [
      amount,
      coverFees,
      donorInfo.email,
      donorInfo.firstName,
      donorInfo.lastName,
      endDate,
      frequency,
      fundId,
      hasEndDate,
      missionaryId,
      paymentMethod,
      postalCode,
      startDate,
    ],
  );
  const currentRequestFingerprintRef = useRef(currentRequestFingerprint);

  const loadCheckoutRuntimeConfig = () => {
    if (stripeOverride) {
      setRuntimeConfig(createReadyRuntimeConfig(stripeOverride.publishableKey));
      return;
    }

    if (
      runtimeConfigRequestedRef.current &&
      runtimeConfig.status === "loading"
    ) {
      return;
    }

    runtimeConfigRequestedRef.current = true;
    runtimeConfigAbortRef.current?.abort();
    const abortController = new AbortController();
    runtimeConfigAbortRef.current = abortController;

    setRuntimeConfig({
      error: null,
      publishableKey: null,
      status: "loading",
      stripePromise: null,
    });

    const loadRuntimeConfig = async () => {
      try {
        const response = await fetch("/api/donate", {
          method: "GET",
          signal: abortController.signal,
        });
        const payload = await response.json().catch(() => null);

        if (abortController.signal.aborted) {
          return;
        }

        if (!response.ok) {
          const message =
            payload && typeof payload === "object"
              ? (payload as Record<string, unknown>).error
              : null;
          setRuntimeConfig({
            error:
              typeof message === "string"
                ? message
                : "Checkout configuration could not be loaded. Please try again.",
            publishableKey: null,
            status: "error",
            stripePromise: null,
          });
          return;
        }

        setRuntimeConfig(
          createRuntimeConfigFromPublishableKey(
            readRuntimePublishableKey(payload),
          ),
        );
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setRuntimeConfig({
          error:
            "Checkout configuration could not be loaded. Please refresh and try again.",
          publishableKey: null,
          status: "error",
          stripePromise: null,
        });
      }
    };

    void loadRuntimeConfig();
  };

  useEffect(() => {
    loadCheckoutRuntimeConfig();

    return () => {
      // The aborted request leaves `runtimeConfig` stuck on "loading"; clear
      // the request flag so a re-run of this effect (StrictMode/Activity
      // remounts) can start a fresh fetch instead of deadlocking on the
      // in-flight guard.
      runtimeConfigRequestedRef.current = false;
      runtimeConfigAbortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO(checkout-runtime-config): Runtime config is keyed by the override object or tenant fetch, not by transient checkout state.
  }, [stripeOverride]);

  useEffect(() => {
    checkoutStateRef.current = checkoutState;
    currentRequestFingerprintRef.current = currentRequestFingerprint;
  }, [checkoutState, currentRequestFingerprint]);

  const isPaymentAttemptActive = (attempt: PaymentAttempt) => {
    const activeAttempt = activePaymentAttemptRef.current;

    return (
      activeAttempt?.id === attempt.id &&
      activeAttempt.fingerprint === attempt.fingerprint &&
      currentRequestFingerprintRef.current === attempt.fingerprint
    );
  };

  const isOriginalPaymentAttemptActive = (attempt: PaymentAttempt) => {
    const activeAttempt = activePaymentAttemptRef.current;

    return (
      activeAttempt?.id === attempt.id &&
      activeAttempt.fingerprint === attempt.fingerprint
    );
  };

  const isPaymentAttemptStateActive = (
    attempt: PaymentAttempt,
    state: CheckoutState,
  ) =>
    state.idempotencyFingerprint === attempt.fingerprint &&
    state.step === "payment";

  const isOriginalPaymentAttemptStateActive = (
    attempt: PaymentAttempt,
    state: CheckoutState,
  ) =>
    isOriginalPaymentAttemptActive(attempt) &&
    state.idempotencyFingerprint === attempt.fingerprint &&
    state.step === "payment";

  const commitPaymentAttemptState = (
    attempt: PaymentAttempt,
    updater: (prev: CheckoutState) => CheckoutState,
  ) => {
    if (!isPaymentAttemptActive(attempt)) {
      return false;
    }

    setCheckoutState((prev) => {
      if (!isPaymentAttemptStateActive(attempt, prev)) {
        return prev;
      }

      const next = updater(prev);
      checkoutStateRef.current = next;
      return next;
    });

    return true;
  };

  const commitSuccessfulOriginalPaymentAttempt = (
    attempt: PaymentAttempt,
    donation: ServerDonation,
  ) => {
    if (
      !isOriginalPaymentAttemptStateActive(attempt, checkoutStateRef.current)
    ) {
      return false;
    }

    setCheckoutState((prev) => {
      if (!isOriginalPaymentAttemptStateActive(attempt, prev)) {
        return prev;
      }

      const next = {
        ...prev,
        donation,
        error: null,
        isProcessing: false,
        step: "success" as const,
        successSnapshot: attempt.successSnapshot,
      };
      activePaymentAttemptRef.current = null;
      checkoutStateRef.current = next;
      return next;
    });

    return true;
  };

  const exitStalePaymentAttempt = (attempt: PaymentAttempt) => {
    setCheckoutState((prev) => {
      const activeAttempt = activePaymentAttemptRef.current;

      if (
        activeAttempt?.id !== attempt.id ||
        activeAttempt.fingerprint !== attempt.fingerprint
      ) {
        return prev;
      }

      const next = {
        ...prev,
        donation: null,
        error:
          "Checkout details changed while payment was processing. Please review your details and try again.",
        isProcessing: false,
        step: "payment" as const,
        successSnapshot: null,
      };

      activePaymentAttemptRef.current = null;
      checkoutStateRef.current = next;
      return next;
    });
  };

  const handleAmountSelect = (val: number) => {
    setAmount(val);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
      setCustomAmount(val);
      if (val && !isNaN(parseFloat(val))) {
        setAmount(parseFloat(val));
      } else if (val === "") {
        setAmount(0);
      }
    }
  };

  const handleNext = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (step === "config") setStep("details");
    else if (step === "details") {
      loadCheckoutRuntimeConfig();
      setStep("payment");
    }
  };

  const handleBack = () => {
    if (isProcessing) {
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    if (step === "details") setStep("config");
    else if (step === "payment") setStep("details");
  };

  const handlePayment = async (
    stripe: Stripe | null,
    elements: StripeElements | null,
  ) => {
    if (!hasGivingTarget) {
      setCheckoutState((prev) => ({
        ...prev,
        error:
          "This checkout link does not include a valid giving target. Please return to the missionary directory and try again.",
      }));
      return;
    }

    if (paymentMethod !== "card") {
      setCheckoutState((prev) => ({
        ...prev,
        error:
          "Card payments are the only checkout method currently available. Bank and wallet checkout need a live Stripe flow before they can be used.",
      }));
      return;
    }

    if (
      !stripeOverride &&
      (checkoutMode === "test" || !mountedPublishableKey)
    ) {
      setRuntimeConfig(createRuntimeConfigError());
      setCheckoutState((prev) => ({
        ...prev,
        donation: null,
        error: CHECKOUT_CONFIGURATION_ERROR,
        isProcessing: false,
        step: "payment",
        successSnapshot: null,
      }));
      return;
    }

    const requestFingerprint = currentRequestFingerprint;
    const attemptSuccessSnapshot = createPaymentSuccessSnapshot({
      donorInfo,
      total,
      workerTitle: resolveSuccessWorkerTitle(worker),
    });
    const paymentAttempt = {
      fingerprint: requestFingerprint,
      id: paymentAttemptIdRef.current + 1,
      successSnapshot: attemptSuccessSnapshot,
    };
    paymentAttemptIdRef.current = paymentAttempt.id;
    activePaymentAttemptRef.current = paymentAttempt;
    const { idempotencyKey, isNewKey } = resolveCheckoutIdempotencyKey({
      currentFingerprint: requestFingerprint,
      existingFingerprint: checkoutState.idempotencyFingerprint,
      existingKey: checkoutState.idempotencyKey,
      generateKey: () => crypto.randomUUID(),
    });

    currentRequestFingerprintRef.current = requestFingerprint;
    checkoutStateRef.current = {
      ...checkoutStateRef.current,
      donation: isNewKey ? null : checkoutStateRef.current.donation,
      error: null,
      idempotencyFingerprint: requestFingerprint,
      idempotencyKey,
      isProcessing: true,
      step: "payment",
      successSnapshot: null,
    };
    setCheckoutState((prev) => ({
      ...prev,
      donation: isNewKey ? null : prev.donation,
      error: null,
      idempotencyFingerprint: requestFingerprint,
      idempotencyKey,
      isProcessing: true,
      step: "payment",
      successSnapshot: null,
    }));

    try {
      const body = buildDonateRequestBody({
        amount,
        currency: "usd",
        coverFees,
        paymentMethod,
        missionaryId,
        fundId,
      });

      const response = await fetch("/api/donate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(body),
      });

      if (!isPaymentAttemptActive(paymentAttempt)) {
        exitStalePaymentAttempt(paymentAttempt);
        return;
      }

      const payload = await response.json().catch(() => null);

      if (!isPaymentAttemptActive(paymentAttempt)) {
        exitStalePaymentAttempt(paymentAttempt);
        return;
      }

      const result = interpretDonateResponse(response.status, payload);

      if (isDonationInitialized(result)) {
        const trimmedPostalCode = postalCode.trim();
        const returnedPublishableKey = normalizePublishableKey(
          result.donation.publishableKey,
        );
        const currentMountedPublishableKey = mountedPublishableKeyRef.current;

        if (returnedPublishableKey !== currentMountedPublishableKey) {
          if (!stripeOverride) {
            setRuntimeConfig(
              returnedPublishableKey
                ? createReadyRuntimeConfig(returnedPublishableKey)
                : createRuntimeConfigError(),
            );
          }

          const didCommit = commitPaymentAttemptState(
            paymentAttempt,
            (prev) => ({
              ...prev,
              donation: null,
              error:
                "Checkout configuration changed while payment was preparing. Please try again.",
              isProcessing: false,
            }),
          );
          if (didCommit) activePaymentAttemptRef.current = null;
          return;
        }

        if (checkoutMode === "test") {
          const didCommit = commitPaymentAttemptState(
            paymentAttempt,
            (prev) => ({
              ...prev,
              donation: result.donation,
              error: null,
              isProcessing: false,
              step: "success",
              successSnapshot: paymentAttempt.successSnapshot,
            }),
          );
          if (didCommit) window.scrollTo(0, 0);
          return;
        }

        if (!result.donation.clientSecret) {
          commitPaymentAttemptState(paymentAttempt, (prev) => ({
            ...prev,
            donation: null,
            error:
              "Payment was initialized, but Stripe did not return a client secret. Please try again.",
            isProcessing: false,
          }));
          return;
        }

        if (!stripe || !elements) {
          commitPaymentAttemptState(paymentAttempt, (prev) => ({
            ...prev,
            donation: null,
            error:
              "Stripe is still initializing. Please wait a moment and try again.",
            isProcessing: false,
          }));
          return;
        }

        const cardElement = elements.getElement(
          CardElement,
        ) as StripeCardElement | null;
        if (!cardElement) {
          commitPaymentAttemptState(paymentAttempt, (prev) => ({
            ...prev,
            donation: null,
            error:
              "Card details are not ready yet. Please check the card form and try again.",
            isProcessing: false,
          }));
          return;
        }

        const billingDetails = {
          ...(trimmedPostalCode
            ? {
                address: {
                  postal_code: trimmedPostalCode,
                },
              }
            : {}),
          email: donorInfo.email,
          name: `${donorInfo.firstName} ${donorInfo.lastName}`.trim(),
        };

        const confirmation = await stripe.confirmCardPayment(
          result.donation.clientSecret,
          {
            payment_method: {
              card: cardElement,
              billing_details: billingDetails,
            },
          },
        );

        if (confirmation.error) {
          if (!isPaymentAttemptActive(paymentAttempt)) {
            exitStalePaymentAttempt(paymentAttempt);
            return;
          }

          commitPaymentAttemptState(paymentAttempt, (prev) => ({
            ...prev,
            donation: null,
            error:
              confirmation.error.message ??
              "Stripe could not confirm this card payment. Please check your card details and try again.",
            isProcessing: false,
          }));
          return;
        }

        if (confirmation.paymentIntent?.status === "processing") {
          if (!isPaymentAttemptActive(paymentAttempt)) {
            exitStalePaymentAttempt(paymentAttempt);
            return;
          }

          commitPaymentAttemptState(paymentAttempt, (prev) => ({
            ...prev,
            donation: null,
            error: PAYMENT_PROCESSING_MESSAGE,
            isProcessing: false,
          }));
          return;
        }

        if (!isStripeFinalCheckoutSuccess(confirmation.paymentIntent?.status)) {
          if (!isPaymentAttemptActive(paymentAttempt)) {
            exitStalePaymentAttempt(paymentAttempt);
            return;
          }

          commitPaymentAttemptState(paymentAttempt, (prev) => ({
            ...prev,
            donation: null,
            error:
              "Stripe has not confirmed this payment yet. Please try again or use another card.",
            isProcessing: false,
          }));
          return;
        }

        const didCommit = commitSuccessfulOriginalPaymentAttempt(
          paymentAttempt,
          result.donation,
        );
        if (didCommit) window.scrollTo(0, 0);
        return;
      }

      const message =
        result.kind === "processing"
          ? PAYMENT_PROCESSING_MESSAGE
          : result.message;
      commitPaymentAttemptState(paymentAttempt, (prev) => ({
        ...prev,
        error: message,
        isProcessing: false,
      }));
    } catch {
      if (!isPaymentAttemptActive(paymentAttempt)) {
        exitStalePaymentAttempt(paymentAttempt);
        return;
      }

      commitPaymentAttemptState(paymentAttempt, (prev) => ({
        ...prev,
        error:
          "We couldn't reach the server to confirm your contribution. Please try again.",
        isProcessing: false,
      }));
    }
  };

  if (step !== "success" && !hasGivingTarget) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-6">
          <div className="size-20 bg-muted rounded-3xl flex items-center justify-center mx-auto border border-border shadow-xl">
            <Activity className="size-8 text-muted-foreground" />
          </div>
          <h2 className="text-3xl font-semibold text-foreground font-display">
            Target Unspecified
          </h2>
          <Link
            href="/workers"
            className={buttonVariants({ variant: "maia", size: "lg" })}
          >
            View Missionaries
          </Link>
        </div>
      </div>
    );
  }

  // Success renders ONLY when Stripe confirmation has accepted the initialized
  // donation and the attempt has the immutable values that should be confirmed.
  // If either is missing, fall through rather than showing an unbacked receipt.
  if (step === "success" && donation && successSnapshot) {
    return (
      <SuccessView
        donorInfo={successSnapshot.donorInfo}
        mode={checkoutMode}
        total={successSnapshot.total}
        workerTitle={successSnapshot.workerTitle}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-32 pt-24 selection:bg-primary/10">
      <div className="container mx-auto px-6 max-w-7xl">
        <StepIndicator currentStep={step} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          <div className="lg:col-span-7 space-y-16">
            <AnimatePresence mode="wait">
              {step === "config" && (
                <ConfigStep
                  amount={amount}
                  calculatedFees={calculatedFees}
                  coverFees={coverFees}
                  customAmount={customAmount}
                  onAmountSelect={handleAmountSelect}
                  onCoverFeesChange={setCoverFees}
                  onCustomAmountChange={handleCustomAmountChange}
                  onNext={handleNext}
                />
              )}

              {step === "details" && (
                <DetailsStep
                  donorInfo={donorInfo}
                  onBack={handleBack}
                  onDonorInfoChange={(patch) =>
                    setDonorInfo({ ...donorInfo, ...patch })
                  }
                  onNext={handleNext}
                />
              )}

              {step === "payment" && (
                <>
                  {stripeOverride ? (
                    <PaymentStep
                      cardElement={stripeOverride.cardElement}
                      elements={stripeOverride.elements}
                      error={error}
                      isProcessing={isProcessing}
                      mode={checkoutMode}
                      onBack={handleBack}
                      onConfirmPayment={handlePayment}
                      onPaymentMethodChange={setPaymentMethod}
                      paymentMethod={paymentMethod}
                      postalCode={postalCode}
                      onPostalCodeChange={setPostalCode}
                      stripe={stripeOverride.stripe}
                      total={total}
                    />
                  ) : runtimeConfig.status === "loading" ? (
                    <CheckoutConfigurationState
                      title="Preparing secure checkout"
                      message="Loading this organization's payment configuration."
                    />
                  ) : runtimeConfig.status === "error" ? (
                    <CheckoutConfigurationError message={runtimeConfig.error} />
                  ) : checkoutMode === "live" && runtimeConfig.stripePromise ? (
                    <Elements
                      key={runtimeConfig.publishableKey}
                      stripe={runtimeConfig.stripePromise}
                    >
                      <StripePaymentStep
                        error={error}
                        isProcessing={isProcessing}
                        mode={checkoutMode}
                        onBack={handleBack}
                        onConfirmPayment={handlePayment}
                        onPaymentMethodChange={setPaymentMethod}
                        paymentMethod={paymentMethod}
                        postalCode={postalCode}
                        onPostalCodeChange={setPostalCode}
                        total={total}
                      />
                    </Elements>
                  ) : (
                    <PaymentStep
                      elements={null}
                      error={error}
                      isProcessing={isProcessing}
                      mode={checkoutMode}
                      onBack={handleBack}
                      onConfirmPayment={handlePayment}
                      onPaymentMethodChange={setPaymentMethod}
                      paymentMethod={paymentMethod}
                      postalCode={postalCode}
                      onPostalCodeChange={setPostalCode}
                      stripe={null}
                      total={total}
                    />
                  )}
                </>
              )}
            </AnimatePresence>
          </div>

          <aside className="lg:col-span-5 hidden lg:block">
            <SummaryCard
              worker={
                worker || {
                  title: hasGeneralGivingTarget
                    ? "General Mission Fund"
                    : searchParams.missionaryId
                      ? "Missionary Support"
                      : "Urgent Needs",
                }
              }
              amount={amount}
              frequency={frequency}
              coverFees={coverFees}
              fees={calculatedFees}
              total={total}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}

export function CheckoutPageClient({
  searchParams,
  stripeOverride,
}: {
  searchParams: CheckoutPageSearchParams;
  stripeOverride?: CheckoutStripeOverride;
}) {
  const normalizedSearchParams = normalizeCheckoutSearchParams(searchParams);
  return (
    <CheckoutContent
      searchParams={normalizedSearchParams}
      stripeOverride={stripeOverride}
    />
  );
}

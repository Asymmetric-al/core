"use client";

import { motion, AnimatePresence } from "@asym/lib/motion";
import {
  isGeneralCheckoutAlias,
  resolveCheckoutFundId,
} from "@asym/lib/payments/checkout-designations";
import { formatCurrency } from "@asym/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import { Input } from "@asym/ui/components/shadcn/input";
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
  resolveCheckoutIdempotencyKey,
  resolveCheckoutMode,
  type CheckoutMode,
  type CheckoutFrequency,
  type CheckoutPaymentMethod,
  type ServerDonation,
} from "./checkout-donation";
import { getFieldWorkerById } from "../../../lib/mock-data";

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
const STRIPE_FEE_PERCENT = 0.029;
const STRIPE_FEE_FIXED = 0.3;
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
    <div className="bg-white rounded-3xl border border-zinc-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden sticky top-32">
      <div className="p-8 bg-zinc-50/50 border-b border-zinc-100">
        <h3 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.3em] mb-6">
          Contribution Summary
        </h3>
        <div className="flex items-center gap-4">
          <Avatar className="size-16 border-4 border-white shadow-xl">
            <AvatarImage src={worker?.image} className="object-cover" />
            <AvatarFallback className="bg-zinc-100 text-zinc-900 font-semibold">
              GH
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-zinc-900 uppercase tracking-widest">
              Supporting
            </p>
            <p className="text-xl font-semibold text-zinc-950 font-syne leading-tight">
              {worker?.title || "General Mission Fund"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-500 font-medium">Base Amount</span>
            <span className="font-semibold text-zinc-950 font-syne">
              {formatCurrency(amount)}
            </span>
          </div>

          {coverFees && (
            <div className="flex justify-between items-center text-sm animate-in fade-in slide-in-from-top-2">
              <span className="text-zinc-500 font-medium flex items-center gap-2">
                <Zap className="size-3.5 text-zinc-900 fill-zinc-900" />{" "}
                Processing Fee
              </span>
              <span className="font-semibold text-zinc-900 font-syne">
                {formatCurrency(fees)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-500 font-medium">Frequency</span>
            <Badge
              variant="outline"
              className="uppercase text-[10px] font-semibold tracking-[0.2em] px-4 py-1.5 rounded-full border-none shadow-none bg-zinc-100 text-zinc-500"
            >
              {frequency}
            </Badge>
          </div>
        </div>

        <Separator className="bg-zinc-100" />

        <div className="flex justify-between items-end pt-2">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.3em]">
              Amount Due Today
            </span>
            <span className="block text-3xl font-semibold text-zinc-950 font-syne tracking-tighter">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </div>

      <div className="px-8 py-4 bg-zinc-950 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.2em] text-white/40">
        <div className="flex items-center gap-2">
          <Shield className="size-3.5 text-zinc-500" /> Secure SSL
        </div>
        <div className="flex items-center gap-2">
          <Lock className="size-3.5 text-zinc-500" /> PCI Compliant
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
      className="flex items-center justify-center gap-4 mb-20"
      aria-label="Checkout progress"
    >
      {steps.map((s, idx) => (
        <div key={s.key} className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <div
              className={cn(
                "h-1.5 rounded-full transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-700 ease-[0.22, 1, 0.36, 1]",
                currentIdx === idx
                  ? "bg-zinc-900 w-12"
                  : currentIdx > idx
                    ? "bg-zinc-900 w-6"
                    : "bg-zinc-200 w-6",
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                "text-[9px] font-semibold uppercase tracking-[0.3em]",
                currentIdx === idx ? "text-zinc-950" : "text-zinc-300",
              )}
            >
              {s.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className="h-px w-8 bg-zinc-100 mb-6" aria-hidden="true" />
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
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white max-w-2xl w-full rounded-[3.5rem] shadow-[0_100px_150px_-50px_rgba(0,0,0,0.1)] overflow-hidden text-center"
      >
        <div className="bg-zinc-950 pt-24 pb-32 px-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" aria-hidden="true">
            <div className="absolute top-0 right-0 size-64 bg-zinc-500 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 size-64 bg-zinc-500 rounded-full blur-[100px]" />
          </div>

          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="size-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(255,255,255,0.1)]"
          >
            <Check
              className="size-12 text-zinc-950"
              strokeWidth={3}
              aria-hidden="true"
            />
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-semibold mb-4 font-syne tracking-tighter">
            Contribution Confirmed.
          </h1>
          <p className="text-zinc-400 font-semibold text-xs uppercase tracking-[0.4em]">
            Thank you for your support
          </p>
        </div>

        <div className="px-16 py-20 space-y-12">
          <div className="space-y-4">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.3em]">
              Total Contribution
            </p>
            <p className="text-7xl font-semibold text-zinc-950 font-syne tracking-tighter">
              {formatCurrency(total)}
            </p>
          </div>

          <p className="text-xl text-zinc-500 leading-relaxed font-light tracking-tight">
            A secure receipt has been sent to{" "}
            <span className="text-zinc-950 font-semibold">
              {donorInfo.email}
            </span>
            . Your gift is being routed to{" "}
            <span className="text-zinc-950 font-semibold">{workerTitle}</span>.
          </p>

          {mode === "test" && (
            <div
              role="status"
              className="inline-flex items-center gap-3 rounded-full bg-amber-50 px-6 py-3 text-[10px] font-semibold uppercase tracking-widest text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
            >
              <AlertTriangle className="size-3.5" aria-hidden="true" /> Test
              mode — no card charge collected
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/donor-dashboard"
              className={cn(
                buttonVariants({ size: "lg" }),
                "flex-1 h-20 rounded-3xl bg-zinc-950 text-white hover:bg-zinc-800 font-semibold font-syne text-[11px] uppercase tracking-widest",
              )}
            >
              Enter Dashboard
            </Link>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "flex-1 h-20 rounded-3xl border-zinc-100 hover:bg-zinc-50 font-semibold font-syne text-[11px] uppercase tracking-widest",
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
        <span className="text-xs font-semibold text-zinc-900 uppercase tracking-[0.4em]">
          Set Up Support
        </span>
        <h1 className="text-5xl md:text-7xl font-semibold text-zinc-950 font-syne tracking-tighter">
          Your Gift.
        </h1>
        <p className="text-2xl text-zinc-400 font-light tracking-tight">
          Configure the amount of your one-time gift.
        </p>
      </header>

      <div className="space-y-8">
        <div className="rounded-[2rem] border border-zinc-100 bg-zinc-50 p-6">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.3em]">
            Contribution Frequency
          </p>
          <p className="mt-2 font-semibold text-zinc-950 font-syne">
            One-time gift
          </p>
        </div>

        <fieldset className="space-y-6">
          <legend className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.3em]">
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
                  "h-24 rounded-[1.8rem] border-2 font-semibold font-syne text-2xl press-feedback",
                  amount === val && !customAmount
                    ? "border-zinc-950 bg-zinc-950 text-white shadow-2xl ring-4 ring-zinc-950/15"
                    : "border-zinc-50 bg-zinc-50 text-zinc-400 hover:border-zinc-200 hover:bg-zinc-100",
                )}
              >
                ${val}
              </button>
            ))}
          </div>

          <div className="relative mt-8">
            <span
              className="absolute left-8 top-1/2 -translate-y-1/2 text-zinc-300 font-semibold font-syne text-3xl"
              aria-hidden="true"
            >
              $
            </span>
            <label className="sr-only" htmlFor="custom-amount">
              Custom amount
            </label>
            <input
              id="custom-amount"
              type="text"
              inputMode="decimal"
              placeholder="Other Amount"
              value={customAmount}
              onChange={onCustomAmountChange}
              className={cn(
                "w-full h-24 pl-16 pr-8 rounded-[1.8rem] text-3xl font-semibold font-syne transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-500 outline-none border-2",
                customAmount
                  ? "border-zinc-950 bg-white"
                  : "border-zinc-50 bg-zinc-50 focus:border-zinc-200",
              )}
            />
          </div>
        </fieldset>

        <div
          className={cn(
            "rounded-[2rem] p-8 border-2 flex gap-6 items-center cursor-pointer transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-500",
            coverFees
              ? "bg-zinc-900 border-zinc-900 text-white"
              : "bg-white border-zinc-100 text-zinc-950 hover:border-zinc-200",
          )}
          onClick={() => onCoverFeesChange(!coverFees)}
          role="checkbox"
          aria-checked={coverFees}
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onCoverFeesChange(!coverFees)}
        >
          <div
            className={cn(
              "size-14 rounded-2xl flex items-center justify-center transition-colors",
              coverFees ? "bg-white/20" : "bg-zinc-50",
            )}
          >
            <Heart
              className={cn(
                "size-6",
                coverFees ? "text-white fill-current" : "text-zinc-900",
              )}
              aria-hidden="true"
            />
          </div>
          <div className="flex-1">
            <p className="font-semibold font-syne text-xl">
              Cover Processing Fees
            </p>
            <p
              className={cn(
                "text-xs font-medium mt-1 leading-relaxed",
                coverFees ? "text-white/80" : "text-zinc-400",
              )}
            >
              Add <strong>{formatCurrency(calculatedFees)}</strong> so 100% of
              your gift reaches the field.
            </p>
          </div>
          <Switch
            checked={coverFees}
            onCheckedChange={onCoverFeesChange}
            className="data-checked:bg-white data-checked:opacity-100"
          />
        </div>
      </div>

      <Button
        onClick={onNext}
        disabled={amount <= 0}
        size="lg"
        className="w-full h-24 text-2xl font-semibold font-syne bg-zinc-950 hover:bg-zinc-800 text-white shadow-2xl rounded-full hover-scale-subtle uppercase tracking-widest"
      >
        Next Step <ArrowRight className="ml-4 size-8" aria-hidden="true" />
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
        <span className="text-xs font-semibold text-zinc-900 uppercase tracking-[0.4em]">
          Donor Information
        </span>
        <h1 className="text-5xl md:text-7xl font-semibold text-zinc-950 font-syne tracking-tighter">
          Your Details.
        </h1>
        <p className="text-2xl text-zinc-400 font-light tracking-tight">
          Information for tax receipts and donation tracking.
        </p>
      </header>

      <div className="bg-zinc-50 p-12 rounded-[3rem] border border-zinc-100 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <Label
              htmlFor="first-name"
              className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest pl-2"
            >
              First Name
            </Label>
            <Input
              id="first-name"
              value={donorInfo.firstName}
              onChange={(e) => onDonorInfoChange({ firstName: e.target.value })}
              placeholder="Jane"
              className="h-16 rounded-2xl bg-white border-none text-lg font-medium shadow-sm focus:ring-4 focus:ring-zinc-900/5 px-6"
              autoComplete="given-name"
            />
          </div>
          <div className="space-y-4">
            <Label
              htmlFor="last-name"
              className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest pl-2"
            >
              Last Name
            </Label>
            <Input
              id="last-name"
              value={donorInfo.lastName}
              onChange={(e) => onDonorInfoChange({ lastName: e.target.value })}
              placeholder="Doe"
              className="h-16 rounded-2xl bg-white border-none text-lg font-medium shadow-sm focus:ring-4 focus:ring-zinc-900/5 px-6"
              autoComplete="family-name"
            />
          </div>
        </div>
        <div className="space-y-4">
          <Label
            htmlFor="email"
            className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest pl-2"
          >
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={donorInfo.email}
            onChange={(e) => onDonorInfoChange({ email: e.target.value })}
            placeholder="jane.doe@example.com"
            className="h-16 rounded-2xl bg-white border-none text-lg font-medium shadow-sm focus:ring-4 focus:ring-zinc-900/5 px-6"
            autoComplete="email"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <Button
          variant="outline"
          onClick={onBack}
          size="lg"
          className="h-20 px-12 rounded-full border-zinc-100 text-zinc-400 font-semibold font-syne text-xs uppercase tracking-widest hover:bg-zinc-50"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={
            !donorInfo.firstName || !donorInfo.lastName || !donorInfo.email
          }
          size="lg"
          className="flex-1 h-20 text-xl font-semibold font-syne bg-zinc-950 hover:bg-zinc-800 text-white shadow-2xl rounded-full transition-[color,background-color,border-color,box-shadow,transform,opacity] uppercase tracking-widest"
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
        <span className="text-xs font-semibold text-zinc-900 uppercase tracking-[0.4em]">
          Payment Information
        </span>
        <h1 className="text-5xl md:text-7xl font-semibold text-zinc-950 font-syne tracking-tighter">
          Secure Payment.
        </h1>
        <p className="text-2xl text-zinc-400 font-light tracking-tight">
          Safely authorize your contribution.
        </p>
      </header>

      <div className="bg-zinc-50 p-12 rounded-[3.5rem] border border-zinc-100 space-y-10">
        <div
          className="flex p-2 bg-white rounded-[2rem] border border-zinc-100"
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
              "flex-1 py-4 text-[10px] font-semibold uppercase tracking-widest rounded-3xl transition-[color,background-color,border-color,box-shadow,transform,opacity]",
              paymentMethod === "card"
                ? "bg-zinc-950 text-white shadow-xl"
                : "text-zinc-400",
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
              "flex-1 py-4 text-[10px] font-semibold uppercase tracking-widest rounded-3xl transition-[color,background-color,border-color,box-shadow,transform,opacity]",
              paymentMethod === "ach"
                ? "bg-zinc-950 text-white shadow-xl"
                : "text-zinc-400",
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
              "flex-1 py-4 text-[10px] font-semibold uppercase tracking-widest rounded-3xl transition-[color,background-color,border-color,box-shadow,transform,opacity]",
              paymentMethod === "wallet"
                ? "bg-zinc-950 text-white shadow-xl"
                : "text-zinc-400",
              isProcessing && "cursor-not-allowed opacity-60",
            )}
          >
            Apple/Google
          </button>
        </div>

        <div
          className="min-h-[300px] flex flex-col justify-center"
          role="tabpanel"
        >
          <AnimatePresence mode="wait">
            {paymentMethod === "card" && (
              <motion.div
                key="card"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="space-y-3" data-testid="stripe-card-panel">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest pl-2">
                    Card Details
                  </p>
                  {mode === "live" ? (
                    <div className="bg-white rounded-[2rem] border border-zinc-100 p-8 shadow-sm">
                      {cardElement ?? (
                        <CardElement options={{ hidePostalCode: true }} />
                      )}
                    </div>
                  ) : (
                    <div
                      role="status"
                      className="rounded-[2rem] border border-dashed border-amber-200 bg-white p-8 text-sm font-medium leading-relaxed text-amber-700"
                    >
                      Test mode does not collect card details. Configure a
                      Stripe publishable key to mount live Elements.
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest pl-2">
                      Country
                    </Label>
                    <Input
                      defaultValue="United States"
                      className="h-16 rounded-2xl bg-white border-none shadow-sm font-medium px-6"
                      disabled
                    />
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="postal-code"
                      className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest pl-2"
                    >
                      Postal Code
                    </Label>
                    <Input
                      id="postal-code"
                      placeholder="12345"
                      className="h-16 rounded-2xl bg-white border-none shadow-sm font-medium px-6 focus:ring-4 focus:ring-zinc-900/5"
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
                <div className="size-24 bg-zinc-100 rounded-[2rem] flex items-center justify-center mx-auto">
                  <Landmark
                    className="size-10 text-zinc-900"
                    aria-hidden="true"
                  />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold font-syne">
                    Instant Bank Link
                  </h3>
                  <p className="text-zinc-500 max-w-sm mx-auto leading-relaxed">
                    Securely connect your bank account via Stripe Financial
                    Connections to maximize your impact with 0% credit card
                    fees.
                  </p>
                </div>
                <Button className="h-20 px-12 rounded-full bg-zinc-950 text-white font-semibold font-syne text-xs uppercase tracking-widest shadow-2xl hover:bg-zinc-800">
                  Connect Securely
                </Button>
              </motion.div>
            )}

            {paymentMethod === "wallet" && (
              <motion.div
                key="wallet"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center h-full min-h-[300px]"
              >
                <button className="h-20 px-12 rounded-full bg-black text-white font-semibold text-2xl flex items-center gap-4 press-feedback hover-scale-subtle shadow-2xl">
                  <Wallet className="size-8" aria-hidden="true" /> Pay with
                  Apple Pay
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {mode === "test" && (
        <div
          role="status"
          className="flex items-start gap-4 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-left dark:border-amber-500/30 dark:bg-amber-500/10"
        >
          <AlertTriangle
            className="size-5 shrink-0 text-amber-600 dark:text-amber-400"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-300">
              Test mode — card capture disabled
            </p>
            <p className="text-sm font-medium leading-relaxed text-amber-700/80 dark:text-amber-200/80">
              Live card processing needs Stripe credentials that aren&apos;t
              configured yet. Your contribution is recorded server-side; the
              card charge is not collected in this mode.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-4 rounded-3xl border border-red-200 bg-red-50 p-6 text-left dark:border-red-500/30 dark:bg-red-500/10"
        >
          <AlertTriangle
            className="size-5 shrink-0 text-red-600 dark:text-red-400"
            aria-hidden="true"
          />
          <p className="text-sm font-medium leading-relaxed text-red-700 dark:text-red-300">
            {error}
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-6">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isProcessing}
          size="lg"
          className="h-24 px-12 rounded-full border-zinc-100 text-zinc-400 font-semibold font-syne text-xs uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-60"
        >
          Back
        </Button>
        <Button
          onClick={() => onConfirmPayment(stripe, elements)}
          disabled={isProcessing}
          size="lg"
          className="flex-1 h-24 text-2xl font-semibold font-syne bg-zinc-900 hover:bg-zinc-800 text-white shadow-2xl rounded-full hover-scale-subtle uppercase tracking-widest"
        >
          {isProcessing ? (
            <Loader2
              className="animate-spin size-8"
              aria-label="Processing payment"
            />
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
      className="flex min-h-[360px] flex-col items-center justify-center gap-6 rounded-[3.5rem] border border-zinc-100 bg-zinc-50 p-12 text-center"
    >
      <Loader2
        className="size-8 animate-spin text-zinc-400"
        aria-hidden="true"
      />
      <div className="space-y-2">
        <h2 className="font-syne text-2xl font-semibold text-zinc-950">
          {title}
        </h2>
        <p className="max-w-md text-sm font-medium leading-relaxed text-zinc-500">
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
        <span className="text-xs font-semibold text-zinc-900 uppercase tracking-[0.4em]">
          Payment Information
        </span>
        <h1 className="text-5xl md:text-7xl font-semibold text-zinc-950 font-syne tracking-tighter">
          Secure Payment.
        </h1>
        <p className="text-2xl text-zinc-400 font-light tracking-tight">
          Safely authorize your contribution.
        </p>
      </header>

      <div
        role="alert"
        className="flex items-start gap-4 rounded-3xl border border-red-200 bg-red-50 p-6 text-left dark:border-red-500/30 dark:bg-red-500/10"
      >
        <AlertTriangle
          className="size-5 shrink-0 text-red-600 dark:text-red-400"
          aria-hidden="true"
        />
        <p className="text-sm font-medium leading-relaxed text-red-700 dark:text-red-300">
          {message ??
            "Checkout configuration could not be loaded. Please refresh and try again."}
        </p>
      </div>
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

  const calculatedFees = useMemo(() => {
    const gross = (amount + STRIPE_FEE_FIXED) / (1 - STRIPE_FEE_PERCENT);
    return gross - amount;
  }, [amount]);

  const total = coverFees ? amount + calculatedFees : amount;
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
        amount: total,
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
      coverFees,
      donorInfo.email,
      donorInfo.firstName,
      donorInfo.lastName,
      endDate,
      frequency,
      fundId,
      hasEndDate,
      paymentMethod,
      postalCode,
      startDate,
      total,
      missionaryId,
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

    return () => runtimeConfigAbortRef.current?.abort();
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
        amount: total,
        currency: "usd",
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-6">
          <div className="size-20 bg-zinc-50 rounded-3xl flex items-center justify-center mx-auto border border-zinc-100 shadow-xl">
            <Activity className="size-8 text-zinc-300" />
          </div>
          <h2 className="text-3xl font-semibold text-zinc-950 font-syne">
            Target Unspecified
          </h2>
          <Link
            href="/workers"
            className={cn(
              buttonVariants(),
              "rounded-full px-8 h-12 font-semibold font-syne text-[10px] uppercase tracking-widest bg-zinc-900 hover:bg-zinc-800",
            )}
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
    <div className="min-h-screen bg-white font-sans pb-32 pt-24 selection:bg-zinc-900/10">
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

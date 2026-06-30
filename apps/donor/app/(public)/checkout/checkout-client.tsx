"use client";

import { motion, AnimatePresence } from "@asym/lib/motion";
import { describeDonationPaymentStatus } from "@asym/lib/payments/payment-status-language";
import { formatCurrency } from "@asym/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import { Separator } from "@asym/ui/components/shadcn/separator";
import { Switch } from "@asym/ui/components/shadcn/switch";
import { cn } from "@asym/ui/lib/utils";
import {
  Check,
  Lock,
  CreditCard,
  ArrowRight,
  Heart,
  Loader2,
  CalendarDays,
  Landmark,
  Wallet,
  Zap,
  Activity,
  Shield,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState, useSyncExternalStore } from "react";

import { makeDisplayDate, todayDateInputValue } from "@/lib/dates";
import { getFieldWorkerById } from "@/lib/mock-data";

function subscribeToToday() {
  return () => {};
}

/** Client-local YYYY-MM-DD; empty on the server to avoid SSR timezone drift. */
function useClientTodayDateInputValue(): string {
  return useSyncExternalStore(subscribeToToday, todayDateInputValue, () => "");
}

type Step = "config" | "details" | "payment" | "success";
type Frequency = "one-time" | "monthly";
type PaymentMethod = "card" | "ach" | "wallet";
type SearchParamInput = string | string[] | undefined;
type CheckoutPageSearchParams = {
  amount?: SearchParamInput;
  frequency?: SearchParamInput;
  fund?: SearchParamInput;
  fund_id?: SearchParamInput;
  missionary_id?: SearchParamInput;
  workerId?: SearchParamInput;
};
type CheckoutSearchParams = {
  amount: string | null;
  frequency: Frequency | null;
  fund: string | null;
  fundId: string | null;
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
  donorInfo: DonorInfo;
  endDate: string;
  frequency: Frequency;
  hasEndDate: boolean;
  isProcessing: boolean;
  paymentMethod: PaymentMethod;
  showScheduleConfig: boolean;
  startDate: string;
  step: Step;
};

const PRESET_AMOUNTS = [50, 100, 250, 500];
const STRIPE_FEE_PERCENT = 0.029;
const STRIPE_FEE_FIXED = 0.3;

const readSearchParam = (value: SearchParamInput): string | null => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? null;
  return null;
};

const readCheckoutFrequency = (value: SearchParamInput): Frequency | null => {
  const normalized = readSearchParam(value)?.trim().toLowerCase();
  if (normalized === "monthly") {
    return "monthly";
  }

  if (normalized === "one-time" || normalized === "one_time") {
    return "one-time";
  }

  return null;
};

const normalizeCheckoutSearchParams = (
  searchParams: CheckoutPageSearchParams,
): CheckoutSearchParams => ({
  amount: readSearchParam(searchParams.amount),
  frequency: readCheckoutFrequency(searchParams.frequency),
  fund: readSearchParam(searchParams.fund),
  fundId: readSearchParam(searchParams.fund_id),
  missionaryId: readSearchParam(searchParams.missionary_id),
  workerId: readSearchParam(searchParams.workerId),
});

const formatDatePretty = (dateStr: string) => {
  if (!dateStr) return "Today";
  const date = makeDisplayDate(dateStr);
  const today = makeDisplayDate();

  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) return "Today";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  }).format(date);
};

interface SummaryCardProps {
  worker: { title?: string; image?: string } | null;
  amount: number;
  frequency: Frequency;
  coverFees: boolean;
  fees: number;
  total: number;
  startDate: string;
  endDate: string | null;
}

function SummaryCard({
  worker,
  amount,
  frequency,
  coverFees,
  fees,
  total,
  startDate,
  endDate,
}: SummaryCardProps) {
  const isFutureStart =
    makeDisplayDate(startDate).setHours(0, 0, 0, 0) >
    makeDisplayDate().setHours(0, 0, 0, 0);
  const dueToday = isFutureStart ? 0 : total;

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
              className={cn(
                "uppercase text-[10px] font-semibold tracking-[0.2em] px-4 py-1.5 rounded-full border-none shadow-none",
                frequency === "monthly"
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-500",
              )}
            >
              {frequency}
            </Badge>
          </div>
        </div>

        {frequency === "monthly" && (
          <div className="bg-zinc-50 rounded-2xl p-5 space-y-3 border border-zinc-100">
            <div className="flex justify-between text-[10px] font-semibold uppercase tracking-widest">
              <span className="text-zinc-400">Start Date</span>
              <span className="text-zinc-900">
                {formatDatePretty(startDate)}
              </span>
            </div>
            <div className="flex justify-between text-[10px] font-semibold uppercase tracking-widest">
              <span className="text-zinc-400">Duration</span>
              <span className="text-zinc-900 flex items-center gap-2">
                {endDate ? formatDatePretty(endDate) : "Ongoing"}
              </span>
            </div>
          </div>
        )}

        <Separator className="bg-zinc-100" />

        <div className="flex justify-between items-end pt-2">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.3em]">
              Amount Due Today
            </span>
            <span className="block text-3xl font-semibold text-zinc-950 font-syne tracking-tighter">
              {formatCurrency(dueToday)}
            </span>
          </div>
          {isFutureStart && (
            <div className="text-right pb-1">
              <span className="text-[9px] font-semibold text-zinc-900 uppercase tracking-widest block mb-1">
                Set Recurring
              </span>
              <span className="text-sm font-semibold text-zinc-400 font-syne">
                {formatCurrency(total)}
              </span>
            </div>
          )}
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
                "h-1.5 rounded-full transition-[width,background-color] duration-[var(--duration-standard)] ease-[var(--ease-out-soft)]",
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
  frequency,
  paymentMethod,
  total,
  workerTitle,
}: {
  donorInfo: DonorInfo;
  frequency: Frequency;
  paymentMethod: PaymentMethod;
  total: number;
  workerTitle: string;
}) {
  // ACH Direct Debit is a delayed-notification rail: the donor authorized the
  // debit, but payment finality arrives later from Stripe. Keep the language
  // honest while the visual treatment stays identical across payment methods.
  const achStatus =
    paymentMethod === "ach"
      ? describeDonationPaymentStatus({
          state: "processing",
          rail: "ach_debit",
          audience: "donor",
        })
      : null;

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
            {achStatus ? "Bank Transfer Started." : "Contribution Logged."}
          </h1>
          <p className="text-zinc-400 font-semibold text-xs uppercase tracking-[0.4em]">
            {achStatus
              ? "Processing — not yet collected"
              : "Thank you for your support"}
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
            {frequency === "monthly" && (
              <div className="inline-flex items-center gap-3 bg-zinc-100 text-zinc-900 px-6 py-2 rounded-full text-[10px] font-semibold uppercase tracking-widest">
                <Activity className="size-3.5" aria-hidden="true" /> Ongoing
                Monthly Support
              </div>
            )}
          </div>

          <p className="text-xl text-zinc-500 leading-relaxed font-light tracking-tight">
            {achStatus
              ? `${achStatus.message} A confirmation has been sent to `
              : "A secure receipt has been sent to "}
            <span className="text-zinc-950 font-semibold">
              {donorInfo.email}
            </span>
            . Your gift is being routed to{" "}
            <span className="text-zinc-950 font-semibold">{workerTitle}</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              asChild
              size="lg"
              className="flex-1 h-20 rounded-3xl bg-zinc-950 text-white hover:bg-zinc-800 transition-colors font-semibold font-syne text-[11px] uppercase tracking-widest"
            >
              <Link href="/donor-dashboard">Enter Dashboard</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="flex-1 h-20 rounded-3xl border-zinc-100 hover:bg-zinc-50 font-semibold font-syne text-[11px] uppercase tracking-widest"
            >
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MonthlyScheduleSection({
  endDate,
  hasEndDate,
  minStartDate,
  onEndDateChange,
  onHasEndDateChange,
  onStartDateChange,
  onToggleScheduleConfig,
  showScheduleConfig,
  startDate,
}: {
  endDate: string;
  hasEndDate: boolean;
  minStartDate: string;
  onEndDateChange: (value: string) => void;
  onHasEndDateChange: (value: boolean) => void;
  onStartDateChange: (value: string) => void;
  onToggleScheduleConfig: () => void;
  showScheduleConfig: boolean;
  startDate: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="space-y-6 overflow-hidden"
    >
      <div className="bg-zinc-50 rounded-[2rem] p-8 border border-zinc-100">
        <div className="flex items-start justify-between mb-8">
          <div className="space-y-1">
            <h4 className="font-semibold text-zinc-900 text-[10px] uppercase tracking-[0.2em] flex items-center gap-3">
              <CalendarDays className="size-4" aria-hidden="true" /> Support
              Schedule
            </h4>
            <p className="text-sm text-zinc-600 font-medium">
              First contribution scheduled for{" "}
              <span className="text-zinc-900 font-semibold">
                {formatDatePretty(startDate)}
              </span>
              .
            </p>
          </div>
          <button
            className="h-10 px-5 rounded-full border border-zinc-200 text-zinc-700 font-semibold text-[9px] uppercase tracking-widest hover:bg-zinc-100 transition-colors"
            onClick={onToggleScheduleConfig}
            aria-expanded={showScheduleConfig}
          >
            {showScheduleConfig ? "SAVE" : "EDIT"}
          </button>
        </div>

        <AnimatePresence>
          {showScheduleConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-8 pt-8 border-t border-zinc-100"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label
                    htmlFor="start-date"
                    className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest"
                  >
                    Start Date
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    min={minStartDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                    className="h-14 rounded-2xl bg-white border-zinc-100 font-medium"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="end-date"
                      className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest"
                    >
                      Ending Date
                    </Label>
                    <Switch
                      checked={hasEndDate}
                      onCheckedChange={(checked) => {
                        onHasEndDateChange(checked);
                        if (!checked) onEndDateChange("");
                      }}
                    />
                  </div>
                  {hasEndDate ? (
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => onEndDateChange(e.target.value)}
                      className="h-14 rounded-2xl bg-white border-zinc-100"
                    />
                  ) : (
                    <div className="h-14 flex items-center px-4 bg-zinc-50 rounded-2xl text-xs text-zinc-400 font-semibold uppercase tracking-widest">
                      Continual Support
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ConfigStep({
  amount,
  calculatedFees,
  coverFees,
  customAmount,
  endDate,
  frequency,
  hasEndDate,
  minStartDate,
  onAmountSelect,
  onCoverFeesChange,
  onCustomAmountChange,
  onEndDateChange,
  onFrequencyChange,
  onHasEndDateChange,
  onNext,
  onStartDateChange,
  onToggleScheduleConfig,
  showScheduleConfig,
  startDate,
}: {
  amount: number;
  calculatedFees: number;
  coverFees: boolean;
  customAmount: string;
  endDate: string;
  frequency: Frequency;
  hasEndDate: boolean;
  minStartDate: string;
  onAmountSelect: (value: number) => void;
  onCoverFeesChange: (value: boolean) => void;
  onCustomAmountChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEndDateChange: (value: string) => void;
  onFrequencyChange: (value: Frequency) => void;
  onHasEndDateChange: (value: boolean) => void;
  onNext: () => void;
  onStartDateChange: (value: string) => void;
  onToggleScheduleConfig: () => void;
  showScheduleConfig: boolean;
  startDate: string;
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
          Configure the amount and frequency of your impact.
        </p>
      </header>

      <div className="space-y-8">
        <fieldset className="space-y-4">
          <legend className="text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.3em]">
            Contribution Frequency
          </legend>
          <div
            className="flex p-1.5 bg-zinc-50 rounded-2xl border border-zinc-100"
            role="radiogroup"
          >
            <button
              onClick={() => onFrequencyChange("one-time")}
              role="radio"
              aria-checked={frequency === "one-time"}
              className={cn(
                "flex-1 py-3 text-[10px] font-semibold uppercase tracking-widest rounded-xl transition-[color,background-color,box-shadow]",
                frequency === "one-time"
                  ? "bg-white text-zinc-950 shadow-md"
                  : "text-zinc-400 hover:text-zinc-600",
              )}
            >
              One-Time
            </button>
            <button
              onClick={() => onFrequencyChange("monthly")}
              role="radio"
              aria-checked={frequency === "monthly"}
              className={cn(
                "flex-1 py-3 text-[10px] font-semibold uppercase tracking-widest rounded-xl transition-[color,background-color,box-shadow] relative",
                frequency === "monthly"
                  ? "bg-white text-zinc-900 shadow-md"
                  : "text-zinc-400 hover:text-zinc-600",
              )}
            >
              Monthly Partner
            </button>
          </div>
        </fieldset>

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
                "w-full h-24 pl-16 pr-8 rounded-[1.8rem] text-3xl font-semibold font-syne transition-colors outline-none border-2",
                customAmount
                  ? "border-zinc-950 bg-white"
                  : "border-zinc-50 bg-zinc-50 focus:border-zinc-200",
              )}
            />
          </div>
        </fieldset>

        {frequency === "monthly" && (
          <MonthlyScheduleSection
            endDate={endDate}
            hasEndDate={hasEndDate}
            minStartDate={minStartDate}
            onEndDateChange={onEndDateChange}
            onHasEndDateChange={onHasEndDateChange}
            onStartDateChange={onStartDateChange}
            onToggleScheduleConfig={onToggleScheduleConfig}
            showScheduleConfig={showScheduleConfig}
            startDate={startDate}
          />
        )}

        <div
          className={cn(
            "rounded-[2rem] p-8 border-2 flex gap-6 items-center cursor-pointer transition-colors",
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
            className="data-[state=checked]:bg-white data-[state=checked]:opacity-100"
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
          className="flex-1 h-20 text-xl font-semibold font-syne bg-zinc-950 hover:bg-zinc-800 text-white shadow-2xl rounded-full transition-colors uppercase tracking-widest"
        >
          Continue to Payment
        </Button>
      </div>
    </motion.div>
  );
}

function PaymentStep({
  isProcessing,
  onBack,
  onConfirmPayment,
  onPaymentMethodChange,
  paymentMethod,
  total,
}: {
  isProcessing: boolean;
  onBack: () => void;
  onConfirmPayment: () => void;
  onPaymentMethodChange: (value: PaymentMethod) => void;
  paymentMethod: PaymentMethod;
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
            onClick={() => onPaymentMethodChange("card")}
            className={cn(
              "flex-1 py-4 text-[10px] font-semibold uppercase tracking-widest rounded-3xl transition-[color,background-color,box-shadow]",
              paymentMethod === "card"
                ? "bg-zinc-950 text-white shadow-xl"
                : "text-zinc-400",
            )}
          >
            Card
          </button>
          <button
            role="tab"
            aria-selected={paymentMethod === "ach"}
            onClick={() => onPaymentMethodChange("ach")}
            className={cn(
              "flex-1 py-4 text-[10px] font-semibold uppercase tracking-widest rounded-3xl transition-[color,background-color,box-shadow]",
              paymentMethod === "ach"
                ? "bg-zinc-950 text-white shadow-xl"
                : "text-zinc-400",
            )}
          >
            Bank
          </button>
          <button
            role="tab"
            aria-selected={paymentMethod === "wallet"}
            onClick={() => onPaymentMethodChange("wallet")}
            className={cn(
              "flex-1 py-4 text-[10px] font-semibold uppercase tracking-widest rounded-3xl transition-[color,background-color,box-shadow]",
              paymentMethod === "wallet"
                ? "bg-zinc-950 text-white shadow-xl"
                : "text-zinc-400",
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
                <div className="space-y-3">
                  <Label
                    htmlFor="card-number"
                    className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest pl-2"
                  >
                    Card Details
                  </Label>
                  <div className="bg-white rounded-[2rem] border border-zinc-100 overflow-hidden shadow-sm">
                    <div className="relative border-b border-zinc-50">
                      <CreditCard
                        className="absolute left-6 top-6 size-6 text-zinc-300"
                        aria-hidden="true"
                      />
                      <Input
                        id="card-number"
                        className="h-20 border-none pl-16 text-lg font-medium bg-transparent focus-visible:ring-0"
                        placeholder="Card Number"
                        autoComplete="cc-number"
                      />
                    </div>
                    <div className="flex">
                      <Input
                        className="h-20 border-none border-r border-zinc-50 text-lg font-medium bg-transparent focus-visible:ring-0 px-8"
                        placeholder="MM/YY"
                        autoComplete="cc-exp"
                        aria-label="Expiration date"
                      />
                      <Input
                        className="h-20 border-none text-lg font-medium bg-transparent focus-visible:ring-0 px-8"
                        placeholder="CVC"
                        autoComplete="cc-csc"
                        aria-label="Security code"
                      />
                    </div>
                  </div>
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

      <div className="flex flex-col sm:flex-row gap-6">
        <Button
          variant="outline"
          onClick={onBack}
          size="lg"
          className="h-24 px-12 rounded-full border-zinc-100 text-zinc-400 font-semibold font-syne text-xs uppercase tracking-widest"
        >
          Back
        </Button>
        <Button
          onClick={onConfirmPayment}
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

function CheckoutContent({
  searchParams,
}: {
  searchParams: CheckoutSearchParams;
}) {
  const workerId = searchParams.workerId ?? searchParams.missionaryId;
  const initialAmount = searchParams.amount;
  const worker = workerId ? getFieldWorkerById(workerId) : null;
  const fundId = searchParams.fundId ?? searchParams.fund;
  const hasGivingTarget = Boolean(workerId || fundId);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>(() => ({
    amount: initialAmount ? Number(initialAmount) : 100,
    coverFees: false,
    customAmount: "",
    donorInfo: {
      email: "",
      firstName: "",
      lastName: "",
    },
    endDate: "",
    frequency: searchParams.frequency ?? "monthly",
    hasEndDate: false,
    isProcessing: false,
    paymentMethod: "card",
    showScheduleConfig: false,
    startDate: "",
    step: "config",
  }));
  const minStartDate = useClientTodayDateInputValue();
  const {
    amount,
    coverFees,
    customAmount,
    donorInfo,
    endDate,
    frequency,
    hasEndDate,
    isProcessing,
    paymentMethod,
    showScheduleConfig,
    startDate,
    step,
  } = checkoutState;
  const effectiveStartDate =
    startDate && (!minStartDate || startDate >= minStartDate)
      ? startDate
      : minStartDate;

  const setStep = (value: Step) =>
    setCheckoutState((prev) => ({ ...prev, step: value }));
  const setAmount = (value: number) =>
    setCheckoutState((prev) => ({ ...prev, amount: value }));
  const setCustomAmount = (value: string) =>
    setCheckoutState((prev) => ({ ...prev, customAmount: value }));
  const setFrequency = (value: Frequency) =>
    setCheckoutState((prev) => ({ ...prev, frequency: value }));
  const setCoverFees = (value: boolean) =>
    setCheckoutState((prev) => ({ ...prev, coverFees: value }));
  const setIsProcessing = (value: boolean) =>
    setCheckoutState((prev) => ({ ...prev, isProcessing: value }));
  const setPaymentMethod = (value: PaymentMethod) =>
    setCheckoutState((prev) => ({ ...prev, paymentMethod: value }));
  const setStartDate = (value: string) =>
    setCheckoutState((prev) => ({ ...prev, startDate: value }));
  const setShowScheduleConfig = (value: boolean) =>
    setCheckoutState((prev) => ({ ...prev, showScheduleConfig: value }));
  const setHasEndDate = (value: boolean) =>
    setCheckoutState((prev) => ({ ...prev, hasEndDate: value }));
  const setEndDate = (value: string) =>
    setCheckoutState((prev) => ({ ...prev, endDate: value }));
  const setDonorInfo = (value: DonorInfo) =>
    setCheckoutState((prev) => ({ ...prev, donorInfo: value }));

  const calculatedFees = useMemo(() => {
    const gross = (amount + STRIPE_FEE_FIXED) / (1 - STRIPE_FEE_PERCENT);
    return gross - amount;
  }, [amount]);

  const total = coverFees ? amount + calculatedFees : amount;

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
    else if (step === "details") setStep("payment");
  };

  const handleBack = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (step === "details") setStep("config");
    else if (step === "payment") setStep("details");
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setStep("success");
    window.scrollTo(0, 0);
  };

  if (!worker && step !== "success" && !hasGivingTarget) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-6">
          <div className="size-20 bg-zinc-50 rounded-3xl flex items-center justify-center mx-auto border border-zinc-100 shadow-xl">
            <Activity className="size-8 text-zinc-300" />
          </div>
          <h2 className="text-3xl font-semibold text-zinc-950 font-syne">
            Target Unspecified
          </h2>
          <Button
            asChild
            className="rounded-full px-8 h-12 font-semibold font-syne text-[10px] uppercase tracking-widest bg-zinc-900 hover:bg-zinc-800"
          >
            <Link href="/workers">View Missionaries</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <SuccessView
        donorInfo={donorInfo}
        frequency={frequency}
        paymentMethod={paymentMethod}
        total={total}
        workerTitle={worker?.title || "our global mission"}
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
                  endDate={endDate}
                  frequency={frequency}
                  hasEndDate={hasEndDate}
                  onAmountSelect={handleAmountSelect}
                  onCoverFeesChange={setCoverFees}
                  onCustomAmountChange={handleCustomAmountChange}
                  onEndDateChange={setEndDate}
                  onFrequencyChange={setFrequency}
                  onHasEndDateChange={setHasEndDate}
                  minStartDate={minStartDate}
                  onNext={handleNext}
                  onStartDateChange={setStartDate}
                  onToggleScheduleConfig={() =>
                    setShowScheduleConfig(!showScheduleConfig)
                  }
                  showScheduleConfig={showScheduleConfig}
                  startDate={effectiveStartDate}
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
                <PaymentStep
                  isProcessing={isProcessing}
                  onBack={handleBack}
                  onConfirmPayment={handlePayment}
                  onPaymentMethodChange={setPaymentMethod}
                  paymentMethod={paymentMethod}
                  total={total}
                />
              )}
            </AnimatePresence>
          </div>

          <aside className="lg:col-span-5 hidden lg:block">
            <SummaryCard
              worker={
                worker || {
                  title:
                    fundId === "general"
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
              startDate={effectiveStartDate}
              endDate={hasEndDate ? endDate : null}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}

export function CheckoutPageClient({
  searchParams,
}: {
  searchParams: CheckoutPageSearchParams;
}) {
  const normalizedSearchParams = normalizeCheckoutSearchParams(searchParams);
  return <CheckoutContent searchParams={normalizedSearchParams} />;
}

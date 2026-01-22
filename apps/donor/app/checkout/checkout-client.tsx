"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  Lock,
  CreditCard,
  ArrowRight,
  Heart,
  Sparkles,
  Loader2,
  CalendarDays,
  Landmark,
  Wallet,
  Zap,
  Activity,
  Shield,
} from "lucide-react";
import { getFieldWorkerById } from "@/lib/mock-data";
import { Button } from "@asym/ui/components/shadcn/button";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import { Switch } from "@asym/ui/components/shadcn/switch";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@asym/ui/components/shadcn/avatar";
import { Separator } from "@asym/ui/components/shadcn/separator";
import { cn, formatCurrency } from "@asym/lib/utils";
import { useSearchParams } from "next/navigation";

type Step = "config" | "details" | "payment" | "success";
type Frequency = "one-time" | "monthly";
type PaymentMethod = "card" | "ach" | "wallet";

const PRESET_AMOUNTS = [50, 100, 250, 500];
const STRIPE_FEE_PERCENT = 0.029;
const STRIPE_FEE_FIXED = 0.3;

const formatDatePretty = (dateStr: string) => {
  if (!dateStr) return "Today";
  const date = new Date(dateStr);
  const today = new Date();

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
    new Date(startDate).setHours(0, 0, 0, 0) > new Date().setHours(0, 0, 0, 0);
  const dueToday = isFutureStart ? 0 : total;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden sticky top-32">
      <div className="p-8 bg-slate-50/50 border-b border-slate-100">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">
          Contribution Summary
        </h3>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-4 border-white shadow-xl">
            <AvatarImage src={worker?.image} className="object-cover" />
            <AvatarFallback className="bg-zinc-100 text-zinc-900 font-bold">
              GH
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">
              Supporting
            </p>
            <p className="text-xl font-bold text-slate-950 font-syne leading-tight">
              {worker?.title || "General Mission Fund"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">Base Amount</span>
            <span className="font-bold text-slate-950 font-syne">
              {formatCurrency(amount)}
            </span>
          </div>

          {coverFees && (
            <div className="flex justify-between items-center text-sm animate-in fade-in slide-in-from-top-2">
              <span className="text-slate-500 font-medium flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-zinc-900 fill-zinc-900" />{" "}
                Processing Fee
              </span>
              <span className="font-bold text-zinc-900 font-syne">
                {formatCurrency(fees)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">Frequency</span>
            <Badge
              variant="outline"
              className={cn(
                "uppercase text-[10px] font-black tracking-[0.2em] px-4 py-1.5 rounded-full border-none shadow-none",
                frequency === "monthly"
                  ? "bg-zinc-900 text-white"
                  : "bg-slate-100 text-slate-500",
              )}
            >
              {frequency}
            </Badge>
          </div>
        </div>

        {frequency === "monthly" && (
          <div className="bg-slate-50 rounded-2xl p-5 space-y-3 border border-slate-100">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-slate-400">Start Date</span>
              <span className="text-slate-900">
                {formatDatePretty(startDate)}
              </span>
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-slate-400">Duration</span>
              <span className="text-slate-900 flex items-center gap-2">
                {endDate ? formatDatePretty(endDate) : "Ongoing"}
              </span>
            </div>
          </div>
        )}

        <Separator className="bg-slate-100" />

        <div className="flex justify-between items-end pt-2">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              Amount Due Today
            </span>
            <span className="block text-3xl font-bold text-slate-950 font-syne tracking-tighter">
              {formatCurrency(dueToday)}
            </span>
          </div>
          {isFutureStart && (
            <div className="text-right pb-1">
              <span className="text-[9px] font-black text-zinc-900 uppercase tracking-widest block mb-1">
                Set Recurring
              </span>
              <span className="text-sm font-bold text-slate-400 font-syne">
                {formatCurrency(total)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="px-8 py-4 bg-slate-950 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-zinc-500" /> Secure SSL
        </div>
        <div className="flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-zinc-500" /> PCI Compliant
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
                "h-1.5 rounded-full transition-all duration-700 ease-[0.22, 1, 0.36, 1]",
                currentIdx === idx
                  ? "bg-zinc-900 w-12"
                  : currentIdx > idx
                    ? "bg-slate-900 w-6"
                    : "bg-slate-200 w-6",
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                "text-[9px] font-black uppercase tracking-[0.3em]",
                currentIdx === idx ? "text-slate-950" : "text-slate-300",
              )}
            >
              {s.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className="h-px w-8 bg-slate-100 mb-6" aria-hidden="true" />
          )}
        </div>
      ))}
    </nav>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const workerId = searchParams.get("workerId");
  const initialAmount = searchParams.get("amount");
  const worker = workerId ? getFieldWorkerById(workerId) : null;

  const [step, setStep] = useState<Step>("config");
  const [amount, setAmount] = useState<number>(
    initialAmount ? Number(initialAmount) : 100,
  );
  const [customAmount, setCustomAmount] = useState<string>("");
  const [frequency, setFrequency] = useState<Frequency>("monthly");
  const [coverFees, setCoverFees] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split("T")[0] ?? "",
  );
  const [showScheduleConfig, setShowScheduleConfig] = useState(false);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState<string>("");

  const [donorInfo, setDonorInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

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

  if (!worker && step !== "success" && !searchParams.get("fund")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-6">
          <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto border border-slate-100 shadow-xl">
            <Activity className="h-8 w-8 text-slate-300" />
          </div>
          <h2 className="text-3xl font-bold text-slate-950 font-syne">
            Target Unspecified
          </h2>
          <Button
            asChild
            className="rounded-full px-8 h-12 font-black font-syne text-[10px] uppercase tracking-widest bg-zinc-900 hover:bg-zinc-800"
          >
            <Link href="/workers">View Missionaries</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white max-w-2xl w-full rounded-[3.5rem] shadow-[0_100px_150px_-50px_rgba(0,0,0,0.1)] overflow-hidden text-center"
        >
          <div className="bg-slate-950 pt-24 pb-32 px-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" aria-hidden="true">
              <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-500 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-500 rounded-full blur-[100px]" />
            </div>

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(255,255,255,0.1)]"
            >
              <Check
                className="w-12 h-12 text-slate-950"
                strokeWidth={3}
                aria-hidden="true"
              />
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold mb-4 font-syne tracking-tighter">
              Contribution Logged.
            </h1>
            <p className="text-zinc-400 font-black text-xs uppercase tracking-[0.4em]">
              Thank you for your support
            </p>
          </div>

          <div className="px-16 py-20 space-y-12">
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                Total Contribution
              </p>
              <p className="text-7xl font-bold text-slate-950 font-syne tracking-tighter">
                {formatCurrency(total)}
              </p>
              {frequency === "monthly" && (
                <div className="inline-flex items-center gap-3 bg-zinc-100 text-zinc-900 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <Activity className="h-3.5 w-3.5" aria-hidden="true" />{" "}
                  Ongoing Monthly Support
                </div>
              )}
            </div>

            <p className="text-xl text-slate-500 leading-relaxed font-light tracking-tight">
              A secure receipt has been sent to{" "}
              <span className="text-slate-950 font-bold">
                {donorInfo.email}
              </span>
              . Your gift is being routed to{" "}
              <span className="text-slate-950 font-bold">
                {worker?.title || "our global mission"}
              </span>
              .
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                asChild
                size="lg"
                className="flex-1 h-20 rounded-3xl bg-slate-950 text-white hover:bg-zinc-800 transition-all font-black font-syne text-[11px] uppercase tracking-widest"
              >
                <Link href="/donor-dashboard">Enter Dashboard</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="flex-1 h-20 rounded-3xl border-slate-100 hover:bg-slate-50 font-black font-syne text-[11px] uppercase tracking-widest"
              >
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
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
                <motion.div
                  key="config"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-12"
                >
                  <header className="space-y-4">
                    <span className="text-xs font-black text-zinc-900 uppercase tracking-[0.4em]">
                      Set Up Support
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold text-slate-950 font-syne tracking-tighter">
                      Your Gift.
                    </h1>
                    <p className="text-2xl text-slate-400 font-light tracking-tight">
                      Configure the amount and frequency of your impact.
                    </p>
                  </header>

                  <div className="space-y-8">
                    <fieldset className="space-y-4">
                      <legend className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                        Contribution Frequency
                      </legend>
                      <div
                        className="flex p-1.5 bg-slate-50 rounded-2xl border border-slate-100"
                        role="radiogroup"
                      >
                        <button
                          onClick={() => setFrequency("one-time")}
                          role="radio"
                          aria-checked={frequency === "one-time"}
                          className={cn(
                            "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-500",
                            frequency === "one-time"
                              ? "bg-white text-slate-950 shadow-md"
                              : "text-slate-400 hover:text-slate-600",
                          )}
                        >
                          One-Time
                        </button>
                        <button
                          onClick={() => setFrequency("monthly")}
                          role="radio"
                          aria-checked={frequency === "monthly"}
                          className={cn(
                            "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-500 relative",
                            frequency === "monthly"
                              ? "bg-white text-zinc-900 shadow-md"
                              : "text-slate-400 hover:text-slate-600",
                          )}
                        >
                          Monthly Partner
                        </button>
                      </div>
                    </fieldset>

                    <fieldset className="space-y-6">
                      <legend className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                        Support Amount
                      </legend>
                      <div
                        className="grid grid-cols-2 md:grid-cols-4 gap-4"
                        role="radiogroup"
                      >
                        {PRESET_AMOUNTS.map((val) => (
                          <button
                            key={val}
                            onClick={() => handleAmountSelect(val)}
                            role="radio"
                            aria-checked={amount === val && !customAmount}
                            className={cn(
                              "h-24 rounded-[1.8rem] border-2 font-bold font-syne text-2xl transition-all duration-500",
                              amount === val && !customAmount
                                ? "border-slate-950 bg-slate-950 text-white shadow-2xl scale-[1.05]"
                                : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200 hover:bg-slate-100",
                            )}
                          >
                            ${val}
                          </button>
                        ))}
                      </div>

                      <div className="relative mt-8">
                        <span
                          className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 font-bold font-syne text-3xl"
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
                          onChange={handleCustomAmountChange}
                          className={cn(
                            "w-full h-24 pl-16 pr-8 rounded-[1.8rem] text-3xl font-bold font-syne transition-all duration-500 outline-none border-2",
                            customAmount
                              ? "border-slate-950 bg-white"
                              : "border-slate-50 bg-slate-50 focus:border-slate-200",
                          )}
                        />
                      </div>
                    </fieldset>

                    {frequency === "monthly" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-6 overflow-hidden"
                      >
                        <div className="bg-zinc-50 rounded-[2rem] p-8 border border-zinc-100">
                          <div className="flex items-start justify-between mb-8">
                            <div className="space-y-1">
                              <h4 className="font-black text-zinc-900 text-[10px] uppercase tracking-[0.2em] flex items-center gap-3">
                                <CalendarDays
                                  className="w-4 h-4"
                                  aria-hidden="true"
                                />{" "}
                                Support Schedule
                              </h4>
                              <p className="text-sm text-zinc-600 font-medium">
                                First contribution scheduled for{" "}
                                <span className="text-zinc-900 font-bold">
                                  {formatDatePretty(startDate)}
                                </span>
                                .
                              </p>
                            </div>
                            <button
                              className="h-10 px-5 rounded-full border border-zinc-200 text-zinc-700 font-black text-[9px] uppercase tracking-widest hover:bg-zinc-100 transition-colors"
                              onClick={() =>
                                setShowScheduleConfig(!showScheduleConfig)
                              }
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
                                      className="text-[10px] font-black text-slate-400 uppercase tracking-widest"
                                    >
                                      Start Date
                                    </Label>
                                    <Input
                                      id="start-date"
                                      type="date"
                                      value={startDate}
                                      min={
                                        new Date().toISOString().split("T")[0]
                                      }
                                      onChange={(e) =>
                                        setStartDate(e.target.value)
                                      }
                                      className="h-14 rounded-2xl bg-white border-zinc-100 font-medium"
                                    />
                                  </div>
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                      <Label
                                        htmlFor="end-date"
                                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest"
                                      >
                                        Ending Date
                                      </Label>
                                      <Switch
                                        checked={hasEndDate}
                                        onCheckedChange={(c) => {
                                          setHasEndDate(c);
                                          if (!c) setEndDate("");
                                        }}
                                      />
                                    </div>
                                    {hasEndDate ? (
                                      <Input
                                        id="end-date"
                                        type="date"
                                        value={endDate}
                                        min={startDate}
                                        onChange={(e) =>
                                          setEndDate(e.target.value)
                                        }
                                        className="h-14 rounded-2xl bg-white border-slate-100"
                                      />
                                    ) : (
                                      <div className="h-14 flex items-center px-4 bg-slate-50 rounded-2xl text-xs text-slate-400 font-bold uppercase tracking-widest">
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
                    )}

                    <div
                      className={cn(
                        "rounded-[2rem] p-8 border-2 flex gap-6 items-center cursor-pointer transition-all duration-500",
                        coverFees
                          ? "bg-zinc-900 border-zinc-900 text-white"
                          : "bg-white border-slate-100 text-slate-950 hover:border-slate-200",
                      )}
                      onClick={() => setCoverFees(!coverFees)}
                      role="checkbox"
                      aria-checked={coverFees}
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" && setCoverFees(!coverFees)
                      }
                    >
                      <div
                        className={cn(
                          "h-14 w-14 rounded-2xl flex items-center justify-center transition-colors",
                          coverFees ? "bg-white/20" : "bg-slate-50",
                        )}
                      >
                        <Heart
                          className={cn(
                            "h-6 w-6",
                            coverFees
                              ? "text-white fill-current"
                              : "text-zinc-900",
                          )}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold font-syne text-xl">
                          Cover Processing Fees
                        </p>
                        <p
                          className={cn(
                            "text-xs font-medium mt-1 leading-relaxed",
                            coverFees ? "text-white/80" : "text-slate-400",
                          )}
                        >
                          Add <strong>{formatCurrency(calculatedFees)}</strong>{" "}
                          so 100% of your gift reaches the field.
                        </p>
                      </div>
                      <Switch
                        checked={coverFees}
                        onCheckedChange={setCoverFees}
                        className="data-[state=checked]:bg-white data-[state=checked]:opacity-100"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleNext}
                    disabled={amount <= 0}
                    size="lg"
                    className="w-full h-24 text-2xl font-black font-syne bg-slate-950 hover:bg-zinc-800 text-white shadow-2xl rounded-full transition-all hover:scale-[1.02] uppercase tracking-widest"
                  >
                    Next Step{" "}
                    <ArrowRight className="ml-4 h-8 w-8" aria-hidden="true" />
                  </Button>
                </motion.div>
              )}

              {step === "details" && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-12"
                >
                  <header className="space-y-4">
                    <span className="text-xs font-black text-zinc-900 uppercase tracking-[0.4em]">
                      Donor Information
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold text-slate-950 font-syne tracking-tighter">
                      Your Details.
                    </h1>
                    <p className="text-2xl text-slate-400 font-light tracking-tight">
                      Information for tax receipts and donation tracking.
                    </p>
                  </header>

                  <div className="bg-slate-50 p-12 rounded-[3rem] border border-slate-100 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <Label
                          htmlFor="first-name"
                          className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2"
                        >
                          First Name
                        </Label>
                        <Input
                          id="first-name"
                          value={donorInfo.firstName}
                          onChange={(e) =>
                            setDonorInfo({
                              ...donorInfo,
                              firstName: e.target.value,
                            })
                          }
                          placeholder="Jane"
                          className="h-16 rounded-2xl bg-white border-none text-lg font-medium shadow-sm focus:ring-4 focus:ring-zinc-900/5 px-6"
                          autoComplete="given-name"
                        />
                      </div>
                      <div className="space-y-4">
                        <Label
                          htmlFor="last-name"
                          className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2"
                        >
                          Last Name
                        </Label>
                        <Input
                          id="last-name"
                          value={donorInfo.lastName}
                          onChange={(e) =>
                            setDonorInfo({
                              ...donorInfo,
                              lastName: e.target.value,
                            })
                          }
                          placeholder="Doe"
                          className="h-16 rounded-2xl bg-white border-none text-lg font-medium shadow-sm focus:ring-4 focus:ring-zinc-900/5 px-6"
                          autoComplete="family-name"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label
                        htmlFor="email"
                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2"
                      >
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={donorInfo.email}
                        onChange={(e) =>
                          setDonorInfo({ ...donorInfo, email: e.target.value })
                        }
                        placeholder="jane.doe@example.com"
                        className="h-16 rounded-2xl bg-white border-none text-lg font-medium shadow-sm focus:ring-4 focus:ring-zinc-900/5 px-6"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      size="lg"
                      className="h-20 px-12 rounded-full border-slate-100 text-slate-400 font-black font-syne text-xs uppercase tracking-widest hover:bg-slate-50"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={
                        !donorInfo.firstName ||
                        !donorInfo.lastName ||
                        !donorInfo.email
                      }
                      size="lg"
                      className="flex-1 h-20 text-xl font-black font-syne bg-slate-950 hover:bg-zinc-800 text-white shadow-2xl rounded-full transition-all uppercase tracking-widest"
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === "payment" && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-12"
                >
                  <header className="space-y-4">
                    <span className="text-xs font-black text-zinc-900 uppercase tracking-[0.4em]">
                      Payment Information
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold text-slate-950 font-syne tracking-tighter">
                      Secure Payment.
                    </h1>
                    <p className="text-2xl text-slate-400 font-light tracking-tight">
                      Safely authorize your contribution.
                    </p>
                  </header>

                  <div className="bg-slate-50 p-12 rounded-[3.5rem] border border-slate-100 space-y-10">
                    <div
                      className="flex p-2 bg-white rounded-[2rem] border border-slate-100"
                      role="tablist"
                    >
                      <button
                        role="tab"
                        aria-selected={paymentMethod === "card"}
                        onClick={() => setPaymentMethod("card")}
                        className={cn(
                          "flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-3xl transition-all",
                          paymentMethod === "card"
                            ? "bg-slate-950 text-white shadow-xl"
                            : "text-slate-400",
                        )}
                      >
                        Card
                      </button>
                      <button
                        role="tab"
                        aria-selected={paymentMethod === "ach"}
                        onClick={() => setPaymentMethod("ach")}
                        className={cn(
                          "flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-3xl transition-all",
                          paymentMethod === "ach"
                            ? "bg-slate-950 text-white shadow-xl"
                            : "text-slate-400",
                        )}
                      >
                        Bank
                      </button>
                      <button
                        role="tab"
                        aria-selected={paymentMethod === "wallet"}
                        onClick={() => setPaymentMethod("wallet")}
                        className={cn(
                          "flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-3xl transition-all",
                          paymentMethod === "wallet"
                            ? "bg-slate-950 text-white shadow-xl"
                            : "text-slate-400",
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
                                className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2"
                              >
                                Card Details
                              </Label>
                              <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                                <div className="relative border-b border-slate-50">
                                  <CreditCard
                                    className="absolute left-6 top-6 h-6 w-6 text-slate-300"
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
                                    className="h-20 border-none border-r border-slate-50 text-lg font-medium bg-transparent focus-visible:ring-0 px-8"
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
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
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
                                  className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2"
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
                            <div className="w-24 h-24 bg-zinc-100 rounded-[2rem] flex items-center justify-center mx-auto">
                              <Landmark
                                className="h-10 w-10 text-zinc-900"
                                aria-hidden="true"
                              />
                            </div>
                            <div className="space-y-4">
                              <h3 className="text-2xl font-bold font-syne">
                                Instant Bank Link
                              </h3>
                              <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
                                Securely connect your bank account via Stripe
                                Financial Connections to maximize your impact
                                with 0% credit card fees.
                              </p>
                            </div>
                            <Button className="h-20 px-12 rounded-full bg-slate-950 text-white font-black font-syne text-xs uppercase tracking-widest shadow-2xl hover:bg-zinc-800">
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
                            <button className="h-20 px-12 rounded-full bg-black text-white font-bold text-2xl flex items-center gap-4 hover:scale-105 transition-all shadow-2xl">
                              <Wallet className="h-8 w-8" aria-hidden="true" />{" "}
                              Pay with Apple Pay
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6">
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      size="lg"
                      className="h-24 px-12 rounded-full border-slate-100 text-slate-400 font-black font-syne text-xs uppercase tracking-widest"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handlePayment}
                      disabled={isProcessing}
                      size="lg"
                      className="flex-1 h-24 text-2xl font-black font-syne bg-zinc-900 hover:bg-zinc-800 text-white shadow-2xl rounded-full transition-all hover:scale-[1.02] uppercase tracking-widest"
                    >
                      {isProcessing ? (
                        <Loader2
                          className="animate-spin h-8 w-8"
                          aria-label="Processing payment"
                        />
                      ) : (
                        `Confirm ${formatCurrency(total)}`
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <aside className="lg:col-span-5 hidden lg:block">
            <SummaryCard
              worker={
                worker || {
                  title:
                    searchParams.get("fund") === "general"
                      ? "General Mission Fund"
                      : "Urgent Needs",
                }
              }
              amount={amount}
              frequency={frequency}
              coverFees={coverFees}
              fees={calculatedFees}
              total={total}
              startDate={startDate}
              endDate={hasEndDate ? endDate : null}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}

export function CheckoutPageClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2
            className="animate-spin h-12 w-12 text-slate-200"
            aria-label="Loading checkout"
          />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}

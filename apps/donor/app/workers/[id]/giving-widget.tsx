"use client";

import React, { useState } from "react";
import Link from "next/link";
import { cn } from "@asym/ui/lib/utils";
import { formatCurrency } from "@asym/lib/utils";
import { Button } from "@asym/ui/components/shadcn/button";
import { ShieldCheck } from "lucide-react";
import { Card } from "@asym/ui/components/shadcn/card";
import { Progress } from "@asym/ui/components/shadcn/progress";

const GivingAmounts = [50, 100, 200, 500];

interface GivingWidgetProps {
  workerId: string;
  raised: number;
  goal: number | null;
  percentRaised: number | null;
}

export function GivingWidget({
  workerId,
  raised,
  goal,
  percentRaised,
}: GivingWidgetProps) {
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [frequency, setFrequency] = useState<"one-time" | "monthly">("monthly");
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handleAmountClick = (val: number) => {
    setAmount(val);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
      setCustomAmount(val);
      if (val && !isNaN(parseFloat(val))) {
        setAmount(parseFloat(val));
      }
    }
  };

  const hasGoal = goal !== null && percentRaised !== null;

  return (
    <Card className="border-none shadow-xl shadow-slate-200/60 overflow-hidden relative bg-white ring-1 ring-slate-100 rounded-2xl">
      <div className="p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="font-bold text-2xl text-slate-900 tracking-tight">
            Partner with Us
          </h3>
          <p className="text-slate-500 text-sm">
            Empower this mission with your support.
          </p>
        </div>

        <div
          className="bg-slate-100 p-1.5 rounded-xl flex relative"
          role="radiogroup"
          aria-label="Giving frequency"
        >
          <button
            onClick={() => setFrequency("one-time")}
            role="radio"
            aria-checked={frequency === "one-time"}
            className={cn(
              "flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-300 relative z-10",
              frequency === "one-time"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            One-Time
          </button>
          <button
            onClick={() => setFrequency("monthly")}
            role="radio"
            aria-checked={frequency === "monthly"}
            className={cn(
              "flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-300 relative z-10",
              frequency === "monthly"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            Monthly
          </button>
        </div>

        <div className="space-y-4">
          <div
            className={cn(
              "relative h-14 rounded-xl border-2 transition-all duration-300 bg-white flex items-center overflow-hidden cursor-text group",
              isInputFocused
                ? "border-slate-900 ring-4 ring-slate-900/5"
                : "border-slate-200 hover:border-slate-300",
            )}
            onClick={() =>
              document.getElementById("custom-amount-input")?.focus()
            }
          >
            <span
              className={cn(
                "absolute left-5 text-xl font-bold transition-colors pointer-events-none",
                isInputFocused || customAmount
                  ? "text-slate-900"
                  : "text-slate-300",
              )}
              aria-hidden="true"
            >
              $
            </span>

            <label htmlFor="custom-amount-input" className="sr-only">
              Custom donation amount
            </label>
            <input
              id="custom-amount-input"
              type="number"
              placeholder="0"
              className="w-full h-full bg-transparent border-none outline-none pl-10 pr-6 text-2xl font-bold text-slate-900 placeholder:text-slate-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all"
              value={customAmount}
              onChange={handleCustomAmountChange}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              inputMode="decimal"
            />

            <span
              className="absolute right-5 text-[9px] font-bold text-slate-400 pointer-events-none uppercase tracking-wider bg-slate-50 px-2 py-1 rounded"
              aria-hidden="true"
            >
              USD
            </span>
          </div>

          <div
            className="grid grid-cols-4 gap-2"
            role="radiogroup"
            aria-label="Preset donation amounts"
          >
            {GivingAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => handleAmountClick(amt)}
                role="radio"
                aria-checked={amount === amt && !customAmount}
                className={cn(
                  "py-2.5 rounded-xl border text-sm font-bold transition-all active:scale-95",
                  amount === amt && !customAmount
                    ? "border-slate-900 bg-slate-50 text-slate-900"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50",
                )}
              >
                ${amt}
              </button>
            ))}
          </div>
        </div>

        {hasGoal && (
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-end text-sm">
              <span className="font-bold text-slate-700">
                {percentRaised}% Funded
              </span>
              <span className="text-slate-500 font-medium">
                {formatCurrency(raised)}{" "}
                <span className="text-slate-300" aria-hidden="true">
                  /
                </span>{" "}
                {formatCurrency(goal)}
              </span>
            </div>
            <Progress
              value={percentRaised}
              className="h-2.5 bg-slate-100"
              aria-label={`${percentRaised}% of funding goal reached`}
            />
          </div>
        )}

        <Button
          size="lg"
          className="w-full h-14 text-lg font-bold bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/20 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99]"
          asChild
        >
          <Link
            href={`/checkout?workerId=${workerId}&amount=${amount}&frequency=${frequency}`}
          >
            {frequency === "monthly"
              ? `Give ${formatCurrency(amount)} Monthly`
              : `Give ${formatCurrency(amount)}`}
          </Link>
        </Button>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
          <ShieldCheck
            className="h-3.5 w-3.5 text-emerald-500"
            aria-hidden="true"
          />{" "}
          Secure Payment &bull; 100% Tax Deductible
        </div>
      </div>
    </Card>
  );
}

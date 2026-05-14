"use client";

import { formatCurrency } from "@asym/lib/utils";
import { Button } from "@asym/ui/components/shadcn/button";
import { Card } from "@asym/ui/components/shadcn/card";
import { Progress } from "@asym/ui/components/shadcn/progress";
import { cn } from "@asym/ui/lib/utils";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

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
    <Card className="border-none shadow-xl shadow-zinc-200/60 overflow-hidden relative bg-white ring-1 ring-zinc-100 rounded-2xl">
      <div className="p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="font-semibold text-2xl text-zinc-900 tracking-tight">
            Partner with Us
          </h3>
          <p className="text-zinc-500 text-sm">
            Empower this mission with your support.
          </p>
        </div>

        <div
          className="bg-zinc-100 p-1.5 rounded-xl flex relative"
          role="radiogroup"
          aria-label="Giving frequency"
        >
          <button
            onClick={() => setFrequency("one-time")}
            role="radio"
            aria-checked={frequency === "one-time"}
            className={cn(
              "flex-1 py-3 text-sm font-semibold rounded-lg transition-all duration-300 relative z-10",
              frequency === "one-time"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700",
            )}
          >
            One-Time
          </button>
          <button
            onClick={() => setFrequency("monthly")}
            role="radio"
            aria-checked={frequency === "monthly"}
            className={cn(
              "flex-1 py-3 text-sm font-semibold rounded-lg transition-all duration-300 relative z-10",
              frequency === "monthly"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700",
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
                ? "border-zinc-900 ring-4 ring-zinc-900/5"
                : "border-zinc-200 hover:border-zinc-300",
            )}
          >
            <span
              className={cn(
                "absolute left-5 text-xl font-semibold transition-colors pointer-events-none",
                isInputFocused || customAmount
                  ? "text-zinc-900"
                  : "text-zinc-300",
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
              className="size-full bg-transparent border-none outline-none pl-10 pr-6 text-2xl font-semibold text-zinc-900 placeholder:text-zinc-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all"
              value={customAmount}
              onChange={handleCustomAmountChange}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              inputMode="decimal"
            />

            <span
              className="absolute right-5 text-[9px] font-semibold text-zinc-400 pointer-events-none uppercase tracking-wider bg-zinc-50 px-2 py-1 rounded"
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
                  "py-2.5 rounded-xl border text-sm font-semibold press-feedback",
                  amount === amt && !customAmount
                    ? "border-zinc-900 bg-zinc-50 text-zinc-900"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 hover:bg-zinc-50",
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
              <span className="font-semibold text-zinc-700">
                {percentRaised}% Funded
              </span>
              <span className="text-zinc-500 font-medium">
                {formatCurrency(raised)}{" "}
                <span className="text-zinc-300" aria-hidden="true">
                  /
                </span>{" "}
                {formatCurrency(goal)}
              </span>
            </div>
            <Progress
              value={percentRaised}
              className="h-2.5 bg-zinc-100"
              aria-label={`${percentRaised}% of funding goal reached`}
            />
          </div>
        )}

        <Button
          size="lg"
          className="w-full h-14 text-lg font-semibold bg-zinc-900 hover:bg-zinc-800 shadow-xl shadow-zinc-900/20 rounded-xl hover-scale-subtle"
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

        <div className="flex items-center justify-center gap-2 text-xs text-zinc-400 font-medium">
          <ShieldCheck
            className="size-3.5 text-emerald-500"
            aria-hidden="true"
          />{" "}
          Secure Payment &bull; 100% Tax Deductible
        </div>
      </div>
    </Card>
  );
}

"use client";

import { buildWorkerCheckoutHref } from "@asym/lib/payments/checkout-designations";
import { formatCurrency } from "@asym/lib/utils";
import { buttonVariants } from "@asym/ui/components/shadcn/button";
import { Card } from "@asym/ui/components/shadcn/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@asym/ui/components/shadcn/input-group";
import { Meter } from "@asym/ui/components/shadcn/meter";
import {
  RadioGroup,
  RadioGroupItem,
} from "@asym/ui/components/shadcn/radio-group";
import { cn } from "@asym/ui/lib/utils";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

const GivingAmounts = [50, 100, 200, 500];

interface GivingWidgetProps {
  missionaryId: string;
  workerId: string;
  raised: number;
  goal: number | null;
  percentRaised: number | null;
}

export function GivingWidget({
  missionaryId,
  workerId,
  raised,
  goal,
  percentRaised,
}: GivingWidgetProps) {
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>("");
  const frequency = "one-time";

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
    <Card className="overflow-hidden relative">
      <div className="p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <h3 className="font-semibold text-2xl text-foreground tracking-tight">
            Partner with Us
          </h3>
          <p className="text-muted-foreground text-sm">
            Empower this mission with your support.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-background p-4 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            One-time gift
          </p>
        </div>

        <div className="space-y-4">
          <label htmlFor="custom-amount-input" className="sr-only">
            Custom donation amount
          </label>
          <InputGroup>
            <InputGroupAddon aria-hidden="true">$</InputGroupAddon>
            <InputGroupInput
              id="custom-amount-input"
              type="number"
              placeholder="0"
              value={customAmount}
              onChange={handleCustomAmountChange}
              inputMode="decimal"
            />
            <InputGroupAddon align="inline-end" aria-hidden="true">
              USD
            </InputGroupAddon>
          </InputGroup>

          <RadioGroup
            className="grid-cols-4 gap-2"
            aria-label="Preset donation amounts"
            value={customAmount ? null : amount}
            onValueChange={(value) => {
              if (typeof value === "number") handleAmountClick(value);
            }}
          >
            {GivingAmounts.map((amt) => (
              <RadioGroupItem
                key={amt}
                value={amt}
                nativeButton
                render={(radioProps) => <button {...radioProps}>${amt}</button>}
                className={cn(
                  "aspect-auto h-auto w-full py-2.5 rounded-xl border text-sm font-semibold shadow-none press-feedback",
                  amount === amt && !customAmount
                    ? "border-border bg-background text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-border hover:text-foreground hover:bg-background",
                )}
              />
            ))}
          </RadioGroup>
        </div>

        {hasGoal && (
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-end text-sm">
              <span className="font-semibold text-foreground">
                {percentRaised}% Funded
              </span>
              <span className="text-muted-foreground font-medium">
                {formatCurrency(raised)}{" "}
                <span className="text-muted-foreground" aria-hidden="true">
                  /
                </span>{" "}
                {formatCurrency(goal)}
              </span>
            </div>
            <Meter
              value={percentRaised}
              className="h-2.5 bg-muted"
              aria-label={`${percentRaised}% of funding goal reached`}
            />
          </div>
        )}

        <Link
          href={buildWorkerCheckoutHref({
            amount,
            frequency,
            missionaryId,
            workerId,
          })}
          className={cn(buttonVariants({ size: "lg" }), "w-full")}
        >
          Give {formatCurrency(amount)}
        </Link>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium">
          <ShieldCheck className="size-3.5 text-success" aria-hidden="true" />{" "}
          Secure Payment &bull; 100% Tax Deductible
        </div>
      </div>
    </Card>
  );
}

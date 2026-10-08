"use client";

import { motion, AnimatePresence } from "@asym/lib/motion";
import { transitionStandard } from "@asym/lib/motion-presets";
import { buildWorkerCheckoutHref } from "@asym/lib/payments/checkout-designations";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupButton,
} from "@asym/ui/components/shadcn/input-group";
import { cn } from "@asym/ui/lib/utils";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";

interface QuickGiveInputProps {
  missionaryId: string;
  workerId: string;
  className?: string;
}

export function QuickGiveInput({
  missionaryId,
  workerId,
  className,
}: QuickGiveInputProps) {
  const { push } = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [amount, setAmount] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Show the CTA if focused OR if there's an amount entered
  const isExpanded = isFocused || amount.length > 0;
  const hasValidAmount =
    amount.length > 0 && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        if (!amount) {
          setIsFocused(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [amount]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and up to 2 decimal places
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
  };

  const handleGive = () => {
    if (hasValidAmount) {
      push(
        buildWorkerCheckoutHref({
          amount,
          missionaryId,
          workerId,
        }),
      );
    } else {
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleGive();
    }
  };

  return (
    <motion.div
      ref={containerRef}
      className={cn("w-full rounded-md bg-background", className)}
    >
      <InputGroup>
        <InputGroupAddon aria-hidden="true">$</InputGroupAddon>
        <motion.div layout className="flex-1 min-w-0">
          <InputGroupInput
            ref={inputRef}
            type="text"
            inputMode="decimal"
            placeholder={isFocused ? "" : "Give"}
            value={amount}
            onChange={handleAmountChange}
            onFocus={() => setIsFocused(true)}
            onBlur={(event) => {
              if (
                !amount &&
                !containerRef.current?.contains(event.relatedTarget)
              ) {
                setIsFocused(false);
              }
            }}
            onKeyDown={handleKeyDown}
            aria-label="Donation amount"
          />
        </motion.div>
        <InputGroupAddon align="inline-end">
          <AnimatePresence mode="popLayout" initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={transitionStandard}
              >
                <InputGroupButton
                  variant="default"
                  size="sm"
                  onClick={handleGive}
                >
                  Give <ArrowRight aria-hidden="true" />
                </InputGroupButton>
              </motion.div>
            )}
          </AnimatePresence>
          {!isExpanded && <ArrowRight aria-hidden="true" />}
        </InputGroupAddon>
      </InputGroup>
    </motion.div>
  );
}

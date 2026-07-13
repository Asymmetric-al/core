"use client";

import { buildWorkerCheckoutHref } from "@asym/lib/payments/checkout-designations";
import { buttonVariants } from "@asym/ui/components/shadcn/button";
import { cn } from "@asym/ui/lib/utils";
import { Zap } from "lucide-react";
import Link from "next/link";
import React from "react";

export function QuickGive({
  missionaryId,
  workerId,
}: {
  missionaryId: string;
  workerId: string;
}) {
  return (
    <Link
      href={buildWorkerCheckoutHref({
        amount: 100,
        missionaryId,
        workerId,
      })}
      className={cn(
        buttonVariants(),
        "w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 shadow-md group",
      )}
    >
      <Zap className="mr-2 size-4 fill-current group-hover:animate-pulse" />{" "}
      Quick Give $100
    </Link>
  );
}

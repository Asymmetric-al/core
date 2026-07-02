"use client";

import { buttonVariants } from "@asym/ui/components/shadcn/button";
import { cn } from "@asym/ui/lib/utils";
import { Zap } from "lucide-react";
import Link from "next/link";
import React from "react";

export function QuickGive({ workerId }: { workerId: string }) {
  return (
    <Link
      href={`/checkout?workerId=${workerId}`}
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

"use client";

import React from "react";
import { Button } from "@asym/ui/components/shadcn/button";
import Link from "next/link";
import { Zap } from "lucide-react";

export function QuickGive({ workerId }: { workerId: string }) {
  return (
    <Button
      className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 shadow-md group transition-all active:scale-95"
      asChild
    >
      <Link href={`/checkout?workerId=${workerId}`}>
        <Zap className="mr-2 h-4 w-4 fill-current group-hover:animate-pulse" />{" "}
        Quick Give $100
      </Link>
    </Button>
  );
}

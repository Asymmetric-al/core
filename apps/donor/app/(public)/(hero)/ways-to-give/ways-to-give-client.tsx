"use client";

import { buttonVariants } from "@asym/ui/components/shadcn/button";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import { cn } from "@asym/ui/lib/utils";
import {
  ArrowRight,
  Briefcase,
  CreditCard,
  Gift,
  Landmark,
  Repeat,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import React from "react";

// Giving methods this site doesn't take yet, listed so donors aren't left
// looking for them.
const NOT_YET_ONLINE = [
  { Icon: Repeat, label: "Monthly giving" },
  { Icon: Landmark, label: "Bank transfers" },
  { Icon: TrendingUp, label: "Gifts of stock" },
  { Icon: Gift, label: "Gifts in honor or memory" },
  { Icon: Briefcase, label: "Employer matching" },
] as const;

export function WaysToGiveClient() {
  return (
    <div className="relative bg-background min-h-dvh pt-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-invert"
      />
      <section className="bg-invert text-invert-foreground py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-radial from-info/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 size-150" />

        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-semibold tracking-normal mb-8 text-balance">
            Invest in Hope
          </h1>
          <p className="text-xl md:text-2xl text-invert-foreground/75 max-w-2xl mx-auto leading-relaxed font-light">
            Your generosity fuels the mission. Here’s how you can give today.
          </p>
        </div>
      </section>

      <section className="py-24 container mx-auto px-6 -mt-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-info" />
            <CardContent className="p-10 space-y-6">
              <div className="size-14 bg-info/10 rounded-2xl flex items-center justify-center text-info mb-2">
                <CreditCard className="size-7" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Give online
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Give a one-time gift by card to the missionary you choose.
                </p>
              </div>
              <Link href="/workers" className={cn(buttonVariants(), "w-full")}>
                Find a missionary{" "}
                <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-10 space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Not available online yet
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  This organization hasn’t set these up on this site.
                </p>
              </div>
              <ul className="space-y-3">
                {NOT_YET_ONLINE.map(({ Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-3 text-foreground"
                  >
                    <span className="size-9 shrink-0 bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    {label}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-20 bg-card border-t border-border">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <h2 className="text-3xl font-semibold text-foreground mb-4 tracking-tight">
            Have a question about giving?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 font-light">
            Receipts, tax deductions and how gifts reach the field are covered
            in the FAQ.
          </p>
          <Link href="/faq" className={buttonVariants({ variant: "outline" })}>
            Read the FAQ
          </Link>
        </div>
      </section>
    </div>
  );
}

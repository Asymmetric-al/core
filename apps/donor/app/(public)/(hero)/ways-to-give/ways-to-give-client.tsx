"use client";

import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import { cn } from "@asym/ui/lib/utils";
import {
  CreditCard,
  TrendingUp,
  Landmark,
  Smartphone,
  Gift,
  Briefcase,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import React from "react";

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
            Your generosity fuels the mission. Choose the method that best fits
            your financial strategy.
          </p>
        </div>
      </section>

      <section className="py-24 container mx-auto px-6 -mt-24 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="transition-transform duration-300 overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-info" />
            <CardContent className="p-10 space-y-6">
              <div className="size-14 bg-info/10 rounded-2xl flex items-center justify-center text-info mb-2 transition-colors duration-300">
                <CreditCard className="size-7" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  Credit / Debit
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  The fastest way to deploy aid. Give a one-time gift or set up
                  a recurring monthly partnership.
                </p>
              </div>
              <Link href="/workers" className={cn(buttonVariants(), "w-full")}>
                Give Online <ArrowRight className="ml-2 size-4" />
              </Link>
            </CardContent>
          </Card>

          <Card className="transition-transform duration-300 overflow-hidden group">
            <CardContent className="p-10 space-y-6">
              <div className="size-14 bg-success/10 rounded-2xl flex items-center justify-center text-success mb-2 transition-colors duration-300">
                <TrendingUp className="size-7" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  Stocks & Assets
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Donate appreciated stock or mutual funds to avoid capital
                  gains tax and receive a full deduction.
                </p>
              </div>
              <Button variant="outline" className="w-full">
                Get Transfer Instructions
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-transform duration-300 overflow-hidden group">
            <CardContent className="p-10 space-y-6">
              <div className="size-14 bg-chart-3/10 rounded-2xl flex items-center justify-center text-chart-3 mb-2 transition-colors duration-300">
                <Landmark className="size-7" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  Legacy Giving
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Include GiveHope in your will or estate plan to leave a
                  lasting legacy of compassion.
                </p>
              </div>
              <Button variant="outline" className="w-full">
                Contact Legacy Team
              </Button>
            </CardContent>
          </Card>

          <Card className="border transition-colors">
            <CardContent className="p-8 space-y-4">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
                  <Smartphone className="size-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Cryptocurrency
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We accept Bitcoin, Ethereum, and USDC via our secure crypto
                portal for seamless digital giving.
              </p>
            </CardContent>
          </Card>

          <Card className="border transition-colors">
            <CardContent className="p-8 space-y-4">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
                  <Briefcase className="size-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Employer Matching
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Double your impact instantly. Check if your company matches
                charitable donations with our tool.
              </p>
            </CardContent>
          </Card>

          <Card className="border transition-colors">
            <CardContent className="p-8 space-y-4">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-muted rounded-xl flex items-center justify-center text-muted-foreground">
                  <Gift className="size-6" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  Honor & Memorial
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Give a gift in honor of a loved one. We&apos;ll send a beautiful
                physical card notifying them of your support.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-20 bg-card border-t border-border">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <h2 className="text-3xl font-semibold text-foreground mb-4 tracking-tight">
            Need assistance?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 font-light">
            Our Donor Relations team is here to assist with complex gifts, wire
            transfers, or any questions you may have.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline">Email Us</Button>
            <Button variant="outline">Call (555) 123-4567</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

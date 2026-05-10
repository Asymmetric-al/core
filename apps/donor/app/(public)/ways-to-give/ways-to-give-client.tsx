"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
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
    <div className="bg-zinc-50 min-h-screen pt-20">
      <section className="bg-zinc-950 text-white py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter mb-8 text-balance">
            Invest in Hope
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-light">
            Your generosity fuels the mission. Choose the method that best fits
            your financial strategy.
          </p>
        </div>
      </section>

      <section className="py-24 container mx-auto px-6 -mt-24 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="shadow-2xl shadow-zinc-950/20 border-none hover:-translate-y-2 transition-transform duration-300 rounded-3xl overflow-hidden bg-white relative group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600" />
            <CardContent className="p-10 space-y-6">
              <div className="size-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-2 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <CreditCard className="size-7" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-zinc-900 mb-2">
                  Credit / Debit
                </h3>
                <p className="text-zinc-500 leading-relaxed">
                  The fastest way to deploy aid. Give a one-time gift or set up
                  a recurring monthly partnership.
                </p>
              </div>
              <Button
                className="w-full h-12 text-base font-semibold bg-zinc-900 hover:bg-zinc-800 shadow-lg"
                asChild
              >
                <Link href="/workers">
                  Give Online <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-xl shadow-zinc-200/50 border-none hover:-translate-y-2 transition-transform duration-300 rounded-3xl overflow-hidden bg-white group">
            <CardContent className="p-10 space-y-6">
              <div className="size-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-2 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <TrendingUp className="size-7" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-zinc-900 mb-2">
                  Stocks & Assets
                </h3>
                <p className="text-zinc-500 leading-relaxed">
                  Donate appreciated stock or mutual funds to avoid capital
                  gains tax and receive a full deduction.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full h-12 border-zinc-200 text-zinc-900 font-semibold hover:bg-zinc-50"
              >
                Get Transfer Instructions
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-xl shadow-zinc-200/50 border-none hover:-translate-y-2 transition-transform duration-300 rounded-3xl overflow-hidden bg-white group">
            <CardContent className="p-10 space-y-6">
              <div className="size-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-2 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                <Landmark className="size-7" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-zinc-900 mb-2">
                  Legacy Giving
                </h3>
                <p className="text-zinc-500 leading-relaxed">
                  Include GiveHope in your will or estate plan to leave a
                  lasting legacy of compassion.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full h-12 border-zinc-200 text-zinc-900 font-semibold hover:bg-zinc-50"
              >
                Contact Legacy Team
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg shadow-zinc-200/50 border border-zinc-100 hover:border-zinc-300 transition-all rounded-3xl">
            <CardContent className="p-8 space-y-4">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-600">
                  <Smartphone className="size-6" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900">
                  Cryptocurrency
                </h3>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed">
                We accept Bitcoin, Ethereum, and USDC via our secure crypto
                portal for seamless digital giving.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg shadow-zinc-200/50 border border-zinc-100 hover:border-zinc-300 transition-all rounded-3xl">
            <CardContent className="p-8 space-y-4">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-600">
                  <Briefcase className="size-6" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900">
                  Employer Matching
                </h3>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Double your impact instantly. Check if your company matches
                charitable donations with our tool.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg shadow-zinc-200/50 border border-zinc-100 hover:border-zinc-300 transition-all rounded-3xl">
            <CardContent className="p-8 space-y-4">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-zinc-100 rounded-xl flex items-center justify-center text-zinc-600">
                  <Gift className="size-6" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900">
                  Honor & Memorial
                </h3>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Give a gift in honor of a loved one. We&apos;ll send a beautiful
                physical card notifying them of your support.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-20 bg-white border-t border-zinc-200">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <h2 className="text-3xl font-semibold text-zinc-900 mb-4 tracking-tight">
            Need assistance?
          </h2>
          <p className="text-lg text-zinc-500 mb-8 font-light">
            Our Donor Relations team is here to assist with complex gifts, wire
            transfers, or any questions you may have.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" className="h-12 px-8 font-semibold">
              Email Us
            </Button>
            <Button variant="outline" className="h-12 px-8 font-semibold">
              Call (555) 123-4567
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

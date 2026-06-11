"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { Download, FileText, CheckCircle, ShieldCheck } from "lucide-react";
import React, { useEffect, useState } from "react";

const data = [
  { name: "Program Services", value: 85, color: "#10b981" },
  { name: "Fundraising", value: 10, color: "#64748b" },
  { name: "Administration", value: 5, color: "#94a3b8" },
];

async function importRechartsModule() {
  return import("recharts");
}

type RechartsImport = Awaited<ReturnType<typeof importRechartsModule>>;
type RechartsModule = {
  Cell: RechartsImport["Cell"];
  Pie: RechartsImport["Pie"];
  PieChart: RechartsImport["PieChart"];
  ResponsiveContainer: RechartsImport["ResponsiveContainer"];
  Tooltip: RechartsImport["Tooltip"];
};

function FinancialsChartFallback() {
  return (
    <div
      className="h-[350px] w-full rounded-2xl bg-zinc-50 animate-pulse"
      aria-hidden="true"
    />
  );
}

export function FinancialsPageClient() {
  const [rechartsModule, setRechartsModule] = useState<RechartsModule | null>(
    null,
  );
  const [rechartsFailed, setRechartsFailed] = useState(false);

  useEffect(() => {
    let isMounted = true;

    importRechartsModule()
      .then((module) => {
        if (isMounted) {
          setRechartsModule({
            Cell: module.Cell,
            Pie: module.Pie,
            PieChart: module.PieChart,
            ResponsiveContainer: module.ResponsiveContainer,
            Tooltip: module.Tooltip,
          });
        }
      })
      .catch((error) => {
        console.error("Failed to load Recharts for donor financials:", error);
        if (isMounted) setRechartsFailed(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-zinc-50 min-h-screen pt-20">
      <section className="bg-white py-24 border-b border-zinc-200">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold uppercase tracking-widest mb-6 border border-emerald-100">
            <ShieldCheck className="size-4" /> Radical Transparency
          </div>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tighter text-zinc-900 mb-6">
            Financial Integrity
          </h1>
          <p className="text-xl md:text-2xl text-zinc-500 max-w-3xl mx-auto font-light leading-relaxed text-balance">
            We believe that every dollar you give is a sacred trust. Here is
            exactly how we use it to change lives.
          </p>
        </div>
      </section>

      <section className="py-24 container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <Card className="shadow-2xl shadow-zinc-200/50 border-none overflow-hidden rounded-3xl bg-white relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-zinc-500 to-zinc-300" />
            <CardHeader className="pt-8 px-8 pb-2">
              <CardTitle className="text-2xl font-semibold text-zinc-900">
                Expense Allocation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-[350px] w-full relative">
                {rechartsFailed ? (
                  <p className="text-sm text-zinc-500">
                    The chart couldn&apos;t load. Refresh the page to try again.
                  </p>
                ) : rechartsModule ? (
                  <FinancialsPieChart rechartsModule={rechartsModule} />
                ) : (
                  <FinancialsChartFallback />
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-6xl font-semibold text-zinc-900 tracking-tighter">
                    85%
                  </span>
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mt-2">
                    Program Services
                  </span>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 transition-colors hover:bg-emerald-50">
                  <div className="flex items-center gap-3">
                    <div className="size-3 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
                    <span className="font-semibold text-zinc-900">
                      Direct Program Support
                    </span>
                  </div>
                  <span className="font-semibold text-emerald-700">85%</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-zinc-100 transition-colors hover:bg-zinc-50">
                  <div className="flex items-center gap-3">
                    <div className="size-3 rounded-full bg-zinc-500" />
                    <span className="font-medium text-zinc-600">
                      Fundraising
                    </span>
                  </div>
                  <span className="font-semibold text-zinc-600">10%</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-zinc-100 transition-colors hover:bg-zinc-50">
                  <div className="flex items-center gap-3">
                    <div className="size-3 rounded-full bg-zinc-300" />
                    <span className="font-medium text-zinc-600">
                      Admin & Management
                    </span>
                  </div>
                  <span className="font-semibold text-zinc-600">5%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-semibold text-zinc-900 mb-8 tracking-tight">
                Accountability Standards
              </h2>
              <div className="space-y-8">
                <div className="flex gap-5">
                  <div className="size-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <CheckCircle className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-zinc-900 mb-2">
                      Independent Audits
                    </h3>
                    <p className="text-zinc-600 leading-relaxed">
                      We undergo voluntary annual financial audits by an
                      independent CPA firm to ensure accuracy and compliance.
                      Our books are open.
                    </p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <div className="size-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <CheckCircle className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-zinc-900 mb-2">
                      Board Oversight
                    </h3>
                    <p className="text-zinc-600 leading-relaxed">
                      Our independent Board of Directors reviews and approves
                      the annual budget, monitors performance, and ensures
                      conflict-of-interest policies.
                    </p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <div className="size-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <CheckCircle className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-zinc-900 mb-2">
                      Donor Privacy
                    </h3>
                    <p className="text-zinc-600 leading-relaxed">
                      We will never sell, trade, or share your personal
                      information with other organizations. Your trust is our
                      currency.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 text-white p-8 rounded-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-semibold text-xl mb-4">Our Promise</h3>
                <p className="text-zinc-300 text-lg italic font-light leading-relaxed">
                  &quot;We pledge to treat every resource entrusted to us with
                  maximum care, ensuring it reaches the intended need with speed
                  and integrity.&quot;
                </p>
              </div>
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <ShieldCheck className="size-32 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-zinc-100 py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold text-zinc-900 mb-10 tracking-tight">
            Annual Reports & Filings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[2023, 2022, 2021].map((year) => (
              <div
                key={year}
                className="bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-8">
                  <FileText className="size-10 text-zinc-300 group-hover:text-blue-600 transition-colors" />
                  <span className="font-semibold text-3xl text-zinc-900">
                    {year}
                  </span>
                </div>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 h-12 text-sm font-semibold border-zinc-200 hover:bg-zinc-50"
                  >
                    <Download className="size-4" /> Annual Report (PDF)
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-12 text-sm text-zinc-500 hover:text-zinc-900"
                  >
                    <Download className="size-4" /> IRS Form 990
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function FinancialsPieChart({
  rechartsModule,
}: {
  rechartsModule: RechartsModule;
}) {
  const { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } = rechartsModule;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={90}
          outerRadius={120}
          paddingAngle={4}
          dataKey="value"
          cornerRadius={6}
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: "none",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

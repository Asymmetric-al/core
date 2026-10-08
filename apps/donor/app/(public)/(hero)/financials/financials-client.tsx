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
  { name: "Program Services", value: 85, color: "var(--chart-2)" },
  { name: "Fundraising", value: 10, color: "var(--chart-4)" },
  { name: "Administration", value: 5, color: "var(--chart-5)" },
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
      className="h-87.5 w-full rounded-2xl bg-background animate-pulse"
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
    <div className="relative bg-background min-h-dvh pt-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-invert"
      />
      <section className="bg-card py-24 border-b border-border">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 text-success rounded-full text-sm font-medium mb-6 border border-success/10">
            <ShieldCheck className="size-4" /> Radical Transparency
          </div>
          <h1 className="text-5xl md:text-6xl font-semibold tracking-normal text-foreground mb-6">
            Financial Integrity
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-light leading-relaxed text-balance">
            We believe that every dollar you give is a sacred trust. Here is
            exactly how we use it to change lives.
          </p>
        </div>
      </section>

      <section className="py-24 container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <Card className="overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-success via-muted to-muted" />
            <CardHeader className="pt-8 px-8 pb-2">
              <CardTitle className="text-2xl font-semibold text-foreground">
                Expense Allocation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-87.5 w-full relative">
                {rechartsFailed ? (
                  <p role="status" className="text-sm text-muted-foreground">
                    The chart couldn&apos;t load. Refresh the page to try again.
                  </p>
                ) : rechartsModule ? (
                  <FinancialsPieChart rechartsModule={rechartsModule} />
                ) : (
                  <FinancialsChartFallback />
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-6xl font-semibold text-foreground tracking-tighter">
                    85%
                  </span>
                  <span className="text-sm font-medium text-muted-foreground mt-2">
                    Program Services
                  </span>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-success/10 border border-success/10 transition-colors hover:bg-success/10">
                  <div className="flex items-center gap-3">
                    <div className="size-3 rounded-full bg-chart-2 ring-2 ring-chart-2" />
                    <span className="font-semibold text-foreground">
                      Direct Program Support
                    </span>
                  </div>
                  <span className="font-semibold text-success">85%</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border transition-colors hover:bg-background">
                  <div className="flex items-center gap-3">
                    <div className="size-3 rounded-full bg-chart-4" />
                    <span className="font-medium text-muted-foreground">
                      Fundraising
                    </span>
                  </div>
                  <span className="font-semibold text-muted-foreground">
                    10%
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border transition-colors hover:bg-background">
                  <div className="flex items-center gap-3">
                    <div className="size-3 rounded-full bg-chart-5" />
                    <span className="font-medium text-muted-foreground">
                      Admin & Management
                    </span>
                  </div>
                  <span className="font-semibold text-muted-foreground">
                    5%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-semibold text-foreground mb-8 tracking-tight">
                Accountability Standards
              </h2>
              <div className="space-y-8">
                <div className="flex gap-5">
                  <div className="size-12 rounded-xl bg-info/10 flex items-center justify-center text-info shrink-0">
                    <CheckCircle className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Independent Audits
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      We undergo voluntary annual financial audits by an
                      independent CPA firm to ensure accuracy and compliance.
                      Our books are open.
                    </p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <div className="size-12 rounded-xl bg-info/10 flex items-center justify-center text-info shrink-0">
                    <CheckCircle className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Board Oversight
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Our independent Board of Directors reviews and approves
                      the annual budget, monitors performance, and ensures
                      conflict-of-interest policies.
                    </p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <div className="size-12 rounded-xl bg-info/10 flex items-center justify-center text-info shrink-0">
                    <CheckCircle className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Donor Privacy
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      We will never sell, trade, or share your personal
                      information with other organizations. Your trust is our
                      currency.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-invert text-invert-foreground p-8 rounded-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-semibold text-xl mb-4">Our Promise</h3>
                <p className="text-invert-foreground/75 text-lg italic font-light leading-relaxed">
                  &quot;We pledge to treat every resource entrusted to us with
                  maximum care, ensuring it reaches the intended need with speed
                  and integrity.&quot;
                </p>
              </div>
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <ShieldCheck className="size-32 text-invert-foreground" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-semibold text-foreground mb-10 tracking-tight">
            Annual Reports & Filings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[2023, 2022, 2021].map((year) => (
              <div
                key={year}
                className="bg-card p-8 rounded-2xl border border-border shadow-sm [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-sm [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-1 transition-[box-shadow,transform] duration-300 group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-8">
                  <FileText className="size-10 text-muted-foreground group-hover:text-info transition-colors" />
                  <span className="font-semibold text-3xl text-foreground">
                    {year}
                  </span>
                </div>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="size-4" /> Annual Report (PDF)
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
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
            border: "1px solid var(--border)",
            background: "var(--popover)",
            color: "var(--popover-foreground)",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

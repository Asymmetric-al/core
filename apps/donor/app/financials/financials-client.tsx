"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@asym/ui/components/shadcn/card";
import { Button } from "@asym/ui/components/shadcn/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Download, FileText, CheckCircle, ShieldCheck } from "lucide-react";

const data = [
  { name: "Program Services", value: 85, color: "#10b981" },
  { name: "Fundraising", value: 10, color: "#64748b" },
  { name: "Administration", value: 5, color: "#94a3b8" },
];

export function FinancialsPageClient() {
  return (
    <div className="bg-slate-50 min-h-screen pt-20">
      <section className="bg-white py-24 border-b border-slate-200">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-emerald-100">
            <ShieldCheck className="w-4 h-4" /> Radical Transparency
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter text-slate-900 mb-6">
            Financial Integrity
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed text-balance">
            We believe that every dollar you give is a sacred trust. Here is
            exactly how we use it to change lives.
          </p>
        </div>
      </section>

      <section className="py-24 container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <Card className="shadow-2xl shadow-slate-200/50 border-none overflow-hidden rounded-3xl bg-white relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-slate-500 to-slate-300" />
            <CardHeader className="pt-8 px-8 pb-2">
              <CardTitle className="text-2xl font-bold text-slate-900">
                Expense Allocation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-[350px] w-full relative">
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
                      {data.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          strokeWidth={0}
                        />
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
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-6xl font-bold text-slate-900 tracking-tighter">
                    85%
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
                    Program Services
                  </span>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 transition-colors hover:bg-emerald-50">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
                    <span className="font-bold text-slate-900">
                      Direct Program Support
                    </span>
                  </div>
                  <span className="font-bold text-emerald-700">85%</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-100 transition-colors hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-slate-500" />
                    <span className="font-medium text-slate-600">
                      Fundraising
                    </span>
                  </div>
                  <span className="font-bold text-slate-600">10%</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-100 transition-colors hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-slate-300" />
                    <span className="font-medium text-slate-600">
                      Admin & Management
                    </span>
                  </div>
                  <span className="font-bold text-slate-600">5%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-8 tracking-tight">
                Accountability Standards
              </h2>
              <div className="space-y-8">
                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      Independent Audits
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      We undergo voluntary annual financial audits by an
                      independent CPA firm to ensure accuracy and compliance.
                      Our books are open.
                    </p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      Board Oversight
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      Our independent Board of Directors reviews and approves
                      the annual budget, monitors performance, and ensures
                      conflict-of-interest policies.
                    </p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      Donor Privacy
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      We will never sell, trade, or share your personal
                      information with other organizations. Your trust is our
                      currency.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 text-white p-8 rounded-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-bold text-xl mb-4">Our Promise</h3>
                <p className="text-slate-300 text-lg italic font-light leading-relaxed">
                  &quot;We pledge to treat every resource entrusted to us with
                  maximum care, ensuring it reaches the intended need with speed
                  and integrity.&quot;
                </p>
              </div>
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <ShieldCheck className="w-32 h-32 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-100 py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-10 tracking-tight">
            Annual Reports & Filings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[2023, 2022, 2021].map((year) => (
              <div
                key={year}
                className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-8">
                  <FileText className="h-10 w-10 text-slate-300 group-hover:text-blue-600 transition-colors" />
                  <span className="font-bold text-3xl text-slate-900">
                    {year}
                  </span>
                </div>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 h-12 text-sm font-semibold border-slate-200 hover:bg-slate-50"
                  >
                    <Download className="h-4 w-4" /> Annual Report (PDF)
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-12 text-sm text-slate-500 hover:text-slate-900"
                  >
                    <Download className="h-4 w-4" /> IRS Form 990
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

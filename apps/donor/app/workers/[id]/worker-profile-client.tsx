"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency, cn } from "@asym/lib/utils";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  MapPin,
  ArrowLeft,
  Share2,
  Heart,
  MessageCircle,
  ShieldCheck,
  Rss,
} from "lucide-react";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@asym/ui/components/shadcn/avatar";
import { Progress } from "@asym/ui/components/shadcn/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@asym/ui/components/shadcn/tabs";
import { motion } from "motion/react";
import type { FieldWorker } from "@/lib/mock-data";

const PUBLIC_UPDATES = [
  {
    id: 1,
    type: "Impact Report",
    date: "2 days ago",
    title: "Foundation Complete!",
    content:
      "<p>We completed the foundation for the new school block today! It was hard work in the heat, but the community turned out in full force. This is just the beginning of a safe learning space for <strong>200 children</strong>.</p>",
    image:
      "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1000&auto=format&fit=crop",
    likes: 24,
    comments: 5,
  },
  {
    id: 2,
    type: "Prayer Request",
    date: "1 week ago",
    title: "Border Delay",
    content:
      "<p><strong>Urgent prayer request:</strong> Our supply truck is stuck at the border due to new regulations. We have essential medical supplies that need to reach the clinic by Friday.</p>",
    likes: 15,
    comments: 12,
  },
  {
    id: 3,
    type: "Story",
    date: "2 weeks ago",
    title: "Aroon's Dream",
    content:
      "<p>Met with the village elders this morning. Their gratitude for the clean water project is overwhelming. They told me that for the first time in years, the river sickness has stopped spreading.</p>",
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80",
    likes: 42,
    comments: 8,
  },
];

const UpdateCard = ({
  update,
  worker,
}: {
  update: (typeof PUBLIC_UPDATES)[0];
  worker: FieldWorker;
}) => (
  <div className="group relative pl-8 pb-12 last:pb-0">
    <div className="absolute left-[11px] top-3 bottom-0 w-px bg-slate-100 group-last:hidden" />
    <div className="absolute left-0 top-3 h-6 w-6 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center z-10 group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300">
      <div className="h-1.5 w-1.5 rounded-full bg-slate-400 group-hover:bg-blue-600 transition-colors" />
    </div>

    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {update.date}
        </span>
        <Badge
          variant="secondary"
          className="px-2 py-0 text-[10px] bg-slate-50 text-slate-600 border-slate-200"
        >
          {update.type}
        </Badge>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 bg-white group/card">
        <CardContent className="p-5">
          {update.title && (
            <h4 className="font-bold text-slate-900 mb-2 text-lg">
              {update.title}
            </h4>
          )}

          <div
            className="prose prose-slate prose-sm max-w-none text-slate-600 mb-4 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: update.content }}
          />

          {update.image && (
            <div className="rounded-lg overflow-hidden mb-4 border border-slate-100 relative h-[300px]">
              <Image
                src={update.image}
                alt="Update visual"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, 500px"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100/50">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-rose-600 transition-colors">
                <Heart className="w-3.5 h-3.5" /> {update.likes}
              </button>
              <button className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-blue-600 transition-colors">
                <MessageCircle className="w-3.5 h-3.5" /> {update.comments}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const GivingAmounts = [50, 100, 200, 500];

interface WorkerProfileClientProps {
  worker: FieldWorker;
}

export function WorkerProfileClient({ worker }: WorkerProfileClientProps) {
  const [amount, setAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [frequency, setFrequency] = useState<"one-time" | "monthly">("monthly");
  const [isInputFocused, setIsInputFocused] = useState(false);

  const percentRaised = worker.goal
    ? Math.min(100, Math.round((worker.raised / worker.goal) * 100))
    : 0;

  const handleAmountClick = (val: number) => {
    setAmount(val);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
      setCustomAmount(val);
      if (val && !isNaN(parseFloat(val))) {
        setAmount(parseFloat(val));
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link
            href="/workers"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Partners
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-7 xl:col-span-8 space-y-12"
          >
            <div className="space-y-6">
              <div className="rounded-3xl overflow-hidden shadow-sm border border-slate-100 bg-white aspect-video relative group">
                <Image
                  src={worker.image}
                  alt={`${worker.title} - Missionary in ${worker.location}`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 800px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-6 left-6 text-white flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  <span className="font-semibold tracking-wide drop-shadow-sm">
                    {worker.location}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white shadow-lg -mt-12 sm:-mt-16 bg-white relative z-10">
                  <AvatarImage src={worker.image} className="object-cover" />
                  <AvatarFallback>
                    {worker.title.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-2 flex-1 pt-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                      {worker.title}
                    </h1>
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-bold uppercase tracking-wider">
                      <ShieldCheck className="h-3.5 w-3.5" /> Verified
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                    <span>{worker.category}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>Partner since 2019</span>
                  </div>
                </div>
              </div>
            </div>

            <Tabs defaultValue="story" className="w-full">
              <TabsList className="w-full justify-start border-b border-slate-200 bg-transparent h-auto p-0 mb-8 gap-8">
                <TabsTrigger
                  value="story"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:shadow-none px-0 py-3 font-semibold text-slate-500 data-[state=active]:text-slate-900 transition-all hover:text-slate-700 text-base"
                >
                  Our Story
                </TabsTrigger>
                <TabsTrigger
                  value="updates"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:shadow-none px-0 py-3 font-semibold text-slate-500 data-[state=active]:text-slate-900 transition-all hover:text-slate-700 text-base flex items-center gap-2"
                >
                  Field Journal{" "}
                  <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none h-5 px-1.5 text-[10px]">
                    New
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="story"
                className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                <div className="prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed font-light">
                  <p className="font-medium text-xl text-slate-900 leading-relaxed mb-8 border-l-4 border-emerald-500 pl-6 italic">
                    &quot;{worker.description}&quot;
                  </p>
                  <h3>The Mission</h3>
                  <p>
                    We are committed to long-term sustainable change. By
                    partnering with local leaders and utilizing indigenous
                    resources, we ensure that every project has community buy-in
                    and lasting impact. Your support doesn&apos;t just provide
                    temporary relief; it builds a foundation for the future.
                  </p>
                  <p>
                    From organizing community health workshops to overseeing
                    construction projects, our days are filled with the hard but
                    rewarding work of transformation. We believe that true
                    change happens in the context of relationship.
                  </p>

                  <div className="my-8 grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose">
                    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <h4 className="font-bold text-slate-900 mb-2">
                        Direct Impact
                      </h4>
                      <p className="text-sm text-slate-500">
                        100% of your program donation goes directly to the field
                        account after processing fees.
                      </p>
                    </div>
                    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                      <h4 className="font-bold text-slate-900 mb-2">
                        Accountability
                      </h4>
                      <p className="text-sm text-slate-500">
                        We conduct quarterly site visits and financial audits to
                        ensure integrity.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="updates"
                className="outline-none animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Latest from the Field
                    </h3>
                    <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      Updates posted directly by {worker.title}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex"
                  >
                    <Rss className="mr-2 h-4 w-4" /> Subscribe
                  </Button>
                </div>

                <div className="space-y-2">
                  {PUBLIC_UPDATES.map((update) => (
                    <UpdateCard
                      key={update.id}
                      update={update}
                      worker={worker}
                    />
                  ))}
                </div>

                <div className="pt-8 text-center">
                  <Button
                    variant="ghost"
                    className="text-slate-500 hover:text-slate-900"
                  >
                    Load older updates
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-5 xl:col-span-4 relative mt-8 lg:mt-0"
          >
            <div className="sticky top-24 space-y-6">
              <Card className="border-none shadow-xl shadow-slate-200/60 overflow-hidden relative bg-white ring-1 ring-slate-100 rounded-3xl">
                <div className="p-6 sm:p-8 space-y-8">
                  <div className="text-center space-y-2">
                    <h3 className="font-bold text-2xl text-slate-900 tracking-tight">
                      Partner with Us
                    </h3>
                    <p className="text-slate-500 text-sm">
                      Empower this mission with your support.
                    </p>
                  </div>

                  <div className="bg-slate-100 p-1.5 rounded-2xl flex relative">
                    <button
                      onClick={() => setFrequency("one-time")}
                      className={cn(
                        "flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 relative z-10",
                        frequency === "one-time"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-700",
                      )}
                    >
                      One-Time
                    </button>
                    <button
                      onClick={() => setFrequency("monthly")}
                      className={cn(
                        "flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 relative z-10",
                        frequency === "monthly"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-700",
                      )}
                    >
                      Monthly
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div
                      className={cn(
                        "relative h-14 rounded-xl border-2 transition-all duration-300 bg-white flex items-center overflow-hidden cursor-text group",
                        isInputFocused
                          ? "border-blue-600 ring-4 ring-blue-50/50"
                          : "border-slate-200 hover:border-slate-300",
                      )}
                      onClick={() =>
                        document.getElementById("custom-amount-input")?.focus()
                      }
                    >
                      <span
                        className={cn(
                          "absolute left-5 text-xl font-bold transition-colors pointer-events-none",
                          isInputFocused || customAmount
                            ? "text-slate-900"
                            : "text-slate-300",
                        )}
                      >
                        $
                      </span>

                      <input
                        id="custom-amount-input"
                        type="number"
                        placeholder="0"
                        className="w-full h-full bg-transparent border-none outline-none pl-10 pr-6 text-2xl font-bold text-slate-900 placeholder:text-slate-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all"
                        value={customAmount}
                        onChange={handleCustomAmountChange}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={() => setIsInputFocused(false)}
                      />

                      <span className="absolute right-5 text-[9px] font-bold text-slate-400 pointer-events-none uppercase tracking-wider bg-slate-50 px-2 py-1 rounded">
                        USD
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {GivingAmounts.map((amt) => (
                        <button
                          key={amt}
                          onClick={() => handleAmountClick(amt)}
                          className={cn(
                            "py-2.5 rounded-xl border text-sm font-bold transition-all active:scale-95",
                            amount === amt && !customAmount
                              ? "border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                              : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-slate-900 hover:bg-slate-50",
                          )}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-end text-sm">
                      <span className="font-bold text-slate-700">
                        {percentRaised}% Funded
                      </span>
                      <span className="text-slate-500 font-medium">
                        {formatCurrency(worker.raised)}{" "}
                        <span className="text-slate-300">/</span>{" "}
                        {formatCurrency(worker.goal || 0)}
                      </span>
                    </div>
                    <Progress
                      value={percentRaised}
                      className="h-2.5 bg-slate-100"
                    />
                  </div>

                  <Button
                    size="lg"
                    className="w-full h-14 text-lg font-bold bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-900/20 rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
                    asChild
                  >
                    <Link
                      href={`/checkout?workerId=${worker.id}&amount=${amount}&frequency=${frequency}`}
                    >
                      {frequency === "monthly"
                        ? `Give ${formatCurrency(amount)} Monthly`
                        : `Give ${formatCurrency(amount)}`}
                    </Link>
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />{" "}
                    Secure Payment &bull; 100% Tax Deductible
                  </div>
                </div>
              </Card>

              <div className="flex gap-4 justify-center">
                <Button
                  variant="ghost"
                  className="text-slate-500 hover:text-slate-900 hover:bg-white/50"
                >
                  <Share2 className="mr-2 h-4 w-4" /> Share Profile
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

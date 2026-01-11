"use client";

import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import {
  Target,
  Users,
  Shield,
  Heart,
  ArrowRight,
  Globe,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as any },
};

export function AboutHero() {
  return (
    <section className="relative pt-48 pb-64 overflow-hidden isolate bg-slate-950">
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-slate-950/80 to-slate-950" />
        <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-600/10 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[180px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-6xl space-y-12"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-[0.4em] backdrop-blur-xl">
            <Sparkles className="w-4 h-4 text-amber-500" /> The Asymmetric
            Method
          </div>

          <h1 className="text-6xl md:text-[10rem] font-bold tracking-tighter text-white leading-[0.85] font-syne text-balance">
            Engineered <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/20">
              Restoration.
            </span>
          </h1>

          <p className="text-2xl md:text-3xl text-slate-400 max-w-3xl font-light leading-relaxed tracking-tight text-balance">
            Geography should not dictate destiny. We build the infrastructure
            that connects{" "}
            <span className="text-white font-medium">global capital</span> to{" "}
            <span className="text-white font-medium">frontline courage.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export function AboutBelief() {
  return (
    <section className="py-40 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
          <motion.div {...fadeInUp} className="space-y-12">
            <div className="space-y-6">
              <span className="text-emerald-600 font-black tracking-[0.4em] uppercase text-xs">
                Our Thesis
              </span>
              <h2 className="text-6xl md:text-8xl font-bold tracking-tighter text-slate-950 leading-[0.85] font-syne">
                Hope as <br />
                <span className="text-slate-300">Infrastructure.</span>
              </h2>
            </div>

            <p className="text-2xl text-slate-600 leading-relaxed font-light tracking-tight">
              Most aid organizations are built for a world that no longer
              exists. They are slow, opaque, and hierarchical.{" "}
              <strong>GiveHope</strong> is built for the now. We are a lean,
              high-trust network of field operators delivering high-impact
              restoration in real-time.
            </p>

            <div className="pt-8">
              <Button
                size="lg"
                className="h-14 px-10 rounded-full bg-slate-950 text-white hover:bg-emerald-500 transition-all font-bold font-syne text-xs uppercase tracking-widest"
                asChild
              >
                <Link href="/workers">Explore the Frontlines</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="aspect-square bg-slate-50 rounded-3xl p-8 flex items-center justify-center border border-slate-100 shadow-xl overflow-hidden relative group">
              <div className="absolute inset-0 opacity-20 pointer-events-none grayscale group-hover:grayscale-0 transition-all duration-700">
                <Image
                  src="https://images.unsplash.com/photo-1536053468241-7649c0d6628c?q=80&w=2000"
                  fill
                  className="object-cover"
                  alt="Community members gathering together"
                  loading="eager"
                  priority
                />
              </div>
              <div className="relative z-10 text-center space-y-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-xl border border-slate-100">
                  <Globe className="h-8 w-8 text-emerald-500" />
                </div>
                <p className="text-3xl font-bold font-syne text-slate-950 tracking-tighter">
                  100% Direct-to-Field
                </p>
                <p className="text-slate-500 max-w-xs mx-auto text-sm font-medium">
                  No middle-management. No administrative leakage. Your support
                  goes exactly where it&apos;s needed.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function AboutValues() {
  const values = [
    {
      icon: Target,
      title: "Precision",
      text: "We target specific, verified needs identified by local field leaders with zero delay.",
      color: "emerald",
    },
    {
      icon: Users,
      title: "Partnership",
      text: "We don't deploy staff; we deploy resources to the local heroes already on the ground.",
      color: "blue",
    },
    {
      icon: Shield,
      title: "Integrity",
      text: "Radical transparency is our default. You track every cent from pledge to payload.",
      color: "amber",
    },
    {
      icon: Heart,
      title: "Dignity",
      text: "We serve humans, not metrics. Every interaction is rooted in mutual respect.",
      color: "red",
    },
  ];

  return (
    <section className="py-40 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-12">
          <div className="space-y-6">
            <span className="text-slate-400 font-black tracking-[0.4em] uppercase text-xs">
              The Protocol
            </span>
            <h2 className="text-6xl md:text-8xl font-bold tracking-tighter text-slate-950 leading-[0.85] font-syne">
              Operational <br />
              <span className="text-slate-300">Principles.</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.8 }}
            >
              <Card className="border-none bg-white rounded-2xl shadow-lg hover:-translate-y-1 transition-all duration-500 h-full">
                <CardContent className="pt-10 pb-8 px-8 flex flex-col items-center text-center space-y-6 h-full">
                  <div
                    className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6",
                      item.color === "emerald"
                        ? "bg-emerald-50 text-emerald-600"
                        : item.color === "blue"
                        ? "bg-blue-50 text-blue-600"
                        : item.color === "amber"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-red-50 text-red-600"
                    )}
                  >
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-slate-950 font-syne">
                      {item.title}
                    </h3>
                    <p className="text-slate-500 leading-relaxed font-light text-sm">
                      {item.text}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutLeadership() {
  const team = [
    {
      name: "Dr. Elena Rostova",
      role: "Executive Director",
      img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&fit=crop",
    },
    {
      name: "Marcus Chen",
      role: "Director of Field Ops",
      img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=800&fit=crop",
    },
    {
      name: "Sarah O'Connell",
      role: "Head of Finance",
      img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&fit=crop",
    },
  ];

  return (
    <section className="py-40 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-32 space-y-6">
          <span className="text-emerald-600 font-black tracking-[0.4em] uppercase text-xs">
            The Board
          </span>
          <h2 className="text-6xl md:text-8xl font-bold tracking-tighter text-slate-950 font-syne">
            Trustees of Hope.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {team.map((person, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[3/4] mb-8 overflow-hidden rounded-2xl bg-slate-100 shadow-xl group-hover:shadow-emerald-500/10 transition-all duration-700">
                <Image
                  src={person.img}
                  alt={`${person.name}, ${person.role} at GiveHope`}
                  fill
                  className="object-cover saturate-0 group-hover:saturate-[0.8] contrast-[1.1] transition-all duration-[1s] group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
                <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/0 transition-all duration-700" />
              </div>
              <div className="space-y-1 text-center">
                <h3 className="text-2xl font-bold text-slate-950 font-syne group-hover:text-emerald-600 transition-colors">
                  {person.name}
                </h3>
                <p className="text-slate-400 font-black text-[9px] uppercase tracking-[0.3em]">
                  {person.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutCTA() {
  return (
    <section className="py-60 bg-slate-950 relative overflow-hidden text-center">
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-emerald-600/30 rounded-full blur-[200px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-6xl md:text-8xl font-bold text-white tracking-tighter mb-8 leading-[0.8] font-syne">
            Join the <br />
            <span className="text-emerald-500">Method.</span>
          </h2>
          <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto mb-16 font-light leading-relaxed tracking-tight">
            Don&apos;t just watch the world change. Be the reason it does. Join
            our global sustainer community today.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="h-14 px-10 rounded-full bg-white text-slate-950 hover:bg-emerald-400 hover:text-emerald-950 text-lg font-bold font-syne shadow-xl transition-all hover:scale-105 active:scale-95"
              asChild
            >
              <Link href="/workers">View Directory</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-10 rounded-full bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 text-lg font-bold font-syne backdrop-blur-xl transition-all"
              asChild
            >
              <Link href="/checkout?fund=general">Support Urgent Needs</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

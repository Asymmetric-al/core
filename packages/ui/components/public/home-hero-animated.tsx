"use client";

import { useReducedMotion } from "@asym/lib/motion";
import { propsHeroEntrance, STAGGER_TIGHT } from "@asym/lib/motion-presets";
import { Activity, ArrowRight, Users, Zap } from "lucide-react";
import { LazyMotion, domAnimation, m } from "motion/react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@asym/ui/components/shadcn/button";

const heroStatIcons = {
  activity: Activity,
  users: Users,
} as const;

type HomeHeroIcon = keyof typeof heroStatIcons;

export type HomeHeroStat = {
  label: string;
  val: string;
  icon: HomeHeroIcon;
};

export function HomeHeroAnimated({
  heroImageSrc,
  blurDataURL,
  stats,
}: {
  heroImageSrc: string;
  blurDataURL: string;
  stats: readonly HomeHeroStat[];
}) {
  const reduceMotion = useReducedMotion();

  return (
    <LazyMotion features={domAnimation}>
      <section
        aria-labelledby="hero-heading"
        className="relative h-[100svh] min-h-[700px] flex items-center justify-center overflow-hidden bg-slate-950 text-white"
      >
        <div className="absolute inset-0 z-0 select-none">
          <Image
            src={heroImageSrc}
            alt=""
            fill
            className="object-cover opacity-60 saturate-[0.8] contrast-[1.1]"
            priority
            sizes="100vw"
            quality={75}
            placeholder="blur"
            blurDataURL={blurDataURL}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 to-transparent" />
        </div>

        <div className="container mx-auto px-6 relative z-10 pt-20">
          <div className="max-w-6xl space-y-12">
            <m.div {...propsHeroEntrance(reduceMotion, 0)}>
              <h1
                id="hero-heading"
                className="text-6xl sm:text-7xl md:text-9xl lg:text-[11rem] font-bold tracking-tighter leading-[0.85] font-syne text-balance"
              >
                Hope is a <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/20">
                  verb.
                </span>
              </h1>
            </m.div>

            <m.div {...propsHeroEntrance(reduceMotion, STAGGER_TIGHT)}>
              <p className="text-xl sm:text-2xl md:text-3xl text-slate-300 max-w-2xl leading-relaxed text-balance font-light tracking-tight">
                Direct-to-field aid deployment.{" "}
                <br className="hidden md:block" />
                <span className="text-white/60">
                  No red tape. No delays. Just uncompromising restoration.
                </span>
              </p>
            </m.div>

            <m.div
              {...propsHeroEntrance(reduceMotion, STAGGER_TIGHT * 2)}
              className="flex flex-col sm:flex-row gap-4 pt-6"
            >
              <Button
                size="lg"
                variant="ghost"
                className="h-12 rounded-full border border-white/15 bg-white px-8 text-sm font-bold font-syne text-slate-950 shadow-lg hover:bg-zinc-100 hover:text-slate-950 hover-scale-subtle group"
                asChild
              >
                <Link href="/workers">
                  Support the Frontlines
                  <Zap
                    className="ml-2 h-4 w-4 fill-current transition-transform duration-200 ease-out group-hover:rotate-12"
                    aria-hidden="true"
                  />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 h-12 px-8 text-sm font-bold font-syne rounded-full backdrop-blur-md transition-colors duration-150 ease-out group"
                asChild
              >
                <Link href="/about">
                  Our Methodology
                  <ArrowRight
                    className="ml-2 h-4 w-4 text-white/50 transition-transform duration-200 ease-out group-hover:translate-x-2 group-hover:text-white"
                    aria-hidden="true"
                  />
                </Link>
              </Button>
            </m.div>
          </div>
        </div>

        <div
          className="absolute bottom-24 right-6 hidden xl:flex flex-col gap-4"
          aria-hidden="true"
        >
          {stats.map((stat, i) => {
            const Icon = heroStatIcons[stat.icon];

            return (
              <m.div
                key={stat.label}
                {...propsHeroEntrance(
                  reduceMotion,
                  STAGGER_TIGHT * 3 + i * STAGGER_TIGHT,
                )}
                className="bg-white/5 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl flex items-center gap-4 w-56"
              >
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <Icon className="h-3 w-3" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                    {stat.label}
                  </p>
                  <p className="text-xl font-bold font-syne">{stat.val}</p>
                </div>
              </m.div>
            );
          })}
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 flex flex-col items-center gap-3 text-[10px] font-bold tracking-[0.3em] uppercase">
          <span className="sr-only">Scroll to explore more content</span>
          <span aria-hidden="true">Explore</span>
          <div
            className="w-px h-16 bg-gradient-to-b from-white/0 via-white/40 to-white/0 animate-pulse [@media(prefers-reduced-motion:reduce)]:animate-none"
            aria-hidden="true"
          />
        </div>
      </section>
    </LazyMotion>
  );
}

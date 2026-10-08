"use client";

import {
  useReducedMotion,
  LazyMotion,
  domAnimation,
  motion as m,
} from "@asym/lib/motion";
import { propsHeroEntrance, STAGGER_TIGHT } from "@asym/lib/motion-presets";
import { Activity, ArrowRight, Users, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@asym/ui/components/shadcn/button";

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
        className="relative h-svh min-h-175 flex items-center justify-center overflow-hidden bg-invert text-media-foreground"
      >
        <div className="absolute inset-0 z-0 select-none">
          <Image
            src={heroImageSrc}
            alt=""
            fill
            className="object-cover opacity-60 saturate-75 contrast-100"
            priority
            sizes="100vw"
            quality={75}
            placeholder="blur"
            blurDataURL={blurDataURL}
          />
          <div className="absolute inset-0 bg-media-scrim/55" />
          <div className="absolute inset-0 bg-linear-to-t from-media-scrim/60 to-transparent" />
        </div>

        <div className="container mx-auto px-6 relative z-10 pt-20">
          <div className="max-w-6xl space-y-12">
            <m.div {...propsHeroEntrance(reduceMotion, 0)} initial={false}>
              <h1
                id="hero-heading"
                className="text-6xl sm:text-7xl md:text-9xl lg:text-9xl font-semibold tracking-normal leading-none font-display text-balance"
              >
                Hope is a <br />
                <span className="to-media-foreground/20">verb.</span>
              </h1>
            </m.div>

            <m.div
              {...propsHeroEntrance(reduceMotion, STAGGER_TIGHT)}
              initial={false}
            >
              <p className="text-xl sm:text-2xl md:text-3xl text-media-foreground/90 max-w-2xl leading-relaxed text-balance font-light tracking-tight">
                Direct-aid deployment. <br className="hidden md:block" />
                <span className="text-media-foreground/90">
                  No red tape. No delays. Just uncompromising restoration.
                </span>
              </p>
            </m.div>

            <m.div
              {...propsHeroEntrance(reduceMotion, STAGGER_TIGHT * 2)}
              initial={false}
              className="flex flex-col sm:flex-row gap-4 pt-6"
            >
              <Link
                href="/workers"
                className={buttonVariants({ size: "lg", variant: "inverse" })}
              >
                Support the Frontlines
                <Zap
                  className="ml-2 size-4 fill-current transition-transform duration-200 ease-out group-hover:rotate-12"
                  aria-hidden="true"
                />
              </Link>
              <Link
                href="/about"
                className={buttonVariants({
                  size: "lg",
                  variant: "outline-inverse",
                })}
              >
                Our Methodology
                <ArrowRight
                  className="ml-2 size-4 text-media-foreground/90 transition-transform duration-200 ease-out group-hover:translate-x-2 group-hover:text-media-foreground"
                  aria-hidden="true"
                />
              </Link>
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
                initial={false}
                className="bg-media-foreground/5 backdrop-blur-2xl border border-media-foreground/10 p-4 rounded-2xl flex items-center gap-4 w-56"
              >
                <div className="size-10 rounded-xl bg-media-foreground/10 flex items-center justify-center text-media-foreground">
                  <Icon className="size-3" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-media-foreground/90">
                    {stat.label}
                  </p>
                  <p className="text-xl font-semibold font-display">
                    {stat.val}
                  </p>
                </div>
              </m.div>
            );
          })}
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-media-foreground/90 flex flex-col items-center gap-3 text-xs font-semibold tracking-widest uppercase">
          <span className="sr-only">Scroll to explore more content</span>
          <span aria-hidden="true">Explore</span>
          <div
            className="w-px h-16 animate-pulse [@media(prefers-reduced-motion:reduce)]:animate-none"
            aria-hidden="true"
          />
        </div>
      </section>
    </LazyMotion>
  );
}

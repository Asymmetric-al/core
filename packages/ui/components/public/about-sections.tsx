"use client";

import {
  LazyMotion,
  domAnimation,
  motion as m,
  useReducedMotion,
} from "@asym/lib/motion";
import {
  DURATION_STANDARD,
  DURATION_SLOW,
  EASE_OUT_SOFT,
  propsFadeRiseInView,
  propsHeroEntrance,
  propsScaleFadeInView,
  STAGGER_MEDIUM,
  STAGGER_TIGHT,
} from "@asym/lib/motion-presets";
import { buildCheckoutHref } from "@asym/lib/payments/checkout-designations";
import { useWithinViewTransitionRouteLayer } from "@asym/lib/view-transitions";
import { Target, Users, Shield, Heart, Globe, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@asym/ui/components/shadcn/button";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import { cn } from "@asym/ui/lib/utils";

function useSectionEntranceDisabled() {
  const reduceMotion = useReducedMotion();
  const withinRouteLayer = useWithinViewTransitionRouteLayer();
  return reduceMotion === true || withinRouteLayer;
}

export function AboutHero() {
  const disableEntrance = useSectionEntranceDisabled();

  return (
    <LazyMotion features={domAnimation}>
      <section className="dark relative pt-48 pb-64 overflow-hidden isolate bg-background text-foreground">
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          <div className="absolute top-0 right-0 size-250 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 size-200 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-6xl flex flex-col gap-12">
            <m.div {...propsHeroEntrance(disableEntrance, 0)}>
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-foreground/5 border border-border text-foreground text-xs font-semibold uppercase tracking-widest backdrop-blur-xl">
                <Sparkles className="size-4 text-primary" /> The Asymmetric
                Method
              </div>
            </m.div>

            <m.div {...propsHeroEntrance(disableEntrance, STAGGER_TIGHT)}>
              <h1 className="text-5xl sm:text-6xl md:text-8xl xl:text-9xl font-semibold tracking-tighter text-foreground leading-none font-display text-balance wrap-anywhere">
                Engineered <br />
                <span>Restoration.</span>
              </h1>
            </m.div>

            <m.div {...propsHeroEntrance(disableEntrance, STAGGER_TIGHT * 2)}>
              <p className="text-2xl md:text-3xl text-muted-foreground max-w-3xl font-light leading-relaxed tracking-tight text-balance">
                Geography should not dictate destiny. We build the
                infrastructure that connects{" "}
                <span className="text-foreground font-medium">
                  global capital
                </span>{" "}
                to{" "}
                <span className="text-foreground font-medium">
                  frontline courage.
                </span>
              </p>
            </m.div>
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}

export function AboutBelief() {
  const disableEntrance = useSectionEntranceDisabled();

  return (
    <LazyMotion features={domAnimation}>
      <section className="py-40 bg-background relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <m.div
              {...propsFadeRiseInView(disableEntrance, { y: 12 })}
              className="flex flex-col gap-12"
            >
              <div className="flex flex-col gap-6">
                <span className="text-muted-foreground font-semibold tracking-widest uppercase text-xs">
                  Our Thesis
                </span>
                <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-semibold tracking-tighter text-foreground leading-none font-display wrap-anywhere">
                  Hope as <br />
                  <span className="text-muted-foreground">Infrastructure.</span>
                </h2>
              </div>

              <p className="text-2xl text-muted-foreground leading-relaxed font-light tracking-tight">
                Most aid organizations are built for a world that no longer
                exists. They are slow, opaque, and hierarchical.{" "}
                <strong>GiveHope</strong> is built for the now. We are a lean,
                high-trust network of field operators delivering high-impact
                restoration in real-time.
              </p>

              <div className="pt-8">
                <Link
                  href="/workers"
                  className={cn(
                    buttonVariants({ variant: "maia", size: "lg" }),
                    "scroll-mt-24",
                  )}
                >
                  Explore the Frontlines
                </Link>
              </div>
            </m.div>

            <m.div
              {...propsScaleFadeInView(disableEntrance)}
              className="relative"
            >
              <div className="aspect-square bg-card rounded-3xl p-8 flex items-center justify-center border border-border shadow-xl overflow-hidden relative group">
                <div className="absolute inset-0 opacity-20 pointer-events-none grayscale [@media(hover:hover)_and_(pointer:fine)]:group-hover:grayscale-0 transition duration-500 ease-out">
                  <Image
                    src="https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=2000"
                    fill
                    className="object-cover transition-transform duration-500 ease-out [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-(--scale-hover-subtle)"
                    alt="Community members gathering together"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                </div>
                <div className="relative z-10 text-center flex flex-col gap-4">
                  <div className="size-16 bg-background rounded-2xl flex items-center justify-center mx-auto shadow-xl border border-border">
                    <Globe className="size-8 text-foreground" />
                  </div>
                  <p className="text-3xl font-semibold font-display text-foreground tracking-tighter">
                    100% Direct-
                  </p>
                  <p className="text-foreground max-w-xs mx-auto text-sm font-medium">
                    No middle-management. No administrative leakage. Your
                    support goes exactly where it&apos;s needed.
                  </p>
                </div>
              </div>
            </m.div>
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}

export function AboutValues() {
  const disableEntrance = useSectionEntranceDisabled();

  const values = [
    {
      icon: Target,
      title: "Precision",
      text: "We target specific, verified needs identified by local field leaders with zero delay.",
    },
    {
      icon: Users,
      title: "Partnership",
      text: "We don't deploy staff; we deploy resources to the local heroes already on the ground.",
    },
    {
      icon: Shield,
      title: "Integrity",
      text: "Radical transparency is our default. You track every cent from pledge to payload.",
    },
    {
      icon: Heart,
      title: "Dignity",
      text: "We serve humans, not metrics. Every interaction is rooted in mutual respect.",
    },
  ];

  return (
    <LazyMotion features={domAnimation}>
      <section className="py-40 bg-muted">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-12">
            <div className="flex flex-col gap-6">
              <span className="text-foreground font-semibold tracking-widest uppercase text-xs">
                The Protocol
              </span>
              <h2 className="text-4xl sm:text-6xl md:text-8xl font-semibold tracking-tighter text-foreground leading-none font-display wrap-anywhere">
                Operational <br />
                <span className="text-muted-foreground">Principles.</span>
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((item, idx) => (
              <m.div
                key={item.title}
                initial={
                  disableEntrance ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }
                }
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: DURATION_STANDARD,
                  ease: EASE_OUT_SOFT,
                  delay: disableEntrance ? 0 : idx * STAGGER_MEDIUM,
                }}
              >
                <div className="group h-full transition-transform duration-300 ease-out [@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-1">
                  <Card className="h-full">
                    <CardContent className="h-full">
                      <div className="flex h-full flex-col items-center gap-6 py-6 text-center">
                        <div className="size-12 rounded-xl flex items-center justify-center bg-muted text-foreground transition-transform duration-200 ease-out [@media(hover:hover)_and_(pointer:fine)]:group-hover:rotate-6">
                          <item.icon className="size-6" />
                        </div>
                        <div className="flex flex-col gap-3">
                          <h3 className="text-xl font-semibold text-foreground font-display">
                            {item.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed font-light text-sm">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}

export function AboutLeadership() {
  const disableEntrance = useSectionEntranceDisabled();

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
    <LazyMotion features={domAnimation}>
      <section className="py-40 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-32 flex flex-col gap-6">
            <span className="text-muted-foreground font-semibold tracking-widest uppercase text-xs">
              The Board
            </span>
            <h2 className="text-4xl sm:text-6xl md:text-7xl xl:text-8xl font-semibold tracking-tighter text-foreground leading-none font-display text-balance wrap-anywhere">
              Trustees of Hope.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {team.map((person, i) => (
              <m.div
                key={person.name}
                initial={
                  disableEntrance
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.96 }
                }
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: DURATION_SLOW,
                  ease: EASE_OUT_SOFT,
                  delay: disableEntrance ? 0 : i * STAGGER_MEDIUM,
                }}
                className="group"
              >
                <div className="relative aspect-3/4 mb-8 overflow-hidden rounded-2xl bg-muted shadow-xl [@media(hover:hover)_and_(pointer:fine)]:group-hover:shadow-foreground/10 transition-shadow duration-300 ease-out">
                  <Image
                    src={person.img}
                    alt={`${person.name}, ${person.role} at GiveHope`}
                    fill
                    className="object-cover saturate-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover:saturate-80 contrast-110 transition duration-500 ease-out [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-(--scale-hover-subtle)"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  <div className="dark absolute inset-0 bg-background/20 [@media(hover:hover)_and_(pointer:fine)]:group-hover:bg-background/0 transition-colors duration-300 ease-out" />
                </div>
                <div className="flex flex-col gap-1 text-center">
                  <h3 className="text-2xl font-semibold text-foreground font-display [@media(hover:hover)_and_(pointer:fine)]:group-hover:text-primary transition-colors duration-200 ease-out">
                    {person.name}
                  </h3>
                  <p className="text-muted-foreground font-semibold text-xs uppercase tracking-widest">
                    {person.role}
                  </p>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </section>
    </LazyMotion>
  );
}

export function AboutCTA() {
  const disableEntrance = useSectionEntranceDisabled();

  return (
    <LazyMotion features={domAnimation}>
      <section className="dark py-60 bg-background text-foreground relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-300 bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10 max-w-5xl">
          <m.div
            {...propsFadeRiseInView(disableEntrance, {
              y: 12,
              duration: DURATION_SLOW,
            })}
          >
            <h2 className="text-5xl sm:text-6xl md:text-8xl font-semibold text-foreground tracking-tighter mb-8 leading-none font-display wrap-anywhere">
              Join the <br />
              <span className="text-muted-foreground">Method.</span>
            </h2>
            <p className="text-xl md:text-2xl text-foreground/80 max-w-2xl mx-auto mb-16 font-light leading-relaxed tracking-tight">
              Don&apos;t just watch the world change. Be the reason it does.
              Join our global sustainer community today.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link
                href="/workers"
                className={cn(
                  buttonVariants({ variant: "maia", size: "lg" }),
                  "scroll-mt-24",
                )}
              >
                View Directory
              </Link>
              <Link
                href={buildCheckoutHref({ fundId: "general" })}
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "scroll-mt-24",
                )}
              >
                Support Urgent Needs
              </Link>
            </div>
          </m.div>
        </div>
      </section>
    </LazyMotion>
  );
}

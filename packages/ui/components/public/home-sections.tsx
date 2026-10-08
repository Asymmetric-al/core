import { siteConfig } from "@asym/config/site";
import {
  ArrowRight,
  Activity,
  Users,
  Globe,
  Sparkles,
  Heart,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@asym/ui/components/shadcn/button";
import { cn } from "@asym/ui/lib/utils";

import { HomeHeroAnimated } from "./home-hero-animated";

import type { CSSProperties } from "react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070&auto=format&fit=crop";
const MISSION_IMAGE =
  "https://images.unsplash.com/photo-1594708767771-a7502209ff51?q=80&w=2000&auto=format&fit=crop";

const projects = [
  {
    title: "Clean Water Protocol",
    loc: "Ghana, West Africa",
    img: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=2000",
    raised: "89%",
  },
  {
    title: "Refugee Crisis Sync",
    loc: "Lesbos, Greece",
    img: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2000",
    raised: "64%",
  },
  {
    title: "Education Backbone",
    loc: "Chiang Mai, Thailand",
    img: "https://images.unsplash.com/photo-1595053826286-2e59efd9ff18?q=80&w=2000",
    raised: "92%",
  },
];

const activities = [
  "Sarah C. just supported clean water in Ghana",
  "Emergency medical supplies deployed to Lebanon",
  "New missionary team onboarding in Thailand",
  "Monthly goal reached for Rural Education fund",
  "David R. pledged $500 to Refugee Response",
  "Clean water well completed in Bekaa Valley",
];

const tickerActivities = [
  ...activities.map((text) => ({ key: `${text}-1`, text })),
  ...activities.map((text) => ({ key: `${text}-2`, text })),
];

const heroStats = [
  { label: "Deployed", val: "$26.4M", icon: "activity" },
  { label: "Partners", val: "42.1k", icon: "users" },
] as const;

const ratingStars = ["star-1", "star-2", "star-3", "star-4", "star-5"] as const;

const HERO_BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIBAAAQMEAgMAAAAAAAAAAAAAAQIDBAAFESEGMRJBYf/EABQBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQACAwEAAAAAAAAAAAAAAAABAgADESH/2gAMAwEAAhEDEEA/";

export function LiveTicker() {
  return (
    <aside
      aria-label="Recent activity feed"
      className="bg-muted border-y border-border py-3 overflow-hidden whitespace-nowrap relative"
    >
      <div className="flex animate-marquee gap-12 items-center" role="marquee">
        {tickerActivities.map((activity) => (
          <div
            key={activity.key}
            className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-foreground"
          >
            <span
              className="size-1.5 rounded-full bg-foreground shadow-sm shadow-foreground/20"
              aria-hidden="true"
            />
            <span>{activity.text}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

export function HomeHero() {
  return (
    <HomeHeroAnimated
      heroImageSrc={HERO_IMAGE}
      blurDataURL={HERO_BLUR_DATA_URL}
      stats={heroStats}
    />
  );
}

export function HomeMission() {
  return (
    <section
      aria-labelledby="mission-heading"
      className="py-24 md:py-40 bg-card relative overflow-hidden"
    >
      <div
        className="absolute top-0 right-0 bg-radial from-muted/50 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 -z-10 size-200"
        aria-hidden="true"
      />

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
          <div className="space-y-12">
            <header className="space-y-6">
              <span className="text-foreground font-semibold text-xs">
                Our Protocol
              </span>
              <h2
                id="mission-heading"
                className="text-5xl sm:text-6xl md:text-8xl font-semibold tracking-normal text-foreground leading-none font-display"
              >
                Precision <br />
                <span className="text-muted-foreground">Philanthropy.</span>
              </h2>
            </header>

            <div className="space-y-8 text-xl sm:text-2xl text-muted-foreground leading-relaxed font-light tracking-tight">
              <p>
                In a world of increasing volatility, traditional charity models
                are too slow.{" "}
                <strong className="text-foreground font-semibold">
                  {siteConfig.name}
                </strong>{" "}
                operates on a zero-friction, direct-support model.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <article className="space-y-3 p-5 rounded-2xl bg-muted/50 border border-border">
                  <ShieldCheck
                    className="size-6 text-foreground"
                    aria-hidden="true"
                  />
                  <h3 className="font-semibold text-foreground font-display">
                    100% Direct
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Every dollar of your program donation reaches the field
                    account of your chosen partner.
                  </p>
                </article>
                <article className="space-y-3 p-5 rounded-2xl bg-muted/50 border border-border">
                  <Activity
                    className="size-6 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <h3 className="font-semibold text-foreground font-display">
                    Real-Time Data
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Monitor impact with live updates, GPS-tagged reports, and
                    transparent financial auditing.
                  </p>
                </article>
              </div>
            </div>

            <div className="pt-10">
              <Link
                href="/about"
                className="group inline-flex items-center text-xs font-semibold text-foreground uppercase tracking-widest"
              >
                <span className="border-b-2 border-foreground pb-2 group-hover:border-foreground group-hover:text-foreground transition-colors duration-150 ease-out">
                  Audit Our Process
                </span>
                <ArrowRight
                  className="ml-5 size-5 text-foreground group-hover:translate-x-2 transition-transform duration-200 ease-out group-hover:text-foreground"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>

          <figure className="relative lg:ml-auto group size-full">
            <div className="relative z-10 h-105 sm:h-130 lg:h-160 w-full rounded-3xl overflow-hidden bg-muted shadow-2xl shadow-foreground/10">
              <Image
                src={MISSION_IMAGE}
                alt="Field workers providing humanitarian aid in communities"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover saturate-75 contrast-100 transition-transform duration-500 ease-out hover-scale-subtle"
                loading="eager"
                quality={75}
              />
              <div className="absolute inset-0 bg-linear-to-t from-media-scrim/60 to-transparent" />

              <figcaption className="absolute inset-x-0 bottom-0 bg-media-scrim/75 p-6 text-media-foreground sm:p-8">
                <p className="text-xs font-semibold text-media-foreground/90 mb-2">
                  Live Deployment
                </p>
                <p className="text-3xl font-semibold font-display tracking-tight">
                  Bekaa Valley, <br />
                  Lebanon
                </p>
              </figcaption>
            </div>

            <div className="absolute z-20 -top-6 -right-6 bg-card p-6 rounded-2xl shadow-sm border border-border max-w-50 hidden xl:block">
              <Sparkles
                className="size-5 text-muted-foreground mb-3"
                aria-hidden="true"
              />
              <blockquote className="text-xs font-semibold text-foreground leading-relaxed">
                &quot;Our fastest deployment yet. Resources reached the field in{" "}
                <span className="text-foreground">under 4 hours</span>.&quot;
              </blockquote>
              <footer className="mt-4 flex items-center gap-3">
                <div
                  className="size-7 rounded-full bg-muted"
                  aria-hidden="true"
                />
                <div>
                  <cite className="text-xs font-semibold uppercase tracking-wider text-foreground not-italic">
                    Dr. Elias H.
                  </cite>
                  <p className="text-xs text-muted-foreground">Field Lead</p>
                </div>
              </footer>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}

export function HomeStats() {
  return (
    <section
      aria-labelledby="stats-heading"
      className="py-24 md:py-40 bg-invert text-invert-foreground relative overflow-hidden"
    >
      <div className="container mx-auto px-6 relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-32 gap-12">
          <div className="space-y-6">
            <span className="text-invert-foreground/75 font-semibold text-xs">
              The Ledger
            </span>
            <h2
              id="stats-heading"
              className="text-5xl sm:text-6xl md:text-8xl font-semibold tracking-normal font-display"
            >
              Global <br />
              Impact Score.
            </h2>
          </div>
          <p className="text-invert-foreground/75 max-w-md text-xl sm:text-2xl leading-relaxed font-light tracking-tight">
            Radical transparency is our core infrastructure. We track every cent
            from pledge to payload.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <article className="md:col-span-8 group bg-invert-foreground/5 backdrop-blur-3xl border border-invert-foreground/10 p-8 md:p-10 rounded-2xl hover:bg-invert-foreground/10 transition-colors duration-300 ease-out flex flex-col justify-between min-h-75 md:min-h-100">
            <div>
              <Activity
                className="size-8 text-invert-foreground/75 mb-8"
                aria-hidden="true"
              />
              <h3 className="text-xl font-semibold font-display mb-2">
                Operational Liquidity
              </h3>
              <p className="text-invert-foreground/75 max-w-md text-base leading-relaxed">
                Active capital deployed across infrastructure, logistics, and
                emergency response in this fiscal quarter.
              </p>
            </div>
            <p className="text-6xl md:text-7xl lg:text-9xl font-semibold tracking-tighter leading-none font-display">
              $26M+
            </p>
          </article>

          <article className="md:col-span-4 group bg-card p-8 md:p-10 rounded-2xl transition-transform duration-300 ease-out hover-scale-subtle flex flex-col justify-between text-card-foreground">
            <Users className="size-8 mb-8" aria-hidden="true" />
            <div>
              <p className="text-6xl md:text-7xl font-semibold tracking-tighter font-display mb-4">
                42k
              </p>
              <h3 className="text-xl font-semibold font-display mb-2">
                Sustainers
              </h3>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                A global coalition of monthly partners providing the bedrock for
                long-term field stability.
              </p>
            </div>
          </article>

          <article className="md:col-span-4 group bg-invert-foreground/5 backdrop-blur-3xl border border-invert-foreground/10 p-8 md:p-10 rounded-2xl hover:bg-invert-foreground/10 transition-colors duration-300 ease-out">
            <Globe
              className="size-8 text-invert-foreground/75 mb-8"
              aria-hidden="true"
            />
            <p className="text-5xl md:text-6xl font-semibold font-display mb-4">
              64
            </p>
            <h3 className="text-lg font-semibold font-display mb-2 text-invert-foreground">
              Jurisdictions
            </h3>
            <p className="text-invert-foreground/75 text-sm leading-relaxed">
              Active operations in diverse geopolitical environments, from
              stable hubs to the deep frontlines.
            </p>
          </article>

          <article className="md:col-span-8 group bg-invert-foreground/5 border border-invert-foreground/5 p-8 md:p-10 rounded-2xl hover:bg-invert-foreground/10 transition-colors duration-300 ease-out flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
            <div className="space-y-4">
              <div
                className="flex gap-1.5"
                role="img"
                aria-label="5 out of 5 stars"
              >
                {ratingStars.map((star) => (
                  <Heart
                    key={star}
                    className="size-4 text-invert-foreground/75 fill-current"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <h3 className="text-2xl font-semibold font-display">
                100% Program Ratio
              </h3>
              <p className="text-invert-foreground/75 text-sm max-w-sm">
                Every program dollar goes to the field. Our operational overhead
                is covered by a dedicated group of private investors.
              </p>
            </div>
            <div
              className="size-24 rounded-full border-4 border-invert-foreground/20 flex items-center justify-center text-2xl font-semibold font-display text-invert-foreground shrink-0"
              aria-label="A+ Rating"
            >
              A+
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export function HomeFeatured() {
  return (
    <section
      aria-labelledby="featured-heading"
      className="py-24 md:py-40 bg-muted/50 overflow-hidden"
    >
      <div className="container mx-auto px-6">
        <header className="flex flex-col md:flex-row justify-between items-end mb-16 md:mb-24 gap-8 md:gap-12">
          <div className="space-y-6">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              Active Deployments
            </span>
            <h2
              id="featured-heading"
              className="text-5xl sm:text-6xl md:text-8xl font-semibold tracking-normal text-foreground font-display"
            >
              Current Priorities.
            </h2>
          </div>
          <Link
            href="/workers"
            className="group hidden md:flex items-center text-xs font-semibold text-foreground hover:text-muted-foreground transition-colors duration-150 ease-out uppercase tracking-widest"
          >
            View Full Directory{" "}
            <ArrowRight
              className="ml-5 size-5 transition-transform duration-200 ease-out group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </header>

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 list-none p-0 m-0">
          {projects.map((item) => (
            <li key={`${item.title}-${item.loc}`}>
              <article className="group cursor-pointer">
                <Link href="/workers" className="block">
                  <div className="relative aspect-3/4 rounded-3xl overflow-hidden mb-6 bg-muted shadow-xl [@media(hover:hover)_and_(pointer:fine)]:group-hover:shadow-foreground/10 transition-shadow duration-300 ease-out">
                    <Image
                      src={item.img}
                      alt={`${item.title} project - ${item.loc}`}
                      fill
                      className="object-cover saturate-75 contrast-100 transition-transform duration-500 ease-out hover-scale-subtle"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      loading="lazy"
                      quality={75}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-media-scrim/90 via-media-scrim/20 to-transparent" />
                    <div className="absolute top-6 right-6 bg-card/95 text-card-foreground backdrop-blur-xl text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full shadow-lg border border-media-foreground/50">
                      {item.raised} Deployed
                    </div>

                    <div className="absolute bottom-6 left-6 right-6 rounded-xl bg-media-scrim/80 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-media-foreground/90 uppercase tracking-widest mb-3">
                        <Globe className="size-3" aria-hidden="true" />{" "}
                        {item.loc}
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-semibold text-media-foreground font-display leading-none mb-4 group-hover:translate-x-1 transition-transform duration-200 ease-out">
                        {item.title}
                      </h3>
                      <div
                        className="h-1 w-full bg-media-foreground/20 rounded-full overflow-hidden"
                        role="progressbar"
                        aria-label={`${item.title} deployed`}
                        aria-valuenow={parseInt(item.raised)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        {/*
                        Animate transform: scaleX (GPU, no layout) instead
                        of width (paint + layout). Keep the bar at full
                        width and scale it horizontally based on raised %.
                      */}
                        <div
                          className="size-full origin-left bg-media-foreground transform-(--impact-progress-transform) transition-transform duration-700 ease-[var(--ease-out-soft)]"
                          style={
                            {
                              "--impact-progress-transform": `scaleX(${parseInt(item.raised) / 100})`,
                            } as CSSProperties
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-xs font-semibold text-foreground -translate-x-2 group-hover:translate-x-0 transition-transform duration-200 ease-out uppercase tracking-widest">
                    Join the Mission{" "}
                    <ArrowRight className="size-3 ml-2" aria-hidden="true" />
                  </div>
                </Link>
              </article>
            </li>
          ))}
        </ul>

        <div className="mt-16 md:mt-20 text-center md:hidden">
          <Link
            href="/workers"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full",
            )}
          >
            View Directory
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HomeCTA() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="py-24 md:py-32 bg-invert relative overflow-hidden text-center flex flex-col items-center justify-center"
    >
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-radial from-invert-foreground/30 to-transparent rounded-full size-300" />
        <div className="absolute top-0 right-0 size-200 bg-radial from-invert-foreground/20 to-transparent rounded-full" />
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-5xl">
        <h2
          id="cta-heading"
          className="text-5xl sm:text-6xl md:text-8xl font-semibold text-invert-foreground tracking-normal mb-8 leading-none font-display"
        >
          Be the <br />
          <span className="text-invert-foreground">response.</span>
        </h2>
        <p className="text-lg sm:text-xl md:text-2xl text-invert-foreground/85 max-w-2xl mx-auto mb-12 md:mb-16 text-balance font-light leading-relaxed tracking-tight">
          The world doesn&apos;t need more awareness. It needs action. Join a
          movement of people who refuse to look away.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link
            href="/workers"
            className={buttonVariants({ size: "lg", variant: "inverse" })}
          >
            Initiate Support
          </Link>
          <Link
            href="/about"
            className={buttonVariants({
              size: "lg",
              variant: "outline-inverse",
            })}
          >
            Our Framework
          </Link>
        </div>
      </div>
    </section>
  );
}

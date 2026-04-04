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

import { Button } from "@asym/ui/components/shadcn/button";

import { HomeHeroAnimated } from "./home-hero-animated";

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
      className="bg-zinc-900/5 border-y border-zinc-200 py-3 overflow-hidden whitespace-nowrap relative"
    >
      <div className="flex animate-marquee gap-12 items-center" role="marquee">
        {tickerActivities.map((activity) => (
          <div
            key={activity.key}
            className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-zinc-900"
          >
            <span
              className="h-1.5 w-1.5 rounded-full bg-zinc-900 shadow-[0_0_8px_rgba(0,0,0,0.2)]"
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
      className="py-24 md:py-40 bg-white relative overflow-hidden"
    >
      <div
        className="absolute top-0 right-0 w-[800px] h-[800px] bg-zinc-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 -z-10"
        aria-hidden="true"
      />

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-center">
          <div className="space-y-12">
            <header className="space-y-6">
              <span className="text-zinc-900 font-black tracking-[0.3em] uppercase text-xs">
                Our Protocol
              </span>
              <h2
                id="mission-heading"
                className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter text-slate-950 leading-[0.85] font-syne"
              >
                Precision <br />
                <span className="text-slate-700">Philanthropy.</span>
              </h2>
            </header>

            <div className="space-y-8 text-xl sm:text-2xl text-slate-600 leading-relaxed font-light tracking-tight">
              <p>
                In a world of increasing volatility, traditional charity models
                are too slow.{" "}
                <strong className="text-slate-900 font-bold">
                  {siteConfig.name}
                </strong>{" "}
                operates on a zero-friction, direct-support model.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <article className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <ShieldCheck
                    className="h-6 w-6 text-zinc-900"
                    aria-hidden="true"
                  />
                  <h3 className="font-bold text-slate-900 font-syne">
                    100% Direct
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-500">
                    Every dollar of your program donation reaches the field
                    account of your chosen partner.
                  </p>
                </article>
                <article className="space-y-3 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <Activity
                    className="h-6 w-6 text-zinc-600"
                    aria-hidden="true"
                  />
                  <h3 className="font-bold text-slate-900 font-syne">
                    Real-Time Data
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-500">
                    Monitor impact with live updates, GPS-tagged reports, and
                    transparent financial auditing.
                  </p>
                </article>
              </div>
            </div>

            <div className="pt-10">
              <Link
                href="/about"
                className="group inline-flex items-center text-xs font-black text-slate-950 uppercase tracking-[0.3em]"
              >
                <span className="border-b-2 border-slate-950 pb-2 group-hover:border-zinc-900 group-hover:text-zinc-900 transition-colors duration-150 ease-out">
                  Audit Our Process
                </span>
                <ArrowRight
                  className="ml-5 h-5 w-5 text-slate-950 group-hover:translate-x-2 transition-transform duration-200 ease-out group-hover:text-zinc-900"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>

          <figure className="relative lg:ml-auto group w-full h-full">
            <div className="relative z-10 h-[420px] sm:h-[520px] lg:h-[640px] w-full rounded-3xl overflow-hidden bg-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]">
              <Image
                src={MISSION_IMAGE}
                alt="Field workers providing humanitarian aid in communities"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover saturate-[0.8] contrast-[1.1] transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                loading="eager"
                quality={75}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

              <figcaption className="absolute bottom-0 left-0 p-8 text-white">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-2">
                  Live Deployment
                </p>
                <p className="text-3xl font-bold font-syne tracking-tight">
                  Bekaa Valley, <br />
                  Lebanon
                </p>
              </figcaption>
            </div>

            <div className="absolute z-20 -top-6 -right-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-[200px] hidden xl:block">
              <Sparkles
                className="h-5 w-5 text-zinc-400 mb-3"
                aria-hidden="true"
              />
              <blockquote className="text-xs font-bold text-slate-900 leading-tight">
                &quot;Our fastest deployment yet. Resources reached the field in{" "}
                <span className="text-zinc-900">under 4 hours</span>.&quot;
              </blockquote>
              <footer className="mt-4 flex items-center gap-3">
                <div
                  className="h-7 w-7 rounded-full bg-slate-200"
                  aria-hidden="true"
                />
                <div>
                  <cite className="text-[9px] font-black uppercase tracking-wider text-slate-900 not-italic">
                    Dr. Elias H.
                  </cite>
                  <p className="text-[9px] text-slate-600">Field Lead</p>
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
      className="py-24 md:py-40 bg-slate-950 text-white relative overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-[0.1] mix-blend-screen"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-6 relative z-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-32 gap-12">
          <div className="space-y-6">
            <span className="text-zinc-400 font-black tracking-[0.4em] uppercase text-xs">
              The Ledger
            </span>
            <h2
              id="stats-heading"
              className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter font-syne"
            >
              Global <br />
              Impact Score.
            </h2>
          </div>
          <p className="text-slate-400 max-w-md text-xl sm:text-2xl leading-relaxed font-light tracking-tight">
            Radical transparency is our core infrastructure. We track every cent
            from pledge to payload.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <article className="md:col-span-8 group bg-white/5 backdrop-blur-3xl border border-white/10 p-8 md:p-10 rounded-2xl hover:bg-white/10 transition-colors duration-300 ease-out flex flex-col justify-between min-h-[300px] md:min-h-[400px]">
            <div>
              <Activity
                className="h-8 w-8 text-zinc-400 mb-8"
                aria-hidden="true"
              />
              <h3 className="text-xl font-bold font-syne mb-2">
                Operational Liquidity
              </h3>
              <p className="text-slate-400 max-w-md text-base leading-relaxed">
                Active capital deployed across infrastructure, logistics, and
                emergency response in this fiscal quarter.
              </p>
            </div>
            <p className="text-6xl md:text-7xl lg:text-9xl font-bold tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/5 font-syne">
              $26M+
            </p>
          </article>

          <article className="md:col-span-4 group bg-white p-8 md:p-10 rounded-2xl hover:scale-[1.02] transition-transform duration-300 ease-out flex flex-col justify-between text-slate-950">
            <Users className="h-8 w-8 mb-8" aria-hidden="true" />
            <div>
              <p className="text-6xl md:text-7xl font-bold tracking-tighter font-syne mb-4">
                42k
              </p>
              <h3 className="text-xl font-black font-syne mb-2">Sustainers</h3>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                A global coalition of monthly partners providing the bedrock for
                long-term field stability.
              </p>
            </div>
          </article>

          <article className="md:col-span-4 group bg-white/5 backdrop-blur-3xl border border-white/10 p-8 md:p-10 rounded-2xl hover:bg-white/10 transition-colors duration-300 ease-out">
            <Globe className="h-8 w-8 text-zinc-400 mb-8" aria-hidden="true" />
            <p className="text-5xl md:text-6xl font-bold font-syne mb-4">64</p>
            <h3 className="text-lg font-bold font-syne mb-2 text-white">
              Jurisdictions
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Active operations in diverse geopolitical environments, from
              stable hubs to the deep frontlines.
            </p>
          </article>

          <article className="md:col-span-8 group bg-slate-900 border border-white/5 p-8 md:p-10 rounded-2xl hover:bg-slate-800 transition-colors duration-300 ease-out flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
            <div className="space-y-4">
              <div
                className="flex gap-1.5"
                role="img"
                aria-label="5 out of 5 stars"
              >
                {ratingStars.map((star) => (
                  <Heart
                    key={star}
                    className="h-4 w-4 text-zinc-400 fill-current"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <h3 className="text-2xl font-bold font-syne">
                100% Program Ratio
              </h3>
              <p className="text-slate-400 text-sm max-w-sm">
                Every program dollar goes to the field. Our operational overhead
                is covered by a dedicated group of private investors.
              </p>
            </div>
            <div
              className="h-24 w-24 rounded-full border-4 border-white/20 flex items-center justify-center text-2xl font-bold font-syne text-white shrink-0"
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
      className="py-24 md:py-40 bg-slate-50 overflow-hidden"
    >
      <div className="container mx-auto px-6">
        <header className="flex flex-col md:flex-row justify-between items-end mb-16 md:mb-24 gap-8 md:gap-12">
          <div className="space-y-6">
            <span className="text-sm font-black text-slate-700 uppercase tracking-[0.4em]">
              Active Deployments
            </span>
            <h2
              id="featured-heading"
              className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter text-slate-950 font-syne"
            >
              Current Priorities.
            </h2>
          </div>
          <Link
            href="/workers"
            className="group hidden md:flex items-center text-xs font-black text-slate-950 hover:text-zinc-600 transition-colors duration-150 ease-out uppercase tracking-[0.3em]"
          >
            View Full Directory{" "}
            <ArrowRight
              className="ml-5 h-5 w-5 transition-transform duration-200 ease-out group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </header>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
          role="list"
        >
          {projects.map((item) => (
            <article
              key={`${item.title}-${item.loc}`}
              className="group cursor-pointer"
              role="listitem"
            >
              <Link href="/workers" className="block">
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden mb-6 bg-slate-200 shadow-xl group-hover:shadow-zinc-500/10 transition-[box-shadow] duration-300 ease-out">
                  <Image
                    src={item.img}
                    alt={`${item.title} project - ${item.loc}`}
                    fill
                    className="object-cover saturate-[0.8] contrast-[1.1] transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    loading="lazy"
                    quality={75}
                  />
                  <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/0 transition-colors duration-300 ease-out" />
                  <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-xl text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg border border-white/50">
                    {item.raised} Deployed
                  </div>

                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="flex items-center gap-2 text-[9px] font-black text-white/70 uppercase tracking-[0.2em] mb-3">
                      <Globe className="h-3 w-3" aria-hidden="true" />{" "}
                      {item.loc}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white font-syne leading-none mb-4 group-hover:translate-x-1 transition-transform duration-200 ease-out">
                      {item.title}
                    </h3>
                    <div
                      className="h-1 w-full bg-white/20 rounded-full overflow-hidden"
                      role="progressbar"
                      aria-label={`${item.title} deployed`}
                      aria-valuenow={parseInt(item.raised)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="h-full bg-white transition-all duration-1000"
                        style={{ width: item.raised }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-[10px] font-black text-zinc-900 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,transform] duration-200 ease-out uppercase tracking-[0.2em]">
                  Join the Mission{" "}
                  <ArrowRight className="h-3 w-3 ml-2" aria-hidden="true" />
                </div>
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-16 md:mt-20 text-center md:hidden">
          <Button
            variant="outline"
            className="w-full h-16 md:h-20 rounded-full border-slate-200 text-slate-950 font-black font-syne text-base md:text-lg tracking-widest uppercase"
            asChild
          >
            <Link href="/workers">View Directory</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function HomeCTA() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="py-24 md:py-32 bg-slate-950 relative overflow-hidden text-center flex flex-col items-center justify-center"
    >
      <div
        className="absolute inset-0 opacity-40 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-zinc-600/30 rounded-full blur-[200px]" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-slate-600/20 rounded-full blur-[180px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-5xl">
        <h2
          id="cta-heading"
          className="text-5xl sm:text-6xl md:text-8xl font-bold text-white tracking-tighter mb-8 leading-[0.8] font-syne"
        >
          Be the <br />
          <span className="text-white">response.</span>
        </h2>
        <p className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto mb-12 md:mb-16 text-balance font-light leading-relaxed tracking-tight">
          The world doesn&apos;t need more awareness. It needs action. Join a
          movement of people who refuse to look away.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button
            size="lg"
            variant="ghost"
            className="h-14 rounded-full border border-white/15 bg-white px-10 text-lg font-bold font-syne text-slate-950 shadow-lg transition-transform duration-200 ease-out hover:scale-[1.02] hover:bg-zinc-100 hover:text-slate-950 active:scale-[0.98]"
            asChild
          >
            <Link href="/workers">Initiate Support</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-14 px-10 rounded-full bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 text-lg font-bold font-syne backdrop-blur-xl transition-all"
            asChild
          >
            <Link href="/about">Our Framework</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

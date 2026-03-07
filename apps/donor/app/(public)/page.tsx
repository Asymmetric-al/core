import { pageMetadata, DonateActionJsonLd } from "@asym/lib/seo";
import {
  HomeHero,
  HomeMission,
  HomeStats,
  HomeFeatured,
  HomeCTA,
  LiveTicker,
} from "@asym/ui/components/public/home-sections";

import type { Metadata } from "next";

import { fetchPublishedCmsUpdates } from "@/lib/cms/client";

export const metadata: Metadata = pageMetadata.home;

export default async function HomePage() {
  const latestUpdates = await fetchPublishedCmsUpdates(3);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 selection:bg-zinc-900/10 selection:text-zinc-900">
      <DonateActionJsonLd />
      <HomeHero />
      <LiveTicker />
      <HomeMission />
      <HomeStats />
      <HomeFeatured />
      {latestUpdates.length ? (
        <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-500">
              From Site Studio
            </p>
            <h2 className="mt-2 text-2xl font-bold text-zinc-900">
              Latest Ministry Updates
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {latestUpdates.map((update) => (
              <article
                key={update.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <p className="text-xs font-medium text-zinc-500">
                  {typeof update.publishedAt === "string"
                    ? new Date(update.publishedAt).toLocaleDateString()
                    : "Published"}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-zinc-900">
                  {update.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm text-zinc-600">
                  {update.excerpt ?? "No summary provided."}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      <HomeCTA />
    </div>
  );
}

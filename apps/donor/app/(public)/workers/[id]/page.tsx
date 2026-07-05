import { SafeHtml } from "@asym/lib/components/safe-html";
import {
  createWorkerMetadata,
  WorkerJsonLd,
  BreadcrumbJsonLd,
} from "@asym/lib/seo";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import { ArrowLeft, Rss, Heart, MessageCircle, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { GivingWidget } from "./giving-widget";
import { WorkerProfileHeroWithViewTransitions } from "./profile-hero-view-transitions";
import { TabsClient } from "./tabs-client";

import type { Metadata } from "next";

import { getFieldWorkerById, getFieldWorkers } from "@/lib/mock-data";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const workers = getFieldWorkers();
  return workers.map((worker) => ({
    id: worker.id,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const worker = getFieldWorkerById(id);

  if (!worker) {
    return {
      title: "Worker Not Found",
    };
  }

  return createWorkerMetadata({
    name: worker.title,
    location: worker.location,
    description: worker.description,
    id: worker.id,
    image: worker.image,
  });
}

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

function UpdateCard({ update }: { update: (typeof PUBLIC_UPDATES)[0] }) {
  return (
    <article className="group relative pl-8 pb-12 last:pb-0">
      <div
        className="absolute left-[11px] top-3 bottom-0 w-px bg-zinc-100 group-last:hidden"
        aria-hidden="true"
      />
      <div
        className="absolute left-0 top-3 size-6 rounded-full border-4 border-white bg-zinc-100 flex items-center justify-center z-10 group-hover:bg-emerald-100 [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-110 transition-[background-color,transform] duration-300"
        aria-hidden="true"
      >
        <div className="size-1.5 rounded-full bg-zinc-400 group-hover:bg-emerald-600 transition-colors" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <time className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            {update.date}
          </time>
          <Badge
            variant="secondary"
            className="px-2 py-0 text-[10px] bg-zinc-100 text-zinc-600 border-none"
          >
            {update.type}
          </Badge>
        </div>

        <Card className="border-zinc-200 shadow-sm overflow-hidden [@media(hover:hover)_and_(pointer:fine)]:hover:shadow-md transition-shadow duration-300 bg-white">
          <CardContent className="p-5">
            {update.title && (
              <h4 className="font-semibold text-zinc-900 mb-2 text-lg">
                {update.title}
              </h4>
            )}

            <SafeHtml
              className="prose prose-slate prose-sm max-w-none text-zinc-600 mb-4 leading-relaxed"
              html={update.content}
            />

            {update.image && (
              <figure className="rounded-xl overflow-hidden mb-4 border border-zinc-100 relative h-[280px]">
                <Image
                  src={update.image}
                  alt={`Visual from ${update.title}`}
                  fill
                  className="object-cover transition-transform duration-700 [@media(hover:hover)_and_(pointer:fine)]:hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 500px"
                  loading="lazy"
                />
              </figure>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-rose-500 cursor-pointer transition-colors">
                  <Heart className="size-3.5" aria-hidden="true" />{" "}
                  {update.likes}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-600 cursor-pointer transition-colors">
                  <MessageCircle className="size-3.5" aria-hidden="true" />{" "}
                  {update.comments}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </article>
  );
}

function StoryContent({ worker }: { worker: { description: string } }) {
  return (
    <div className="prose prose-lg prose-slate max-w-none text-zinc-600 leading-relaxed font-light">
      <blockquote className="font-medium text-xl text-zinc-900 leading-relaxed mb-8 border-l-4 border-emerald-500 pl-6 italic not-prose">
        &quot;{worker.description}&quot;
      </blockquote>
      <h3>The Mission</h3>
      <p>
        We are committed to long-term sustainable change. By partnering with
        local leaders and utilizing indigenous resources, we ensure that every
        project has community buy-in and lasting impact. Your support
        doesn&apos;t just provide temporary relief; it builds a foundation for
        the future.
      </p>
      <p>
        From organizing community health workshops to overseeing construction
        projects, our days are filled with the hard but rewarding work of
        transformation. We believe that true change happens in the context of
        relationship.
      </p>

      <div className="my-8 grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose">
        <div className="p-6 bg-white rounded-2xl border border-zinc-100 shadow-sm">
          <h4 className="font-semibold text-zinc-900 mb-2">Direct Impact</h4>
          <p className="text-sm text-zinc-500">
            100% of your program donation goes directly to the field account
            after processing fees.
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-zinc-100 shadow-sm">
          <h4 className="font-semibold text-zinc-900 mb-2">Accountability</h4>
          <p className="text-sm text-zinc-500">
            We conduct quarterly site visits and financial audits to ensure
            integrity.
          </p>
        </div>
      </div>
    </div>
  );
}

function UpdatesContent({ workerTitle }: { workerTitle: string }) {
  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-semibold text-zinc-900">
            Latest from the Field
          </h3>
          <p className="text-zinc-500 text-sm mt-1 flex items-center gap-2">
            <span className="relative flex size-2" aria-hidden="true">
              <span className="animate-ping absolute inline-flex size-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
            </span>
            Updates posted directly by {workerTitle}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:flex rounded-full"
        >
          <Rss className="mr-2 size-4" aria-hidden="true" /> Subscribe
        </Button>
      </div>

      <div className="space-y-2">
        {PUBLIC_UPDATES.map((update) => (
          <UpdateCard key={update.id} update={update} />
        ))}
      </div>

      <div className="pt-8 text-center">
        <Button
          variant="ghost"
          className="text-zinc-500 hover:text-zinc-900 rounded-full"
        >
          Load older updates
        </Button>
      </div>
    </>
  );
}

function GivingWidgetSkeleton() {
  return (
    <Card className="border-none shadow-xl shadow-zinc-200/60 overflow-hidden relative bg-white ring-1 ring-zinc-100 rounded-3xl animate-pulse">
      <div className="p-6 sm:p-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="h-8 bg-zinc-200 rounded w-48 mx-auto" />
          <div className="h-4 bg-zinc-100 rounded w-64 mx-auto" />
        </div>
        <div className="h-12 bg-zinc-100 rounded-2xl" />
        <div className="h-14 bg-zinc-200 rounded-xl" />
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((slot) => (
            <div
              key={`amount-slot-${slot}`}
              className="h-10 bg-zinc-100 rounded-xl"
            />
          ))}
        </div>
        <div className="h-14 bg-zinc-900 rounded-2xl" />
      </div>
    </Card>
  );
}

export default async function WorkerProfilePage({ params }: PageProps) {
  await connection();
  const { id } = await params;
  const worker = getFieldWorkerById(id);

  if (!worker) {
    notFound();
  }

  const percentRaised =
    worker.goal !== null
      ? Math.min(100, Math.round((worker.raised / worker.goal) * 100))
      : null;

  return (
    <>
      <WorkerJsonLd
        name={worker.title}
        description={worker.description}
        location={worker.location}
        image={worker.image}
        id={worker.id}
        category={worker.category}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", href: "/" },
          { name: "Missionary Directory", href: "/workers" },
          { name: worker.title, href: `/workers/${worker.id}` },
        ]}
      />

      <div className="min-h-screen bg-zinc-50 font-sans pt-16">
        <div className="bg-white border-b border-zinc-100">
          <div className="container mx-auto px-4 h-12 flex items-center">
            <Link
              href="/workers"
              className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="size-4 mr-2" aria-hidden="true" /> Back to
              Partners
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <article className="lg:col-span-7 xl:col-span-8 space-y-10">
              <WorkerProfileHeroWithViewTransitions worker={worker} />

              <TabsClient
                storyContent={<StoryContent worker={worker} />}
                updatesContent={<UpdatesContent workerTitle={worker.title} />}
              />
            </article>

            <aside
              className="lg:col-span-5 xl:col-span-4 relative mt-8 lg:mt-0"
              aria-label="Support options"
            >
              <div className="sticky top-24 space-y-6">
                <Suspense fallback={<GivingWidgetSkeleton />}>
                  <GivingWidget
                    workerId={worker.id}
                    raised={worker.raised}
                    goal={worker.goal}
                    percentRaised={percentRaised}
                  />
                </Suspense>

                <div className="flex gap-4 justify-center">
                  <Button
                    variant="ghost"
                    className="text-zinc-500 hover:text-zinc-900 hover:bg-white rounded-full"
                  >
                    <Share2 className="mr-2 size-4" aria-hidden="true" /> Share
                    Profile
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { getFieldWorkerById, getFieldWorkers } from "@/lib/mock-data";
import { createWorkerMetadata } from "@asym/lib/seo";
import { WorkerJsonLd, BreadcrumbJsonLd } from "@asym/lib/seo";
import { Avatar, AvatarFallback, AvatarImage } from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  MapPin,
  ArrowLeft,
  ShieldCheck,
  Rss,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";
import { GivingWidget } from "./giving-widget";
import { TabsClient } from "./tabs-client";

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

function UpdateCard({
  update,
  workerTitle,
}: {
  update: (typeof PUBLIC_UPDATES)[0];
  workerTitle: string;
}) {
  return (
    <article className="group relative pl-8 pb-12 last:pb-0">
      <div
        className="absolute left-[11px] top-3 bottom-0 w-px bg-slate-100 group-last:hidden"
        aria-hidden="true"
      />
      <div
        className="absolute left-0 top-3 h-6 w-6 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center z-10 group-hover:bg-emerald-100 group-hover:scale-110 transition-all duration-300"
        aria-hidden="true"
      >
        <div className="h-1.5 w-1.5 rounded-full bg-slate-400 group-hover:bg-emerald-600 transition-colors" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <time className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {update.date}
          </time>
          <Badge
            variant="secondary"
            className="px-2 py-0 text-[10px] bg-slate-100 text-slate-600 border-none"
          >
            {update.type}
          </Badge>
        </div>

        <Card className="border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 bg-white">
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
              <figure className="rounded-xl overflow-hidden mb-4 border border-slate-100 relative h-[280px]">
                <Image
                  src={update.image}
                  alt={`Visual from ${update.title}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 500px"
                  loading="lazy"
                />
              </figure>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-rose-500 cursor-pointer transition-colors">
                  <Heart className="w-3.5 h-3.5" aria-hidden="true" />{" "}
                  {update.likes}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                  <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />{" "}
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
    <div className="prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed font-light">
      <blockquote className="font-medium text-xl text-slate-900 leading-relaxed mb-8 border-l-4 border-emerald-500 pl-6 italic not-prose">
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
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <h4 className="font-bold text-slate-900 mb-2">Direct Impact</h4>
          <p className="text-sm text-slate-500">
            100% of your program donation goes directly to the field account
            after processing fees.
          </p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <h4 className="font-bold text-slate-900 mb-2">Accountability</h4>
          <p className="text-sm text-slate-500">
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
          <h3 className="text-xl font-bold text-slate-900">
            Latest from the Field
          </h3>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Updates posted directly by {workerTitle}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:flex rounded-full"
        >
          <Rss className="mr-2 h-4 w-4" aria-hidden="true" /> Subscribe
        </Button>
      </div>

      <div className="space-y-2">
        {PUBLIC_UPDATES.map((update) => (
          <UpdateCard
            key={update.id}
            update={update}
            workerTitle={workerTitle}
          />
        ))}
      </div>

      <div className="pt-8 text-center">
        <Button
          variant="ghost"
          className="text-slate-500 hover:text-slate-900 rounded-full"
        >
          Load older updates
        </Button>
      </div>
    </>
  );
}

function GivingWidgetSkeleton() {
  return (
    <Card className="border-none shadow-xl shadow-slate-200/60 overflow-hidden relative bg-white ring-1 ring-slate-100 rounded-3xl animate-pulse">
      <div className="p-6 sm:p-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="h-8 bg-slate-200 rounded w-48 mx-auto" />
          <div className="h-4 bg-slate-100 rounded w-64 mx-auto" />
        </div>
        <div className="h-12 bg-slate-100 rounded-2xl" />
        <div className="h-14 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-xl" />
          ))}
        </div>
        <div className="h-14 bg-slate-900 rounded-2xl" />
      </div>
    </Card>
  );
}

export default async function WorkerProfilePage({ params }: PageProps) {
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

      <div className="min-h-screen bg-slate-50 font-sans pt-16">
        <div className="bg-white border-b border-slate-100">
          <div className="container mx-auto px-4 h-12 flex items-center">
            <Link
              href="/workers"
              className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" /> Back to
              Partners
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <article className="lg:col-span-7 xl:col-span-8 space-y-10">
              <header className="space-y-6">
                <figure className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white aspect-video relative group">
                  <Image
                    src={worker.image}
                    alt={`${worker.title} - Missionary serving in ${worker.location}`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 800px"
                    priority
                    quality={85}
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                    aria-hidden="true"
                  />
                  <figcaption className="absolute bottom-5 left-5 text-white flex items-center gap-2">
                    <MapPin
                      className="h-4 w-4 text-emerald-400"
                      aria-hidden="true"
                    />
                    <span className="font-medium tracking-wide drop-shadow-sm">
                      {worker.location}
                    </span>
                  </figcaption>
                </figure>

                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white shadow-lg -mt-14 sm:-mt-16 bg-white relative z-10 ring-1 ring-slate-100">
                    <AvatarImage
                      src={worker.image}
                      alt=""
                      className="object-cover"
                    />
                    <AvatarFallback className="text-lg font-bold bg-slate-100 text-slate-700">
                      {worker.title.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-2 flex-1 pt-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                        {worker.title}
                      </h1>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-bold uppercase tracking-wider">
                        <ShieldCheck
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />{" "}
                        Verified
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                      <span>{worker.category}</span>
                      <span
                        className="w-1 h-1 rounded-full bg-slate-300"
                        aria-hidden="true"
                      />
                      <span>Partner since 2019</span>
                    </div>
                  </div>
                </div>
              </header>

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
                    className="text-slate-500 hover:text-slate-900 hover:bg-white rounded-full"
                  >
                    <Share2 className="mr-2 h-4 w-4" aria-hidden="true" /> Share
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

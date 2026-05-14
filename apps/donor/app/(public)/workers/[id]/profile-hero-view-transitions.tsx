"use client";

import {
  workerAvatarTransitionName,
  workerHeroImageTransitionName,
  workerTitleTransitionName,
} from "@asym/lib/view-transitions";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { SharedNamedViewTransition } from "@asym/ui/components/view-transitions";
import { MapPin, ShieldCheck } from "lucide-react";
import Image from "next/image";

import type { FieldWorker } from "@/lib/mock-data";

export function WorkerProfileHeroWithViewTransitions({
  worker,
}: {
  worker: FieldWorker;
}) {
  return (
    <header className="space-y-6">
      <SharedNamedViewTransition
        name={workerHeroImageTransitionName(worker.id)}
      >
        <figure className="rounded-2xl overflow-hidden shadow-sm border border-zinc-200 bg-white aspect-video relative group">
          <Image
            src={worker.image}
            alt={`${worker.title} - Missionary serving in ${worker.location}`}
            fill
            className="object-cover transition-transform duration-700 [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 800px"
            priority
            quality={85}
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
            aria-hidden="true"
          />
          <figcaption className="absolute bottom-5 left-5 text-white flex items-center gap-2">
            <MapPin className="size-4 text-emerald-400" aria-hidden="true" />
            <span className="font-medium tracking-wide drop-shadow-sm">
              {worker.location}
            </span>
          </figcaption>
        </figure>
      </SharedNamedViewTransition>

      <div className="flex flex-col sm:flex-row gap-5 items-start">
        <SharedNamedViewTransition name={workerAvatarTransitionName(worker.id)}>
          <Avatar className="size-20 sm:h-24 sm:w-24 border-4 border-white shadow-lg -mt-14 sm:-mt-16 bg-white relative z-10 ring-1 ring-zinc-100">
            <AvatarImage src={worker.image} alt="" className="object-cover" />
            <AvatarFallback className="text-lg font-semibold bg-zinc-100 text-zinc-700">
              {worker.title.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
        </SharedNamedViewTransition>

        <div className="space-y-2 flex-1 pt-1">
          <div className="flex flex-wrap items-center gap-3">
            <SharedNamedViewTransition
              name={workerTitleTransitionName(worker.id)}
            >
              <h1 className="text-3xl sm:text-4xl font-semibold text-zinc-900 tracking-tight">
                {worker.title}
              </h1>
            </SharedNamedViewTransition>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-semibold uppercase tracking-wider">
              <ShieldCheck className="size-3.5" aria-hidden="true" /> Verified
            </div>
          </div>
          <div className="flex items-center gap-2 text-zinc-500 font-medium text-sm">
            <span>{worker.category}</span>
            <span
              className="size-1 rounded-full bg-zinc-300"
              aria-hidden="true"
            />
            <span>Partner since 2019</span>
          </div>
        </div>
      </div>
    </header>
  );
}

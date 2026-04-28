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
        <figure className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white aspect-video relative group">
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
            <MapPin className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            <span className="font-medium tracking-wide drop-shadow-sm">
              {worker.location}
            </span>
          </figcaption>
        </figure>
      </SharedNamedViewTransition>

      <div className="flex flex-col sm:flex-row gap-5 items-start">
        <SharedNamedViewTransition name={workerAvatarTransitionName(worker.id)}>
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white shadow-lg -mt-14 sm:-mt-16 bg-white relative z-10 ring-1 ring-slate-100">
            <AvatarImage src={worker.image} alt="" className="object-cover" />
            <AvatarFallback className="text-lg font-bold bg-slate-100 text-slate-700">
              {worker.title.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
        </SharedNamedViewTransition>

        <div className="space-y-2 flex-1 pt-1">
          <div className="flex flex-wrap items-center gap-3">
            <SharedNamedViewTransition
              name={workerTitleTransitionName(worker.id)}
            >
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                {worker.title}
              </h1>
            </SharedNamedViewTransition>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />{" "}
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
  );
}

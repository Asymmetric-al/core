"use client";

import {
  workerHeroImageTransitionName,
  workerTitleTransitionName,
} from "@asym/lib/view-transitions";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
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
        <figure className="rounded-2xl overflow-hidden shadow-sm border border-border bg-card aspect-video relative group">
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
            className="absolute inset-0 bg-linear-to-t from-media-scrim/90 via-media-scrim/20 to-transparent"
            aria-hidden="true"
          />
          {/* Bottom-right so the overlapping avatar never covers it. */}
          <figcaption className="absolute bottom-5 right-5 text-media-foreground flex items-center gap-2">
            <MapPin
              className="size-4 text-media-foreground"
              aria-hidden="true"
            />
            <span className="font-medium drop-shadow-sm">
              {worker.location}
            </span>
          </figcaption>
        </figure>
      </SharedNamedViewTransition>

      <div className="flex flex-col sm:flex-row gap-5 items-start">
        {/* No shared VT name: the workers list card renders no avatar, so
            this name has no pairing surface anywhere. */}
        <Avatar className="size-20 sm:h-24 sm:w-24 border-4 border-background shadow-sm -mt-14 sm:-mt-16 bg-card relative z-10 ring-1 ring-ring">
          <AvatarImage src={worker.image} alt="" className="object-cover" />
          <AvatarFallback className="text-lg font-semibold bg-muted text-foreground">
            {workerInitials(worker.title)}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-2 flex-1 pt-1">
          <div className="flex flex-wrap items-center gap-3">
            <SharedNamedViewTransition
              name={workerTitleTransitionName(worker.id)}
            >
              <h1 className="text-3xl sm:text-4xl font-semibold text-foreground tracking-tight">
                {worker.title}
              </h1>
            </SharedNamedViewTransition>
            <Badge variant="success">
              <ShieldCheck aria-hidden="true" /> Verified
            </Badge>
          </div>
          <p className="text-muted-foreground font-medium text-sm">
            {worker.category}
          </p>
        </div>
      </div>
    </header>
  );
}

/** "The Miller Family" → "MF": skip a leading article, take two initials. */
function workerInitials(title: string) {
  const words = title.split(" ").filter(Boolean);
  const significant =
    words[0]?.toLowerCase() === "the" ? words.slice(1) : words;
  return significant
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

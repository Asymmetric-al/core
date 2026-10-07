"use client";

import { buildCheckoutHref } from "@asym/lib/payments/checkout-designations";
import {
  useWithinViewTransitionRouteLayer,
  workerHeroImageTransitionName,
  workerTitleTransitionName,
} from "@asym/lib/view-transitions";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenuGroup,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@asym/ui/components/shadcn/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@asym/ui/components/shadcn/input-group";
import { SharedNamedViewTransition } from "@asym/ui/components/view-transitions";
import { cn } from "@asym/ui/lib/utils";
import {
  Search,
  MapPin,
  Filter,
  Globe,
  ChevronDown,
  X,
  Sparkles,
  Activity,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";

import type { Dispatch, SetStateAction } from "react";

import { QuickGiveInput } from "@/features/giving/components/QuickGiveInput";
import { getFieldWorkers, type FieldWorker } from "@/lib/mock-data";

function WorkerCard({
  worker,
  animateEntrance,
}: {
  worker: FieldWorker;
  animateEntrance: boolean;
}) {
  return (
    <article
      className={cn(
        "group flex flex-col",
        animateEntrance && "animate-fade-in-up",
      )}
    >
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-invert shadow-sm  ring-1 ring-media-scrim/5 transition-[box-shadow,transform] duration-500 ease-out [@media(hover:hover)_and_(pointer:fine)]:group-hover:shadow-sm [@media(hover:hover)_and_(pointer:fine)]:group-hover:-translate-y-1 [@media(hover:hover)_and_(pointer:fine)]:group-hover:ring-success/20">
        <Link
          href={`/workers/${worker.id}`}
          // The App Shell is shared across every link to /workers/[id], so it
          // cannot carry per-worker content. That content is still instant
          // because `generateStaticParams` prerenders each worker as its own
          // static page — the click pulls a static file, not a server render,
          // which is why the route deliberately skips `prefetch =
          // 'allow-runtime'` (one server render per visible card, for content
          // that is already static). Giving progress streams in after.
          prefetch
          className="absolute inset-0 z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl"
          aria-label={`View ${worker.title}'s profile`}
        >
          <span className="sr-only">View {worker.title}&apos;s profile</span>
        </Link>

        <SharedNamedViewTransition
          name={workerHeroImageTransitionName(worker.id)}
        >
          <Image
            src={worker.image}
            alt=""
            fill
            className="object-cover transition-transform duration-700 opacity-90 group-hover:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </SharedNamedViewTransition>

        <div className="absolute inset-0 bg-linear-to-t from-media-scrim/95 via-media-scrim/35 to-transparent pointer-events-none" />

        <div className="absolute top-4 left-4 z-20 transition-transform duration-500 ease-out group-hover:translate-x-0.5">
          <Badge>{worker.category}</Badge>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
          <div className="flex items-center gap-2 text-xs font-medium text-media-foreground/80 mb-2 transition-colors duration-300 group-hover:text-media-foreground">
            <MapPin
              className="size-3 shrink-0 text-media-foreground transition-transform duration-300 [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-110"
              aria-hidden="true"
            />
            <span className="truncate">{worker.location}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold text-media-foreground leading-tight mb-4">
            <Link
              href={`/workers/${worker.id}`}
              // Same target as the card link above, so it must prefetch the same
              // way — siblings that disagree leave this one committing a shell
              // with no worker content.
              prefetch
              className="group/name inline-flex items-center gap-2 cursor-pointer hover:text-media-foreground transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2 focus-visible:ring-offset-invert rounded-sm"
            >
              <SharedNamedViewTransition
                name={workerTitleTransitionName(worker.id)}
              >
                <span className="relative inline-block">
                  {worker.title}
                  <span className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-media-foreground origin-left scale-x-0 transition-transform duration-300 ease-out group-hover/name:scale-x-100" />
                </span>
              </SharedNamedViewTransition>
              <ArrowRight className="size-4 sm:h-5 sm:w-5 text-media-foreground opacity-0 -translate-x-2 transition-[opacity,transform] duration-300 ease-out group-hover/name:opacity-100 group-hover/name:translate-x-0" />
            </Link>
          </h2>

          <div className="relative z-30">
            <QuickGiveInput
              missionaryId={worker.givingMissionaryId}
              workerId={worker.id}
            />
          </div>
        </div>
      </div>

      <div className="pt-4 px-1">
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 font-medium transition-colors duration-300 group-hover:text-foreground">
          {worker.description}
        </p>
      </div>
    </article>
  );
}

export function WorkersPageClient() {
  const [searchTerm, setSearchTerm] = useState("");
  // Route VT owns the entrance when active (incl. hero/title share morphs);
  // only run the card fade/stagger on plain mounts.
  const withinRouteVt = useWithinViewTransitionRouteLayer();
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [regionFilter, setRegionFilter] = useState<string>("All");

  const workers = getFieldWorkers();

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(workers.map((w) => w.category)))],
    [workers],
  );

  const regions = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(workers.map((w) => w.location.split(", ").pop() || "Global")),
      ),
    ],
    [workers],
  );

  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        worker.title.toLowerCase().includes(searchLower) ||
        worker.location.toLowerCase().includes(searchLower) ||
        worker.description.toLowerCase().includes(searchLower);

      const matchesCategory =
        categoryFilter === "All" || worker.category === categoryFilter;
      const matchesRegion =
        regionFilter === "All" || worker.location.includes(regionFilter);

      return matchesSearch && matchesCategory && matchesRegion;
    });
  }, [searchTerm, categoryFilter, regionFilter, workers]);

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("All");
    setRegionFilter("All");
  };

  const hasActiveFilters =
    categoryFilter !== "All" || regionFilter !== "All" || searchTerm;

  return (
    <div className="min-h-dvh bg-card">
      <WorkersHero regions={regions} />

      <WorkerDirectoryFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        categories={categories}
        setCategoryFilter={setCategoryFilter}
        regionFilter={regionFilter}
        regions={regions}
        setRegionFilter={setRegionFilter}
        hasActiveFilters={hasActiveFilters}
        clearFilters={clearFilters}
      />

      <WorkerDirectoryResults
        filteredWorkers={filteredWorkers}
        withinRouteVt={withinRouteVt}
        clearFilters={clearFilters}
      />

      <WorkersCallToAction />
    </div>
  );
}

function WorkersHero({ regions }: { regions: string[] }) {
  return (
    <section className="relative bg-invert pt-32 sm:pt-40 lg:pt-48 pb-40 sm:pb-52 lg:pb-64 overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 to-invert" />
        <div className="absolute top-0 right-0 w-150 sm:w-200 lg:w-250 h-150 sm:h-200 lg:h-250 bg-radial from-success/10 to-transparent rounded-full" />
        <div className="absolute bottom-0 left-0 w-125 sm:w-150 lg:w-200 h-125 sm:h-150 lg:h-200 bg-radial from-info/10 to-transparent rounded-full" />
      </div>

      <div className="container-responsive relative z-10">
        <div className="max-w-5xl space-y-6 sm:space-y-8">
          <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-card/5 border border-background/10 text-invert-foreground/60 text-xs sm:text-sm font-medium sm:backdrop-blur-xl">
            <Globe
              className="size-3 sm:w-4 sm:h-4 text-success"
              aria-hidden="true"
            />
            <span>Operational Map: {regions.length - 1} Regions</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-normal text-invert-foreground leading-[0.9]">
            Field <br className="sm:hidden" />
            <span className="text-invert-foreground/75">Directory.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-invert-foreground/75 max-w-2xl font-light leading-relaxed">
            A verified roster of frontline partners delivering critical
            restoration.
            <span className="text-invert-foreground font-medium">
              {" "}
              100% Direct. 0% Delay.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

function WorkerDirectoryFilters({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  categories,
  setCategoryFilter,
  regionFilter,
  regions,
  setRegionFilter,
  hasActiveFilters,
  clearFilters,
}: {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  categoryFilter: string;
  categories: string[];
  setCategoryFilter: Dispatch<SetStateAction<string>>;
  regionFilter: string;
  regions: string[];
  setRegionFilter: Dispatch<SetStateAction<string>>;
  hasActiveFilters: string | true;
  clearFilters: () => void;
}) {
  return (
    <div className="container-responsive -mt-20 sm:-mt-28 lg:-mt-32 relative z-20">
      <div className="bg-card/95 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-sm  border border-border p-3 sm:p-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          <div className="flex-1">
            <label htmlFor="worker-search" className="sr-only">
              Search missionaries by name, region, or mission focus
            </label>
            <InputGroup>
              <InputGroupAddon>
                <Search aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                id="worker-search"
                type="text"
                placeholder="Search name, region, or focus..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>

          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" className="flex-1 justify-between">
                    <Filter
                      className="size-4 text-muted-foreground shrink-0"
                      aria-hidden="true"
                    />
                    <span className="truncate">
                      {categoryFilter === "All" ? "Focus" : categoryFilter}
                    </span>
                    <ChevronDown
                      className="size-3 opacity-50 shrink-0"
                      aria-hidden="true"
                    />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Category</DropdownMenuLabel>

                  <DropdownMenuSeparator />
                  {categories.map((cat) => (
                    <DropdownMenuCheckboxItem
                      key={cat}
                      checked={categoryFilter === cat}
                      onCheckedChange={() => setCategoryFilter(cat)}
                      className="rounded-lg h-9 font-medium text-sm"
                    >
                      {cat}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" className="flex-1 justify-between">
                    <MapPin
                      className="size-4 text-muted-foreground shrink-0"
                      aria-hidden="true"
                    />
                    <span className="truncate">
                      {regionFilter === "All" ? "Region" : regionFilter}
                    </span>
                    <ChevronDown
                      className="size-3 opacity-50 shrink-0"
                      aria-hidden="true"
                    />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Region</DropdownMenuLabel>

                  <DropdownMenuSeparator />
                  {regions.map((reg) => (
                    <DropdownMenuCheckboxItem
                      key={reg}
                      checked={regionFilter === reg}
                      onCheckedChange={() => setRegionFilter(reg)}
                      className="rounded-lg h-9 font-medium text-sm"
                    >
                      {reg}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="shrink-0"
                aria-label="Clear all filters"
              >
                <X className="size-5" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkerDirectoryResults({
  filteredWorkers,
  withinRouteVt,
  clearFilters,
}: {
  filteredWorkers: FieldWorker[];
  withinRouteVt: boolean;
  clearFilters: () => void;
}) {
  return (
    <div className="container-responsive py-16 sm:py-20 lg:py-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-4 sm:gap-6">
        <div className="space-y-1 sm:space-y-2">
          <span className="text-sm font-medium text-muted-foreground ">
            Active Partners
          </span>
          <p className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
            {filteredWorkers.length}{" "}
            <span className="font-normal text-muted-foreground">
              missionaries
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 bg-background px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-border">
          <Activity
            className="size-4 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="text-xs sm:text-sm font-medium text-muted-foreground">
            Sort: Priority
          </span>
        </div>
      </div>

      {filteredWorkers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {filteredWorkers.map((worker) => (
            <div key={worker.id}>
              <WorkerCard worker={worker} animateEntrance={!withinRouteVt} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 sm:py-20 bg-background rounded-2xl border border-border">
          <div className="size-12 sm:w-14 sm:h-14 bg-card rounded-xl flex items-center justify-center mb-5 sm:mb-6 shadow-sm border border-border mx-auto">
            <Search
              className="size-5 sm:h-6 sm:w-6 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
            No matches found
          </h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-6 sm:mb-8 text-sm px-4">
            We couldn&apos;t find any partners matching your criteria. Try
            adjusting your filters.
          </p>
          <Button onClick={clearFilters} variant="outline">
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}

function WorkersCallToAction() {
  return (
    <section className="bg-invert py-20 sm:py-28 lg:py-32 relative overflow-hidden text-center">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 sm:w-150 lg:w-200 h-125 sm:h-150 lg:h-200 bg-radial from-success to-transparent rounded-full" />
      </div>

      <div className="container-responsive relative z-10 px-4">
        <Sparkles
          className="size-6 sm:h-8 sm:w-8 text-warning mx-auto mb-6 sm:mb-8"
          aria-hidden="true"
        />
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-invert-foreground tracking-tight mb-4 sm:mb-6">
          Undirected Impact.
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-invert-foreground/75 max-w-2xl mx-auto mb-8 sm:mb-10 lg:mb-12 font-light leading-relaxed">
          Can&apos;t decide who to support? Donate to our{" "}
          <strong className="text-invert-foreground">Global Resilience</strong>{" "}
          fund. Resources are instantly routed to the highest-priority urgent
          needs.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <Link
            href={buildCheckoutHref({ fundId: "general" })}
            className={cn(
              buttonVariants({ variant: "inverse", size: "lg" }),
              "w-full sm:w-auto",
            )}
          >
            Support Urgent Needs
          </Link>
          <Link
            href="/about"
            className={cn(
              buttonVariants({ variant: "outline-inverse", size: "lg" }),
              "w-full sm:w-auto",
            )}
          >
            How We Verify
          </Link>
        </div>
      </div>
    </section>
  );
}

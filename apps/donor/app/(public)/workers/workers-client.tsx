"use client";

import {
  workerHeroImageTransitionName,
  workerTitleTransitionName,
} from "@asym/lib/view-transitions";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { Input } from "@asym/ui/components/shadcn/input";
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

import { QuickGiveInput } from "@/features/giving/components/QuickGiveInput";
import { getFieldWorkers, type FieldWorker } from "@/lib/mock-data";

function WorkerCard({ worker }: { worker: FieldWorker }) {
  return (
    <article className="group flex flex-col animate-fade-in-up">
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-zinc-900 shadow-xl shadow-zinc-200/50 ring-1 ring-black/5 transition-all duration-500 ease-out group-hover:shadow-2xl group-hover:shadow-zinc-300/60 group-hover:-translate-y-1 group-hover:ring-emerald-500/20">
        <Link
          href={`/workers/${worker.id}`}
          className="absolute inset-0 z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-2xl"
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

        <div className="absolute inset-0 opacity-90 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none" />

        <div className="absolute top-4 left-4 z-20 transition-transform duration-500 ease-out group-hover:translate-x-0.5">
          <Badge className="bg-white/10 backdrop-blur-md text-white border-white/20 font-medium text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-xl transition-all duration-300 group-hover:bg-white/15 group-hover:border-white/30">
            {worker.category}
          </Badge>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
          <div className="flex items-center gap-2 text-[11px] font-medium text-white/60 mb-2 uppercase tracking-wider transition-colors duration-300 group-hover:text-white/90">
            <MapPin
              className="size-3 flex-shrink-0 text-emerald-400 transition-transform duration-300 group-hover:scale-110"
              aria-hidden="true"
            />
            <span className="truncate">{worker.location}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold text-white leading-tight mb-4 group-hover:tracking-tight transition-all duration-300">
            <Link
              href={`/workers/${worker.id}`}
              className="group/name inline-flex items-center gap-2 cursor-pointer hover:text-emerald-300 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-sm"
            >
              <SharedNamedViewTransition
                name={workerTitleTransitionName(worker.id)}
              >
                <span className="relative inline-block">
                  {worker.title}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-[2px] bg-emerald-400 transition-all duration-300 ease-out group-hover/name:w-full" />
                </span>
              </SharedNamedViewTransition>
              <ArrowRight className="size-4 sm:h-5 sm:w-5 text-emerald-400 opacity-0 -translate-x-2 transition-all duration-300 ease-out group-hover/name:opacity-100 group-hover/name:translate-x-0" />
            </Link>
          </h2>

          <div className="relative z-30">
            <QuickGiveInput workerId={worker.id} />
          </div>
        </div>
      </div>

      <div className="pt-4 px-1">
        <p className="text-zinc-500 text-sm leading-relaxed line-clamp-2 font-medium transition-colors duration-300 group-hover:text-zinc-700">
          {worker.description}
        </p>
      </div>
    </article>
  );
}

export function WorkersPageClient() {
  const [searchTerm, setSearchTerm] = useState("");
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
    <div className="min-h-screen bg-white">
      <section className="relative bg-zinc-950 pt-32 sm:pt-40 lg:pt-48 pb-40 sm:pb-52 lg:pb-64 overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 to-zinc-950" />
          <div className="absolute top-0 right-0 w-[600px] sm:w-[800px] lg:w-[1000px] h-[600px] sm:h-[800px] lg:h-[1000px] bg-emerald-600/10 rounded-full blur-[150px] sm:blur-[200px]" />
          <div className="absolute bottom-0 left-0 w-[500px] sm:w-[600px] lg:w-[800px] h-[500px] sm:h-[600px] lg:h-[800px] bg-blue-600/10 rounded-full blur-[120px] sm:blur-[180px]" />
        </div>

        <div className="container-responsive relative z-10">
          <div className="max-w-5xl space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] backdrop-blur-xl">
              <Globe
                className="size-3 sm:w-4 sm:h-4 text-emerald-400"
                aria-hidden="true"
              />
              <span>Operational Map: {regions.length - 1} Regions</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tighter text-white leading-[0.9]">
              Field <br className="sm:hidden" />
              <span className="to-white/30">Directory.</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl font-light leading-relaxed">
              A verified roster of frontline partners delivering critical
              restoration.
              <span className="text-white font-medium">
                {" "}
                100% Direct. 0% Delay.
              </span>
            </p>
          </div>
        </div>
      </section>

      <div className="container-responsive -mt-20 sm:-mt-28 lg:-mt-32 relative z-20">
        <div className="bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl shadow-zinc-200/50 border border-zinc-100 p-3 sm:p-4">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-400"
                aria-hidden="true"
              />
              <label htmlFor="worker-search" className="sr-only">
                Search missionaries by name, region, or mission focus
              </label>
              <Input
                id="worker-search"
                type="text"
                placeholder="Search name, region, or focus..."
                className="h-11 sm:h-12 pl-11 pr-4 rounded-lg sm:rounded-xl bg-zinc-50 border-zinc-200 focus:bg-white text-zinc-900 placeholder:text-zinc-400 text-sm sm:text-base font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      className="h-11 sm:h-12 px-4 sm:px-5 rounded-lg sm:rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-50 bg-white gap-2 font-medium text-sm flex-1 sm:flex-none justify-between sm:justify-start"
                    >
                      <Filter
                        className="size-4 text-zinc-400 shrink-0"
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
                <DropdownMenuContent
                  align="end"
                  className="w-56 p-2 rounded-xl"
                >
                  <DropdownMenuLabel className="text-xs font-semibold text-zinc-500 py-2">
                    Category
                  </DropdownMenuLabel>
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
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      className="h-11 sm:h-12 px-4 sm:px-5 rounded-lg sm:rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-50 bg-white gap-2 font-medium text-sm flex-1 sm:flex-none justify-between sm:justify-start"
                    >
                      <MapPin
                        className="size-4 text-zinc-400 shrink-0"
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
                <DropdownMenuContent
                  align="end"
                  className="w-56 p-2 rounded-xl"
                >
                  <DropdownMenuLabel className="text-xs font-semibold text-zinc-500 py-2">
                    Region
                  </DropdownMenuLabel>
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
                </DropdownMenuContent>
              </DropdownMenu>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="h-11 sm:h-12 w-11 sm:w-12 rounded-lg sm:rounded-xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 p-0 shrink-0"
                  aria-label="Clear all filters"
                >
                  <X className="size-5" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-responsive py-16 sm:py-20 lg:py-24">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 sm:mb-12 gap-4 sm:gap-6">
          <div className="space-y-1 sm:space-y-2">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
              Active Partners
            </span>
            <p className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900">
              {filteredWorkers.length}{" "}
              <span className="font-normal text-zinc-400">missionaries</span>
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 bg-zinc-50 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-zinc-100">
            <Activity className="size-4 text-zinc-400" aria-hidden="true" />
            <span className="text-xs sm:text-sm font-medium text-zinc-500">
              Sort: Priority
            </span>
          </div>
        </div>

        {filteredWorkers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {filteredWorkers.map((worker, index) => (
              <div
                key={worker.id}
                style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
              >
                <WorkerCard worker={worker} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 sm:py-20 bg-zinc-50 rounded-2xl border border-zinc-100">
            <div className="size-12 sm:w-14 sm:h-14 bg-white rounded-xl flex items-center justify-center mb-5 sm:mb-6 shadow-lg border border-zinc-100 mx-auto">
              <Search
                className="size-5 sm:h-6 sm:w-6 text-zinc-300"
                aria-hidden="true"
              />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-zinc-900 mb-2">
              No matches found
            </h3>
            <p className="text-zinc-500 max-w-sm mx-auto mb-6 sm:mb-8 text-sm px-4">
              We couldn&apos;t find any partners matching your criteria. Try
              adjusting your filters.
            </p>
            <Button
              onClick={clearFilters}
              variant="outline"
              className="h-10 sm:h-11 px-5 sm:px-6 rounded-xl"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      <section className="bg-zinc-950 py-20 sm:py-28 lg:py-32 relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[600px] lg:w-[800px] h-[500px] sm:h-[600px] lg:h-[800px] bg-emerald-600 rounded-full blur-[150px] sm:blur-[200px]" />
        </div>

        <div className="container-responsive relative z-10 px-4">
          <Sparkles
            className="size-6 sm:h-8 sm:w-8 text-amber-400 mx-auto mb-6 sm:mb-8"
            aria-hidden="true"
          />
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-white tracking-tight mb-4 sm:mb-6">
            Undirected Impact.
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-8 sm:mb-10 lg:mb-12 font-light leading-relaxed">
            Can&apos;t decide who to support? Donate to our{" "}
            <strong className="text-white">Global Resilience</strong> fund.
            Resources are instantly routed to the highest-priority urgent needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link
              href="/checkout?fund=general"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 sm:h-14 px-6 sm:px-10 rounded-xl sm:rounded-2xl bg-white text-zinc-900 hover:bg-zinc-100 text-sm sm:text-base font-semibold shadow-xl w-full sm:w-auto",
              )}
            >
              Support Urgent Needs
            </Link>
            <Link
              href="/about"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 sm:h-14 px-6 sm:px-10 rounded-xl sm:rounded-2xl bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 text-sm sm:text-base font-semibold backdrop-blur-xl w-full sm:w-auto",
              )}
            >
              How We Verify
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

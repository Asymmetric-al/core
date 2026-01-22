"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";

import {
  usePublicLocations,
  Location,
} from "@/features/mission-control/locations/hooks/use-locations";
import { Button } from "@asym/ui/components/shadcn/button";
import { Badge } from "@asym/ui/components/shadcn/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@asym/ui/components/shadcn/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@asym/ui/components/shadcn/dialog";
import { cn } from "@asym/lib/utils";
import {
  Map,
  MapMarker,
  MarkerContent,
  MapControls,
  MapStyleToggle,
  MapLegend,
} from "@asym/ui/components/shadcn/map";

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

const MARKER_COLORS = {
  missionary: {
    bg: "bg-emerald-500",
    bgHex: "#10b981",
    border: "border-emerald-500",
    ring: "ring-emerald-500/30",
    text: "text-emerald-600 dark:text-emerald-400",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/50",
    borderLight: "border-emerald-200 dark:border-emerald-800",
    label: "Global Worker",
    gradient: "from-emerald-500 to-teal-500",
  },
  project: {
    bg: "bg-violet-500",
    bgHex: "#8b5cf6",
    border: "border-violet-500",
    ring: "ring-violet-500/30",
    text: "text-violet-600 dark:text-violet-400",
    bgLight: "bg-violet-50 dark:bg-violet-950/50",
    borderLight: "border-violet-200 dark:border-violet-800",
    label: "Project",
    gradient: "from-violet-500 to-purple-500",
  },
  custom: {
    bg: "bg-slate-500",
    bgHex: "#64748b",
    border: "border-slate-500",
    ring: "ring-slate-500/30",
    text: "text-slate-600 dark:text-slate-400",
    bgLight: "bg-slate-50 dark:bg-slate-950/50",
    borderLight: "border-slate-200 dark:border-slate-800",
    label: "Location",
    gradient: "from-slate-500 to-zinc-500",
  },
} as const;

function LocationSearchCommand({
  locations,
  onSelect,
  open,
  onOpenChange,
}: {
  locations: Location[];
  onSelect: (loc: Location) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const grouped = useMemo(() => {
    const missionaries = locations.filter((l) => l.type === "missionary");
    const projects = locations.filter((l) => l.type === "project");
    const custom = locations.filter((l) => l.type === "custom");
    return { missionaries, projects, custom };
  }, [locations]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Search Locations</DialogTitle>
          <DialogDescription>
            Find missionaries and projects around the world
          </DialogDescription>
        </DialogHeader>
        <Command className="rounded-lg border-0 shadow-none">
          <CommandInput
            placeholder="Search locations, workers, projects..."
            className="h-14 text-base"
          />
          <CommandList className="max-h-[400px]">
            <CommandEmpty className="py-12">
              <div className="flex flex-col items-center gap-2">
                <div className="size-12 rounded-full bg-muted flex items-center justify-center">
                  <SearchIcon className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  No results found
                </p>
                <p className="text-xs text-muted-foreground">
                  Try a different search term
                </p>
              </div>
            </CommandEmpty>
            {grouped.missionaries.length > 0 && (
              <CommandGroup heading="Global Workers">
                {grouped.missionaries.map((loc) => (
                  <CommandItem
                    key={loc.id}
                    value={`${loc.title} ${loc.summary || ""}`}
                    onSelect={() => {
                      onSelect(loc);
                      onOpenChange(false);
                    }}
                    className="gap-3 py-3 cursor-pointer"
                  >
                    <div
                      className={cn(
                        "size-2.5 rounded-full shrink-0",
                        MARKER_COLORS.missionary.bg,
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{loc.title}</p>
                      {loc.summary && (
                        <p className="text-xs text-muted-foreground truncate">
                          {loc.summary}
                        </p>
                      )}
                    </div>
                    <ChevronRightIcon className="size-4 text-muted-foreground shrink-0" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {grouped.projects.length > 0 && (
              <CommandGroup heading="Projects">
                {grouped.projects.map((loc) => (
                  <CommandItem
                    key={loc.id}
                    value={`${loc.title} ${loc.summary || ""}`}
                    onSelect={() => {
                      onSelect(loc);
                      onOpenChange(false);
                    }}
                    className="gap-3 py-3 cursor-pointer"
                  >
                    <div
                      className={cn(
                        "size-2.5 rounded-full shrink-0",
                        MARKER_COLORS.project.bg,
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{loc.title}</p>
                      {loc.summary && (
                        <p className="text-xs text-muted-foreground truncate">
                          {loc.summary}
                        </p>
                      )}
                    </div>
                    <ChevronRightIcon className="size-4 text-muted-foreground shrink-0" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {grouped.custom.length > 0 && (
              <CommandGroup heading="Other Locations">
                {grouped.custom.map((loc) => (
                  <CommandItem
                    key={loc.id}
                    value={`${loc.title} ${loc.summary || ""}`}
                    onSelect={() => {
                      onSelect(loc);
                      onOpenChange(false);
                    }}
                    className="gap-3 py-3 cursor-pointer"
                  >
                    <div
                      className={cn(
                        "size-2.5 rounded-full shrink-0",
                        MARKER_COLORS.custom.bg,
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{loc.title}</p>
                      {loc.summary && (
                        <p className="text-xs text-muted-foreground truncate">
                          {loc.summary}
                        </p>
                      )}
                    </div>
                    <ChevronRightIcon className="size-4 text-muted-foreground shrink-0" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function HoverTooltip({
  location,
  visible,
}: {
  location: Location;
  visible: boolean;
}) {
  const colors =
    MARKER_COLORS[location.type as keyof typeof MARKER_COLORS] ||
    MARKER_COLORS.custom;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 2, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none z-50"
        >
          <div className="bg-popover border border-border rounded-xl shadow-xl px-3 py-2 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <div className={cn("size-1.5 rounded-full", colors.bg)} />
              <span className="text-xs font-semibold text-foreground">
                {location.title}
              </span>
            </div>
            <p className={cn("text-[10px] font-medium mt-0.5", colors.text)}>
              {colors.label}
            </p>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div className="w-2 h-2 bg-popover border-r border-b border-border rotate-45" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MarkerDot({
  location,
  isSelected,
  onSelect,
  onHover,
  isHovered,
}: {
  location: Location;
  isSelected: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
  isHovered: boolean;
}) {
  const colors =
    MARKER_COLORS[location.type as keyof typeof MARKER_COLORS] ||
    MARKER_COLORS.custom;

  return (
    <MapMarker
      longitude={location.lng}
      latitude={location.lat}
      onClick={onSelect}
    >
      <MarkerContent>
        <div
          className="relative"
          onMouseEnter={() => onHover(true)}
          onMouseLeave={() => onHover(false)}
        >
          <HoverTooltip
            location={location}
            visible={isHovered && !isSelected}
          />

          <div
            className={cn(
              "relative transition-all duration-200 ease-out cursor-pointer",
              isSelected ? "z-50" : "z-10 hover:z-40",
            )}
          >
            <div
              className={cn(
                "rounded-full border-[1.5px] border-white/90 dark:border-zinc-900/90 shadow-md transition-all duration-200 ease-out",
                colors.bg,
                isSelected
                  ? "size-3.5 ring-[3px] shadow-lg"
                  : "size-2 hover:size-2.5",
                isSelected && colors.ring,
              )}
            />

            {isSelected && (
              <motion.div
                initial={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className={cn("absolute inset-0 rounded-full", colors.bg)}
              />
            )}
          </div>
        </div>
      </MarkerContent>
    </MapMarker>
  );
}

function DetailDialog({
  location,
  open,
  onOpenChange,
}: {
  location: Location | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!location) return null;

  const colors =
    MARKER_COLORS[location.type as keyof typeof MARKER_COLORS] ||
    MARKER_COLORS.custom;
  const hasImage = location.image_public_id;
  const imageUrl = hasImage
    ? `https://res.cloudinary.com/demo/image/upload/w_800,h_500,c_fill/${location.image_public_id}`
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{location.title}</DialogTitle>
          <DialogDescription>
            {location.summary || "View location details"}
          </DialogDescription>
        </DialogHeader>

        {imageUrl ? (
          <div className="relative h-52 bg-muted overflow-hidden">
            <Image
              src={imageUrl}
              alt={location.title}
              fill
              className="object-cover"
              sizes="520px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-3 right-3 size-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <XIcon className="size-4 text-white" />
            </button>
          </div>
        ) : (
          <div
            className={cn(
              "relative h-32 bg-gradient-to-br",
              colors.gradient,
              "flex items-center justify-center",
            )}
          >
            <GlobeIcon className="size-12 text-white/30" />
            <button
              onClick={() => onOpenChange(false)}
              className="absolute top-3 right-3 size-8 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center hover:bg-black/40 transition-colors"
            >
              <XIcon className="size-4 text-white" />
            </button>
          </div>
        )}

        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wider",
                colors.bgLight,
                colors.text,
                "border",
                colors.borderLight,
              )}
            >
              {colors.label}
            </Badge>
          </div>

          <h2 className="text-xl font-bold text-foreground mb-2">
            {location.title}
          </h2>

          {location.summary && (
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {location.summary}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
            <MapPinIcon className="size-3.5" />
            <span>
              {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°
            </span>
          </div>

          <div className="flex gap-3">
            {location.linked_id && location.type === "missionary" ? (
              <>
                <Link
                  href={`/workers/${location.linked_id}`}
                  className="flex-1"
                >
                  <Button className="w-full h-11 rounded-xl font-semibold gap-2">
                    <ExternalLinkIcon className="size-4" />
                    View Profile
                  </Button>
                </Link>
                <Link href={`/checkout?missionary=${location.linked_id}`}>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="size-11 rounded-xl shrink-0"
                  >
                    <HeartIcon className="size-4" />
                  </Button>
                </Link>
              </>
            ) : (
              <Button
                variant="secondary"
                className="w-full h-11 rounded-xl font-semibold"
              >
                Learn More
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MobileDetailSheet({
  location,
  onClose,
}: {
  location: Location;
  onClose: () => void;
}) {
  const colors =
    MARKER_COLORS[location.type as keyof typeof MARKER_COLORS] ||
    MARKER_COLORS.custom;
  const hasImage = location.image_public_id;
  const imageUrl = hasImage
    ? `https://res.cloudinary.com/demo/image/upload/w_800,h_400,c_fill/${location.image_public_id}`
    : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-[60] bg-card rounded-t-3xl shadow-2xl lg:hidden max-h-[85vh] overflow-hidden"
      >
        <div className="sticky top-0 bg-card p-3 flex justify-center">
          <div className="w-12 h-1 bg-muted-foreground/20 rounded-full" />
        </div>

        {imageUrl && (
          <div className="relative h-40 mx-4 rounded-2xl overflow-hidden mb-4">
            <Image
              src={imageUrl}
              alt={location.title}
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
        )}

        <div className="px-6 pb-8 pt-2">
          <Badge
            variant="secondary"
            className={cn(
              "text-[10px] font-semibold uppercase tracking-wider mb-3",
              colors.bgLight,
              colors.text,
              "border",
              colors.borderLight,
            )}
          >
            {colors.label}
          </Badge>

          <h3 className="text-xl font-bold text-foreground mb-2">
            {location.title}
          </h3>

          {location.summary && (
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {location.summary}
            </p>
          )}

          <div className="flex gap-3">
            {location.linked_id && location.type === "missionary" ? (
              <>
                <Link
                  href={`/workers/${location.linked_id}`}
                  className="flex-1"
                >
                  <Button className="w-full h-12 rounded-xl font-semibold gap-2">
                    <ExternalLinkIcon className="size-4" />
                    View Profile
                  </Button>
                </Link>
                <Link href={`/checkout?missionary=${location.linked_id}`}>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="size-12 rounded-xl shrink-0"
                  >
                    <HeartIcon className="size-4" />
                  </Button>
                </Link>
              </>
            ) : (
              <Button
                variant="secondary"
                className="flex-1 h-12 rounded-xl font-semibold"
              >
                Learn More
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="size-12 rounded-xl shrink-0"
            >
              <XIcon className="size-5" />
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export function WhereWeWorkMap() {
  const { data: locations, isLoading } = usePublicLocations();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(
    undefined,
  );
  const [mapZoom, setMapZoom] = useState<number | undefined>(undefined);
  const [searchOpen, setSearchOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const selectedLocation = useMemo(() => {
    if (!selectedId || !locations) return null;
    return locations.find((loc) => loc.id === selectedId) || null;
  }, [selectedId, locations]);

  const stats = useMemo(() => {
    if (!locations) return { total: 0, missionaries: 0, projects: 0 };
    return {
      total: locations.length,
      missionaries: locations.filter((l) => l.type === "missionary").length,
      projects: locations.filter((l) => l.type === "project").length,
    };
  }, [locations]);

  const handleSelectLocation = useCallback(
    (loc: Location) => {
      setSelectedId(loc.id);
      setMapCenter([loc.lng, loc.lat]);
      setMapZoom(6);

      if (isMobile) {
        setShowMobileSheet(true);
      } else {
        setDetailDialogOpen(true);
      }
    },
    [isMobile],
  );

  const handleMarkerClick = useCallback(
    (loc: Location) => {
      setSelectedId(loc.id);
      setMapCenter([loc.lng, loc.lat]);
      setMapZoom(6);

      if (isMobile) {
        setShowMobileSheet(true);
      } else {
        setDetailDialogOpen(true);
      }
    },
    [isMobile],
  );

  const handleCloseDetail = useCallback(() => {
    setDetailDialogOpen(false);
    setShowMobileSheet(false);
  }, []);

  const mapInitialViewState = useMemo(
    () => ({ longitude: 15, latitude: 20, zoom: 2 }),
    [],
  );

  return (
    <div className="relative w-full min-h-[100dvh] bg-background">
      <div className="relative w-full h-[100dvh] overflow-hidden">
        <Map
          center={mapCenter}
          zoom={mapZoom}
          initialViewState={mapInitialViewState}
          className="absolute inset-0 w-full h-full"
        >
          <MapControls
            position="bottom-right"
            className="bottom-6 right-4 lg:bottom-8 lg:right-8"
            showFullscreen={!isMobile}
          />
          <MapStyleToggle
            position="bottom-right"
            className="bottom-[140px] lg:bottom-[180px] right-4 lg:right-8"
          />

          <MapLegend
            title="Legend"
            position="bottom-left"
            className="bottom-8 left-8"
          >
            <div className="flex items-center gap-2.5">
              <div className="size-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-muted-foreground">
                Global Workers
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="size-2 rounded-full bg-violet-500" />
              <span className="text-xs font-medium text-muted-foreground">
                Projects
              </span>
            </div>
          </MapLegend>

          {locations?.map((loc) => (
            <MarkerDot
              key={loc.id}
              location={loc}
              isSelected={selectedId === loc.id}
              isHovered={hoveredId === loc.id}
              onSelect={() => handleMarkerClick(loc)}
              onHover={(hovered) => setHoveredId(hovered ? loc.id : null)}
            />
          ))}
        </Map>

        <div className="absolute top-4 left-4 z-30 flex items-center gap-3">
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="h-10 rounded-xl bg-card/95 backdrop-blur-md border-border/50 shadow-lg hover:bg-card gap-2"
            >
              <ArrowLeftIcon className="size-4" />
              <span className="font-medium hidden sm:inline">Back</span>
            </Button>
          </Link>
        </div>

        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl rounded-2xl overflow-hidden"
          >
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors w-full"
            >
              <SearchIcon className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-medium">
                Search locations...
              </span>
              <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
          </motion.div>
        </div>

        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="hidden sm:flex items-center gap-2 bg-card/95 backdrop-blur-xl border border-border/50 shadow-lg rounded-xl px-3 py-2"
          >
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-foreground">
                {stats.missionaries}
              </span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-violet-500" />
              <span className="text-xs font-semibold text-foreground">
                {stats.projects}
              </span>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {selectedLocation && !detailDialogOpen && !showMobileSheet && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30"
            >
              <button
                onClick={() =>
                  isMobile
                    ? setShowMobileSheet(true)
                    : setDetailDialogOpen(true)
                }
                className="bg-card/95 backdrop-blur-xl shadow-2xl rounded-full pl-4 pr-2 py-2 flex items-center gap-3 border border-border/50 hover:bg-card transition-colors group"
              >
                <div
                  className={cn(
                    "size-2.5 rounded-full",
                    MARKER_COLORS[
                      selectedLocation.type as keyof typeof MARKER_COLORS
                    ]?.bg || MARKER_COLORS.custom.bg,
                  )}
                />
                <span className="text-sm font-semibold text-foreground truncate max-w-[200px]">
                  {selectedLocation.title}
                </span>
                <div className="size-7 rounded-full bg-primary flex items-center justify-center group-hover:bg-primary/90 transition-colors">
                  <ChevronRightIcon className="size-4 text-primary-foreground" />
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 text-[10px] text-muted-foreground/60 font-medium"
          >
            <span>Scroll down for more</span>
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {locations && (
        <LocationSearchCommand
          locations={locations}
          onSelect={handleSelectLocation}
          open={searchOpen}
          onOpenChange={setSearchOpen}
        />
      )}

      <DetailDialog
        location={selectedLocation}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />

      <AnimatePresence>
        {showMobileSheet && selectedLocation && (
          <MobileDetailSheet
            location={selectedLocation}
            onClose={handleCloseDetail}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

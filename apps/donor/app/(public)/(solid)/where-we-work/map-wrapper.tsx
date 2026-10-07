"use client";

import {
  usePublicLocations,
  type PublicLocation as Location,
} from "@asym/database/hooks";
import { motion, AnimatePresence } from "@asym/lib/motion";
import { buildCheckoutHref } from "@asym/lib/payments/checkout-designations";
import {
  Map,
  MapMarker,
  MarkerContent,
  MapControls,
  MapStyleToggle,
  MapLegend,
} from "@asym/ui/components/primitives/map";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@asym/ui/components/shadcn/sheet";
import { cn } from "@asym/ui/lib/utils";
import {
  Search as SearchIcon,
  X as XIcon,
  ChevronRight as ChevronRightIcon,
  ChevronDown,
  Globe as GlobeIcon,
  ArrowLeft as ArrowLeftIcon,
  Heart as HeartIcon,
  ExternalLink as ExternalLinkIcon,
  MapPin as MapPinIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useCallback, useEffect } from "react";

const MARKER_COLORS = {
  missionary: {
    bg: "bg-success",
    border: "border-success",
    ring: "ring-success/30",
    text: "text-success",
    bgLight: "bg-success/10",
    borderLight: "border-success/25",
    label: "Global Worker",
    gradient: "from-success to-success",
  },
  project: {
    bg: "bg-chart-3",
    border: "border-chart-3",
    ring: "ring-chart-3/30",
    text: "text-chart-3",
    bgLight: "bg-chart-3/10",
    borderLight: "border-chart-3/25",
    label: "Project",
    gradient: "from-chart-3 to-chart-3",
  },
  custom: {
    bg: "bg-muted-foreground",
    border: "border-muted-foreground",
    ring: "ring-muted-foreground/30",
    text: "text-muted-foreground",
    bgLight: "bg-muted",
    borderLight: "border-border",
    label: "Location",
    gradient: "from-invert to-invert",
  },
};

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
      <DialogContent className="sm:max-w-120" scrollable>
        <DialogHeader className="sr-only">
          <DialogTitle>Search Locations</DialogTitle>
          <DialogDescription>
            Find missionaries and projects around the world
          </DialogDescription>
        </DialogHeader>
        <Command>
          <CommandInput placeholder="Search locations, workers, projects…" />
          <CommandList>
            <CommandEmpty>
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
          <div className="bg-popover border border-border rounded-xl shadow-md px-3 py-2 whitespace-nowrap">
            <div className="flex items-center gap-2">
              <div className={cn("size-1.5 rounded-full", colors.bg)} />
              <span className="text-xs font-semibold text-foreground">
                {location.title}
              </span>
            </div>
            <p className={cn("text-xs font-medium mt-0.5", colors.text)}>
              {colors.label}
            </p>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div className="size-2 bg-popover border-r border-b border-border rotate-45" />
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
    <MapMarker longitude={location.lng} latitude={location.lat}>
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

          <button
            type="button"
            aria-label={`View ${location.title}`}
            onClick={onSelect}
            className={cn(
              "group relative cursor-pointer touch-target flex items-center justify-center rounded-full focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
              isSelected ? "z-50" : "z-10 hover:z-40",
            )}
          >
            <span
              data-slot="location-marker-visual"
              aria-hidden="true"
              className={cn(
                "relative block size-2 origin-center transition-transform duration-200 ease-out",
                isSelected
                  ? "scale-[1.75]"
                  : "[@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-125",
              )}
            >
              <div
                className={cn(
                  "size-2 rounded-full border-[1.5px] border-background/90 shadow-md transition-shadow duration-200 ease-out",
                  colors.bg,
                  isSelected && "ring-2 shadow-lg",
                  isSelected && colors.ring,
                )}
              />

              {isSelected && (
                <motion.div
                  data-slot="location-marker-pulse"
                  aria-hidden="true"
                  initial={{ scale: 1, opacity: 0.4 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className={cn(
                    "absolute inset-0 rounded-full pointer-events-none",
                    colors.bg,
                  )}
                />
              )}
            </span>
          </button>
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
      <DialogContent className="sm:max-w-130" scrollable>
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
            <div className="absolute inset-0 bg-linear-to-t from-media-scrim/60 via-transparent to-transparent" />
            <div className="absolute top-3 right-3">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => onOpenChange(false)}
                aria-label="Close location details"
              >
                <XIcon aria-hidden="true" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "relative h-32 bg-gradient-to-br",
              colors.gradient,
              "flex items-center justify-center",
            )}
          >
            <GlobeIcon className="size-12 text-media-foreground/30" />
            <div className="absolute top-3 right-3">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => onOpenChange(false)}
                aria-label="Close location details"
              >
                <XIcon aria-hidden="true" />
              </Button>
            </div>
          </div>
        )}

        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary">{colors.label}</Badge>
          </div>

          <h2 className="text-xl font-semibold text-foreground mb-2">
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
                  // Matches the directory's links: the shared /workers/[id] App
                  // Shell carries no per-worker content, so only a full prefetch
                  // pulls that worker's prerendered page. One dialog is open at a
                  // time, so this costs a single prefetch.
                  prefetch
                  className={cn(
                    buttonVariants(),
                    "flex-1 h-11 rounded-xl font-semibold",
                  )}
                >
                  <ExternalLinkIcon className="size-4" />
                  View Profile
                </Link>
                <Link
                  href={buildCheckoutHref({
                    missionaryId: location.linked_id,
                  })}
                  aria-label={`Give to ${location.title}`}
                  className={cn(
                    buttonVariants({ variant: "secondary", size: "icon" }),
                    "size-11 rounded-xl shrink-0",
                  )}
                >
                  <HeartIcon className="size-4" />
                </Link>
              </>
            ) : (
              <Button variant="secondary" className="w-full">
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
  open,
  onClose,
}: {
  location: Location;
  open: boolean;
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
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <SheetContent side="bottom" showCloseButton={false}>
        <div className="max-h-[85dvh] overflow-y-auto">
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
            <Badge variant="secondary" className="mb-3">
              {colors.label}
            </Badge>

            <SheetTitle>{location.title}</SheetTitle>

            <SheetDescription
              className={
                location.summary
                  ? "text-muted-foreground text-sm leading-relaxed mb-6"
                  : "sr-only"
              }
            >
              {location.summary || "Location details"}
            </SheetDescription>

            <div className="flex gap-3">
              {location.linked_id && location.type === "missionary" ? (
                <>
                  <Link
                    href={`/workers/${location.linked_id}`}
                    // See the desktop dialog above: one sheet is open at a time.
                    prefetch
                    className={cn(
                      buttonVariants(),
                      "flex-1 h-12 rounded-xl font-semibold",
                    )}
                  >
                    <ExternalLinkIcon className="size-4" />
                    View Profile
                  </Link>
                  <Link
                    href={buildCheckoutHref({
                      missionaryId: location.linked_id,
                    })}
                    aria-label={`Give to ${location.title}`}
                    className={cn(
                      buttonVariants({ variant: "secondary", size: "icon" }),
                      "size-12 rounded-xl shrink-0",
                    )}
                  >
                    <HeartIcon className="size-4" />
                  </Link>
                </>
              ) : (
                <Button variant="secondary" className="w-full">
                  Learn More
                </Button>
              )}
              <SheetClose
                render={
                  <Button variant="outline" size="icon" className="shrink-0" />
                }
                aria-label="Close location details"
              >
                <XIcon className="size-5" />
              </SheetClose>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MapHeaderControls({
  missionaryCount,
  onOpenSearch,
  searchOpen,
  projectCount,
}: {
  missionaryCount: number;
  onOpenSearch: () => void;
  searchOpen: boolean;
  projectCount: number;
}) {
  return (
    <>
      <div className="absolute top-20 left-4 z-30 flex items-center gap-3">
        <Link
          href="/"
          aria-label="Back"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-10 rounded-xl bg-card/95 backdrop-blur-md border-border/50 shadow-lg hover:bg-card gap-2",
          )}
        >
          <ArrowLeftIcon className="size-4" />
          <span className="font-medium hidden sm:inline">Back</span>
        </Link>
      </div>

      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card/95 backdrop-blur-xl border border-border/50 shadow-md rounded-2xl overflow-hidden"
        >
          <Button
            variant="ghost"
            size="lg"
            aria-haspopup="dialog"
            aria-expanded={searchOpen}
            onClick={onOpenSearch}
            className="w-full"
          >
            <SearchIcon className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-medium">
              Search locations…
            </span>
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground ml-auto">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </motion.div>
      </div>

      <div className="absolute top-20 right-4 z-30 flex items-center gap-2">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="hidden sm:flex items-center gap-2 bg-card/95 backdrop-blur-xl border border-border/50 shadow-lg rounded-xl px-3 py-2"
        >
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-success" />
            <span className="text-xs font-semibold text-foreground">
              {missionaryCount}
            </span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-chart-3" />
            <span className="text-xs font-semibold text-foreground">
              {projectCount}
            </span>
          </div>
        </motion.div>
      </div>
    </>
  );
}

function SelectedLocationPill({
  onOpenDetails,
  selectedLocation,
  visible,
}: {
  onOpenDetails: () => void;
  selectedLocation: Location | null;
  visible: boolean;
}) {
  return (
    <AnimatePresence>
      {selectedLocation && visible && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30"
        >
          <Button variant="outline" size="lg" onClick={onOpenDetails}>
            <div
              className={cn(
                "size-2.5 rounded-full",
                MARKER_COLORS[
                  selectedLocation.type as keyof typeof MARKER_COLORS
                ]?.bg || MARKER_COLORS.custom.bg,
              )}
            />
            <span className="text-sm font-semibold text-foreground truncate max-w-50">
              {selectedLocation.title}
            </span>
            <div className="size-7 rounded-full bg-primary flex items-center justify-center group-hover:bg-primary/90 transition-colors">
              <ChevronRightIcon className="size-4 text-primary-foreground" />
            </div>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MapScrollHint() {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-2 text-xs text-muted-foreground/60 font-medium"
      >
        <span>Scroll down for more</span>
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="size-3" aria-hidden="true" />
        </motion.div>
      </motion.div>
    </div>
  );
}

export function WhereWeWorkMap() {
  const { data: locations } = usePublicLocations();
  const [selectionState, setSelectionState] = useState<{
    hoveredId: string | null;
    mapCenter: [number, number] | undefined;
    mapZoom: number | undefined;
    selectedId: string | null;
  }>({
    hoveredId: null,
    mapCenter: undefined,
    mapZoom: undefined,
    selectedId: null,
  });
  const [uiState, setUiState] = useState({
    detailDialogOpen: false,
    searchOpen: false,
    showMobileSheet: false,
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setUiState((prev) =>
          prev.showMobileSheet ? { ...prev, showMobileSheet: false } : prev,
        );
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setUiState((prev) => ({ ...prev, searchOpen: !prev.searchOpen }));
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const selectedLocation = useMemo(() => {
    if (!selectionState.selectedId || !locations) return null;
    return (
      locations.find((loc) => loc.id === selectionState.selectedId) || null
    );
  }, [selectionState.selectedId, locations]);

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
      setSelectionState((prev) => ({
        ...prev,
        mapCenter: [loc.lng, loc.lat],
        mapZoom: 6,
        selectedId: loc.id,
      }));

      if (isMobile) {
        setUiState((prev) => ({
          ...prev,
          detailDialogOpen: false,
          showMobileSheet: true,
        }));
      } else {
        setUiState((prev) => ({
          ...prev,
          detailDialogOpen: true,
          showMobileSheet: false,
        }));
      }
    },
    [isMobile],
  );

  const handleMarkerClick = useCallback(
    (loc: Location) => {
      setSelectionState((prev) => ({
        ...prev,
        mapCenter: [loc.lng, loc.lat],
        mapZoom: 6,
        selectedId: loc.id,
      }));

      if (isMobile) {
        setUiState((prev) => ({
          ...prev,
          detailDialogOpen: false,
          showMobileSheet: true,
        }));
      } else {
        setUiState((prev) => ({
          ...prev,
          detailDialogOpen: true,
          showMobileSheet: false,
        }));
      }
    },
    [isMobile],
  );

  const handleCloseDetail = useCallback(() => {
    setUiState((prev) => ({
      ...prev,
      detailDialogOpen: false,
      showMobileSheet: false,
    }));
  }, []);

  const mapInitialViewState = useMemo(
    () => ({ longitude: 15, latitude: 20, zoom: 2 }),
    [],
  );

  return (
    <div className="relative w-full min-h-[100dvh] bg-background">
      <div className="relative w-full h-[100dvh] overflow-hidden">
        <Map
          center={selectionState.mapCenter}
          zoom={selectionState.mapZoom}
          initialViewState={mapInitialViewState}
        >
          <MapControls position="bottom-right" showFullscreen={!isMobile} />
          <div className="absolute bottom-32 lg:bottom-44 right-0 size-0">
            <MapStyleToggle position="bottom-right" />
          </div>

          <MapLegend title="Legend" position="bottom-left">
            <div className="flex items-center gap-2.5">
              <div className="size-2 rounded-full bg-success" />
              <span className="text-xs font-medium text-muted-foreground">
                Global Workers
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="size-2 rounded-full bg-chart-3" />
              <span className="text-xs font-medium text-muted-foreground">
                Projects
              </span>
            </div>
          </MapLegend>

          {locations?.map((loc) => (
            <MarkerDot
              key={loc.id}
              location={loc}
              isSelected={selectionState.selectedId === loc.id}
              isHovered={selectionState.hoveredId === loc.id}
              onSelect={() => handleMarkerClick(loc)}
              onHover={(hovered) =>
                setSelectionState((prev) => ({
                  ...prev,
                  hoveredId: hovered ? loc.id : null,
                }))
              }
            />
          ))}
        </Map>
        <MapHeaderControls
          searchOpen={uiState.searchOpen}
          missionaryCount={stats.missionaries}
          onOpenSearch={() =>
            setUiState((prev) => ({ ...prev, searchOpen: true }))
          }
          projectCount={stats.projects}
        />
        <SelectedLocationPill
          selectedLocation={selectedLocation}
          visible={!uiState.detailDialogOpen && !uiState.showMobileSheet}
          onOpenDetails={() =>
            isMobile
              ? setUiState((prev) => ({ ...prev, showMobileSheet: true }))
              : setUiState((prev) => ({ ...prev, detailDialogOpen: true }))
          }
        />
        <MapScrollHint />
      </div>

      {locations && (
        <LocationSearchCommand
          locations={locations}
          onSelect={handleSelectLocation}
          open={uiState.searchOpen}
          onOpenChange={(open) =>
            setUiState((prev) => ({ ...prev, searchOpen: open }))
          }
        />
      )}

      <DetailDialog
        location={selectedLocation}
        open={uiState.detailDialogOpen}
        onOpenChange={(open) =>
          setUiState((prev) => ({ ...prev, detailDialogOpen: open }))
        }
      />

      {selectedLocation && (
        <MobileDetailSheet
          location={selectedLocation}
          open={uiState.showMobileSheet}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
}

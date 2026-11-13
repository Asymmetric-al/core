"use client";

import {
  Map,
  MapMarker,
  MarkerContent,
  MapControls,
} from "@asym/ui/components/primitives/map";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@asym/ui/components/shadcn/alert-dialog";
import { Button } from "@asym/ui/components/shadcn/button";
import { Card } from "@asym/ui/components/shadcn/card";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@asym/ui/components/shadcn/empty";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@asym/ui/components/shadcn/tabs";
import {
  Crosshair,
  Layers,
  MapPin,
  Plus,
  Table as TableIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import type { Location } from "@/features/mission-control/locations/hooks/use-locations";

import { LocationEditor } from "@/features/mission-control/locations/components/LocationEditor";
import { LocationTable } from "@/features/mission-control/locations/components/LocationTable";
import {
  useLocations,
  useDeleteLocation,
} from "@/features/mission-control/locations/hooks/use-locations";
import {
  LOCATION_TYPE_LABELS as MARKER_LABELS,
  getLocationTypeTone,
} from "@/features/mission-control/locations/location-labels";

/**
 * The marker key, under the map so it never covers a pin and shows on every
 * screen size.
 */
function LocationsMapLegend({ locations }: { locations: Location[] }) {
  const presentTypes = new Set(locations.map((location) => location.type));
  const types = (Object.keys(MARKER_LABELS) as Array<Location["type"]>).filter(
    (type) => presentTypes.has(type),
  );
  if (types.length === 0) return null;
  return (
    <ul
      aria-label="Marker types"
      className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground"
    >
      {types.map((type) => (
        <li key={type} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`size-3 rounded-full ${getLocationTypeTone(type)}`}
          />
          {MARKER_LABELS[type]}
        </li>
      ))}
    </ul>
  );
}

type MapClickEvent = {
  lngLat: {
    lng: number;
    lat: number;
  };
};

function roundCoordinate(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function wrapLongitude(longitude: number): number {
  return ((((longitude + 180) % 360) + 360) % 360) - 180;
}

function toCoordinates(
  point: MapClickEvent["lngLat"],
): Pick<Location, "lat" | "lng"> {
  return {
    lat: roundCoordinate(point.lat),
    lng: roundCoordinate(wrapLongitude(point.lng)),
  };
}

export default function LocationsPage() {
  const { data: locations, isLoading, isError, refetch } = useLocations();
  const { mutateAsync: deleteLocation, isPending: isDeleting } =
    useDeleteLocation();
  const [selectedLocation, setSelectedLocation] =
    useState<Partial<Location> | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [view, setView] = useState("map");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Escape cancels pin placement, as it closes other transient modes.
  useEffect(() => {
    if (!isAdding) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsAdding(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isAdding]);

  const handleMapClick = (e: MapClickEvent) => {
    if (isAdding) {
      setSelectedLocation({
        ...toCoordinates(e.lngLat),
        type: "custom",
        status: "draft",
      });
      setIsEditorOpen(true);
      setIsAdding(false);
      toast.info("Pin placed. Add the location's details.");
    }
  };

  // The keyboard path: the editor opens with empty coordinate fields.
  const handleAdd = () => {
    setIsAdding(false);
    setSelectedLocation({ type: "custom", status: "draft" });
    setIsEditorOpen(true);
  };

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    setIsEditorOpen(true);
  };

  // Asks first, in an AlertDialog rendered below.
  const handleDelete = (id: string) => {
    setDeleteError(null);
    setPendingDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId || isDeleting) return;
    setDeleteError(null);
    try {
      await deleteLocation(pendingDeleteId);
      toast.success("Location deleted");
      if (selectedLocation?.id === pendingDeleteId) setIsEditorOpen(false);
      setPendingDeleteId(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not delete this location. Try again.";
      setDeleteError(message);
      toast.error(message);
    }
  };
  const pendingDelete = locations?.find(
    (location) => location.id === pendingDeleteId,
  );

  const editorKey = `${selectedLocation?.id ?? "new"}-${selectedLocation?.lat ?? ""}-${selectedLocation?.lng ?? ""}-${isEditorOpen ? "open" : "closed"}`;

  const actions = (
    <>
      <Button
        variant={isAdding ? "secondary" : "outline"}
        onClick={() => {
          if (!isAdding) setView("map");
          setIsAdding(!isAdding);
        }}
        disabled={isLoading || isError}
        aria-pressed={isAdding}
      >
        <Crosshair aria-hidden="true" />
        Place on map
      </Button>
      <Button onClick={handleAdd}>
        <Plus aria-hidden="true" />
        Add location
      </Button>
    </>
  );

  return (
    <PageShell
      title="Locations"
      description="Where missionaries serve and projects run, on the public map."
      density="compact"
      actions={actions}
    >
      <Tabs
        value={view}
        onValueChange={(next) => {
          setView(next);
          if (next === "table") setIsAdding(false);
        }}
        className="space-y-5"
      >
        <div className="flex justify-start">
          <TabsList aria-label="Locations view">
            <TabsTrigger value="map">
              <Layers aria-hidden="true" /> Map
            </TabsTrigger>
            <TabsTrigger value="table">
              <TableIcon aria-hidden="true" /> List
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="map" className="m-0 flex flex-col gap-3">
          <Card className="h-150 overflow-hidden py-0">
            <div className="relative h-full">
              <Map
                initialViewState={{
                  longitude: 0,
                  latitude: 20,
                  zoom: 1.5,
                }}
                onClick={handleMapClick}
              >
                <MapControls />
                {locations?.map((loc) => (
                  <MapMarker
                    key={loc.id}
                    longitude={loc.lng}
                    latitude={loc.lat}
                    label={`Edit ${loc.title}`}
                    onClick={() => handleEdit(loc)}
                  >
                    <MarkerContent>
                      <div
                        className={`size-6 rounded-full border-4 border-background shadow-xl flex items-center justify-center transition-transform [@media(hover:hover)_and_(pointer:fine)]:hover:scale-110 ${getLocationTypeTone(loc.type)}`}
                      >
                        <MapPin className="size-3 text-primary-foreground" />
                      </div>
                    </MarkerContent>
                  </MapMarker>
                ))}
              </Map>

              {isLoading ? (
                <div
                  role="status"
                  className="absolute inset-0 bg-background/80 p-4"
                >
                  <Skeleton className="h-full w-full" />
                  <span className="sr-only">Loading locations�</span>
                </div>
              ) : isError ? (
                <div className="absolute inset-x-4 top-4">
                  <Alert variant="destructive">
                    <AlertTitle>Locations could not load</AlertTitle>
                    <AlertDescription>
                      Check your connection and try again.
                      <Button variant="outline" onClick={() => void refetch()}>
                        Try again
                      </Button>
                    </AlertDescription>
                  </Alert>
                </div>
              ) : locations?.length === 0 && !isAdding ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle>No locations yet</EmptyTitle>
                      <EmptyDescription>
                        Add your first location to the public map.
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Button onClick={handleAdd}>Add location</Button>
                    </EmptyContent>
                  </Empty>
                </div>
              ) : null}
              {isAdding && !isLoading && !isError && (
                <div className="pointer-events-none absolute inset-x-4 top-4 z-20 flex justify-center">
                  <p
                    role="status"
                    className="rounded-xl border bg-background px-4 py-3 text-center text-sm font-medium shadow-sm"
                  >
                    Click the map to place a pin. Press Escape to cancel.
                  </p>
                </div>
              )}
            </div>
          </Card>
          {!isLoading && !isError ? (
            <LocationsMapLegend locations={locations ?? []} />
          ) : null}
        </TabsContent>

        <TabsContent value="table" className="m-0">
          <LocationTable
            data={locations ?? []}
            isLoading={isLoading}
            error={
              isError
                ? {
                    title: "Locations could not load",
                    message: "Check your connection and try again.",
                    onRetry: () => void refetch(),
                  }
                : null
            }
            onAdd={handleAdd}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </TabsContent>
      </Tabs>

      <LocationEditor
        key={editorKey}
        location={selectedLocation}
        isOpen={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        onDelete={handleDelete}
      />
      <AlertDialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setPendingDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {pendingDelete?.title ?? "this location"}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              It is removed from the public map.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError ? (
            <Alert variant="destructive">
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={() => void confirmDelete()}
            >
              {isDeleting ? "Deleting…" : "Delete location"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}

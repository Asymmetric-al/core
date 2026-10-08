"use client";

import {
  Map,
  MapMarker,
  MarkerContent,
  MapControls,
} from "@asym/ui/components/primitives/map";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Button } from "@asym/ui/components/shadcn/button";
import { Card } from "@asym/ui/components/shadcn/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@asym/ui/components/shadcn/tabs";
import { Plus, MapPin, Table as TableIcon, Layers } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

import type { Location } from "@/features/mission-control/locations/hooks/use-locations";

import { LocationEditor } from "@/features/mission-control/locations/components/LocationEditor";
import { LocationTable } from "@/features/mission-control/locations/components/LocationTable";
import {
  useLocations,
  useDeleteLocation,
} from "@/features/mission-control/locations/hooks/use-locations";

type MapClickEvent = {
  lngLat: {
    lng: number;
    lat: number;
  };
};

export default function LocationsPage() {
  const { data: locations, isLoading } = useLocations();
  const { mutate: deleteLocation } = useDeleteLocation();
  const [selectedLocation, setSelectedLocation] =
    useState<Partial<Location> | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleMapClick = (e: MapClickEvent) => {
    if (isAdding) {
      const { lng, lat } = e.lngLat;
      setSelectedLocation({ lat, lng, type: "custom", status: "draft" });
      setIsEditorOpen(true);
      setIsAdding(false);
      toast.info("Drop confirmed. Now configure your location.");
    }
  };

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    setIsEditorOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this location?")) {
      deleteLocation(id);
      setIsEditorOpen(false);
    }
  };

  const editorKey = `${selectedLocation?.id ?? "new"}-${selectedLocation?.lat ?? ""}-${selectedLocation?.lng ?? ""}-${isEditorOpen ? "open" : "closed"}`;

  const actions = (
    <Button
      onClick={() => setIsAdding(!isAdding)}
      aria-pressed={isAdding}
      variant={isAdding ? "secondary" : "default"}
      className="h-auto min-h-9 whitespace-normal text-left"
    >
      <Plus className="mr-2 size-4" />
      {isAdding ? "Click on Map to Drop Marker" : "Add Location"}
    </Button>
  );

  return (
    <PageShell
      title="Where We Work"
      description="Manage global ministry footprints and projects."
      density="compact"
      actions={actions}
    >
      <Tabs defaultValue="map" className="space-y-5">
        <div className="flex justify-start">
          <TabsList>
            <TabsTrigger value="map">
              <Layers className="mr-2 size-3.5" /> Map View
            </TabsTrigger>
            <TabsTrigger value="table">
              <TableIcon className="mr-2 size-3.5" /> Data Table
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="map" className="m-0">
          <Card className="relative h-150 overflow-hidden rounded-2xl border-border bg-muted shadow-sm">
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
                  onClick={() => handleEdit(loc)}
                >
                  <MarkerContent>
                    <div
                      className={`size-6 rounded-full border-4 border-background shadow-xl flex items-center justify-center transition-transform [@media(hover:hover)_and_(pointer:fine)]:hover:scale-110 ${
                        loc.type === "missionary"
                          ? "bg-primary"
                          : loc.type === "project"
                            ? "bg-info"
                            : "bg-muted-foreground"
                      }`}
                    >
                      <MapPin className="size-3 text-primary-foreground" />
                    </div>
                  </MarkerContent>
                </MapMarker>
              ))}
            </Map>

            {isAdding && (
              <div className="pointer-events-none absolute inset-x-4 top-4 z-20 flex justify-center">
                <div className="rounded-xl border border-warning/25 bg-background px-4 py-3 text-center text-sm font-medium text-warning shadow-sm">
                  Add Mode Active: Click anywhere on map
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="table" className="m-0">
          <Card className="rounded-2xl border-border shadow-sm">
            <div className="p-4">
              <LocationTable
                data={locations || []}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <LocationEditor
        key={editorKey}
        location={selectedLocation}
        isOpen={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        onDelete={handleDelete}
      />
    </PageShell>
  );
}

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
      className={`h-10 rounded-xl px-4 text-sm font-semibold shadow-sm transition-colors ${
        isAdding
          ? "bg-amber-500 hover:bg-amber-600 text-white animate-pulse"
          : "bg-zinc-900 text-white hover:bg-zinc-800"
      }`}
    >
      <Plus className="mr-2 h-4 w-4" />
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
          <TabsList className="h-10 rounded-xl border border-zinc-200 bg-zinc-100/60 p-1">
            <TabsTrigger
              value="map"
              className="rounded-lg px-4 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Layers className="mr-2 h-3.5 w-3.5" /> Map View
            </TabsTrigger>
            <TabsTrigger
              value="table"
              className="rounded-lg px-4 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <TableIcon className="mr-2 h-3.5 w-3.5" /> Data Table
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="map" className="m-0">
          <Card className="relative h-[600px] overflow-hidden rounded-2xl border-zinc-100 bg-zinc-50 shadow-sm">
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
                      className={`size-6 rounded-full border-4 border-white shadow-xl flex items-center justify-center transition-transform hover:scale-125 ${
                        loc.type === "missionary"
                          ? "bg-zinc-900"
                          : loc.type === "project"
                            ? "bg-blue-600"
                            : "bg-zinc-400"
                      }`}
                    >
                      <MapPin className="size-3 text-white" />
                    </div>
                  </MarkerContent>
                </MapMarker>
              ))}
            </Map>

            {isAdding && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <div className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-full shadow-2xl animate-bounce">
                  Add Mode Active: Click anywhere on map
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="table" className="m-0">
          <Card className="rounded-2xl border-zinc-100 shadow-sm">
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

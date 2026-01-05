"use client";

import React, { useState } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Table as TableIcon, Layers } from "lucide-react";
import { useLocations, useDeleteLocation, Location } from "@/features/mission-control/locations/hooks/use-locations";
import { LocationTable } from "@/features/mission-control/locations/components/LocationTable";
import { LocationEditor } from "@/features/mission-control/locations/components/LocationEditor";
import { Map, MapMarker, MarkerContent, MapControls } from "@/components/ui/map";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function LocationsPage() {
  const { data: locations, isLoading } = useLocations();
  const { mutate: deleteLocation } = useDeleteLocation();
  const [selectedLocation, setSelectedLocation] = useState<Partial<Location> | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleMapClick = (e: any) => {
    if (isAdding) {
      const { lng, lat } = e.lngLat;
      setSelectedLocation({ lat, lng, type: 'custom', status: 'draft' });
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

  const actions = (
    <Button 
      onClick={() => setIsAdding(!isAdding)}
      className={`h-14 px-8 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all shadow-2xl ${
        isAdding ? "bg-amber-500 hover:bg-amber-600 text-white animate-pulse" : "bg-zinc-900 text-white hover:bg-zinc-800"
      }`}
    >
      <Plus className="mr-3 h-4 w-4" /> 
      {isAdding ? "Click on Map to Drop Marker" : "Add Location"}
    </Button>
  );

  return (
    <PageShell
      badge="Strategic Map"
      title="Where We Work"
      description="Manage global ministry footprints and projects."
      actions={actions}
    >
      <Tabs defaultValue="map" className="space-y-8">
        <div className="flex justify-center">
          <TabsList className="bg-zinc-100/50 p-1.5 rounded-[1.5rem] h-auto border border-zinc-100">
            <TabsTrigger 
              value="map" 
              className="rounded-xl px-8 py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
            >
              <Layers className="mr-2 h-3.5 w-3.5" /> Map View
            </TabsTrigger>
            <TabsTrigger 
              value="table" 
              className="rounded-xl px-8 py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
            >
              <TableIcon className="mr-2 h-3.5 w-3.5" /> Data Table
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="map" className="m-0">
          <Card className="relative h-[600px] rounded-[2.5rem] overflow-hidden border-zinc-100 shadow-2xl shadow-zinc-100 bg-zinc-50">
            <Map
              initialViewState={{
                longitude: 0,
                latitude: 20,
                zoom: 1.5
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
                    <div className={`size-6 rounded-full border-4 border-white shadow-xl flex items-center justify-center transition-transform hover:scale-125 ${
                      loc.type === 'missionary' ? 'bg-zinc-900' : loc.type === 'project' ? 'bg-blue-600' : 'bg-zinc-400'
                    }`}>
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
          <Card className="rounded-[2.5rem] overflow-hidden border-zinc-100 shadow-2xl shadow-zinc-100">
            <div className="p-8">
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
        location={selectedLocation}
        isOpen={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        onDelete={handleDelete}
      />
    </PageShell>
  );
}

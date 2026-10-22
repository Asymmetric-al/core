import { NuqsAdapter } from "nuqs/adapters/react";
import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import {
  Map,
  MapControls,
  MapMarker,
  MapStyleToggle,
  MarkerContent,
  useMap,
} from "../../../packages/ui/components/primitives/map";
import { MotionPreset } from "../../../packages/ui/components/primitives/motion-preset";
import { Button } from "../../../packages/ui/components/shadcn/button";
import { useDataTableUrlState } from "../../../packages/ui/components/shadcn/data-table/hooks/use-data-table-url-state";
import { Input } from "../../../packages/ui/components/shadcn/input";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../../packages/ui/components/shadcn/resizable";
import { ThemeProvider } from "../../../packages/ui/lib/theme-provider";
import { cn } from "../../../packages/ui/lib/utils";
import "virtual:base-ui-styles";

const mapStyles = {
  light: "/ui-map-light.json",
  dark: "/ui-map-dark.json",
};
const initialMapView = { longitude: 0, latitude: 20, zoom: 2 };

function MapObservation() {
  const { map, isLoaded } = useMap();
  const [view, setView] = useState({
    zoom: 0,
    style: "",
    features: 0,
    circleColor: "",
  });
  useEffect(() => {
    if (!map || !isLoaded) return;
    const update = () => {
      if (!map.isStyleLoaded()) return;
      setView({
        zoom: map.getZoom(),
        style: map.getStyle().name ?? "",
        circleColor: String(
          map.getPaintProperty("offline-points", "circle-color") ?? "",
        ),
        features: map.queryRenderedFeatures({ layers: ["offline-points"] })
          .length,
      });
    };
    map.on("idle", update);
    update();
    return () => {
      map.off("idle", update);
    };
  }, [map, isLoaded]);
  return (
    <output aria-label="Map observation" className="sr-only">
      {JSON.stringify(view)}
    </output>
  );
}

function UrlState() {
  const state = useDataTableUrlState({ history: "push" });
  return (
    <section aria-label="Partner URL state" className="space-y-3">
      <h2>Partner filters</h2>
      <label htmlFor="partner-search">Search partners</label>
      <Input
        id="partner-search"
        value={state.globalFilter}
        onChange={(event) => state.setGlobalFilter(event.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => state.setPagination({ pageIndex: 2, pageSize: 25 })}
        >
          Next page
        </Button>
        <Button onClick={() => state.setSorting([{ id: "name", desc: true }])}>
          Sort descending
        </Button>
        <Button onClick={() => state.setColumnVisibility({ email: false })}>
          Hide email
        </Button>
        <Button onClick={state.resetUrlState}>Reset filters</Button>
      </div>
      <output aria-label="Partner filter state">
        {JSON.stringify({
          search: state.globalFilter,
          page: state.pagination,
          sort: state.sorting,
          visibility: state.columnVisibility,
        })}
      </output>
    </section>
  );
}

function App() {
  const [showMotion, setShowMotion] = useState(false);
  return (
    <main className="space-y-6 p-4">
      <h1>Shared UI upgrade contracts</h1>
      <section aria-label="Offline ministry map" className="space-y-3">
        <h2 className="flex items-center gap-2">Ministry locations</h2>
        <Map styles={mapStyles} initialViewState={initialMapView}>
          <MapObservation />
          <MapControls showGeolocate={false} showFullscreen={false} />
          <MapStyleToggle position="top-right" />
          <MapMarker longitude={0} latitude={20}>
            <MarkerContent>
              <Button size="sm">Sample ministry</Button>
            </MarkerContent>
          </MapMarker>
        </Map>
      </section>
      <section aria-label="Resizable workspace" className="space-y-3">
        <h2>Workspace panels</h2>
        <ResizablePanelGroup className="h-48" orientation="horizontal">
          <ResizablePanel
            id="partner-list"
            defaultSize="50%"
            minSize="20%"
            maxSize="80%"
          >
            <div className="bg-card h-full p-3">Primary panel</div>
          </ResizablePanel>
          <ResizableHandle aria-label="Resize workspace" withHandle />
          <ResizablePanel id="partner-details" minSize="20%" defaultSize="50%">
            <div className="bg-muted h-full p-3">Secondary panel</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </section>
      <UrlState />
      <section aria-label="Shared transition" className="space-y-3">
        <h2>Reduced motion</h2>
        <Button onClick={() => setShowMotion((value) => !value)}>
          Toggle content
        </Button>
        {showMotion && (
          <MotionPreset
            inView={false}
            fade
            slide={{ direction: "up", offset: 12 }}
            className="motion-qualification"
          >
            Preserved transition content
          </MotionPreset>
        )}
      </section>
      <div
        aria-label="Merged background"
        className={cn(
          "bg-linear-to-r from-primary to-secondary",
          "bg-transparent",
        )}
      >
        Shared semantic gradient
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    disableTransitionOnChange
  >
    <NuqsAdapter>
      <App />
    </NuqsAdapter>
  </ThemeProvider>,
);

"use client";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { cn } from "@asym/ui/lib/utils";
import { useTheme } from "next-themes";
import {
  createContext,
  type MutableRefObject,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

type MapContextValue = {
  map: maplibregl.Map | null;
  isLoaded: boolean;
};

const MapContext = createContext<MapContextValue | null>(null);

export function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a Map component");
  }
  return context;
}

const STYLES = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
};

type InitialViewState = {
  longitude: number;
  latitude: number;
  zoom: number;
};

type MapProps = {
  children?: ReactNode;
  styles?: {
    light?: string;
    dark?: string;
  };
  center?: [number, number];
  zoom?: number;
  initialViewState?: InitialViewState;
  className?: string;
  onLoad?: (map: maplibregl.Map) => void;
  onClick?: (e: maplibregl.MapMouseEvent) => void;
};

function Loader() {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-50/80 backdrop-blur-md dark:bg-zinc-900/80">
      <div className="relative mb-4 flex items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
        <div className="relative size-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>
      <div className="flex items-center gap-1.5">
        <span className="font-medium text-sm text-zinc-600 dark:text-zinc-400">
          Loading Map
        </span>
        <div className="flex gap-1">
          <span className="size-1 animate-bounce rounded-full bg-primary" />
          <span className="size-1 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
          <span className="size-1 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

export function Map({
  children,
  styles,
  center,
  zoom,
  initialViewState,
  className,
  onLoad,
  onClick,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const hasInitializedRef = useRef(false);
  const onLoadRef = useRef(onLoad);
  const onClickRef = useRef(onClick);
  const [mapState, setMapState] = useState<MapContextValue>({
    map: null,
    isLoaded: false,
  });
  const { resolvedTheme } = useTheme();

  const lightStyle = styles?.light ?? STYLES.light;
  const darkStyle = styles?.dark ?? STYLES.dark;
  const mapLoaded = mapState.isLoaded;

  const markMapReady = useCallback(() => {
    setMapState((previous) => {
      const currentMap = mapInstanceRef.current;
      if (previous.isLoaded && previous.map === currentMap) {
        return previous;
      }
      return {
        map: currentMap,
        isLoaded: true,
      };
    });
  }, []);

  const resetMapState = useCallback(() => {
    setMapState({ map: null, isLoaded: false });
  }, []);

  useEffect(() => {
    onLoadRef.current = onLoad;
  }, [onLoad]);

  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  useEffect(() => {
    if (hasInitializedRef.current || !containerRef.current) {
      return;
    }
    const currentTheme = resolvedTheme === "dark" ? "dark" : "light";
    const initialStyle = currentTheme === "dark" ? darkStyle : lightStyle;
    const initialCenter: [number, number] = initialViewState
      ? [initialViewState.longitude, initialViewState.latitude]
      : (center ?? [0, 20]);
    const initialZoom = initialViewState?.zoom ?? zoom ?? 2;

    try {
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: initialStyle,
        center: initialCenter,
        zoom: initialZoom,
        attributionControl: false,
      });

      mapInstanceRef.current = map;
      hasInitializedRef.current = true;

      const onMapLoad = () => {
        if (!mapInstanceRef.current) {
          return;
        }
        markMapReady();
        onLoadRef.current?.(map);
      };

      if (map.loaded()) {
        onMapLoad();
      } else {
        map.on("load", onMapLoad);
      }

      map.on("error", (e) => {
        console.error("MapLibre error:", e);
        markMapReady();
      });

      map.on("click", (e) => onClickRef.current?.(e));
    } catch (error) {
      console.error("Failed to initialize map:", error);
      markMapReady();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      hasInitializedRef.current = false;
      resetMapState();
    };
  }, [
    center,
    darkStyle,
    initialViewState,
    lightStyle,
    markMapReady,
    resetMapState,
    resolvedTheme,
    zoom,
  ]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!(map && mapLoaded)) {
      return;
    }

    const currentTheme = resolvedTheme === "dark" ? "dark" : "light";
    const targetStyle = currentTheme === "dark" ? darkStyle : lightStyle;

    const currentStyleName = map.getStyle()?.name?.toLowerCase() ?? "";
    const isCurrentlyDark = currentStyleName.includes("dark");
    const shouldBeDark = currentTheme === "dark";

    if (isCurrentlyDark !== shouldBeDark) {
      map.setStyle(targetStyle);
    }
  }, [resolvedTheme, darkStyle, lightStyle, mapLoaded]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!(map && mapLoaded)) {
      return;
    }
    if (center && zoom !== undefined) {
      map.flyTo({ center, zoom, duration: 1500 });
    }
  }, [center, zoom, mapLoaded]);

  return (
    <MapContext.Provider value={mapState}>
      <div
        className={cn(
          "relative h-full min-h-[400px] w-full bg-zinc-100 dark:bg-zinc-900",
          className
        )}
        ref={containerRef}
      >
        {!mapLoaded && <Loader />}
        {mapLoaded && children}
      </div>
    </MapContext.Provider>
  );
}

type MarkerContextValue = {
  markerRef: MutableRefObject<maplibregl.Marker | null>;
  element: HTMLDivElement | null;
};

const MarkerContext = createContext<MarkerContextValue | null>(null);

function useMarkerContext() {
  const ctx = useContext(MarkerContext);
  if (!ctx) {
    throw new Error("Must be used within MapMarker");
  }
  return ctx;
}

type MapMarkerProps = {
  longitude: number;
  latitude: number;
  children: ReactNode;
  onClick?: () => void;
  draggable?: boolean;
};

export function MapMarker({
  longitude,
  latitude,
  children,
  onClick,
  draggable = false,
}: MapMarkerProps) {
  const { map, isLoaded } = useMap();
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const initialLngLatRef = useRef<[number, number]>([longitude, latitude]);
  const onClickRef = useRef(onClick);
  const markerElement = useMemo<HTMLDivElement | null>(() => {
    if (typeof document === "undefined") {
      return null;
    }

    const element = document.createElement("div");
    element.className = "map-marker-container";
    return element;
  }, []);

  useEffect(() => {
    onClickRef.current = onClick;
    if (markerElement) {
      markerElement.style.cursor = onClick ? "pointer" : "";
    }
  }, [markerElement, onClick]);

  useLayoutEffect(() => {
    if (!(isLoaded && map && markerElement)) {
      return;
    }

    const handleMarkerClick = (event: MouseEvent) => {
      event.stopPropagation();
      onClickRef.current?.();
    };

    markerElement.addEventListener("click", handleMarkerClick);

    const marker = new maplibregl.Marker({
      element: markerElement,
      draggable,
    })
      .setLngLat(initialLngLatRef.current)
      .addTo(map);

    markerRef.current = marker;

    return () => {
      markerElement.removeEventListener("click", handleMarkerClick);
      marker.remove();
      if (markerRef.current === marker) {
        markerRef.current = null;
      }
    };
  }, [draggable, isLoaded, map, markerElement]);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) {
      return;
    }
    marker.setLngLat([longitude, latitude]);
  }, [longitude, latitude]);

  const markerContext = useMemo<MarkerContextValue>(
    () => ({
      markerRef,
      element: markerElement,
    }),
    [markerElement]
  );

  return (
    <MarkerContext.Provider value={markerContext}>
      {children}
    </MarkerContext.Provider>
  );
}

export function MarkerContent({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  const { element } = useMarkerContext();
  if (!element) {
    return null;
  }
  return createPortal(
    <div
      className={cn(
        "relative transition-transform duration-200 hover:scale-110",
        className
      )}
    >
      {children ?? (
        <div className="size-6 rounded-full border-4 border-white bg-primary shadow-xl ring-2 ring-primary/20" />
      )}
    </div>,
    element
  );
}

export function MarkerPopup({
  children,
  className,
  offset = 20,
}: {
  children: ReactNode;
  className?: string;
  offset?: number;
}) {
  const { markerRef } = useMarkerContext();
  const container = useMemo<HTMLDivElement | null>(() => {
    if (typeof document === "undefined") {
      return null;
    }
    return document.createElement("div");
  }, []);

  useEffect(() => {
    const marker = markerRef.current;
    if (!(marker && container)) {
      return;
    }

    const popup = new maplibregl.Popup({
      offset,
      closeButton: false,
      className: "custom-maplibre-popup",
    })
      .setMaxWidth("none")
      .setDOMContent(container);

    marker.setPopup(popup);

    return () => {
      popup.remove();
    };
  }, [container, markerRef, offset]);

  if (!container) {
    return null;
  }
  return createPortal(
    <div
      className={cn(
        "relative rounded-2xl border border-zinc-200/50 bg-white p-0 text-zinc-900 shadow-2xl dark:bg-zinc-900 dark:text-zinc-50",
        className
      )}
    >
      {children}
    </div>,
    container
  );
}

export function MapOverlay({
  children,
  className,
  position = "top-left",
}: {
  children: ReactNode;
  className?: string;
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "center";
}) {
  const positions = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  };

  return (
    <div className={cn("absolute z-10", positions[position], className)}>
      {children}
    </div>
  );
}

function ZoomInIcon() {
  return (
    <svg
      className="text-zinc-600 dark:text-zinc-400"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="18"
    >
      <line x1="12" x2="12" y1="5" y2="19" />
      <line x1="5" x2="19" y1="12" y2="12" />
    </svg>
  );
}

function ZoomOutIcon() {
  return (
    <svg
      className="text-zinc-600 dark:text-zinc-400"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="18"
    >
      <line x1="5" x2="19" y1="12" y2="12" />
    </svg>
  );
}

function LocateIcon() {
  return (
    <svg
      className="text-zinc-600 dark:text-zinc-400"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="18"
    >
      <line x1="2" x2="5" y1="12" y2="12" />
      <line x1="19" x2="22" y1="12" y2="12" />
      <line x1="12" x2="12" y1="2" y2="5" />
      <line x1="12" x2="12" y1="19" y2="22" />
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function MaximizeIcon() {
  return (
    <svg
      className="text-zinc-600 dark:text-zinc-400"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="18"
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      className="text-zinc-400"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="18"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      className="text-zinc-600"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="18"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

export function MapControls({
  position = "bottom-right",
  showZoom = true,
  showGeolocate = true,
  showFullscreen = true,
  className,
}: {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  showZoom?: boolean;
  showGeolocate?: boolean;
  showFullscreen?: boolean;
  className?: string;
}) {
  const { map, isLoaded } = useMap();

  const handleZoomIn = useCallback(() => map?.zoomIn(), [map]);
  const handleZoomOut = useCallback(() => map?.zoomOut(), [map]);
  const handleGeolocate = useCallback(() => {
    if (!(navigator.geolocation && map)) {
      return;
    }
    navigator.geolocation.getCurrentPosition((pos) => {
      map.flyTo({
        center: [pos.coords.longitude, pos.coords.latitude],
        zoom: 14,
      });
    });
  }, [map]);
  const handleFullscreen = useCallback(() => {
    const el = map?.getContainer();
    if (!el) {
      return;
    }
    if (document.fullscreenElement) {
      document.exitFullscreen();
      return;
    }

    el.requestFullscreen();
  }, [map]);

  if (!isLoaded) {
    return null;
  }

  return (
    <MapOverlay
      className={cn("flex flex-col gap-2", className)}
      position={position}
    >
      <div className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/90 shadow-lg ring-1 ring-black/5 backdrop-blur-xl dark:bg-zinc-900/90">
        {showZoom && (
          <>
            <button
              className="border-zinc-100 border-b p-2.5 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800"
              onClick={handleZoomIn}
              title="Zoom In"
            >
              <ZoomInIcon />
            </button>
            <button
              className="border-zinc-100 border-b p-2.5 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800"
              onClick={handleZoomOut}
              title="Zoom Out"
            >
              <ZoomOutIcon />
            </button>
          </>
        )}
        {showGeolocate && (
          <button
            className="border-zinc-100 border-b p-2.5 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-800"
            onClick={handleGeolocate}
            title="Find My Location"
          >
            <LocateIcon />
          </button>
        )}
        {showFullscreen && (
          <button
            className="p-2.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            onClick={handleFullscreen}
            title="Toggle Fullscreen"
          >
            <MaximizeIcon />
          </button>
        )}
      </div>
    </MapOverlay>
  );
}

export function MapStyleToggle({
  position = "bottom-right",
  className,
}: {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const { isLoaded } = useMap();

  if (!isLoaded) {
    return null;
  }

  return (
    <MapOverlay className={cn(className)} position={position}>
      <button
        className="flex size-10 items-center justify-center rounded-2xl border border-zinc-200/80 bg-white/90 shadow-lg ring-1 ring-black/5 backdrop-blur-xl transition-all hover:bg-zinc-50 dark:bg-zinc-900/90 dark:hover:bg-zinc-800"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      >
        {resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>
    </MapOverlay>
  );
}

export function MapLegend({
  children,
  className,
  title = "Legend",
  position = "bottom-left",
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
  const { isLoaded } = useMap();
  if (!isLoaded) {
    return null;
  }

  return (
    <MapOverlay
      className={cn("hidden lg:block", className)}
      position={position}
    >
      <div className="min-w-[160px] rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-xl ring-1 ring-black/5 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/90">
        <p className="mb-3 font-bold text-[10px] text-zinc-400 uppercase tracking-wider dark:text-zinc-500">
          {title}
        </p>
        <div className="space-y-2.5">{children}</div>
      </div>
    </MapOverlay>
  );
}

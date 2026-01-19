"use client";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTheme } from "next-themes";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

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
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-md z-50">
      <div className="relative flex items-center justify-center mb-4">
        <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
        <div className="relative size-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
      <div className="flex gap-1.5 items-center">
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Loading Map
        </span>
        <div className="flex gap-1">
          <span className="size-1 rounded-full bg-primary animate-bounce" />
          <span className="size-1 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
          <span className="size-1 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
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
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);
  const { resolvedTheme } = useTheme();

  const lightStyle = styles?.light ?? STYLES.light;
  const darkStyle = styles?.dark ?? STYLES.dark;

  useEffect(() => {
    if (hasInitializedRef.current || !containerRef.current) return;

    const currentTheme = resolvedTheme === "dark" ? "dark" : "light";
    const styleUrl = currentTheme === "dark" ? darkStyle : lightStyle;

    const mapCenter: [number, number] = initialViewState
      ? [initialViewState.longitude, initialViewState.latitude]
      : (center ?? [0, 20]);
    const mapZoom = initialViewState?.zoom ?? zoom ?? 2;

    try {
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: styleUrl,
        center: mapCenter,
        zoom: mapZoom,
        attributionControl: false,
      });

      mapInstanceRef.current = map;
      hasInitializedRef.current = true;

      const onMapLoad = () => {
        if (!mapInstanceRef.current) return;
        setMapInstance(mapInstanceRef.current);
        setMapLoaded(true);
        onLoad?.(map);
      };

      if (map.loaded()) {
        onMapLoad();
      } else {
        map.on("load", onMapLoad);
      }

      map.on("error", (e) => {
        console.error("MapLibre error:", e);
        setMapLoaded(true);
      });

      if (onClick) {
        map.on("click", onClick);
      }
    } catch (error) {
      console.error("Failed to initialize map:", error);
      setMapLoaded(true);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      hasInitializedRef.current = false;
      setMapLoaded(false);
      setMapInstance(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

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
    if (!map || !mapLoaded) return;
    if (center && zoom !== undefined) {
      map.flyTo({ center, zoom, duration: 1500 });
    }
  }, [center, zoom, mapLoaded]);

  const contextValue = useMemo(
    () => ({ map: mapInstance, isLoaded: mapLoaded }),
    [mapInstance, mapLoaded],
  );

  return (
    <MapContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={cn(
          "relative w-full h-full min-h-[400px] bg-zinc-100 dark:bg-zinc-900",
          className,
        )}
      >
        {!mapLoaded && <Loader />}
        {mapLoaded && children}
      </div>
    </MapContext.Provider>
  );
}

type MarkerContextValue = {
  marker: maplibregl.Marker | null;
  element: HTMLDivElement | null;
};

const MarkerContext = createContext<MarkerContextValue | null>(null);

function useMarkerContext() {
  const ctx = useContext(MarkerContext);
  if (!ctx) throw new Error("Must be used within MapMarker");
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
  const [marker, setMarker] = useState<maplibregl.Marker | null>(null);
  const [element, setElement] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isLoaded || !map) return;

    const el = document.createElement("div");
    el.className = "map-marker-container";
    if (onClick) {
      el.style.cursor = "pointer";
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onClick();
      });
    }

    const m = new maplibregl.Marker({ element: el, draggable })
      .setLngLat([longitude, latitude])
      .addTo(map);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMarker(m);
    setElement(el);

    return () => {
      m.remove();
      setMarker(null);
      setElement(null);
    };
  }, [map, isLoaded, longitude, latitude, draggable, onClick]);

  useEffect(() => {
    marker?.setLngLat([longitude, latitude]);
  }, [marker, longitude, latitude]);

  return (
    <MarkerContext.Provider value={{ marker, element }}>
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
  if (!element) return null;
  return createPortal(
    <div
      className={cn(
        "relative transition-transform duration-200 hover:scale-110",
        className,
      )}
    >
      {children ?? (
        <div className="size-6 rounded-full border-4 border-white bg-primary shadow-xl ring-2 ring-primary/20" />
      )}
    </div>,
    element,
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
  const { marker } = useMarkerContext();
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!marker) return;

    const el = document.createElement("div");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContainer(el);

    const popup = new maplibregl.Popup({
      offset,
      closeButton: false,
      className: "custom-maplibre-popup",
    })
      .setMaxWidth("none")
      .setDOMContent(el);

    marker.setPopup(popup);

    return () => {
      popup.remove();
      setContainer(null);
    };
  }, [marker, offset]);

  if (!container) return null;
  return createPortal(
    <div
      className={cn(
        "relative rounded-2xl border border-zinc-200/50 bg-white dark:bg-zinc-900 p-0 text-zinc-900 dark:text-zinc-50 shadow-2xl",
        className,
      )}
    >
      {children}
    </div>,
    container,
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
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-zinc-600 dark:text-zinc-400"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ZoomOutIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-zinc-600 dark:text-zinc-400"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function LocateIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-zinc-600 dark:text-zinc-400"
    >
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function MaximizeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-zinc-600 dark:text-zinc-400"
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
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-zinc-400"
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
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-zinc-600"
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
    if (!navigator.geolocation || !map) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      map.flyTo({
        center: [pos.coords.longitude, pos.coords.latitude],
        zoom: 14,
      });
    });
  }, [map]);
  const handleFullscreen = useCallback(() => {
    const el = map?.getContainer();
    if (!el) return;
    document.fullscreenElement
      ? document.exitFullscreen()
      : el.requestFullscreen();
  }, [map]);

  if (!isLoaded) return null;

  return (
    <MapOverlay
      position={position}
      className={cn("flex flex-col gap-2", className)}
    >
      <div className="flex flex-col rounded-2xl border border-zinc-200/80 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-lg overflow-hidden ring-1 ring-black/5">
        {showZoom && (
          <>
            <button
              onClick={handleZoomIn}
              className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border-b border-zinc-100 dark:border-zinc-800"
              title="Zoom In"
            >
              <ZoomInIcon />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border-b border-zinc-100 dark:border-zinc-800"
              title="Zoom Out"
            >
              <ZoomOutIcon />
            </button>
          </>
        )}
        {showGeolocate && (
          <button
            onClick={handleGeolocate}
            className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border-b border-zinc-100 dark:border-zinc-800"
            title="Find My Location"
          >
            <LocateIcon />
          </button>
        )}
        {showFullscreen && (
          <button
            onClick={handleFullscreen}
            className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
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

  if (!isLoaded) return null;

  return (
    <MapOverlay position={position} className={cn(className)}>
      <button
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className="size-10 flex items-center justify-center rounded-2xl border border-zinc-200/80 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all ring-1 ring-black/5"
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
  if (!isLoaded) return null;

  return (
    <MapOverlay
      position={position}
      className={cn("hidden lg:block", className)}
    >
      <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xl p-4 min-w-[160px] ring-1 ring-black/5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3">
          {title}
        </p>
        <div className="space-y-2.5">{children}</div>
      </div>
    </MapOverlay>
  );
}

// @vitest-environment jsdom

import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mapMocks = vi.hoisted(() => {
  const Map = vi.fn(function MapConstructor() {
    return {
      loaded: () => true,
      on: vi.fn(),
      off: vi.fn(),
      remove: vi.fn(),
      getStyle: () => ({ name: "positron" }),
      setStyle: vi.fn(),
      flyTo: vi.fn(),
    };
  });
  const Marker = vi.fn(function MarkerConstructor(options: {
    element: HTMLElement;
  }) {
    const marker = {
      setLngLat: () => marker,
      addTo: () => {
        document.body.appendChild(options.element);
        return marker;
      },
      remove: () => options.element.remove(),
    };
    return marker;
  });
  return {
    Map,
    Marker,
    Popup: vi.fn(),
    getWorkerUrl: vi.fn(() => "worker.js"),
    setWorkerUrl: vi.fn(),
  };
});

vi.mock("maplibre-gl", () => ({
  GPUInitializationError: class extends Error {},
  Map: mapMocks.Map,
  Marker: mapMocks.Marker,
  Popup: mapMocks.Popup,
  getWorkerUrl: mapMocks.getWorkerUrl,
  setWorkerUrl: mapMocks.setWorkerUrl,
}));

vi.mock("maplibre-gl/dist/maplibre-gl.css", () => ({}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", setTheme: vi.fn() }),
}));

import {
  Map,
  MapMarker,
  MarkerContent,
} from "../../../../../../packages/ui/components/primitives/map";

afterEach(cleanup);

async function markerElement() {
  let element: HTMLElement | null = null;
  await waitFor(() => {
    element = document.querySelector<HTMLElement>(".map-marker-container");
    expect(element).not.toBeNull();
  });
  return element as unknown as HTMLElement;
}

describe("MapMarker keyboard support", () => {
  it("makes a labelled, clickable marker a focusable button that Enter and Space activate", async () => {
    const onClick = vi.fn();
    render(
      <Map>
        <MapMarker
          longitude={1}
          latitude={2}
          label="Edit Lima clinic"
          onClick={onClick}
        >
          <MarkerContent />
        </MapMarker>
      </Map>,
    );

    const marker = await markerElement();
    expect(marker.getAttribute("role")).toBe("button");
    expect(marker.getAttribute("tabindex")).toBe("0");
    expect(marker.getAttribute("aria-label")).toBe("Edit Lima clinic");

    fireEvent.keyDown(marker, { key: "Enter" });
    fireEvent.keyDown(marker, { key: " " });
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("leaves a marker without a click handler out of the tab order", async () => {
    render(
      <Map>
        <MapMarker longitude={1} latitude={2} label="Lima clinic">
          <MarkerContent />
        </MapMarker>
      </Map>,
    );

    const marker = await markerElement();
    expect(marker.getAttribute("role")).toBeNull();
    expect(marker.getAttribute("tabindex")).toBeNull();
  });
});

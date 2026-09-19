// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mapMocks = vi.hoisted(() => {
  class GPUInitializationError extends Error {
    constructor(message = "Failed to initialize WebGL") {
      super(message);
      this.name = "GPUInitializationError";
    }
  }

  const Map = vi.fn(function MapConstructor() {
    throw new GPUInitializationError(
      "Failed to initialize WebGL: check that WebGL2 is supported",
    );
  });

  return {
    GPUInitializationError,
    Map,
    Marker: vi.fn(),
    Popup: vi.fn(),
    getWorkerUrl: vi.fn(() => ""),
    setWorkerUrl: vi.fn(),
  };
});

vi.mock("maplibre-gl", () => ({
  GPUInitializationError: mapMocks.GPUInitializationError,
  Map: mapMocks.Map,
  Marker: mapMocks.Marker,
  Popup: mapMocks.Popup,
  getWorkerUrl: mapMocks.getWorkerUrl,
  setWorkerUrl: mapMocks.setWorkerUrl,
}));

vi.mock("maplibre-gl/dist/maplibre-gl.css", () => ({}));

vi.mock("next-themes", () => ({
  useTheme: () => ({
    resolvedTheme: "light",
    setTheme: vi.fn(),
  }),
}));

import {
  Map,
  MapControls,
  MapLegend,
  MapStyleToggle,
} from "../../../../../../packages/ui/components/primitives/map";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

beforeEach(() => {
  mapMocks.Map.mockClear();
  mapMocks.setWorkerUrl.mockClear();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

function renderFailedMap() {
  return render(
    <Map>
      <p>map children</p>
      <MapControls />
      <MapStyleToggle />
      <MapLegend title="Legend">
        <span>Global Workers</span>
      </MapLegend>
    </Map>,
  );
}

describe("Map GPU initialization failure", () => {
  it("surfaces constructor GPUInitializationError instead of a loaded empty map", async () => {
    renderFailedMap();

    expect(mapMocks.Map).toHaveBeenCalled();
    expect(mapMocks.Map.mock.results[0]?.type).toBe("throw");
    expect(mapMocks.Map.mock.results[0]?.value).toBeInstanceOf(
      mapMocks.GPUInitializationError,
    );

    const fallback = await screen.findByRole("alert");
    expect(fallback.textContent).toMatch(/unable to initialize the map/i);
    expect(fallback.textContent).toMatch(/webgl2/i);

    await waitFor(() => {
      expect(screen.queryByText("Loading Map")).toBeNull();
    });
    expect(screen.queryByText("map children")).toBeNull();
  });

  it("does not mount inert map-only controls when the map is absent", async () => {
    renderFailedMap();

    await screen.findByRole("alert");

    expect(screen.queryByRole("button", { name: "Zoom In" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Zoom Out" })).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Find My Location" }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Toggle Fullscreen" }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Toggle map theme" }),
    ).toBeNull();
    expect(screen.queryByText("Legend")).toBeNull();
    expect(screen.queryByText("Global Workers")).toBeNull();
  });
});

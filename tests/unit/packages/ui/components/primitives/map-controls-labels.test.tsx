// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
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
      zoomIn: vi.fn(),
      zoomOut: vi.fn(),
    };
  });
  return {
    Map,
    Marker: vi.fn(),
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
  MapControls,
} from "../../../../../../packages/ui/components/primitives/map";

afterEach(cleanup);

describe("MapControls labels", () => {
  it("names each control in sentence case and hides its decorative icon", async () => {
    render(
      <Map>
        <MapControls />
      </Map>,
    );

    for (const name of [
      "Zoom in",
      "Zoom out",
      "Find my location",
      "Toggle full screen",
    ]) {
      const button = await screen.findByRole("button", { name, exact: true });
      // The accessible name comes from aria-label, not only a hover title.
      expect(button.getAttribute("aria-label")).toBe(name);
      expect(button.getAttribute("title")).toBe(name);
      const icon = button.querySelector("svg");
      expect(icon?.getAttribute("aria-hidden")).toBe("true");
    }
  });
});

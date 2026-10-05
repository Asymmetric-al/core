import type { ReactNode } from "react";

function Container({ children }: { children?: ReactNode }) {
  return <div>{children}</div>;
}
export const Map = Container;
export const MapMarker = Container;
export const MarkerContent = Container;
export const MapLegend = Container;
export function MapControls() {
  return null;
}
export function MapStyleToggle() {
  return null;
}

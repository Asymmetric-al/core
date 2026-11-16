/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import {
  EveSectionEmpty,
  useEveSectionReady,
} from "../../../../apps/admin/app/(app)/admin/eve/section-states";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.history.replaceState(null, "", "/");
});

it("announces a successful empty result in the shared Empty composition", () => {
  render(
    <EveSectionEmpty
      title="No records."
      description="New records appear here."
    />,
  );
  expect(screen.getByRole("status").textContent).toContain("No records.");
});

it("resolves the requested hash again once its data is ready", () => {
  window.history.replaceState(null, "", "/admin/eve#eve-audit");
  const target = document.createElement("section");
  target.id = "eve-audit";
  target.scrollIntoView = vi.fn();
  document.body.append(target);
  const frame = vi.fn();
  vi.stubGlobal("requestAnimationFrame", frame);
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  const sections = [
    { id: "eve-audit", title: "Audit", description: "Audit records" },
  ];
  const { rerender } = renderHook(
    ({ ready }) => useEveSectionReady(ready, sections),
    { initialProps: { ready: false } },
  );
  expect(frame).not.toHaveBeenCalled();
  rerender({ ready: true });
  act(() => frame.mock.calls[0]![0]());
  expect(target.scrollIntoView).toHaveBeenCalledWith({ block: "start" });
  target.remove();
});

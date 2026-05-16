// @vitest-environment jsdom

import { act } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useResponsive } from "../../../../packages/lib/hooks/use-mobile";
import { BREAKPOINTS } from "../../../../packages/lib/responsive";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

function ResponsiveProbe() {
  const state = useResponsive();

  return <output>{JSON.stringify(state)}</output>;
}

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
    writable: true,
  });
}

describe("useResponsive", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("hydrates from the deterministic server fallback before reading the browser width", async () => {
    const originalWindow = window;
    vi.stubGlobal("window", undefined);
    const serverHtml = renderToString(<ResponsiveProbe />);

    vi.stubGlobal("window", originalWindow);
    setViewportWidth(375);

    const container = document.createElement("div");
    container.innerHTML = serverHtml;
    expect(JSON.parse(container.textContent ?? "")).toEqual({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      breakpoint: "lg",
      width: BREAKPOINTS.lg,
    });

    const recoverableErrors: unknown[] = [];
    let root: Root | undefined;

    await act(async () => {
      root = hydrateRoot(container, <ResponsiveProbe />, {
        onRecoverableError(error) {
          recoverableErrors.push(error);
        },
      });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(recoverableErrors).toEqual([]);
    expect(JSON.parse(container.textContent ?? "")).toEqual({
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      breakpoint: "xs",
      width: 375,
    });

    await act(async () => {
      root?.unmount();
    });
  });
});

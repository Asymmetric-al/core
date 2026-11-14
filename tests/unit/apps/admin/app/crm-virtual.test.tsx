/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  crmVirtualAllowance,
  getCrmVirtualHeight,
  useCrmVirtualAllowance,
} from "../../../../../apps/admin/app/(app)/crm/crm-virtual";

/**
 * The CRM virtual list fills the window below its own top, so a page with
 * summary cards or a footer scrolls inside the list, not around it as well.
 */
describe("CRM virtual list height", () => {
  it("fits the space a page measured, capped at the rows' own height", () => {
    expect(getCrmVirtualHeight(100, 52, { allowance: 412 })).toBe(
      "min(max(16rem, calc(100dvh - 412px)), 5288px)",
    );
  });

  it("keeps a share of the window for rows when a page asks for it", () => {
    // Relationships at 1024x900: summary cards, a two-row toolbar and a
    // footer left the list at the 16rem floor, about five rows (round 9r).
    // The page then scrolls a little, instead of the list being a slot.
    expect(
      getCrmVirtualHeight(100, 52, { allowance: 700, minViewportShare: 0.6 }),
    ).toBe("min(max(16rem, 60dvh, calc(100dvh - 700px)), 5288px)");
  });

  it("falls back to a fixed allowance before the page is measured", () => {
    expect(getCrmVirtualHeight(100, 52)).toBe(
      "min(max(16rem, calc(100dvh - 20rem)), 5288px)",
    );
    expect(getCrmVirtualHeight(100, 52, { allowance: null })).toBe(
      "min(max(16rem, calc(100dvh - 20rem)), 5288px)",
    );
  });

  it("leaves the end-of-list row out of a list without one", () => {
    expect(getCrmVirtualHeight(2, 52, { statusRow: false })).toBe(
      "min(max(16rem, calc(100dvh - 20rem)), 144px)",
    );
  });

  it("allows for everything above the list body and the panel chrome below it", () => {
    expect(
      crmVirtualAllowance({
        panelTop: 420,
        panelHeight: 900,
        bodyHeight: 700,
        bottomGap: 28,
      }),
    ).toBe(648);
  });
});

describe("useCrmVirtualAllowance", () => {
  const getBoundingClientRect = Element.prototype.getBoundingClientRect;

  beforeEach(() => {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    Element.prototype.getBoundingClientRect = function (this: Element) {
      const rect = getBoundingClientRect.call(this);
      if (this.getAttribute("data-testid") === "panel") {
        return { ...rect, top: 400, height: 900 };
      }
      if (this.getAttribute("data-slot") === "data-grid-table-viewport") {
        return { ...rect, top: 520, height: 700 };
      }
      return rect;
    };
  });

  afterEach(() => {
    Element.prototype.getBoundingClientRect = getBoundingClientRect;
    cleanup();
    vi.restoreAllMocks();
  });

  function Probe({ withBody = true }: { withBody?: boolean }) {
    const panelRef = useRef<HTMLDivElement | null>(null);
    const allowance = useCrmVirtualAllowance(panelRef);
    return (
      <div ref={panelRef} data-testid="panel">
        {withBody ? <div data-slot="data-grid-table-viewport" /> : null}
        <output>{allowance === null ? "unmeasured" : String(allowance)}</output>
      </div>
    );
  }

  it("measures the panel's own top and chrome", () => {
    render(<Probe />);
    // The panel's top, its 200px of chrome around the body (toolbar above,
    // footer below) and the page's bottom padding.
    expect(screen.getByRole("status").textContent).toBe(
      String(400 + (900 - 700) + 28),
    );
  });

  it("stays unmeasured until the list body renders", () => {
    render(<Probe withBody={false} />);
    expect(screen.getByRole("status").textContent).toBe("unmeasured");
  });
});

/** @vitest-environment jsdom */

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EveOperationsWorkspace } from "../../../../../apps/admin/app/(app)/admin/eve/workspace-shell";

const PANELS = {
  overview: <div id="eve-active-runs">Active runs panel</div>,
  approvals: <div id="eve-budgets">Budgets panel</div>,
  policy: <div id="eve-model-policy">Model policy panel</div>,
  connections: <div id="eve-notifications">Notifications panel</div>,
};

beforeEach(() => {
  window.history.replaceState(null, "", "/admin/eve");
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(cleanup);

describe("Eve operations workspace tabs", () => {
  it("keeps the full panel index first and shows one group of panels at a time", () => {
    render(<EveOperationsWorkspace panels={PANELS} />);
    // The index still names every governance surface (spec: operations
    // first, every surface reachable without chat).
    const index = screen.getByRole("navigation", {
      name: "Eve operations panels",
    });
    expect(index.querySelectorAll("a[href^='#eve-']").length).toBe(16);
    expect(screen.getByText("Active runs panel")).toBeTruthy();
    expect(screen.queryByText("Budgets panel")).toBeNull();
    expect(screen.queryByText("Model policy panel")).toBeNull();
  });

  it("keeps the single status row after the index and before the tabs on every tab", () => {
    render(
      <EveOperationsWorkspace
        panels={PANELS}
        statusRow={<section aria-label="Eve status">Status summary</section>}
      />,
    );
    const index = screen.getByRole("navigation", {
      name: "Eve operations panels",
    });
    const status = screen.getByRole("region", { name: "Eve status" });
    const tabs = screen.getByRole("tablist", {
      name: "Eve operations",
      hidden: true,
    });
    expect(
      index.compareDocumentPosition(status) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      status.compareDocumentPosition(tabs) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("link", { name: /^Budgets/ }));
    expect(screen.getAllByRole("region", { name: "Eve status" })).toHaveLength(
      1,
    );
  });

  it("opens the tab that holds a section chosen from the index", () => {
    render(<EveOperationsWorkspace panels={PANELS} />);
    fireEvent.click(screen.getByRole("link", { name: /^Budgets/ }));
    expect(screen.getByText("Budgets panel")).toBeTruthy();
    expect(
      screen
        .getByRole("tab", { name: "Approvals and budgets", hidden: true })
        .getAttribute("aria-selected"),
    ).toBe("true");
  });

  it("scrolls once for each repeated section selection under Strict Mode", async () => {
    window.history.replaceState(null, "", "/admin/eve?tab=approvals");
    render(
      <StrictMode>
        <EveOperationsWorkspace panels={PANELS} />
      </StrictMode>,
    );
    const settleFrames = async () => {
      await act(async () => {
        await new Promise<void>((resolve) =>
          window.requestAnimationFrame(() => resolve()),
        );
      });
    };
    fireEvent.click(screen.getByRole("link", { name: /^Budgets/ }));
    await settleFrames();
    vi.mocked(Element.prototype.scrollIntoView).mockClear();
    fireEvent.click(screen.getByRole("link", { name: /^Budgets/ }));
    await settleFrames();
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("opens the tab named by the link a page was opened from", async () => {
    window.history.replaceState(null, "", "/admin/eve#eve-model-policy");
    render(<EveOperationsWorkspace panels={PANELS} />);
    expect(screen.getByText("Model policy panel")).toBeTruthy();
    // Base UI unmounts the panel it leaves once its exit has finished.
    await waitFor(() =>
      expect(screen.queryByText("Active runs panel")).toBeNull(),
    );
  });

  it("lists each panel under the tab that holds it", () => {
    render(<EveOperationsWorkspace panels={PANELS} />);
    const index = screen.getByRole("navigation", {
      name: "Eve operations panels",
    });
    const budgets = within(index).getByRole("list", {
      name: "Approvals and budgets",
    });
    expect(
      within(budgets).getByRole("link", { name: /^Budgets/ }),
    ).toBeTruthy();
    expect(
      within(index)
        .getAllByRole("list")
        .map((list) => list.getAttribute("aria-labelledby")),
    ).toHaveLength(4);
  });

  it("keeps ?tab= in step with a section opened from the index", () => {
    window.history.replaceState(null, "", "/admin/eve?tab=connections");
    render(<EveOperationsWorkspace panels={PANELS} />);
    fireEvent.click(screen.getByRole("link", { name: /^Model policy/ }));
    expect(window.location.search).toBe("?tab=policy");
    expect(window.location.hash).toBe("#eve-model-policy");
  });

  it("adds a history entry for a section chosen from the index, so Back returns", () => {
    window.history.replaceState(null, "", "/admin/eve?tab=connections");
    render(<EveOperationsWorkspace panels={PANELS} />);
    const before = window.history.length;
    fireEvent.click(screen.getByRole("link", { name: /^Model policy/ }));
    expect(window.history.length).toBe(before + 1);
    expect(window.location.search).toBe("?tab=policy");
  });

  it("returns to the tab in the URL when Back leaves a section", async () => {
    window.history.replaceState(null, "", "/admin/eve?tab=connections");
    render(<EveOperationsWorkspace panels={PANELS} />);
    fireEvent.click(screen.getByRole("link", { name: /^Model policy/ }));
    expect(screen.getByText("Model policy panel")).toBeTruthy();
    // What the browser does on Back: the URL changes, then popstate.
    window.history.replaceState(null, "", "/admin/eve?tab=connections");
    fireEvent.popState(window);
    expect(await screen.findByText("Notifications panel")).toBeTruthy();
  });

  it("keeps the chosen tab in the URL and opens it from there", async () => {
    render(<EveOperationsWorkspace panels={PANELS} />);
    fireEvent.click(screen.getByRole("tab", { name: "Policy and memory" }));
    await waitFor(() => expect(window.location.search).toBe("?tab=policy"));
    cleanup();

    window.history.replaceState(null, "", "/admin/eve?tab=connections");
    render(<EveOperationsWorkspace panels={PANELS} />);
    expect(screen.getByText("Notifications panel")).toBeTruthy();
  });
});

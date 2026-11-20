// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The one bounded reload every scope guard uses (JB2), as JR3 bounds it, at
 * its own seam. A tab reloads an address at most once in the window, so a
 * fault that a reload does not cure ends on a page with a way out instead of
 * reloading for ever.
 *
 * Web Studio's suite on a production build, after the develop merge: a page
 * reloaded for a crossing and left before it hydrated never rendered in its
 * scope, so it never freed the address, and the next switch of organization
 * within the window stayed on the notice. A crossing's claim now stops only
 * the document its own reload loaded, which is the loop.
 */

const reloadDocument = vi.hoisted(() => vi.fn());
vi.mock("../../../../packages/database/document-reload", () => ({
  reloadDocument,
}));

/** A new document of the same tab: fresh modules, the same session storage. */
async function newDocument(how?: NavigationTimingType) {
  vi.resetModules();
  vi.spyOn(performance, "getEntriesByType").mockImplementation((type) =>
    type === "navigation"
      ? ([
          { name: window.location.href, ...(how ? { type: how } : {}) },
        ] as PerformanceEntryList)
      : [],
  );
  return import("../../../../packages/database/document-reload-claim");
}

beforeEach(() => {
  vi.restoreAllMocks();
  reloadDocument.mockReset();
  window.sessionStorage.clear();
  window.history.replaceState(null, "", "/web-studio");
});

describe("the bounded reload's claim", () => {
  it("a crossing in a document the person navigated to reloads, though a reload left before it hydrated claimed the address", async () => {
    const chooser = await newDocument("navigate");
    expect(chooser.requestDocumentReload()).toBe(true);
    // The reloaded document is left before any of its code runs. The person
    // navigates to the chooser again and crosses into the same address.
    const chooserAgain = await newDocument("navigate");
    expect(chooserAgain.requestDocumentReload()).toBe(true);
    expect(reloadDocument).toHaveBeenCalledTimes(2);
  });

  it("the document the reload loaded meets the same crossing: no second reload, so no loop", async () => {
    const chooser = await newDocument("navigate");
    expect(chooser.requestDocumentReload()).toBe(true);
    const reloaded = await newDocument("reload");
    expect(reloaded.requestDocumentReload()).toBe(false);
    expect(reloadDocument).toHaveBeenCalledTimes(1);
  });

  it("where the browser cannot say how the document was loaded, the claim stops it, as before", async () => {
    const chooser = await newDocument("navigate");
    expect(chooser.requestDocumentReload()).toBe(true);
    const unknown = await newDocument();
    expect(unknown.requestDocumentReload()).toBe(false);
    expect(reloadDocument).toHaveBeenCalledTimes(1);
  });

  it("a refused scope's claim is kept for its window whatever the next document is (JR3)", async () => {
    const first = await newDocument("navigate");
    expect(first.requestDocumentReload("refused")).toBe(true);
    const next = await newDocument("navigate");
    expect(next.requestDocumentReload("refused")).toBe(false);
    expect(reloadDocument).toHaveBeenCalledTimes(1);
  });
});

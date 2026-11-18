// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { createElement, useEffect } from "react";
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";

import { loadDocument } from "../../../apps/admin/src/cms/web-studio-document-load";

/**
 * Leaving Web Studio by Payload's router after its leave-without-saving
 * dialog: the person has already chosen to leave, so Payload's own
 * `beforeunload` listener, still attached, must not ask a second time
 * (AL-2675, council C1). Chromium runs a window's `beforeunload` listeners
 * in the order they were added, whatever their capture flag (seen in the
 * end-to-end suite), so the guard must be added before Payload's: the Web
 * Studio document adds it as it first renders. jsdom cannot navigate; the
 * unload is dispatched by hand. The cases run in order, as one document.
 */

const payloadPrompt = vi.fn((event: Event) => {
  event.preventDefault();
});
const added: Array<{ listener: unknown; capture: boolean }> = [];
const originalAdd = window.addEventListener.bind(window);

beforeAll(() => {
  window.addEventListener = ((
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) => {
    if (type === "beforeunload") {
      added.push({
        listener,
        capture:
          typeof options === "object" ? Boolean(options.capture) : !!options,
      });
    }
    return originalAdd(type, listener, options);
  }) as typeof window.addEventListener;
});
afterAll(() => {
  window.addEventListener = originalAdd;
});
afterEach(cleanup);

function unload(): Event {
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return event;
}

/** Stands in for a Payload form that holds a change. */
function FormWithUnsavedChange() {
  useEffect(() => {
    window.addEventListener("beforeunload", payloadPrompt);
  }, []);
  return null;
}

it("adds the leave guard as the Web Studio document renders, before any form's prompt", async () => {
  const { WebStudioDocument } =
    await import("../../../apps/admin/src/cms-ui/web-studio/shell/web-studio-document");
  render(
    createElement(
      WebStudioDocument,
      {
        scope: {
          userId: "00000000-0000-4000-8000-0000000000c1",
          tenantId: "00000000-0000-0000-0000-000000000001",
          assignmentId: "00000000-0000-4000-8000-0000000000a1",
          addressPrefix: "",
        },
        organization: { name: "Alpha Mission", canSwitch: true },
      },
      createElement(FormWithUnsavedChange),
    ),
  );

  expect(added.map((entry) => entry.listener)).toContain(payloadPrompt);
  const guard = added.findIndex((entry) => entry.capture);
  const prompt = added.findIndex((entry) => entry.listener === payloadPrompt);
  expect(guard).toBeGreaterThanOrEqual(0);
  expect(guard).toBeLessThan(prompt);
});

it("leaves Payload's prompt in place until the person chose to leave", () => {
  const event = unload();
  expect(payloadPrompt).toHaveBeenCalledTimes(1);
  expect(event.defaultPrevented).toBe(true);
});

it("lets the document unload without Payload's second prompt once the person chose to leave", () => {
  payloadPrompt.mockClear();
  const jsdomNavigation = vi
    .spyOn(console, "error")
    .mockImplementation(() => {});
  loadDocument("/web-studio/organization?next=%2Fweb-studio", {
    replace: false,
  });
  jsdomNavigation.mockRestore();

  const event = unload();
  expect(payloadPrompt).not.toHaveBeenCalled();
  expect(event.defaultPrevented).toBe(false);
});

it("asks again in a page the browser restores from its back/forward cache", () => {
  // The load left the page, then the person came back to the same page.
  const restored = new Event("pageshow");
  Object.defineProperty(restored, "persisted", { value: true });
  window.dispatchEvent(restored);
  payloadPrompt.mockClear();

  const event = unload();
  expect(payloadPrompt).toHaveBeenCalledTimes(1);
  expect(event.defaultPrevented).toBe(true);
});

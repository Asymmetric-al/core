// @vitest-environment jsdom

import { afterEach, expect, it, vi } from "vitest";

import { loadDocument } from "../../../apps/admin/src/cms/web-studio-document-load";

/**
 * Leaving Web Studio by Payload's router after its leave-without-saving
 * dialog: the person has already chosen to leave, so Payload's own
 * `beforeunload` listener, still attached, must not ask a second time
 * (AL-2675, council C1). jsdom cannot navigate; the unload is dispatched by
 * hand after the load is asked for.
 */

const payloadPrompt = vi.fn((event: Event) => {
  event.preventDefault();
});

afterEach(() => {
  window.removeEventListener("beforeunload", payloadPrompt);
  payloadPrompt.mockClear();
});

function unload(): Event {
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return event;
}

it("lets the document unload without Payload's second prompt", () => {
  window.addEventListener("beforeunload", payloadPrompt);
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

it("stops the prompt for that one load only", () => {
  window.addEventListener("beforeunload", payloadPrompt);
  const jsdomNavigation = vi
    .spyOn(console, "error")
    .mockImplementation(() => {});
  loadDocument("/", { replace: true });
  jsdomNavigation.mockRestore();
  unload();

  // A later unload, as from the browser's own reload, asks again.
  const later = unload();
  expect(payloadPrompt).toHaveBeenCalledTimes(1);
  expect(later.defaultPrevented).toBe(true);
});

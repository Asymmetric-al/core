// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type * as StripeSdk from "@stripe/stripe-js";

const initialStripe = Object.getOwnPropertyDescriptor(window, "Stripe");

describe("real Stripe.js module loader", () => {
  beforeEach(() => {
    vi.resetModules();
    document
      .querySelectorAll('script[src^="https://js.stripe.com/"]')
      .forEach((script) => script.remove());
    Reflect.deleteProperty(window, "Stripe");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new Error("Network disabled in the Stripe loader fixture"),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document
      .querySelectorAll('script[src^="https://js.stripe.com/"]')
      .forEach((script) => script.remove());
    if (initialStripe) Object.defineProperty(window, "Stripe", initialStripe);
    else Reflect.deleteProperty(window, "Stripe");
  });

  it.each(["@stripe/stripe-js", "@stripe/stripe-js/pure"])(
    "settles concurrent %s callers through one intercepted script",
    async (entry) => {
      // Resolve the public SDK export used by the donor workspace, bypassing checkout mocks.
      const { loadStripe } = await vi.importActual<typeof StripeSdk>(entry);
      const first = loadStripe("pk_test_local_first");
      const second = loadStripe("pk_test_local_second");

      const scripts = document.querySelectorAll(
        'script[src^="https://js.stripe.com/"]',
      );
      expect(scripts).toHaveLength(1);
      const factory = Object.assign(
        vi.fn((key: string) => ({ key })),
        {
          version: "endive",
        },
      );
      Object.defineProperty(window, "Stripe", {
        configurable: true,
        value: factory,
      });
      scripts[0]?.dispatchEvent(new Event("load"));

      // Race only to make an unresolved SDK promise fail promptly; no network can load a script in this JSDOM harness.
      let timeout: ReturnType<typeof setTimeout> | undefined;
      let outcome;
      try {
        outcome = await Promise.race([
          Promise.all([first, second]),
          new Promise<never>((_, reject) => {
            timeout = setTimeout(
              () =>
                reject(new Error("Concurrent Stripe loaders did not settle")),
              250,
            );
          }),
        ]);
      } finally {
        clearTimeout(timeout);
      }
      expect(outcome).toEqual([
        { key: "pk_test_local_first" },
        { key: "pk_test_local_second" },
      ]);
      expect(factory).toHaveBeenNthCalledWith(1, "pk_test_local_first");
      expect(factory).toHaveBeenNthCalledWith(2, "pk_test_local_second");
      expect(fetch).not.toHaveBeenCalled();
    },
  );
});

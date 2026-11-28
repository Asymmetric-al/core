// @vitest-environment jsdom

import { act, cleanup, render } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const MODULE =
  "../../../../apps/donor/app/(public)/(solid)/checkout/checkout-turnstile";

type Fake = {
  render: ReturnType<typeof vi.fn>;
  reset: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
};

const RETRY_MS = 2_000;

const fakeTurnstile = (): Fake => ({
  render: vi.fn(() => "widget-1"),
  reset: vi.fn(),
  remove: vi.fn(),
});

const scripts = () => Array.from(document.head.querySelectorAll("script"));

function install(api: Fake | undefined) {
  (window as unknown as { turnstile?: Fake }).turnstile = api;
}

async function mount(onToken = vi.fn()) {
  const { CheckoutTurnstile } = (await import(MODULE)) as {
    CheckoutTurnstile: (props: {
      siteKey: string;
      onToken: (token: string | null) => void;
      resetSignal: number;
    }) => React.ReactElement;
  };
  await act(async () => {
    render(
      <CheckoutTurnstile
        siteKey="1x00000000000000000000AA"
        onToken={onToken}
        resetSignal={0}
      />,
    );
  });
  return onToken;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.resetModules();
  document.head.innerHTML = "";
  install(undefined);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("AL-2681 B fix round X2: the challenge recovers by itself", () => {
  it("a challenge script that failed to load is tried again, and the widget then renders", async () => {
    await mount();
    expect(scripts()).toHaveLength(1);
    await act(async () => {
      scripts()[0]!.dispatchEvent(new Event("error"));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(RETRY_MS);
    });
    const retried = scripts();
    expect(retried).toHaveLength(1);
    const turnstile = fakeTurnstile();
    install(turnstile);
    await act(async () => {
      retried[0]!.dispatchEvent(new Event("load"));
    });
    expect(turnstile.render).toHaveBeenCalledTimes(1);
  });

  it("a widget in its error state gives up its token and is reset", async () => {
    const turnstile = fakeTurnstile();
    install(turnstile);
    const onToken = await mount();
    const options = turnstile.render.mock.calls[0]![1] as Record<
      string,
      () => unknown
    >;
    await act(async () => {
      options["error-callback"]!();
    });
    expect(onToken).toHaveBeenLastCalledWith(null);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(RETRY_MS);
    });
    expect(turnstile.reset).toHaveBeenCalledWith("widget-1");
  });
});

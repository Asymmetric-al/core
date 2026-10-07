/** @vitest-environment jsdom */

import { execFileSync } from "node:child_process";

import { act } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";

import { MotionProvider } from "../../../../packages/lib/motion-provider";
// eslint-disable-next-line no-restricted-imports -- AL-1931 Real donor page SSR/hydration at its public seam; no app imports another app.
import { FAQPageClient } from "../../../../apps/donor/app/(public)/(hero)/faq/faq-client";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
afterEach(async () => {
  await act(async () => root?.unmount());
  root = undefined;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("hydrates the initially expanded answer without a motion-preference markup mismatch", async () => {
  const container = document.createElement("div");
  // Motion caches its browser environment at module load. A DOM-free process
  // models real SSR rather than deleting jsdom globals after importing it.
  container.innerHTML = execFileSync(
    "bun",
    [
      "-e",
      `
    import React from "react";
    import { renderToString } from "react-dom/server";
    import { MotionProvider } from "./packages/lib/motion-provider.tsx";
    import { FAQPageClient } from "./apps/donor/app/(public)/(hero)/faq/faq-client.tsx";
    console.log(renderToString(React.createElement(MotionProvider, null, React.createElement(FAQPageClient))));
  `,
    ],
    { cwd: process.cwd(), encoding: "utf8" },
  ).trim();
  const serverAnswer = container.querySelector('[role="region"]');
  expect(serverAnswer?.textContent).toContain("85%");
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query === "(prefers-reduced-motion)",
    media: query,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  const errors: unknown[] = [];
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  await act(async () => {
    root = hydrateRoot(
      container,
      <MotionProvider>
        <FAQPageClient />
      </MotionProvider>,
      {
        onRecoverableError: (error) => errors.push(error),
      },
    );
  });
  expect(errors).toEqual([]);
  expect(
    consoleError.mock.calls
      .map((args) => args.join(" "))
      .filter((message) =>
        /hydrated|hydration|server rendered|didn't match/i.test(message),
      ),
  ).toEqual([]);
  expect(container.querySelector('[role="region"]')).toBe(serverAnswer);
});

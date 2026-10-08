// @vitest-environment jsdom

import { execFileSync } from "node:child_process";

import { act } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppIcon } from "../../../../packages/ui/components/shadcn/icons/AppIcon";
import { Activity } from "../../../../packages/ui/node_modules/lucide-react";

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root | undefined;
afterEach(async () => {
  await act(async () => root?.unmount());
  root = undefined;
  vi.unstubAllGlobals();
});

describe("active navigation icon hydration", () => {
  it("preserves its server element when hydration resolves reduced motion", async () => {
    const icon = <AppIcon icon={Activity} animated aria-label="Activity" />;
    const container = document.createElement("div");
    // Render the actual component in a real server process without DOM globals;
    // Motion caches whether its module was loaded in a browser, so removing
    // jsdom's window after import would not accurately model server rendering.
    container.innerHTML = execFileSync(
      "bun",
      [
        "-e",
        `
      import React from "react";
      import { renderToString } from "react-dom/server";
      import { AppIcon } from "./packages/ui/components/shadcn/icons/AppIcon.tsx";
      import { Activity } from "./packages/ui/node_modules/lucide-react";
      console.log(renderToString(React.createElement(AppIcon, {
        icon: Activity, animated: true, "aria-label": "Activity"
      })));
    `,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    ).trim();
    const serverElement = container.firstElementChild;
    const recoverableErrors: unknown[] = [];
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query === "(prefers-reduced-motion)",
      media: query,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    await act(async () => {
      root = hydrateRoot(container, icon, {
        onRecoverableError: (error) => recoverableErrors.push(error),
      });
    });
    expect(recoverableErrors).toEqual([]);
    expect(container.firstElementChild).toBe(serverElement);
    expect(container.querySelector("svg")?.getAttribute("aria-label")).toBe(
      "Activity",
    );
  });
});

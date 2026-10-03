/** @vitest-environment jsdom */

import { cleanup, render } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MCShell } from "../../../../apps/admin/app/mc-shell";

vi.mock("@asym/lib/mission-control/context", () => ({
  MCProvider: ({ children }: PropsWithChildren) => children,
  useMC: () => ({ user: null, role: "admin", signOut: vi.fn() }),
}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/feed",
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("../../../../apps/admin/app/eve/global-panel", () => ({
  EveGlobalPanel: () => null,
}));
beforeEach(() => {
  vi.stubGlobal("matchMedia", (media: string) => ({
    media,
    matches: false,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Mission Control composed navigation names", () => {
  it("keeps the rendered submenu links named by their parent content", () => {
    const view = render(
      <MCShell>
        <h1>Content</h1>
      </MCShell>,
    );
    expect(
      view.getByRole("link", { name: "Moderation" }).getAttribute("href"),
    ).toBe("/feed");
    expect(
      view.getByRole("link", { name: "Org Updates" }).getAttribute("href"),
    ).toBe("/feed/org-updates");
  });
});

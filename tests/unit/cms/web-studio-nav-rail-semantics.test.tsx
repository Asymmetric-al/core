/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

// Use the admin workspace's public client export so the preferences mock and
// router context share Payload's bundled module identity with Bun's linker.
import { RouterAdapterContext } from "../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js";
import type { LinkAdapterProps } from "../../../apps/admin/node_modules/@payloadcms/ui/dist/providers/RouterAdapter/index.js";
import { StudioNavRail } from "../../../apps/admin/src/cms-ui/web-studio/shell/studio-nav-rail";

const fixture = vi.hoisted(() => ({
  getPreference: vi.fn(async (key: string) => {
    if (key === "web-studio.navCollapsed") return { collapsed: false };
    if (key === "web-studio.pages.recent") {
      return [
        {
          id: "doc-1",
          title: "Quarterly update",
          href: "/web-studio/collections/pages/doc-1",
        },
      ];
    }
    return [];
  }),
  setPreference: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock(
  "../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js",
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import("../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js")
      >();
    return {
      ...actual,
      usePreferences: () => ({
        getPreference: fixture.getPreference,
        setPreference: fixture.setPreference,
      }),
    };
  },
);
vi.mock("next/navigation", () => ({ usePathname: () => "/web-studio" }));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function NativeLink({ href, ...props }: LinkAdapterProps) {
  return <a href={href} {...props} />;
}

it("keeps recent documents as named navigation links and preserves Payload navigation", async () => {
  render(
    <RouterAdapterContext
      value={{
        Link: NativeLink,
        pathname: "/web-studio",
        params: {},
        searchParams: new URLSearchParams(),
        router: {
          push: fixture.push,
          replace: fixture.replace,
          refresh: vi.fn(),
          back: vi.fn(),
          forward: vi.fn(),
          prefetch: vi.fn(),
        },
      }}
    >
      <StudioNavRail />
    </RouterAdapterContext>,
  );
  const documentLink = await screen.findByTitle("Quarterly update");
  expect(documentLink.tagName).toBe("A");
  expect(documentLink.getAttribute("href")).toBe(
    "/web-studio/collections/pages/doc-1",
  );
  fireEvent.click(documentLink);
  expect(fixture.push).toHaveBeenCalledExactlyOnceWith(
    "/web-studio/collections/pages/doc-1",
    { scroll: undefined },
  );
  expect(screen.getByRole("link", { name: "Quarterly update" })).toBe(
    documentLink,
  );
  expect(screen.queryByRole("button", { name: "Quarterly update" })).toBeNull();
  expect(
    screen.getByRole("button", { name: "Collapse studio navigation" }),
  ).toBeTruthy();
});

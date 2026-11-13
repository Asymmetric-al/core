// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { WebStudioNotFoundView } from "../../../../apps/admin/src/cms-ui/web-studio/flows/WebStudioNotFoundView";

const fixture = vi.hoisted(() => ({
  user: { id: 1 } as { id: number } | null,
  canAccessAdmin: true,
}));
vi.mock(
  "../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js",
  () => ({
    useAuth: () => ({
      user: fixture.user,
      permissions: { canAccessAdmin: fixture.canAccessAdmin },
    }),
    NotFoundClient: () => <p>Payload unavailable page</p>,
  }),
);
vi.mock("../../../../apps/admin/src/cms-ui/web-studio/routing", () => ({
  Link: (props: React.ComponentProps<"a">) => <a {...props} />,
}));
vi.mock(
  "../../../../apps/admin/src/cms-ui/web-studio/shell/studio-layout",
  () => ({
    StudioLayout: ({ children }: { children: React.ReactNode }) => (
      <main data-testid="studio-shell">{children}</main>
    ),
  }),
);
afterEach(() => {
  cleanup();
  fixture.user = { id: 1 };
  fixture.canAccessAdmin = true;
});

it("renders one native Studio shell with both recovery exits", () => {
  render(<WebStudioNotFoundView />);
  expect(screen.getAllByTestId("studio-shell")).toHaveLength(1);
  expect(
    screen.getByRole("heading", { level: 1, name: "This page isn’t here" }),
  ).toBeTruthy();
  expect(
    screen
      .getByRole("link", { name: "Back to Web Studio" })
      .getAttribute("href"),
  ).toBe("/web-studio");
  expect(
    screen
      .getByRole("link", { name: "Back to Mission Control" })
      .getAttribute("href"),
  ).toBe("/");
  const route = readFileSync(
    "apps/admin/app/(payload)/web-studio/[[...segments]]/not-found.tsx",
    "utf8",
  );
  expect(route).toContain("<WebStudioNotFoundView />");
  expect(route).toContain("generatePageMetadata");
  expect(route).not.toContain("NotFoundPage(");
});

it.each(["anonymous", "denied"])(
  "preserves Payload's no-shell fallback for %s access",
  (state) => {
    if (state === "anonymous") fixture.user = null;
    else fixture.canAccessAdmin = false;
    render(<WebStudioNotFoundView />);
    expect(screen.getByText("Payload unavailable page")).toBeTruthy();
    expect(screen.queryByTestId("studio-shell")).toBeNull();
  },
);

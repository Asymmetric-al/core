// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { StudioTopBar } from "../../../../apps/admin/src/cms-ui/web-studio/shell/studio-top-bar";
import { WebStudioDocument } from "../../../../apps/admin/src/cms-ui/web-studio/shell/web-studio-document";

/**
 * Inside Web Studio a person sees the organization they work in, and one who
 * holds staff rows in more than one place can switch (plan 5.2; AL-2675,
 * WP2b slice C). Switching goes through the Web Studio chooser as a full
 * document load.
 */

vi.mock(
  "../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js")
    >()),
    useAuth: () => ({ user: { email: "editor@example.org" } }),
    useConfig: () => ({
      config: {
        admin: { routes: { account: "/account", logout: "/logout" } },
        routes: { admin: "/web-studio" },
      },
    }),
  }),
);
vi.mock("../../../../apps/admin/src/cms-ui/web-studio/routing", () => ({
  Link: ({ href, ...props }: React.ComponentProps<"a">) => (
    <a href={href} {...props} />
  ),
}));
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  usePathname: () => "/web-studio/collections/pages",
}));

afterEach(cleanup);

const SCOPE = {
  userId: "00000000-0000-4000-8000-0000000000c1",
  tenantId: "00000000-0000-0000-0000-000000000002",
  assignmentId: "00000000-0000-4000-8000-0000000000b1",
  addressPrefix: "",
};

function openAccountMenu() {
  fireEvent.click(screen.getByRole("button", { name: /account menu/ }));
}

it("names the organization and offers a switch to a person in more than one", async () => {
  render(
    <WebStudioDocument
      scope={SCOPE}
      organization={{ name: "Bravo Mission", canSwitch: true }}
    >
      <StudioTopBar sectionLabel="Pages" />
    </WebStudioDocument>,
  );
  openAccountMenu();

  expect(await screen.findByText("Bravo Mission")).toBeTruthy();
  const item = await screen.findByRole("menuitem", {
    name: /Switch organization/,
  });
  expect(item.getAttribute("href")).toBe(
    "/web-studio/organization?next=%2Fweb-studio%2Fcollections%2Fpages",
  );
});

it("offers no switch to a person with one place to work", async () => {
  render(
    <WebStudioDocument
      scope={SCOPE}
      organization={{ name: "Bravo Mission", canSwitch: false }}
    >
      <StudioTopBar sectionLabel="Pages" />
    </WebStudioDocument>,
  );
  openAccountMenu();

  expect(await screen.findByText("Bravo Mission")).toBeTruthy();
  expect(
    screen.queryByRole("menuitem", { name: /Switch organization/ }),
  ).toBeNull();
});

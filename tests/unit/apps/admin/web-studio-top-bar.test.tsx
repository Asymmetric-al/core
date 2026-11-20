// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { StudioTopBar } from "../../../../apps/admin/src/cms-ui/web-studio/shell/studio-top-bar";

const session = vi.hoisted(() => ({ signOut: vi.fn() }));
vi.mock("@asym/auth/client-session", () => ({
  signOutClientSession: session.signOut,
}));

const organization = vi.hoisted(() => ({
  current: null as null | {
    name: string;
    canSwitch: boolean;
    missionControlHref: string;
  },
}));
vi.mock(
  "../../../../apps/admin/src/cms-ui/web-studio/shell/web-studio-document",
  () => ({ useWebStudioOrganization: () => organization.current }),
);

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

afterEach(() => {
  cleanup();
  session.signOut.mockReset();
});

// The bar renders each width's form; CSS shows one per breakpoint.
function byClass(container: HTMLElement, selector: string) {
  const element = container.querySelector(selector);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`${selector} missing`);
  }
  return element;
}

it("gives phones a back link to the section instead of a back row on the page", () => {
  const { container } = render(
    <StudioTopBar sectionLabel="Pages" currentLabel="Local CMS Home" />,
  );
  const back = byClass(container, "header a.sm\\:hidden");
  expect(back.textContent).toBe("Pages");
  // The document's own heading names it; the phone back link does not
  // repeat the title.
  expect(back.getAttribute("href")).toBe("/web-studio/collections/pages");
});

it("gives small tablets a linked section crumb before the current page", () => {
  const { container } = render(
    <StudioTopBar sectionLabel="Pages" currentLabel="Local CMS Home" />,
  );
  const crumb = byClass(container, "header .sm\\:block.md\\:hidden");
  const link = crumb.querySelector("a");
  expect(link?.textContent).toBe("Pages");
  expect(link?.getAttribute("href")).toBe("/web-studio/collections/pages");
  expect(crumb.querySelector('[aria-current="page"]')?.textContent).toBe(
    "Local CMS Home",
  );
});

it("keeps a section's own page name alone on phones", () => {
  const { container } = render(<StudioTopBar sectionLabel="Pages" />);
  const phone = byClass(container, "header .md\\:hidden");
  expect(phone.querySelector("a")).toBeNull();
  expect(phone.textContent).toBe("Pages");
  expect(container.querySelector("header a.sm\\:hidden")).toBeNull();
  expect(screen.getByText("Staff only")).toBeTruthy();
});

// Council on the joined release, JC3: a person in two organizations must
// see which one Web Studio works in without opening the account menu, and
// the way back leads to that organization's home in Mission Control.
it("names the organization Web Studio works in in the bar itself, and leads back to its home in Mission Control", () => {
  organization.current = {
    name: "Bravo Mission",
    canSwitch: true,
    missionControlHref: "/00000000-0000-0000-0000-000000000002",
  };
  render(<StudioTopBar sectionLabel="Pages" />);
  const bar = screen.getByRole("banner");
  // The account menu is closed: its content is not in the page.
  expect(screen.queryByRole("menu")).toBeNull();
  expect(within(bar).getByText("Bravo Mission")).toBeTruthy();
  expect(
    within(bar)
      .getByRole("link", { name: "Mission Control" })
      .getAttribute("href"),
  ).toBe("/00000000-0000-0000-0000-000000000002");
});

// Payload's own logout only ends Payload's side: with its local strategy
// off it runs the collection's afterLogout hook and leaves the Supabase
// session signed in, which a shared computer would keep (coordinator's
// ruling on the joined release). Web Studio's "Log out" is Mission
// Control's own sign-out: the server ends the session, and the login page
// loads as a new document.
it("logs out through Mission Control's sign-out, not Payload's logout page", async () => {
  organization.current = null;
  render(<StudioTopBar sectionLabel="Pages" />);
  fireEvent.click(screen.getByRole("button", { name: /account menu/ }));
  const logOut = await screen.findByRole("menuitem", { name: "Log out" });
  expect(logOut.getAttribute("href")).toBeNull();
  expect(logOut.closest("a")).toBeNull();
  fireEvent.click(logOut);
  await waitFor(() => expect(session.signOut).toHaveBeenCalledTimes(1));
  // Its default: the server's sign-out first, then the login page as a
  // document.
  expect(session.signOut).toHaveBeenCalledWith();
});

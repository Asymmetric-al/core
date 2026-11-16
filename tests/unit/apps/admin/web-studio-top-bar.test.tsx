// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { StudioTopBar } from "../../../../apps/admin/src/cms-ui/web-studio/shell/studio-top-bar";

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

afterEach(cleanup);

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

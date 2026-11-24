// @vitest-environment jsdom

import { act, cleanup, render, screen } from "@testing-library/react";
import { useContext } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { RouterAdapterContext } from "../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js";
import { NextRouterAdapter } from "../../../apps/admin/src/cms/payload-next-router-adapter";

import type { RouterAdapterContextValue } from "../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js";

/**
 * Payload's router adapter with the real document load behind it (council on
 * the joined release, JC1 and JC8):
 *
 * - its `Link` loads a document wherever its router does, so Payload's links
 *   to the Web Studio chooser, to Mission Control or to a REST route never
 *   render on this document;
 * - a document load it begins carries slice A's mark (AR14), so the
 *   `push(outside); refresh()` Payload makes in one task does not render the
 *   current page again on the document that is going away.
 *
 * jsdom cannot navigate: the shared document load is observed.
 */

const next = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
  forward: vi.fn(),
}));
const documents = vi.hoisted(() => ({
  loadDocument: vi.fn(),
  reloadDocument: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => next,
  usePathname: () => "/web-studio/collections/pages/7",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    prefetch: _prefetch,
    replace: _replace,
    scroll: _scroll,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    prefetch?: boolean | null;
    replace?: boolean;
    scroll?: boolean;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock(
  "../../../packages/database/document-reload",
  async (importOriginal) => {
    const actual = await importOriginal<Record<string, unknown>>();
    return { ...actual, ...documents };
  },
);

const PAGE = "/web-studio/collections/pages/7";

beforeEach(() => {
  window.history.replaceState(null, "", PAGE);
});
afterEach(async () => {
  cleanup();
  vi.clearAllMocks();
  // Each case begins in a task of its own.
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
});

function adapter(): RouterAdapterContextValue {
  let value: RouterAdapterContextValue | null = null;
  function Probe() {
    value = useContext(RouterAdapterContext);
    return null;
  }
  render(
    <NextRouterAdapter>
      <Probe />
    </NextRouterAdapter>,
  );
  if (!value) throw new Error("no router adapter");
  return value;
}

it.each([
  ["the organization chooser", "/web-studio/organization?next=%2Fweb-studio"],
  ["Mission Control", "/"],
  ["a Mission Control page", "/people"],
  ["a REST route", "/web-studio/api/pages/7/preview"],
])("makes Payload's link to %s a document load", (_label, href) => {
  const { Link } = adapter();
  render(<Link href={href}>Out</Link>);

  act(() => screen.getByText("Out").click());

  expect(documents.loadDocument).toHaveBeenCalledExactlyOnceWith(href, {
    replace: false,
  });
});

it("keeps Payload's link to a Web Studio page a client navigation", () => {
  const { Link } = adapter();
  render(<Link href="/web-studio/collections/pages/8">Next</Link>);

  act(() => screen.getByText("Next").click());

  expect(documents.loadDocument).not.toHaveBeenCalled();
});

it("leaves a link opened in a new tab to the browser", () => {
  const { Link } = adapter();
  render(<Link href="/web-studio/organization">Out</Link>);

  act(() => {
    screen.getByText("Out").dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        ctrlKey: true,
      }),
    );
  });

  expect(documents.loadDocument).not.toHaveBeenCalled();
});

it("does not refresh in the task in which its router began a document load", async () => {
  const { router } = adapter();
  router.push("/");
  router.refresh();
  expect(documents.loadDocument).toHaveBeenCalledExactlyOnceWith("/", {
    replace: false,
  });
  expect(next.refresh).not.toHaveBeenCalled();

  // A document still here after that task refreshes again (AR14).
  await act(() => new Promise<void>((resolve) => setTimeout(resolve, 0)));
  router.refresh();
  expect(next.refresh).toHaveBeenCalledTimes(1);
});

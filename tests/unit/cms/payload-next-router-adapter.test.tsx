// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { useContext } from "react";
import { afterEach, expect, it, vi } from "vitest";

import { RouterAdapterContext } from "../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js";
import { NextRouterAdapter } from "../../../apps/admin/src/cms/payload-next-router-adapter";

import type { RouterAdapterContextValue } from "../../../apps/admin/node_modules/@payloadcms/ui/dist/exports/client/index.js";

/**
 * Payload navigates through the router adapter Web Studio gives it: its
 * links, and its leave-without-saving dialog, which catches every link click
 * on a page with unsaved changes and, once the person confirms, pushes the
 * link's address. Only a Web Studio page may be reached by a client
 * navigation; anything else, such as the organization chooser or Mission
 * Control, is a document load, so switching organization or leaving Web
 * Studio never keeps the old organization's page (AL-2675, council C1, C12).
 */

const next = vi.hoisted(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
  forward: vi.fn(),
}));
const loads = vi.hoisted(() => ({ loadDocument: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => next,
  usePathname: () => "/web-studio/collections/pages/7",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));
vi.mock("../../../apps/admin/src/cms/web-studio-document-load", () => loads);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function payloadRouter(): RouterAdapterContextValue["router"] {
  let router: RouterAdapterContextValue["router"] | null = null;
  function Probe() {
    router = useContext(RouterAdapterContext).router;
    return null;
  }
  render(
    <NextRouterAdapter>
      <Probe />
    </NextRouterAdapter>,
  );
  if (!router) throw new Error("no router adapter");
  return router;
}

it("keeps a Web Studio page a client navigation", () => {
  const router = payloadRouter();
  router.push("/web-studio/collections/pages/8", { scroll: false });
  router.replace("/web-studio/collections/pages?page=2");

  expect(next.push).toHaveBeenCalledWith("/web-studio/collections/pages/8", {
    scroll: false,
  });
  expect(next.replace).toHaveBeenCalledWith(
    "/web-studio/collections/pages?page=2",
    undefined,
  );
  expect(loads.loadDocument).not.toHaveBeenCalled();
});

it.each([
  ["the organization chooser", "/web-studio/organization?next=%2Fweb-studio"],
  ["Mission Control", "/"],
  ["a Mission Control page", "/people"],
  ["a REST route", "/web-studio/api/pages"],
  ["another origin", "https://elsewhere.example/web-studio"],
])("loads %s as a document", (_label, href) => {
  const router = payloadRouter();
  router.push(href);

  expect(loads.loadDocument).toHaveBeenCalledExactlyOnceWith(href, {
    replace: false,
  });
  expect(next.push).not.toHaveBeenCalled();
});

it("replaces the entry when Payload replaces it", () => {
  const router = payloadRouter();
  router.replace("/web-studio/organization?next=%2Fweb-studio");

  expect(loads.loadDocument).toHaveBeenCalledExactlyOnceWith(
    "/web-studio/organization?next=%2Fweb-studio",
    { replace: true },
  );
  expect(next.replace).not.toHaveBeenCalled();
});

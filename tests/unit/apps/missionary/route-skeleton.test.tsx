/** @vitest-environment jsdom */

import { cleanup, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-2675: the fallback must hold the route's own loading skeleton.
import AnalyticsLoading from "../../../../apps/missionary/app/analytics/loading";
// eslint-disable-next-line no-restricted-imports -- AL-2675: the fallback must hold the route's own loading skeleton.
import TasksLoading from "../../../../apps/missionary/app/tasks/loading";

/**
 * Council round 2, AR11. The workspace's request-time boundary (the role
 * gate and the document scope, `app/layout.tsx`) streams every workspace
 * page, so each route's prerendered shell is that boundary's fallback. The
 * fallback reads the route path, as the layout shell above it does, and
 * shows the route's own skeleton, its `loading.tsx`, inside the workspace's
 * chrome; a route with none shows the generic one. It holds no tenant: the
 * route path is the same in the prerendered shell and in the browser under
 * any tenant prefix.
 */

const TA = "00000000-0000-0000-0000-000000000001";
const navigation = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

const { RouteSkeleton } =
  await import("../../../../apps/missionary/app/_providers/route-skeleton");

afterEach(() => {
  cleanup();
});

/** The markup of a route's own skeleton, to find inside the fallback. */
function markupOf(Skeleton: () => React.ReactNode) {
  return renderToString(<Skeleton />);
}

it.each([
  ["/tasks", TasksLoading],
  [`/${TA}/tasks`, TasksLoading],
  ["/analytics", AnalyticsLoading],
  [`/${TA}/analytics`, AnalyticsLoading],
])("shows the route's own skeleton at %s", (pathname, Own) => {
  navigation.pathname = pathname;
  const html = renderToString(<RouteSkeleton />);
  expect(html).toContain(markupOf(Own));
  expect(html).toContain(
    `data-route-skeleton="${pathname.replace(`/${TA}`, "")}"`,
  );
});

it.each(["/", "/donors", "/feed", "/settings", "/tasks/archive"])(
  "shows the generic skeleton at %s, which has none of its own",
  (pathname) => {
    navigation.pathname = pathname;
    const html = renderToString(<RouteSkeleton />);
    expect(html).not.toContain(markupOf(TasksLoading));
    expect(html).not.toContain(markupOf(AnalyticsLoading));
    expect(html).not.toContain("data-route-skeleton");
  },
);

it("keeps the workspace chrome and one loading status around any route's skeleton", () => {
  for (const pathname of ["/tasks", "/donors"]) {
    navigation.pathname = pathname;
    const view = render(<RouteSkeleton />);
    expect(view.getAllByRole("status")).toHaveLength(1);
    expect(view.getByRole("status").textContent).toBe("Loading…");
    cleanup();
  }
});

it("holds no tenant", () => {
  navigation.pathname = `/${TA}/tasks`;
  expect(renderToString(<RouteSkeleton />)).not.toContain(TA);
});

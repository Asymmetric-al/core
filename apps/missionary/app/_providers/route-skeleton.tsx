"use client";

import { useRoutePathname } from "@asym/auth/tenant-navigation";

import { WorkspaceSkeleton } from "./workspace-skeleton";
import AnalyticsLoading from "../analytics/loading";
import TasksLoading from "../tasks/loading";

import type { ReactNode } from "react";

/**
 * The workspace routes with a skeleton of their own: their `loading.tsx`,
 * which holds no tenant. Matched on the whole route path; a route below one
 * of them has its own layout and gets the generic skeleton.
 */
const ROUTE_SKELETONS: ReadonlyMap<string, ReactNode> = new Map([
  ["/tasks", <TasksLoading key="/tasks" />],
  ["/analytics", <AnalyticsLoading key="/analytics" />],
]);

/**
 * The fallback of the workspace's request-time boundary (`app/layout.tsx`),
 * and so each workspace route's prerendered shell: the workspace chrome
 * around the route's own skeleton, chosen by the route path (council round
 * 2, AR11). The route path is the same when the shell is prerendered and in
 * the browser under any tenant prefix, and the workspace has no dynamic
 * route, so the shell stays one for every organization (A15). A route with
 * no skeleton of its own shows the generic one.
 */
export function RouteSkeleton() {
  const route = useRoutePathname();
  const own = ROUTE_SKELETONS.get(route);
  return own ? (
    <WorkspaceSkeleton route={route}>{own}</WorkspaceSkeleton>
  ) : (
    <WorkspaceSkeleton />
  );
}

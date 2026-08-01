"use client";

import dynamic from "next/dynamic";

import { HistorySkeleton } from "./history-skeleton";

/**
 * `ssr: false` is load-bearing, not incidental: the content subtree calls
 * `useLiveQuery` (TanStack react-db), which uses `useSyncExternalStore` with no
 * server snapshot and starts a relative-URL fetch during render — both throw on
 * the server.
 *
 * Because that opts the subtree out of prerendering, the route would otherwise
 * paint nothing while the client chunk downloads: `page.tsx` has no server
 * `await`, so the sibling `loading.tsx` boundary resolves immediately and its
 * fallback is gone before the chunk is even requested. Handing the same
 * skeleton to `dynamic` is what keeps the region occupied.
 */
const PageContent = dynamic(() => import("./page-content"), {
  ssr: false,
  loading: () => <HistorySkeleton />,
});

export default function PageClient() {
  return <PageContent />;
}

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { nextPartnerLinkStep } from "./donors-page-model";
import { useDonorsPageViewFields } from "./use-donors-page-view";

/**
 * Links such as Home's "View partner" open one partner with
 * `?partner=<id>`. Partners load a page at a time, so this keeps loading
 * until the partner turns up or the list runs out. The request is cleared
 * once honoured so a refresh doesn't reopen it. Reading the URL suspends, so
 * the page renders this inside its own boundary.
 */
export function OpenPartnerFromLink() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const partnerId = searchParams.get("partner");
  const view = useDonorsPageViewFields();
  const { all, hasMore, isLoadingMore, loadMore, selectById } = view.donors;
  const { isLoading, error } = view.status;
  const loadedIds = React.useMemo(() => all.map((donor) => donor.id), [all]);
  const step = partnerId
    ? nextPartnerLinkStep(partnerId, loadedIds, {
        isLoading,
        hasError: Boolean(error),
        hasMore,
        isLoadingMore,
      })
    : null;
  // One request per page: re-renders before the next page arrives must not
  // ask for it again. Likewise each link is honoured once, even if the page
  // re-renders before the cleared URL lands.
  const requestedAtCountRef = React.useRef<number | null>(null);
  const handledLinkRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!partnerId) {
      handledLinkRef.current = null;
      return;
    }
    if (!step || step === "wait" || handledLinkRef.current === partnerId) {
      return;
    }
    if (step === "load-more") {
      if (requestedAtCountRef.current === loadedIds.length) return;
      requestedAtCountRef.current = loadedIds.length;
      void loadMore();
      return;
    }
    requestedAtCountRef.current = null;
    handledLinkRef.current = partnerId;
    if (step === "open") selectById(partnerId);
    else toast.error("That partner isn’t in your list any more.");
    const rest = new URLSearchParams(searchParams.toString());
    rest.delete("partner");
    const query = rest.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [
    loadMore,
    loadedIds.length,
    partnerId,
    pathname,
    router,
    searchParams,
    selectById,
    step,
  ]);

  return null;
}

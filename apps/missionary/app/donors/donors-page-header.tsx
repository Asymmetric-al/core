"use client";

import { AddPartnerDialog } from "@asym/missionary/components/add-partner-dialog";
import { PageHeader } from "@asym/ui/components/page-header";
import { Button } from "@asym/ui/components/shadcn/button";
import { Download, Plus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { downloadPartnersCsv } from "./partners-export";
import { useDonorsPageViewFields } from "./use-donors-page-view";

/**
 * Links such as Home's "Add partner" open the dialog with `?add=1`. The
 * request is cleared once honoured so a refresh doesn't reopen it. Reading the
 * URL suspends, so it sits in its own boundary and the header stays instant.
 */
function OpenAddPartnerFromLink({ onOpen }: { onOpen: () => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const wantsAdd = searchParams.has("add");
  React.useEffect(() => {
    if (!wantsAdd) return;
    onOpen();
    const rest = new URLSearchParams(searchParams.toString());
    rest.delete("add");
    const query = rest.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [wantsAdd, onOpen, pathname, router, searchParams]);
  return null;
}

export function DonorsPageHeader() {
  const [addOpen, setAddOpen] = React.useState(false);
  const openAdd = React.useCallback(() => setAddOpen(true), []);
  const view = useDonorsPageViewFields();
  const { profile } = view;
  const { refreshDonors } = view.actions;
  const { filtered, hasMore } = view.donors;

  // Exports the partners shown (search and filters apply). When more pages
  // exist, the label says only the loaded ones are included.
  const exportLabel = hasMore
    ? `Export the ${filtered.length} loaded`
    : "Export CSV";

  return (
    <PageHeader
      title="Partners"
      description="The people and churches who support your ministry."
    >
      <Button
        variant="outline"
        size="sm"
        disabled={filtered.length === 0}
        onClick={() => downloadPartnersCsv(filtered)}
      >
        <Download data-icon="inline-start" aria-hidden />
        {exportLabel}
      </Button>
      {profile?.id && (
        <AddPartnerDialog
          missionaryId={profile.id}
          onSuccess={refreshDonors}
          open={addOpen}
          onOpenChange={setAddOpen}
          trigger={
            <Button size="sm">
              <Plus data-icon="inline-start" aria-hidden />
              Add partner
            </Button>
          }
        />
      )}
      <React.Suspense fallback={null}>
        <OpenAddPartnerFromLink onOpen={openAdd} />
      </React.Suspense>
    </PageHeader>
  );
}

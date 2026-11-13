"use client";

import { PageShell } from "@asym/ui/components/primitives/page-shell";

import { CareDirectoryLimitNote } from "@/features/mission-control/care/components/care-directory-limit-note";
import { CarePersonnelGrid } from "@/features/mission-control/care/components/care-personnel-grid";
import { useCarePersonnel } from "@/features/mission-control/care/hooks/use-care";

export default function CareDirectoryPage() {
  const personnel = useCarePersonnel();

  return (
    <PageShell
      title="Care directory"
      description="Members in care, with their status and last contact."
      density="compact"
    >
      {!personnel.isError && !personnel.isLoading ? (
        <CareDirectoryLimitNote
          shown={personnel.data.length}
          total={personnel.personnelTotal}
        />
      ) : null}
      <CarePersonnelGrid
        personnel={personnel.data}
        activities={personnel.activities}
        requirements={personnel.requirements}
        lastContacts={personnel.lastContacts}
        isLoading={personnel.isLoading}
        error={
          personnel.isError
            ? {
                title: "The directory could not load",
                message: "Check your connection and try again.",
                onRetry: () => void personnel.refetch(),
              }
            : null
        }
      />
    </PageShell>
  );
}

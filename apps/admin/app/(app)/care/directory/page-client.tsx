"use client";

import { useMC } from "@asym/lib/mission-control/context";
import { PageShell } from "@asym/ui/components/primitives/page-shell";

import { CareDirectoryLimitNote } from "@/features/mission-control/care/components/care-directory-limit-note";
import {
  CareNoAccessState,
  isCareAccessDeniedError,
} from "@/features/mission-control/care/components/care-no-access-state";
import { CarePersonnelGrid } from "@/features/mission-control/care/components/care-personnel-grid";
import { useCarePersonnel } from "@/features/mission-control/care/hooks/use-care";

function CareDirectoryContent() {
  const personnel = useCarePersonnel();

  if (personnel.isError && isCareAccessDeniedError(personnel.error)) {
    return (
      <CareNoAccessState
        title="Care directory"
        description="Members in care, with their status and last contact."
      />
    );
  }

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

export default function CareDirectoryPage() {
  const { capabilities = [] } = useMC();

  if (!capabilities.includes("care.access")) {
    return (
      <CareNoAccessState
        title="Care directory"
        description="Members in care, with their status and last contact."
      />
    );
  }

  return <CareDirectoryContent />;
}

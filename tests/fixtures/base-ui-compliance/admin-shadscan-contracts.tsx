import React, { useRef, useState } from "react";

import { DeleteNamedViewDialog } from "../../../apps/admin/app/(app)/crm/gift-history-dialogs";
import { EveWorkspaceIndex } from "../../../apps/admin/app/(app)/admin/eve/workspace-shell";
import { MobilizeAddCandidateSheet } from "../../../apps/admin/app/(app)/mobilize/mobilize-sections";
import { MissionControlNavigationSearch } from "../../../apps/admin/features/mission-control/components/navigation-search";
import { useInboxShortcuts } from "../../../apps/admin/features/support-hub/components/command/use-inbox-shortcuts";
import { StudioFlowLoading } from "../../../apps/admin/src/cms-ui/web-studio/flows/studio-flow-loading";
import { Button } from "../../../packages/ui/components/shadcn/button";
import { Input } from "../../../packages/ui/components/shadcn/input";

const currentView = {
  id: "current-view",
  name: "Current view",
  isDefault: true,
  schemaVersion: 1,
  pinnedActionId: null,
  settings: null,
};

export function AdminShadscanContracts() {
  const [destination, setDestination] = useState("");
  const [candidateOpen, setCandidateOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [choice, setChoice] = useState("");
  const [supportHandled, setSupportHandled] = useState(false);
  const supportRef = useRef<HTMLDivElement>(null);
  useInboxShortcuts({
    containerRef: supportRef,
    handlers: { openCommandPalette: () => setSupportHandled(true) },
  });

  return (
    <section
      id="admin-shadscan-contracts"
      aria-labelledby="admin-shadscan-title"
      className="space-y-4"
    >
      <h2 id="admin-shadscan-title" className="text-lg font-semibold">
        Admin audit repairs
      </h2>
      <MissionControlNavigationSearch
        role="staff"
        onNavigate={setDestination}
      />
      <output aria-label="Last navigation">
        {destination || "No page selected"}
      </output>
      <Input aria-label="Draft note" placeholder="Write a note" />
      <div ref={supportRef}>
        <Button variant="outline">Focused Support workspace</Button>
        <output aria-label="Support shortcut">
          {supportHandled
            ? "Support shortcut handled"
            : "Waiting for Support shortcut"}
        </output>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => setCandidateOpen(true)}>
          Open candidate fields
        </Button>
        <Button onClick={() => setViewOpen(true)}>
          Choose replacement default
        </Button>
      </div>
      <MobilizeAddCandidateSheet
        open={candidateOpen}
        onOpenChange={setCandidateOpen}
      />
      <DeleteNamedViewDialog
        view={viewOpen ? currentView : null}
        views={[currentView]}
        nextDefaultChoice={choice}
        onCancel={() => setViewOpen(false)}
        onConfirm={() => setViewOpen(false)}
        onNextDefaultChoiceChange={setChoice}
      />
      <StudioFlowLoading />
      <EveWorkspaceIndex />
    </section>
  );
}

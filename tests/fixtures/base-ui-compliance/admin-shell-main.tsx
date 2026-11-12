import { createClearedEveKillSwitchState } from "@asym/api/eve/governance/types";
import React from "react";
import { createRoot } from "react-dom/client";

// eslint-disable-next-line no-restricted-imports -- AL-1864: Browser fixture exercises the actual audit layout without live governance requests.
import { EveGovernanceView } from "../../../apps/admin/app/(app)/admin/eve/page-client";
// eslint-disable-next-line no-restricted-imports -- AL-1864: Browser fixture exercises the actual Eve panel with inert transport and identity boundaries.
import { EveGlobalPanel } from "../../../apps/admin/app/eve/global-panel";
// eslint-disable-next-line no-restricted-imports -- AL-1864: Browser fixture exercises the actual independent tile actions.
import { TileCard } from "../../../apps/admin/features/mission-control/components/tiles/tile-card";
// eslint-disable-next-line no-restricted-imports -- AL-1864: Browser fixture exercises the actual standalone Studio shell with inert Payload preferences.
import { MissionariesHubView } from "../../../apps/admin/src/cms-ui/web-studio/flows/MissionariesHubView";

import "virtual:base-ui-styles";

const surface = new URLSearchParams(location.search).get("surface");
const auditTarget = `https://example.test/${"a".repeat(200)}`;

createRoot(document.getElementById("root")!).render(
  surface === "studio" ? (
    <MissionariesHubView />
  ) : surface === "audit" ? (
    <main className="p-4">
      <EveGovernanceView
        isError={false}
        isLoading={false}
        data={{
          system: {
            source: "persisted",
            releaseEnabled: false,
            emergencyOff: false,
            killSwitchState: createClearedEveKillSwitchState(),
            policyStatus: "not_configured",
            stateVersion: 1,
            updatedAt: "2026-07-17T00:00:00.000Z",
          },
          recentRuns: [],
          auditHistory: [
            {
              id: "fixture-event",
              actorId: "verified-admin",
              identityMode: "admin",
              initiatorType: "authenticated_admin",
              initiatorId: "verified-admin",
              policyId: "eve-governance-kernel",
              policyStatus: "not_configured",
              action: "governance.inspect",
              target: auditTarget,
              result: "succeeded",
              modelRole: "not_used",
              evidenceSummary: "Redacted evidence",
              changeSummary: "No changes",
              decisionSummary: "Authorized inspection",
              debugMetadata: {},
              redactionVersion: "eve-audit-v1",
              createdAt: "2026-07-17T00:00:00.000Z",
            },
          ],
        }}
      />
    </main>
  ) : surface === "tile" ? (
    <main className="mx-auto max-w-md p-4">
      <TileCard
        tile={{
          id: "fixture",
          title: "Fixture workspace",
          route: "#workspace",
          icon: "Settings",
          purpose: "Exercise independent action targets",
          inside: "Workspace contents",
          quickActions: [
            { label: "First action", href: "#first" },
            { label: "Second action", href: "#second" },
          ],
          roles: ["admin"],
        }}
      />
    </main>
  ) : (
    <EveGlobalPanel />
  ),
);

import { useState } from "react";

import type { SupportLabel, SupportMacro } from "@asym/database/hooks";

const agents = [
  { id: "agent-a", name: "W".repeat(75) + " Lastname", avatarUrl: null },
  { id: "agent-b", name: "Camille Support", avatarUrl: null },
];

const labels = [
  {
    id: "label-a",
    slug: "escalation-alpha",
    name: "CustomerEscalationTierAlpha",
  },
  {
    id: "label-b",
    slug: "escalation-beta",
    name: "CustomerEscalationTierBeta",
  },
  { id: "label-c", slug: "long-label", name: "W".repeat(76) + "Zeta" },
].map<SupportLabel>((label) => ({
  ...label,
  tenantId: "tenant-a",
  tone: "blue",
  description: null,
}));

const macroPrefix = "DonorEscalationWorkflowPrioritySyncPending";
const macros = [
  macroPrefix + "Alpha",
  macroPrefix + "Beta",
  "W".repeat(75) + "Omega",
].map<SupportMacro>((name, index) => ({
  id: "macro-" + index,
  tenantId: "tenant-a",
  ownerAgentId: null,
  name,
  description: null,
  actions: [{ kind: "set_status", status: "waiting" }],
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-01T00:00:00.000Z",
}));

const reportState = {
  from: "2026-10-01T00:00:00.000Z",
  to: "2026-10-31T00:00:00.000Z",
  groupBy: "day",
  businessHoursOnly: false,
  scopeKind: "agent",
  scopeId: "agent-b",
};

export function useSupportAgents() {
  return { data: agents };
}

export function useSupportInboxes() {
  return { data: [] };
}

export function useSupportLabels() {
  return { data: labels };
}

export function LabelManagerDialog() {
  return null;
}

export function useSupportMacros() {
  return { data: macros };
}

export function useRunSupportMacro() {
  return {
    mutateAsync({ macroId }: { macroId: string }) {
      const result = document.getElementById("support-layout-result");
      if (result) result.textContent = "Ran " + macroId;
      return Promise.resolve({ outcomes: [] });
    },
  };
}

export function useCurrentSupportAgentId() {
  return "agent-b";
}

export function useAssignSupportConversation() {
  return {
    mutate({ assigneeAgentId }: { assigneeAgentId: string | null }) {
      const result = document.getElementById("support-layout-result");
      if (result) result.textContent = "Assigned " + assigneeAgentId;
    },
  };
}

export function useSupportReportRouteState() {
  const [state, setState] = useState(reportState);
  return {
    state,
    setState: (patch: Partial<typeof reportState>) => {
      setState((previous) => ({ ...previous, ...patch }));
    },
    resetState: () => setState(reportState),
  };
}

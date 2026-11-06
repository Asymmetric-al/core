import { useState } from "react";

const agents = [
  { id: "agent-a", name: "W".repeat(75) + " Lastname", avatarUrl: null },
  { id: "agent-b", name: "Camille Support", avatarUrl: null },
];

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
  return { data: [] };
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

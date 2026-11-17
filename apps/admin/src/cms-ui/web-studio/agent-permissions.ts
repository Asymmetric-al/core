import type { AgentPermission } from "@asym/ui/components/primitives/agent-bridge";

/**
 * What an agent may do in Web Studio: reorder the View menu's column order
 * (a viewer preference Payload saves), its one UI SDK-backed control. The
 * label pins the grant to that list; no `confirm`, so a step under
 * `data-agent-confirm` stays with the person. The Payload layout mounts the
 * bridge, because Web Studio renders outside Mission Control's shell.
 */
export const WEB_STUDIO_AGENT_PERMISSIONS: AgentPermission[] = [
  { component: "sortable-list", label: "Column order", actions: ["move"] },
];

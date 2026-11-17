"use client";

import { useEffect, useRef } from "react";

import type {
  AgentAction,
  createAgent,
  registerTools,
} from "@ui-sdk/react/agent";

/** One step an agent asks to run, as UI SDK resolved it: the component's `ref`, `component` and `label`, the `action` with its `args`, and the `data-agent-confirm` sentence as `confirm`. */
export type AgentRequest = AgentAction;

/** Lets an agent run `actions` on a UI SDK component, like `{ component: "sortable-list", actions: ["move"] }`; `label` narrows it to the one with that accessible name. */
export type AgentPermission = {
  component: string;
  actions: readonly string[];
  label?: string;
};

/** Asks the person about a step marked `data-agent-confirm`; only `true` lets it run. `signal` aborts when the step stops waiting, so the prompt can close. */
export type AgentConfirm = (
  message: string,
  context: { request: AgentRequest; signal: AbortSignal },
) => Promise<boolean>;

/** The page's UI SDK components as an agent sees them: `snapshot` lists them, `query` finds them, `act` runs steps under the mounted `AgentBridge` allowlists. */
export type AgentBridgeHandle = Pick<
  ReturnType<typeof createAgent>,
  "snapshot" | "query" | "act"
>;

export type AgentBridgeProps = {
  /** What an agent may do. Anything not listed is refused. */
  allow: readonly AgentPermission[];
  /** Without it, a step marked `data-agent-confirm` is refused. */
  confirm?: AgentConfirm;
};

type Grant = AgentBridgeProps;

type Loaded = {
  agent: ReturnType<typeof createAgent>;
  registerTools: typeof registerTools;
};

// Kept on the document, not in module scope, so strict mode, a second mount
// and a hot reload all reach the one bridge UI SDK cannot destroy.
type BridgeState = {
  grants: Set<Grant>;
  loaded?: Promise<Loaded>;
  registering?: boolean;
  unregisterTools?: () => void;
};

const STATE = Symbol.for("asym.ui.agent-bridge");

function bridgeState(): BridgeState {
  const host = document as Document & { [STATE]?: BridgeState };
  return (host[STATE] ??= { grants: new Set() });
}

function grantsFor(state: BridgeState, request: AgentRequest) {
  return [...state.grants].filter((grant) =>
    grant.allow.some(
      (rule) =>
        rule.component === request.component &&
        rule.actions.includes(request.action) &&
        (rule.label === undefined || rule.label === request.label),
    ),
  );
}

// UI SDK keeps its own marks: `data-agent-hidden` hides a region from
// snapshot, query and act, `data-agent-secret` reads values as "[redacted]",
// and `data-agent-confirm` puts its sentence in `request.confirm`, asked here.
async function decide(
  state: BridgeState,
  request: AgentRequest,
  signal: AbortSignal,
): Promise<boolean> {
  const grants = grantsFor(state, request);
  if (grants.length === 0) return false;
  if (request.confirm === undefined) return true;
  const confirm = grants.find((grant) => grant.confirm)?.confirm;
  if (!confirm) return false;
  try {
    return (await confirm(request.confirm, { request, signal })) === true;
  } catch {
    return false;
  }
}

function load(state: BridgeState): Promise<Loaded> {
  return (state.loaded ??= import("@ui-sdk/react/agent").then(
    ({ createAgent, registerTools }) => ({
      agent: createAgent({
        allow: (request, { signal }) => decide(state, request, signal),
      }),
      registerTools,
    }),
    (error: unknown) => {
      state.loaded = undefined;
      throw error;
    },
  ));
}

/** Resolves to the document's one bridge, loading UI SDK's agent entry on first call. Rejects outside the browser. */
export function getAgentBridge(): Promise<AgentBridgeHandle> {
  if (typeof document === "undefined") {
    return Promise.reject(new Error("The agent bridge runs in the browser."));
  }
  return load(bridgeState()).then(({ agent }) => agent);
}

// The feature check UI SDK documents for WebMCP registration.
function hasWebMcp() {
  const { modelContext } = document as Document & {
    modelContext?: { registerTool?: unknown };
  };
  return typeof modelContext?.registerTool === "function";
}

function syncTools(state: BridgeState) {
  if (state.grants.size === 0) {
    state.unregisterTools?.();
    state.unregisterTools = undefined;
    return;
  }
  if (state.unregisterTools || state.registering || !hasWebMcp()) return;
  state.registering = true;
  load(state).then(
    ({ agent, registerTools }) => {
      state.registering = false;
      if (state.grants.size === 0 || state.unregisterTools) return;
      // The agent's own `allow` has already run `decide`, confirm included;
      // this re-checks the allowlist without asking the person twice.
      state.unregisterTools = registerTools(agent, {
        allow: (request) => grantsFor(state, request).length > 0,
      });
    },
    () => {
      state.registering = false;
    },
  );
}

function mountGrant(grant: Grant) {
  const state = bridgeState();
  state.grants.add(grant);
  syncTools(state);
  return () => {
    state.grants.delete(grant);
    syncTools(state);
  };
}

/**
 * Lets an agent use the page's UI SDK components within `allow`, and offers
 * them to the browser's agent where it has WebMCP. Renders nothing; loads no
 * SDK code until a WebMCP browser or `getAgentBridge` needs it.
 */
export function AgentBridge({ allow, confirm }: AgentBridgeProps): null {
  const grant = useRef<Grant>({ allow, confirm });

  useEffect(() => {
    grant.current.allow = allow;
    grant.current.confirm = confirm;
  }, [allow, confirm]);

  useEffect(() => mountGrant(grant.current), []);

  return null;
}

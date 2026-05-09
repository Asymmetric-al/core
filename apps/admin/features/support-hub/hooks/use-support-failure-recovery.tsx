"use client";

import * as React from "react";

export type SupportFailureKind =
  | "send-reply"
  | "save-draft"
  | "add-note"
  | "assign"
  | "set-status"
  | "toggle-label"
  | "snooze"
  | "run-macro";

export interface SupportFailureRecord {
  id: string;
  kind: SupportFailureKind;
  message: string;
  conversationId: string | null;
  /** Sync retry callback. The composer / bulk-action surface invokes it. */
  retry: () => Promise<void> | void;
  /** Set when the failure was reported. */
  occurredAt: string;
}

interface SupportFailureRecoveryContextValue {
  failure: SupportFailureRecord | null;
  report: (record: Omit<SupportFailureRecord, "id" | "occurredAt">) => void;
  clear: () => void;
}

const SupportFailureRecoveryContext =
  React.createContext<SupportFailureRecoveryContextValue | null>(null);

interface ProviderProps {
  children: React.ReactNode;
}

/**
 * Owns the "last failed mutation" record so the composer + bulk-action
 * surfaces can render an inline retry banner without prop drilling. Mounted
 * inside `<SupportInbox />` alongside the existing palette + now providers.
 */
export function SupportFailureRecoveryProvider({ children }: ProviderProps) {
  const [failure, setFailure] = React.useState<SupportFailureRecord | null>(
    null,
  );

  const value = React.useMemo<SupportFailureRecoveryContextValue>(
    () => ({
      failure,
      report: (record) => {
        setFailure({
          ...record,
          id: generateFailureId(),
          occurredAt: new Date().toISOString(),
        });
      },
      clear: () => setFailure(null),
    }),
    [failure],
  );

  return (
    <SupportFailureRecoveryContext.Provider value={value}>
      {children}
    </SupportFailureRecoveryContext.Provider>
  );
}

export function useSupportFailureRecovery(): SupportFailureRecoveryContextValue {
  const value = React.useContext(SupportFailureRecoveryContext);
  if (!value) {
    throw new Error(
      "useSupportFailureRecovery must be used inside <SupportFailureRecoveryProvider />.",
    );
  }
  return value;
}

function generateFailureId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `fail-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;
}

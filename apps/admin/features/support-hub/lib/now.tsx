"use client";

import * as React from "react";

const SupportNowContext = React.createContext<string | null>(null);

interface SupportNowProviderProps {
  /** Tick interval in ms. Defaults to one minute, fast enough for relative timestamps. */
  intervalMs?: number;
  children: React.ReactNode;
}

/**
 * Provides a single ISO "now" value to every consumer in the inbox tree so
 * relative-time cells and DnD cards stay pure during render. Recomputes on a
 * timer rather than on every render — so `formatRelative` and `isPastDue`
 * see a stable value within a single React commit.
 */
export function SupportNowProvider({
  intervalMs = 60_000,
  children,
}: SupportNowProviderProps) {
  const [nowIso, setNowIso] = React.useState(() => new Date().toISOString());

  React.useEffect(() => {
    const handle = window.setInterval(() => {
      setNowIso(new Date().toISOString());
    }, intervalMs);
    return () => window.clearInterval(handle);
  }, [intervalMs]);

  return (
    <SupportNowContext.Provider value={nowIso}>
      {children}
    </SupportNowContext.Provider>
  );
}

/**
 * Returns the provider's "now". Outside a provider it returns the fixed
 * epoch `FALLBACK_NOW`, never the real clock, so renders stay pure;
 * `SupportInbox` and `SupportWorkspaceShell` both mount the provider.
 */
export function useSupportNow(): string {
  const value = React.use(SupportNowContext);
  return value ?? FALLBACK_NOW;
}

const FALLBACK_NOW = "1970-01-01T00:00:00.000Z";

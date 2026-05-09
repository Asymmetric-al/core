"use client";

import * as React from "react";

interface SupportCommandPaletteContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const SupportCommandPaletteContext =
  React.createContext<SupportCommandPaletteContextValue | null>(null);

interface ProviderProps {
  children: React.ReactNode;
}

/**
 * Owns the open / close state of `<SupportCommandPalette />`. Mounted once
 * inside `<SupportInbox />` so every nested component (keyboard hook, header,
 * composer chrome) can share a single open state.
 */
export function SupportCommandPaletteProvider({ children }: ProviderProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const value = React.useMemo<SupportCommandPaletteContextValue>(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((prev) => !prev),
    }),
    [isOpen],
  );

  return (
    <SupportCommandPaletteContext.Provider value={value}>
      {children}
    </SupportCommandPaletteContext.Provider>
  );
}

export function useSupportCommandPalette(): SupportCommandPaletteContextValue {
  const value = React.useContext(SupportCommandPaletteContext);
  if (!value) {
    throw new Error(
      "useSupportCommandPalette must be used inside <SupportCommandPaletteProvider />",
    );
  }
  return value;
}

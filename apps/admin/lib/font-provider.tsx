"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type FontPairing = "product" | "modern-clean" | "minimal";

const STORAGE_KEY = "admin-font-pairing";
const DEFAULT_FONT: FontPairing = "product";
const VALID: FontPairing[] = ["product", "modern-clean", "minimal"];

interface FontContextValue {
  font: FontPairing;
  setFont: (font: FontPairing) => void;
}

const FontContext = createContext<FontContextValue>({
  font: DEFAULT_FONT,
  setFont: () => {},
});

export function useFontPairing() {
  return useContext(FontContext);
}

function applyFont(font: FontPairing) {
  document.documentElement.setAttribute("data-font", font);
}

function readStoredFont(): FontPairing {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as FontPairing | null;
    return stored && (VALID as string[]).includes(stored) ? stored : DEFAULT_FONT;
  } catch {
    return DEFAULT_FONT;
  }
}

/** Inline script injected into <head> — reads localStorage before first paint to avoid FOUC. */
export const FONT_INLINE_SCRIPT = `(function(){try{var v=["product","modern-clean","minimal"],f=localStorage.getItem("${STORAGE_KEY}");document.documentElement.setAttribute("data-font",v.includes(f)?f:"${DEFAULT_FONT}");}catch(e){}})();`;

export function FontProvider({ children }: { children: React.ReactNode }) {
  const [font, setFontState] = useState<FontPairing>(readStoredFont);

  useEffect(() => {
    applyFont(font);
  }, [font]);

  const setFont = useCallback((next: FontPairing) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    setFontState(next);
    applyFont(next);
  }, []);

  return (
    <FontContext.Provider value={{ font, setFont }}>
      {children}
    </FontContext.Provider>
  );
}

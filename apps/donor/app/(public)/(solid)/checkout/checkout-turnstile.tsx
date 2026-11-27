"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = {
  render: (
    element: HTMLElement,
    options: Record<string, unknown>,
  ) => string | undefined;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let loading: Promise<TurnstileApi | null> | null = null;

function loadTurnstile(): Promise<TurnstileApi | null> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  loading ??= new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(window.turnstile ?? null);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
  return loading;
}

export function CheckoutTurnstile({
  siteKey,
  onToken,
  resetSignal,
}: {
  siteKey: string;
  onToken: (token: string | null) => void;
  resetSignal: number;
}) {
  const container = useRef<HTMLDivElement>(null);
  const widget = useRef<string | undefined>(undefined);
  const api = useRef<TurnstileApi | null>(null);

  useEffect(() => {
    let active = true;
    void loadTurnstile().then((turnstile) => {
      if (!active || !turnstile || !container.current) return;
      api.current = turnstile;
      widget.current = turnstile.render(container.current, {
        sitekey: siteKey,
        appearance: "interaction-only",
        "refresh-expired": "auto",
        callback: (token: string) => onToken(token),
        "expired-callback": () => onToken(null),
        "error-callback": () => onToken(null),
      });
    });
    return () => {
      active = false;
      if (widget.current) api.current?.remove(widget.current);
    };
  }, [siteKey, onToken]);

  useEffect(() => {
    if (resetSignal === 0 || !api.current) return;
    onToken(null);
    api.current.reset(widget.current);
  }, [resetSignal, onToken]);

  return <div ref={container} className="min-h-0" />;
}

"use client";

import * as React from "react";
import { preload } from "react-dom";

import { cn } from "../../lib/utils";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const WIDE_STILL_QUERY = "(min-aspect-ratio: 3/4)";
const ULTRAWIDE_QUERY = "(aspect-ratio > 4/1)";

export type SignInBackdropPhase = "still" | "animating" | "settled" | "failed";

export interface SignInBackdropStills {
  narrow: string;
  wide: string;
}

export interface SignInBackdropProps {
  stills: SignInBackdropStills;
  children: React.ReactNode;
}

export function SignInBackdrop({ stills, children }: SignInBackdropProps) {
  const layerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const doneRef = React.useRef(false);
  const [phase, setPhase] = React.useState<SignInBackdropPhase>("still");
  preload(stills.narrow, {
    as: "image",
    fetchPriority: "high",
    media: `not all and ${WIDE_STILL_QUERY}`,
  });
  preload(stills.wide, {
    as: "image",
    fetchPriority: "high",
    media: WIDE_STILL_QUERY,
  });

  React.useEffect(() => {
    const layer = layerRef.current;
    const canvas = canvasRef.current;
    if (!layer || !canvas) return;
    const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const ultrawideQuery = window.matchMedia(ULTRAWIDE_QUERY);
    let controller: AbortController | null = null;

    function finish(owner: AbortController, next: SignInBackdropPhase) {
      if (owner !== controller) return;
      doneRef.current = true;
      controller = null;
      owner.abort();
      setPhase(next);
    }

    function start(
      layerElement: HTMLDivElement,
      canvasElement: HTMLCanvasElement,
    ) {
      if (
        doneRef.current ||
        controller ||
        motionQuery.matches ||
        ultrawideQuery.matches
      )
        return;
      const owner = new AbortController();
      controller = owner;
      import("./sign-in-shader")
        .then(({ createShader, resolveCssColorHex }) => {
          owner.signal.throwIfAborted();
          const background = resolveCssColorHex(
            getComputedStyle(layerElement).backgroundColor,
          );
          if (!background)
            throw new Error("The backdrop colour is unreadable.");
          return createShader(canvasElement, {
            theme: document.documentElement.classList.contains("dark")
              ? "dark"
              : "light",
            background: { dark: background, light: background },
            signal: owner.signal,
            onReady: () => setPhase("animating"),
            onSettled: () => finish(owner, "settled"),
            onError: () => finish(owner, "failed"),
          });
        })
        .catch(() => finish(owner, "failed"));
    }

    function onMotionPreferenceChange() {
      if (!motionQuery.matches) {
        if (layer && canvas) start(layer, canvas);
      } else if (controller) {
        finish(controller, "still");
      }
    }

    function holdStill() {
      const owner = controller;
      if (!owner) return;
      controller = null;
      owner.abort();
      setPhase("still");
    }

    function onUltrawideChange() {
      if (!ultrawideQuery.matches) {
        if (layer && canvas) start(layer, canvas);
        return;
      }
      holdStill();
    }

    start(layer, canvas);
    motionQuery.addEventListener("change", onMotionPreferenceChange);
    ultrawideQuery.addEventListener("change", onUltrawideChange);
    return () => {
      motionQuery.removeEventListener("change", onMotionPreferenceChange);
      ultrawideQuery.removeEventListener("change", onUltrawideChange);
      const owner = controller;
      controller = null;
      owner?.abort();
      setPhase((previous) => (previous === "animating" ? "still" : previous));
    };
  }, []);

  const revealed = phase === "animating";

  return (
    <div className="relative isolate min-h-dvh bg-muted *:data-[slot=auth-shell]:bg-transparent">
      <div
        ref={layerRef}
        aria-hidden="true"
        data-slot="sign-in-backdrop"
        data-state={phase}
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-muted bg-(image:--sign-in-still-narrow) bg-cover bg-center bg-no-repeat [@media(min-aspect-ratio:3/4)]:bg-(image:--sign-in-still-wide)"
        style={
          {
            "--sign-in-still-narrow": `url("${stills.narrow}")`,
            "--sign-in-still-wide": `url("${stills.wide}")`,
          } satisfies React.CSSProperties & {
            "--sign-in-still-narrow": string;
            "--sign-in-still-wide": string;
          }
        }
      >
        <canvas
          ref={canvasRef}
          className={cn(
            "absolute inset-0 size-full opacity-0 transition-opacity duration-(--duration-drawer) ease-(--ease-out-soft)",
            revealed && "opacity-100",
          )}
        />
        <div className="absolute inset-0 bg-muted/30 bg-radial from-muted/75 to-transparent to-70% max-sm:bg-muted/45" />
      </div>
      {children}
    </div>
  );
}

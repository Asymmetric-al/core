"use client";

import { Pause, Play } from "lucide-react";
import * as React from "react";

import { cn } from "../../lib/utils";
import { Button } from "../shadcn/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip";

import type { SignInShaderHandle } from "./sign-in-shader";

const PAUSED_STORAGE_KEY = "asym:sign-in-backdrop:paused";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export type SignInBackdropPhase = "still" | "playing" | "paused" | "failed";

export interface SignInBackdropStills {
  narrow: string;
  wide: string;
}

export interface SignInBackdropProps {
  stills: SignInBackdropStills;
  children: React.ReactNode;
}

function readPausedPreference() {
  try {
    return window.localStorage.getItem(PAUSED_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function writePausedPreference(paused: boolean) {
  try {
    if (paused) window.localStorage.setItem(PAUSED_STORAGE_KEY, "true");
    else window.localStorage.removeItem(PAUSED_STORAGE_KEY);
  } catch {
    return;
  }
}

export function SignInBackdrop({ stills, children }: SignInBackdropProps) {
  const layerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const shaderRef = React.useRef<SignInShaderHandle | null>(null);
  const failedRef = React.useRef(false);
  const [phase, setPhase] = React.useState<SignInBackdropPhase>("still");

  React.useEffect(() => {
    const layer = layerRef.current;
    const canvas = canvasRef.current;
    if (!layer || !canvas) return;
    const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    let attempt = 0;

    function stop() {
      attempt += 1;
      shaderRef.current?.destroy();
      shaderRef.current = null;
    }

    function fail() {
      failedRef.current = true;
      stop();
      setPhase("failed");
    }

    function start(
      layerElement: HTMLDivElement,
      canvasElement: HTMLCanvasElement,
    ) {
      if (failedRef.current || motionQuery.matches || shaderRef.current) return;
      attempt += 1;
      const current = attempt;
      const paused = readPausedPreference();
      import("./sign-in-shader")
        .then((shader) => {
          if (current !== attempt) return;
          const background = shader.resolveCssColor(
            getComputedStyle(layerElement).backgroundColor,
          );
          if (!background)
            throw new Error("The backdrop colour is unreadable.");
          shaderRef.current = shader.createSignInShader(canvasElement, {
            background,
            paused,
            onReady: () => setPhase(paused ? "paused" : "playing"),
            onFailure: fail,
          });
        })
        .catch(() => {
          if (current === attempt) fail();
        });
    }

    function onMotionPreferenceChange() {
      if (!motionQuery.matches) {
        if (layer && canvas) start(layer, canvas);
        return;
      }
      stop();
      setPhase((previous) => (previous === "failed" ? previous : "still"));
    }

    start(layer, canvas);
    motionQuery.addEventListener("change", onMotionPreferenceChange);
    return () => {
      motionQuery.removeEventListener("change", onMotionPreferenceChange);
      stop();
      setPhase((previous) => (previous === "failed" ? previous : "still"));
    };
  }, []);

  const animated = phase === "playing" || phase === "paused";
  const paused = phase === "paused";
  const toggleLabel = paused
    ? "Play background animation"
    : "Pause background animation";

  function togglePaused() {
    const next = !paused;
    shaderRef.current?.setPaused(next);
    writePausedPreference(next);
    setPhase(next ? "paused" : "playing");
  }

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
          } as React.CSSProperties
        }
      >
        <canvas
          ref={canvasRef}
          className={cn(
            "absolute inset-0 size-full opacity-0 transition-opacity duration-(--duration-drawer) ease-(--ease-out-soft)",
            animated && "opacity-100",
          )}
        />
        <div className="absolute inset-0 bg-muted/30 bg-radial from-muted/75 to-transparent to-70%" />
      </div>
      {children}
      {animated ? (
        <aside
          aria-label="Background animation"
          className={cn(
            "fixed right-4 z-10",
            process.env.NODE_ENV === "development" ? "bottom-20" : "bottom-4",
          )}
        >
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={toggleLabel}
                  onClick={togglePaused}
                />
              }
            >
              {paused ? (
                <Play aria-hidden="true" />
              ) : (
                <Pause aria-hidden="true" />
              )}
            </TooltipTrigger>
            <TooltipContent side="left">{toggleLabel}</TooltipContent>
          </Tooltip>
        </aside>
      ) : null}
    </div>
  );
}

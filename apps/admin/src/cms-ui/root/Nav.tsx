"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import { LazyMotion, m, useReducedMotion } from "motion/react";

import { loadAdminMotionFeatures } from "./load-motion-features";

export function Nav() {
  const reduceMotion = useReducedMotion();

  return (
    <LazyMotion features={loadAdminMotionFeatures}>
      <m.div
        initial={
          reduceMotion ? false : { opacity: 0, transform: "translateY(8px)" }
        }
        animate={{ opacity: 1, transform: "none" }}
        transition={
          reduceMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }
        }
        className="payload-admin-wrapper px-4 pt-4 pb-2"
      >
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="flex items-center justify-between px-3 py-2.5">
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Mission Control
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
                Site Studio
              </span>
            </div>
            <Badge
              variant="secondary"
              className="font-semibold uppercase tracking-[0.12em]"
            >
              Payload
            </Badge>
          </CardContent>
        </Card>
      </m.div>
    </LazyMotion>
  );
}

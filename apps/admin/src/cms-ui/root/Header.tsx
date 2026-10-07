"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import { LazyMotion, m, useReducedMotion } from "motion/react";

import { loadAdminMotionFeatures } from "./load-motion-features";

export function Header() {
  const reduceMotion = useReducedMotion();

  return (
    <LazyMotion features={loadAdminMotionFeatures}>
      <m.div
        initial={
          reduceMotion ? false : { opacity: 0, transform: "translateY(8px)" }
        }
        animate={{ opacity: 1, transform: "none" }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.24, ease: "easeOut", delay: 0.04 }
        }
        className="payload-admin-wrapper"
      >
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="flex items-center justify-between gap-3 px-3 py-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <span className="inline-flex size-2 rounded-full bg-primary" />
              Tenant-safe publishing is active
            </div>
            <Badge
              variant="outline"
              className="font-semibold uppercase tracking-[0.12em]"
            >
              staff only
            </Badge>
          </CardContent>
        </Card>
      </m.div>
    </LazyMotion>
  );
}

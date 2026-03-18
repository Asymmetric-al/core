"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import {
  AuthButton,
  AuthCard,
  AuthCardContent,
  AuthCardDescription,
  AuthCardHeader,
  AuthCardTitle,
} from "./auth-primitives";

export interface DemoOnlyLoginCardProps {
  title: string;
  subtitle?: string;
  helperText?: string;
  buttonLabel?: string;
  isLoading?: boolean;
  error?: string | null;
  onDemoLogin: () => void | Promise<void>;
}

export function DemoOnlyLoginCard({
  title,
  subtitle = "Enter the demo environment",
  helperText,
  buttonLabel = "Demo Access",
  isLoading = false,
  error,
  onDemoLogin,
}: DemoOnlyLoginCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <AuthCard>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-muted to-transparent" />
        <AuthCardHeader>
          <AuthCardTitle>{title}</AuthCardTitle>
          <AuthCardDescription>{subtitle}</AuthCardDescription>
        </AuthCardHeader>
        <AuthCardContent>
          <AuthButton type="button" loading={isLoading} onClick={onDemoLogin}>
            {buttonLabel}
          </AuthButton>

          {helperText ? (
            <p className="text-center text-xs text-muted-foreground">
              {helperText}
            </p>
          ) : null}

          <AnimatePresence mode="wait">
            {error ? (
              <motion.p
                key="demo-error"
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={{ duration: 0.16 }}
                className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </AuthCardContent>
      </AuthCard>
    </motion.div>
  );
}

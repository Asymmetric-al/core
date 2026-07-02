"use client";

import { AnimatePresence, motion, useReducedMotion } from "@asym/lib/motion";
import Link from "next/link";
import * as React from "react";

import {
  AuthButton,
  AuthCard,
  AuthCardContent,
  AuthCardDescription,
  AuthCardHeader,
  AuthCardTitle,
  AuthInput,
  AuthLabel,
  AuthSeparator,
} from "./auth-primitives";

export interface FullLoginCardProps {
  title: string;
  subtitle?: string;
  email: string;
  password: string;
  isLoading?: boolean;
  error?: string | null;
  demoEnabled?: boolean;
  demoLoading?: boolean;
  forgotPasswordHref?: string;
  registerHref?: string;
  showRegisterLink?: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  onDemoLogin?: () => void | Promise<void>;
}

export function FullLoginCard({
  title,
  subtitle = "Sign in to continue",
  email,
  password,
  isLoading = false,
  error,
  demoEnabled = false,
  demoLoading = false,
  forgotPasswordHref = "/forgot-password",
  registerHref = "/register",
  showRegisterLink = true,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onDemoLogin,
}: FullLoginCardProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <AuthCard className="backdrop-blur">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-muted to-transparent" />
        <div className="pointer-events-none absolute -top-20 -right-20 hidden size-56 rounded-full bg-muted/50 lg:block" />
        <div className="pointer-events-none absolute -bottom-28 -left-20 hidden size-56 rounded-full bg-muted/40 lg:block" />

        <AuthCardHeader>
          <div className="mx-auto mb-2 grid size-10 place-items-center rounded-xl border border-border bg-background text-xs font-bold tracking-widest">
            GH
          </div>
          <AuthCardTitle>{title}</AuthCardTitle>
          <AuthCardDescription>{subtitle}</AuthCardDescription>
        </AuthCardHeader>

        <AuthCardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <AuthLabel htmlFor="email">Email</AuthLabel>
              <AuthInput
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => onEmailChange(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <AuthLabel htmlFor="password">Password</AuthLabel>
                <Link
                  href={forgotPasswordHref}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <AuthInput
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => onPasswordChange(event.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <AuthButton type="submit" loading={isLoading}>
              Sign In
            </AuthButton>
          </form>

          {demoEnabled && onDemoLogin ? (
            <div className="space-y-3">
              <div className="relative py-1">
                <AuthSeparator />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-[11px] text-muted-foreground">
                  or use demo access
                </span>
              </div>
              <AuthButton
                type="button"
                variant="secondary"
                loading={demoLoading}
                onClick={onDemoLogin}
              >
                Demo Access
              </AuthButton>
            </div>
          ) : null}

          <AnimatePresence mode="wait">
            {error ? (
              <motion.p
                key="login-error"
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

          {showRegisterLink ? (
            <p className="text-center text-sm text-muted-foreground">
              Need an account?{" "}
              <Link
                href={registerHref}
                className="font-medium text-foreground hover:underline"
              >
                Register
              </Link>
            </p>
          ) : null}
        </AuthCardContent>
      </AuthCard>
    </motion.div>
  );
}

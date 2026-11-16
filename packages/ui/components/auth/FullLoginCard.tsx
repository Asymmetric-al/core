"use client";

import { Eye, EyeOff } from "lucide-react";
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
  AuthMark,
  AuthMessage,
} from "./auth-primitives";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../shadcn/input-group";

export interface FullLoginCardProps {
  title: string;
  subtitle?: string;
  email: string;
  password: string;
  isLoading?: boolean;
  error?: string | null;
  demoEnabled?: boolean;
  demoLoading?: boolean;
  /** Null hides the link where password reset is not offered. */
  forgotPasswordHref?: string | null;
  registerHref?: string;
  showRegisterLink?: boolean;
  /** Shown in place of the register link when there is no self sign-up. */
  accountNote?: React.ReactNode;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  onDemoLogin?: () => void | Promise<void>;
}

/**
 * Email and password sign-in on the base-maia Card, with an InputGroup
 * password toggle. The error sits above the submit button and is tied to
 * both fields.
 */

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
  accountNote,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onDemoLogin,
}: FullLoginCardProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const errorId = React.useId();
  const describedBy = error ? errorId : undefined;

  return (
    <AuthCard>
      <AuthCardHeader>
        <AuthMark />
        <AuthCardTitle>{title}</AuthCardTitle>
        <AuthCardDescription>{subtitle}</AuthCardDescription>
      </AuthCardHeader>

      <AuthCardContent>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="flex flex-col gap-2">
            <AuthLabel htmlFor="email">Email</AuthLabel>
            <AuthInput
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="you@example.com"
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <AuthLabel htmlFor="password">Password</AuthLabel>
              {forgotPasswordHref ? (
                <Link
                  href={forgotPasswordHref}
                  // Touch screens give links a 44px minimum height; centre
                  // the text so it lines up with the Password label.
                  className="inline-flex items-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Forgot password?
                </Link>
              ) : null}
            </div>
            <InputGroup>
              <InputGroupInput
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy}
                required
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? (
                    <EyeOff aria-hidden="true" />
                  ) : (
                    <Eye aria-hidden="true" />
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>

          {error ? (
            <AuthMessage id={errorId} tone="error">
              {error}
            </AuthMessage>
          ) : null}

          <AuthButton type="submit" loading={isLoading}>
            Sign in
          </AuthButton>
        </form>

        {demoEnabled && onDemoLogin ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
              or
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
            </div>
            <AuthButton
              type="button"
              variant="secondary"
              loading={demoLoading}
              onClick={onDemoLogin}
            >
              Demo access
            </AuthButton>
          </div>
        ) : null}

        {showRegisterLink ? (
          <p className="text-center text-sm text-muted-foreground">
            Need an account?{" "}
            <Link
              href={registerHref}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Register
            </Link>
          </p>
        ) : accountNote ? (
          <p className="text-center text-sm text-muted-foreground">
            {accountNote}
          </p>
        ) : null}
      </AuthCardContent>
    </AuthCard>
  );
}

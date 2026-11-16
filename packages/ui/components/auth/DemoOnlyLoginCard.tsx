"use client";

import {
  AuthButton,
  AuthCard,
  AuthCardContent,
  AuthCardDescription,
  AuthCardHeader,
  AuthCardTitle,
  AuthMark,
  AuthMessage,
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
  buttonLabel = "Demo access",
  isLoading = false,
  error,
  onDemoLogin,
}: DemoOnlyLoginCardProps) {
  return (
    <AuthCard>
      <AuthCardHeader>
        <AuthMark />
        <AuthCardTitle>{title}</AuthCardTitle>
        <AuthCardDescription>{subtitle}</AuthCardDescription>
      </AuthCardHeader>
      <AuthCardContent>
        <p role="status" aria-atomic="true" className="sr-only">
          {isLoading ? "Opening demo…" : ""}
        </p>
        {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}
        <AuthButton type="button" loading={isLoading} onClick={onDemoLogin}>
          {buttonLabel}
        </AuthButton>
        {helperText ? (
          <p className="text-center text-sm text-muted-foreground">
            {helperText}
          </p>
        ) : null}
      </AuthCardContent>
    </AuthCard>
  );
}

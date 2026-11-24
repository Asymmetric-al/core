"use client";

import {
  appPathname,
  loadDocument,
  withAppBasePath,
} from "@asym/database/document-reload";
import { ownApiFetch } from "@asym/database/own-api";
import {
  captureAndStripInviteFragment,
  consumeInviteFragment,
} from "@asym/lib/monitoring/sentry-policy";
import { MailCheck } from "lucide-react";
import * as React from "react";

import {
  AuthButton,
  AuthCard,
  AuthCardContent,
  AuthCardDescription,
  AuthCardHeader,
  AuthCardTitle,
  AuthMark,
  AuthMessage,
  AuthShell,
} from "./auth-primitives";
import { ButtonLink } from "../shadcn/button";

export interface InvitationDoorwayProps {
  selector: string;
  surfaceName: "Mission Control" | "Missionary Workspace";
  loginHref?: string;
  onNavigate?: (path: string) => void;
}

type AcceptResponse = {
  error?: string;
  code?: string;
  tenant_id?: string;
  redirectPath?: string;
};

export function InvitationDoorway({
  selector,
  surfaceName,
  loginHref = "/login",
  onNavigate,
}: InvitationDoorwayProps) {
  const [verifier, setVerifier] = React.useState<string | null>(null);
  const [checkedHash, setCheckedHash] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [needsSignIn, setNeedsSignIn] = React.useState(false);
  const submissionRef = React.useRef(false);
  const selectorRef = React.useRef(selector);

  const readHashVerifier = React.useCallback(() => {
    captureAndStripInviteFragment();
    const extracted = consumeInviteFragment(
      appPathname(window.location.pathname),
    );
    if (extracted) {
      setVerifier(extracted);
    }
    setCheckedHash(true);
  }, []);

  React.useEffect(() => {
    if (selectorRef.current !== selector) {
      selectorRef.current = selector;
      setVerifier(null);
    }
    readHashVerifier();
    window.addEventListener("hashchange", readHashVerifier);
    return () => {
      window.removeEventListener("hashchange", readHashVerifier);
    };
  }, [readHashVerifier, selector]);

  const signInTarget = `${withAppBasePath(loginHref)}?next=${encodeURIComponent(`/invite/${selector}`)}`;

  const handleAccept = React.useCallback(async () => {
    if (!verifier || submissionRef.current) return;
    submissionRef.current = true;
    setIsSubmitting(true);
    setErrorMessage(null);
    setNeedsSignIn(false);

    try {
      const response = await ownApiFetch("/api/invitations/accept", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ selector, verifier }),
      });

      const payload = (await response
        .json()
        .catch(() => ({}))) as AcceptResponse;

      if (!response.ok) {
        if (response.status === 401 || payload.code === "UNAUTHENTICATED") {
          setNeedsSignIn(true);
          setErrorMessage(
            "Sign in with the invited email address, then reopen your full invitation link to accept.",
          );
          return;
        }
        setErrorMessage(
          payload.error?.trim() ||
            "Invitation is invalid or no longer available.",
        );
        return;
      }

      const destination =
        payload.redirectPath ||
        (payload.tenant_id ? `/${payload.tenant_id}` : "/");
      if (onNavigate) {
        onNavigate(destination);
      } else {
        loadDocument(withAppBasePath(destination));
      }
    } catch {
      setErrorMessage("Could not reach the server. Try again.");
    } finally {
      submissionRef.current = false;
      setIsSubmitting(false);
    }
  }, [onNavigate, selector, verifier]);

  const missingVerifier = checkedHash && !verifier;

  return (
    <AuthShell>
      <AuthCard>
        <AuthCardHeader>
          <AuthMark icon={<MailCheck />} />
          <AuthCardTitle>Accept organization invitation</AuthCardTitle>
          <AuthCardDescription>
            Confirm below to join {surfaceName} with your signed-in account.
          </AuthCardDescription>
        </AuthCardHeader>
        <AuthCardContent>
          <p className="text-center text-sm text-muted-foreground">
            You need an existing account with the invited email address. If you
            are not signed in yet, sign in first and reopen your full invitation
            link.
          </p>

          {missingVerifier ? (
            <AuthMessage tone="error">
              This invitation link is incomplete. Open the full link you
              received to accept it.
            </AuthMessage>
          ) : null}

          {errorMessage ? (
            <AuthMessage tone="error">{errorMessage}</AuthMessage>
          ) : null}

          <AuthButton
            type="button"
            loading={isSubmitting}
            disabled={!checkedHash || !verifier || isSubmitting}
            onClick={() => void handleAccept()}
          >
            Accept invitation
          </AuthButton>

          {needsSignIn ? (
            <ButtonLink
              variant="outline"
              className="w-full"
              render={<a href={signInTarget}>Sign in</a>}
            />
          ) : (
            <div className="text-center">
              <ButtonLink
                variant="link"
                render={<a href={signInTarget}>Need to sign in first?</a>}
              />
            </div>
          )}
        </AuthCardContent>
      </AuthCard>
    </AuthShell>
  );
}

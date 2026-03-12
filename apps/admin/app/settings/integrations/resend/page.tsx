"use client";

import React, { useCallback, useEffect, useReducer, useState } from "react";
import { toast } from "sonner";

import {
  ResendConnectedView,
  ResendDisconnectedView,
  ResendPageHeader,
  ResendTestDialog,
} from "./resend-sections";

import type {
  ConnectResendResponse,
  DeliverabilityWarning,
  DomainAuthentication,
  ResendConnectionStateResponse,
  SenderIdentity,
} from "@asym/email/types";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";
type TestEmailStatus = "idle" | "sending" | "success" | "error";

interface ConnectionState {
  status: ConnectionStatus;
  apiKeyHint?: string;
  senderIdentities: SenderIdentity[];
  domainAuthentication: DomainAuthentication[];
  deliverabilityScore: number;
  warnings: DeliverabilityWarning[];
  error?: string;
}

interface ResendUiState {
  apiKey: string;
  showApiKey: boolean;
  fromEmail: string;
  fromName: string;
  replyToEmail: string;
  showTestDialog: boolean;
  testEmail: string;
  testStatus: TestEmailStatus;
  testError: string | null;
}

type EditableField =
  | "apiKey"
  | "fromEmail"
  | "fromName"
  | "replyToEmail"
  | "testEmail";

type ResendUiAction =
  | { type: "set-field"; field: EditableField; value: string }
  | { type: "toggle-api-key-visibility" }
  | { type: "open-test-dialog" }
  | { type: "close-test-dialog" }
  | { type: "set-test-status"; status: TestEmailStatus }
  | { type: "set-test-error"; error: string | null };

const INITIAL_UI_STATE: ResendUiState = {
  apiKey: "",
  showApiKey: false,
  fromEmail: "",
  fromName: "",
  replyToEmail: "",
  showTestDialog: false,
  testEmail: "",
  testStatus: "idle",
  testError: null,
};

function resendUiReducer(
  state: ResendUiState,
  action: ResendUiAction,
): ResendUiState {
  switch (action.type) {
    case "set-field":
      return {
        ...state,
        [action.field]: action.value,
      };
    case "toggle-api-key-visibility":
      return {
        ...state,
        showApiKey: !state.showApiKey,
      };
    case "open-test-dialog":
      return {
        ...state,
        showTestDialog: true,
        testEmail: "",
        testStatus: "idle",
        testError: null,
      };
    case "close-test-dialog":
      return {
        ...state,
        showTestDialog: false,
      };
    case "set-test-status":
      return {
        ...state,
        testStatus: action.status,
      };
    case "set-test-error":
      return {
        ...state,
        testError: action.error,
      };
    default:
      return state;
  }
}

export default function ResendSettingsPage() {
  const [uiState, dispatchUi] = useReducer(resendUiReducer, INITIAL_UI_STATE);
  const {
    apiKey,
    showApiKey,
    fromEmail,
    fromName,
    replyToEmail,
    showTestDialog,
    testEmail,
    testStatus,
    testError,
  } = uiState;

  const [connection, setConnection] = useState<ConnectionState>({
    status: "disconnected",
    senderIdentities: [],
    domainAuthentication: [],
    deliverabilityScore: 0,
    warnings: [],
  });
  const [isHydratingConnection, setIsHydratingConnection] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function hydrateConnectionState() {
      try {
        const response = await fetch("/api/email/connect", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const data =
          (await response.json()) as ResendConnectionStateResponse & {
            error?: string;
          };
        if (!isActive) {
          return;
        }

        if (!response.ok) {
          setConnection((prev) => ({
            ...prev,
            status: "error",
            error: data.error || "Failed to load Resend connection status",
          }));
          return;
        }

        if (data.defaultFromEmail) {
          dispatchUi({
            type: "set-field",
            field: "fromEmail",
            value: data.defaultFromEmail,
          });
        }
        if (data.defaultFromName) {
          dispatchUi({
            type: "set-field",
            field: "fromName",
            value: data.defaultFromName,
          });
        }
        dispatchUi({
          type: "set-field",
          field: "replyToEmail",
          value: data.replyToEmail ?? "",
        });

        if (!data.connected) {
          setConnection({
            status: "disconnected",
            senderIdentities: [],
            domainAuthentication: [],
            deliverabilityScore: 0,
            warnings: [],
          });
          return;
        }

        setConnection({
          status: "connected",
          apiKeyHint: data.apiKeyHint ?? undefined,
          senderIdentities: data.senderIdentities || [],
          domainAuthentication: data.domainAuthentication || [],
          deliverabilityScore: data.deliverabilityScore || 0,
          warnings: data.warnings || [],
          error: data.error,
        });
      } catch {
        if (!isActive) {
          return;
        }
        setConnection((prev) => ({
          ...prev,
          status: "error",
          error: "Failed to load Resend connection status.",
        }));
      } finally {
        if (isActive) {
          setIsHydratingConnection(false);
        }
      }
    }

    hydrateConnectionState();

    return () => {
      isActive = false;
    };
  }, []);

  const handleConnect = useCallback(async () => {
    if (!apiKey || !fromEmail || !fromName) {
      toast.error("Please fill in all required fields");
      return;
    }

    setConnection((prev) => ({
      ...prev,
      status: "connecting",
      error: undefined,
    }));

    try {
      const response = await fetch("/api/email/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          defaultFromEmail: fromEmail,
          defaultFromName: fromName,
          replyToEmail: replyToEmail || undefined,
        }),
      });

      const data = (await response.json()) as ConnectResendResponse & {
        error?: string;
      };

      if (!data.success) {
        setConnection((prev) => ({
          ...prev,
          status: "error",
          error: data.error || "Failed to connect",
        }));
        toast.error("Connection failed", { description: data.error });
        return;
      }

      setConnection({
        status: "connected",
        apiKeyHint: data.apiKeyHint ?? apiKey.slice(-4),
        senderIdentities: data.senderIdentities || [],
        domainAuthentication: data.domainAuthentication || [],
        deliverabilityScore: data.deliverabilityScore || 0,
        warnings: data.warnings || [],
      });

      toast.success("Resend connected!", {
        description: "Your API key has been validated successfully",
      });
    } catch {
      setConnection((prev) => ({
        ...prev,
        status: "error",
        error: "Network error. Please try again.",
      }));
      toast.error("Connection failed", { description: "Network error" });
    }
  }, [apiKey, fromEmail, fromName, replyToEmail]);

  const handleDisconnect = useCallback(async () => {
    try {
      const response = await fetch("/api/email/connect", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
      };

      if (!response.ok || !data.success) {
        toast.error("Disconnect failed", {
          description: data.error || "Unable to disconnect Resend.",
        });
        return;
      }

      setConnection({
        status: "disconnected",
        senderIdentities: [],
        domainAuthentication: [],
        deliverabilityScore: 0,
        warnings: [],
      });
      dispatchUi({ type: "set-field", field: "apiKey", value: "" });
      toast.info("Resend disconnected");
    } catch {
      toast.error("Disconnect failed", {
        description: "Network error while disconnecting Resend.",
      });
    }
  }, []);

  const handleSendTest = useCallback(async () => {
    if (!testEmail) {
      toast.error("Please enter a test email address");
      return;
    }

    dispatchUi({ type: "set-test-status", status: "sending" });
    dispatchUi({ type: "set-test-error", error: null });

    try {
      const response = await fetch("/api/email/test-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: apiKey || undefined,
          toEmail: testEmail,
          fromEmail: fromEmail || undefined,
          fromName: fromName || undefined,
        }),
      });

      const data = (await response.json()) as {
        success: boolean;
        error?: string;
      };

      if (!data.success) {
        dispatchUi({ type: "set-test-status", status: "error" });
        dispatchUi({
          type: "set-test-error",
          error: data.error || "Failed to send test email",
        });
        return;
      }

      dispatchUi({ type: "set-test-status", status: "success" });
      toast.success("Test email sent!", {
        description: `Check ${testEmail} for the test email`,
      });
    } catch {
      dispatchUi({ type: "set-test-status", status: "error" });
      dispatchUi({
        type: "set-test-error",
        error: "Network error. Please try again.",
      });
    }
  }, [apiKey, testEmail, fromEmail, fromName]);

  if (isHydratingConnection) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Loading Resend integration settings...
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl space-y-8 py-8">
      <ResendPageHeader isConnected={connection.status === "connected"} />

      {connection.status === "connected" ? (
        <ResendConnectedView
          connection={connection}
          onDisconnect={handleDisconnect}
          onOpenTestDialog={() => dispatchUi({ type: "open-test-dialog" })}
        />
      ) : (
        <ResendDisconnectedView
          apiKey={apiKey}
          showApiKey={showApiKey}
          fromEmail={fromEmail}
          fromName={fromName}
          replyToEmail={replyToEmail}
          connectionStatus={connection.status}
          connectionError={connection.error}
          onFieldChange={(field, value) =>
            dispatchUi({ type: "set-field", field, value })
          }
          onToggleApiKeyVisibility={() =>
            dispatchUi({ type: "toggle-api-key-visibility" })
          }
          onConnect={handleConnect}
        />
      )}

      <ResendTestDialog
        open={showTestDialog}
        testEmail={testEmail}
        testStatus={testStatus}
        testError={testError}
        fromName={fromName}
        fromEmail={fromEmail}
        onOpenChange={(open) =>
          dispatchUi({ type: open ? "open-test-dialog" : "close-test-dialog" })
        }
        onTestEmailChange={(value) =>
          dispatchUi({ type: "set-field", field: "testEmail", value })
        }
        onSendTest={handleSendTest}
      />
    </div>
  );
}

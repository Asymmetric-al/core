"use client";

import React, { useCallback, useReducer, useState } from "react";
import { toast } from "sonner";

import {
  SendGridConnectedView,
  SendGridDisconnectedView,
  SendGridPageHeader,
  SendGridTestDialog,
} from "./sendgrid-sections";

import type {
  ConnectSendGridResponse,
  DeliverabilityWarning,
  DomainAuthentication,
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

interface SendGridUiState {
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

type SendGridUiAction =
  | { type: "set-field"; field: EditableField; value: string }
  | { type: "toggle-api-key-visibility" }
  | { type: "open-test-dialog" }
  | { type: "close-test-dialog" }
  | { type: "set-test-status"; status: TestEmailStatus }
  | { type: "set-test-error"; error: string | null };

const INITIAL_UI_STATE: SendGridUiState = {
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

function sendGridUiReducer(
  state: SendGridUiState,
  action: SendGridUiAction,
): SendGridUiState {
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

export default function SendGridSettingsPage() {
  const [uiState, dispatchUi] = useReducer(sendGridUiReducer, INITIAL_UI_STATE);
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

      const data = (await response.json()) as ConnectSendGridResponse & {
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
        apiKeyHint: apiKey.slice(-4),
        senderIdentities: data.senderIdentities || [],
        domainAuthentication: data.domainAuthentication || [],
        deliverabilityScore: data.deliverabilityScore || 0,
        warnings: data.warnings || [],
      });

      toast.success("SendGrid connected!", {
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

  const handleDisconnect = useCallback(() => {
    setConnection({
      status: "disconnected",
      senderIdentities: [],
      domainAuthentication: [],
      deliverabilityScore: 0,
      warnings: [],
    });
    dispatchUi({ type: "set-field", field: "apiKey", value: "" });
    toast.info("SendGrid disconnected");
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
          apiKey,
          toEmail: testEmail,
          fromEmail,
          fromName,
        }),
      });

      const data = (await response.json()) as {
        success: boolean;
        error?: string;
        message?: string;
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

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <SendGridPageHeader isConnected={connection.status === "connected"} />

      {connection.status === "connected" ? (
        <SendGridConnectedView
          connection={connection}
          onDisconnect={handleDisconnect}
          onOpenTestDialog={() => dispatchUi({ type: "open-test-dialog" })}
        />
      ) : (
        <SendGridDisconnectedView
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

      <SendGridTestDialog
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

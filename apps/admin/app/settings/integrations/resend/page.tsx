"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { toResendConnectPayload } from "./resend-form-schema";
import {
  ResendConnectedView,
  ResendDisconnectedView,
  ResendPageHeader,
  ResendTestDialog,
} from "./resend-sections";
import { useResendConnectForm, useResendTestForm } from "./use-resend-forms";

import type {
  ConnectResendResponse,
  DeliverabilityWarning,
  DomainAuthentication,
  ResendConnectionStateResponse,
  SenderIdentity,
  TestSendEmailResponse,
} from "@asym/email/types";

import { fetchWithSupabaseAuth } from "@/lib/authenticated-fetch";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";
type TestEmailStatus = "idle" | "sending" | "success" | "error";

interface ConnectionState {
  status: ConnectionStatus;
  sendReady: boolean;
  hasValidationMetadata: boolean;
  persisted: boolean;
  apiKeyHint?: string;
  validatedAt?: string;
  senderIdentities: SenderIdentity[];
  domainAuthentication: DomainAuthentication[];
  deliverabilityScore: number;
  warnings: DeliverabilityWarning[];
  error?: string;
}

export default function ResendSettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testStatus, setTestStatus] = useState<TestEmailStatus>("idle");
  const [testError, setTestError] = useState<string | null>(null);
  const [connection, setConnection] = useState<ConnectionState>({
    status: "disconnected",
    sendReady: false,
    hasValidationMetadata: false,
    persisted: true,
    senderIdentities: [],
    domainAuthentication: [],
    deliverabilityScore: 0,
    warnings: [],
  });
  const [isHydratingConnection, setIsHydratingConnection] = useState(true);

  const connectForm = useResendConnectForm({
    onSubmit: async (value) => {
      setConnection((prev) => ({
        ...prev,
        status: "connecting",
        error: undefined,
      }));

      try {
        const response = await fetchWithSupabaseAuth("/api/email/connect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toResendConnectPayload(value)),
        });

        const data = (await response.json()) as ConnectResendResponse & {
          error?: string;
        };

        if (!data.success) {
          const errorMessage = data.error || "Failed to connect";
          setConnection((prev) => ({
            ...prev,
            status: "error",
            error: errorMessage,
            warnings: data.warnings || [],
          }));
          toast.error("Connection failed", { description: errorMessage });
          return;
        }

        setConnection({
          status: "connected",
          sendReady: data.sendReady,
          hasValidationMetadata:
            data.senderIdentities !== undefined ||
            data.domainAuthentication !== undefined ||
            data.deliverabilityScore !== undefined,
          persisted: data.persisted ?? true,
          apiKeyHint: data.apiKeyHint ?? value.apiKey.slice(-4),
          validatedAt: data.validatedAt,
          senderIdentities: data.senderIdentities || [],
          domainAuthentication: data.domainAuthentication || [],
          deliverabilityScore: data.deliverabilityScore || 0,
          warnings: data.warnings || [],
        });

        if (data.persisted ?? true) {
          connectForm.reset({
            apiKey: "",
            fromEmail: value.fromEmail,
            fromName: value.fromName,
            replyToEmail: value.replyToEmail,
          });

          toast.success("Resend connected!", {
            description: "Your API key has been validated successfully",
          });
        } else {
          toast.warning("Resend validated for this session", {
            description:
              "This environment cannot persist the connection yet, so the key remains available only until refresh.",
          });
        }
      } catch {
        setConnection((prev) => ({
          ...prev,
          status: "error",
          error: "Network error. Please try again.",
        }));
        toast.error("Connection failed", { description: "Network error" });
      }
    },
  });

  const testForm = useResendTestForm({
    onSubmit: async (value) => {
      setTestStatus("sending");
      setTestError(null);

      try {
        const response = await fetchWithSupabaseAuth("/api/email/test-send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apiKey: connectForm.getFieldValue("apiKey") || undefined,
            toEmail: value.testEmail,
            fromEmail: connectForm.getFieldValue("fromEmail") || undefined,
            fromName: connectForm.getFieldValue("fromName") || undefined,
          }),
        });

        const data = (await response.json()) as TestSendEmailResponse;

        if (!data.success) {
          const errorMessage = data.error || "Failed to send test email";
          setTestStatus("error");
          setTestError(errorMessage);
          return;
        }

        setTestStatus("success");
        if (data.auditLogged === false) {
          toast.warning("Test email sent, but audit logging failed", {
            description:
              data.warning ||
              `Check ${value.testEmail} for the test email, then review server logs for the audit logging failure.`,
          });
          return;
        }

        toast.success("Test email sent!", {
          description: `Check ${value.testEmail} for the test email`,
        });
      } catch {
        setTestStatus("error");
        setTestError("Network error. Please try again.");
      }
    },
  });

  useEffect(() => {
    let isActive = true;

    async function hydrateConnectionState() {
      try {
        const response = await fetchWithSupabaseAuth("/api/email/connect", {
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

        connectForm.reset({
          apiKey: "",
          fromEmail: data.defaultFromEmail ?? "",
          fromName: data.defaultFromName ?? "",
          replyToEmail: data.replyToEmail ?? "",
        });

        if (!data.connected) {
          setConnection({
            status: "disconnected",
            sendReady: data.sendReady,
            hasValidationMetadata: false,
            persisted: data.persisted ?? true,
            validatedAt: undefined,
            senderIdentities: [],
            domainAuthentication: [],
            deliverabilityScore: 0,
            warnings: data.warnings || [],
            error: data.error,
          });
          return;
        }

        setConnection({
          status: "connected",
          sendReady: data.sendReady,
          hasValidationMetadata:
            data.senderIdentities !== undefined ||
            data.domainAuthentication !== undefined ||
            data.deliverabilityScore !== undefined,
          persisted: data.persisted ?? true,
          apiKeyHint: data.apiKeyHint ?? undefined,
          validatedAt: data.validatedAt,
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
      }
      if (isActive) {
        setIsHydratingConnection(false);
      }
    }

    hydrateConnectionState();

    return () => {
      isActive = false;
    };
  }, [connectForm]);

  const handleDisconnect = async () => {
    try {
      const response = await fetchWithSupabaseAuth("/api/email/connect", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
        persisted?: boolean;
      };

      if (!response.ok || !data.success) {
        toast.error("Disconnect failed", {
          description: data.error || "Unable to disconnect Resend.",
        });
        return;
      }

      setConnection({
        status: "disconnected",
        sendReady: false,
        hasValidationMetadata: false,
        persisted: data.persisted ?? connection.persisted,
        validatedAt: undefined,
        senderIdentities: [],
        domainAuthentication: [],
        deliverabilityScore: 0,
        warnings: [],
      });
      connectForm.setFieldValue("apiKey", "");
      toast.info("Resend disconnected");
    } catch {
      toast.error("Disconnect failed", {
        description: "Network error while disconnecting Resend.",
      });
    }
  };

  const handleTestDialogOpenChange = (open: boolean) => {
    setShowTestDialog(open);

    if (open) {
      testForm.reset({ testEmail: "" });
      setTestStatus("idle");
      setTestError(null);
    }
  };

  if (isHydratingConnection) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Loading Resend integration settings...
        </div>
      </div>
    );
  }

  const canSendTestEmail = connection.sendReady;

  return (
    <div className="container max-w-4xl space-y-8 py-8">
      <ResendPageHeader isConnected={connection.status === "connected"} />

      {connection.status === "connected" ? (
        <ResendConnectedView
          canSendTestEmail={canSendTestEmail}
          connection={connection}
          onDisconnect={handleDisconnect}
          onOpenTestDialog={() => handleTestDialogOpenChange(true)}
        />
      ) : (
        <ResendDisconnectedView
          connectionWarnings={connection.warnings}
          connectionError={connection.error}
          connectionStatus={connection.status}
          form={connectForm}
          showApiKey={showApiKey}
          onToggleApiKeyVisibility={() =>
            setShowApiKey((currentValue) => !currentValue)
          }
        />
      )}

      <ResendTestDialog
        form={testForm}
        fromEmail={String(connectForm.getFieldValue("fromEmail") ?? "")}
        fromName={String(connectForm.getFieldValue("fromName") ?? "")}
        open={showTestDialog}
        testError={testError}
        testStatus={testStatus}
        onOpenChange={handleTestDialogOpenChange}
      />
    </div>
  );
}

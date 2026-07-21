"use client";

import { Alert, AlertDescription } from "@asym/ui/components/shadcn/alert";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BellRing } from "lucide-react";

import type {
  EveNotificationAdminView,
  EveNotificationChannel,
} from "@asym/api/eve/notifications";

interface NotificationResponse extends EveNotificationAdminView {
  requestId: string;
}

const QUERY_KEY = ["admin", "eve", "notifications"] as const;

async function loadNotifications(): Promise<NotificationResponse> {
  const response = await fetch("/api/admin/eve/notifications", {
    credentials: "same-origin",
    headers: { accept: "application/json" },
  });
  if (!response.ok) throw new Error("Could not load Eve notifications.");
  return (await response.json()) as NotificationResponse;
}

async function updateChannel(input: {
  channel: EveNotificationChannel;
  enabled?: boolean;
  paused?: boolean;
}): Promise<NotificationResponse> {
  const response = await fetch("/api/admin/eve/notifications", {
    method: "PATCH",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind: "channel", ...input }),
  });
  const body = (await response.json().catch(() => null)) as
    | NotificationResponse
    | { error?: string }
    | null;
  if (!response.ok) {
    throw new Error(body && "error" in body ? body.error : "Update failed.");
  }
  return body as NotificationResponse;
}

async function updateRecipient(input: {
  profileId: string;
  enabled: boolean;
  optedOut: boolean;
}): Promise<NotificationResponse> {
  const response = await fetch("/api/admin/eve/notifications", {
    method: "PATCH",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ kind: "recipient", ...input }),
  });
  const body = (await response.json().catch(() => null)) as
    | NotificationResponse
    | { error?: string }
    | null;
  if (!response.ok) {
    throw new Error(body && "error" in body ? body.error : "Update failed.");
  }
  return body as NotificationResponse;
}

export function EveNotificationsPanel() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: loadNotifications,
    staleTime: 15_000,
    refetchInterval: 30_000,
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: (
      input:
        | ({ kind: "channel" } & Parameters<typeof updateChannel>[0])
        | ({ kind: "recipient" } & Parameters<typeof updateRecipient>[0]),
    ) =>
      input.kind === "channel" ? updateChannel(input) : updateRecipient(input),
    onSuccess(data) {
      queryClient.setQueryData(QUERY_KEY, data);
    },
  });

  return (
    <Card id="eve-notifications">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing aria-hidden="true" className="size-5" />
          Operator notifications
        </CardTitle>
        <CardDescription>
          Durable email and Discord alerts with platform-owner recipients,
          redacted payloads, stable dedupe, and independent pause controls.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {query.isError || mutation.isError ? (
          <Alert variant="destructive">
            <AlertDescription>
              {query.error?.message ?? mutation.error?.message}
            </AlertDescription>
          </Alert>
        ) : null}
        {query.isLoading ? (
          <div className="grid gap-3 md:grid-cols-2">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {(query.data?.channels ?? []).map((channel) => (
              <section key={channel.channel} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium capitalize">
                      {channel.channel}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {channel.channel === "email"
                        ? "Eligible platform owners only"
                        : "Urgent alerts via a server-only webhook"}
                    </p>
                  </div>
                  <Badge
                    variant={
                      channel.enabled && !channel.paused
                        ? "default"
                        : "secondary"
                    }
                  >
                    {!channel.enabled
                      ? "Disabled"
                      : channel.paused
                        ? "Paused"
                        : "Enabled"}
                  </Badge>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={mutation.isPending}
                    onClick={() =>
                      mutation.mutate({
                        kind: "channel",
                        channel: channel.channel,
                        enabled: !channel.enabled,
                      })
                    }
                  >
                    {channel.enabled ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={mutation.isPending || !channel.enabled}
                    onClick={() =>
                      mutation.mutate({
                        kind: "channel",
                        channel: channel.channel,
                        paused: !channel.paused,
                      })
                    }
                  >
                    {channel.paused ? "Resume" : "Pause"}
                  </Button>
                </div>
              </section>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          All channels ship disabled and paused. Enabling a channel still does
          not bypass Eve release, policy, budget, severity, or emergency gates.
        </p>
        <section aria-labelledby="eve-notification-recipients">
          <h3 id="eve-notification-recipients" className="text-sm font-medium">
            Platform-owner email recipients
          </h3>
          <ul className="mt-3 divide-y rounded-lg border px-4">
            {(query.data?.recipients ?? []).map((recipient) => (
              <li
                key={recipient.profileId}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {recipient.displayName ?? recipient.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {recipient.email}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={mutation.isPending}
                  onClick={() =>
                    mutation.mutate({
                      kind: "recipient",
                      profileId: recipient.profileId,
                      enabled: !recipient.enabled,
                      optedOut: recipient.enabled,
                    })
                  }
                >
                  {recipient.enabled && !recipient.optedOut
                    ? "Remove recipient"
                    : "Enable recipient"}
                </Button>
              </li>
            ))}
            {!query.isLoading && (query.data?.recipients.length ?? 0) === 0 ? (
              <li className="py-4 text-sm text-muted-foreground">
                No eligible platform-owner profile has an email address.
              </li>
            ) : null}
          </ul>
        </section>
        <section aria-labelledby="eve-notification-history">
          <h3 id="eve-notification-history" className="text-sm font-medium">
            Recent delivery records
          </h3>
          <ul className="mt-3 divide-y rounded-lg border px-4">
            {(query.data?.recentNotifications ?? []).map((record) => (
              <li
                key={record.id}
                className="flex justify-between gap-3 py-3 text-sm"
              >
                <span>
                  {record.envelope.eventType} · {record.channel}
                </span>
                <Badge variant="outline">{record.status}</Badge>
              </li>
            ))}
            {!query.isLoading &&
            (query.data?.recentNotifications.length ?? 0) === 0 ? (
              <li className="py-4 text-sm text-muted-foreground">
                No notification delivery has been attempted.
              </li>
            ) : null}
          </ul>
        </section>
      </CardContent>
    </Card>
  );
}

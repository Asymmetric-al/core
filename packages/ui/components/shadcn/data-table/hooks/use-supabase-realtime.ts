"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createBrowserClient } from "@asym/database/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

interface RealtimePayload {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Record<string, unknown>;
  old: Record<string, unknown>;
}

interface UseSupabaseRealtimeOptions<TData> {
  tableName: string;
  queryKey: string[];
  schema?: string;
  filter?: string;
  events?: RealtimeEvent[];
  enabled?: boolean;
  onInsert?: (payload: TData) => void;
  onUpdate?: (payload: { old: TData; new: TData }) => void;
  onDelete?: (payload: TData) => void;
  transform?: (payload: Record<string, unknown>) => TData;
}

interface UseSupabaseRealtimeReturn {
  isConnected: boolean;
  error: Error | null;
  subscribe: () => void;
  unsubscribe: () => void;
}

export function useSupabaseRealtime<TData extends Record<string, unknown>>({
  tableName,
  queryKey,
  schema = "public",
  filter,
  events = ["*"],
  enabled = true,
  onInsert,
  onUpdate,
  onDelete,
  transform,
}: UseSupabaseRealtimeOptions<TData>): UseSupabaseRealtimeReturn {
  const queryClient = useQueryClient();
  const supabase = createBrowserClient();
  const channelRef = React.useRef<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const handlePayload = React.useCallback(
    (payload: RealtimePayload) => {
      const eventType = payload.eventType;

      const transformData = (
        data: Record<string, unknown> | null,
      ): TData | null => {
        if (!data) return null;
        return transform ? transform(data) : (data as TData);
      };

      switch (eventType) {
        case "INSERT": {
          const newRecord = transformData(payload.new);
          if (newRecord) {
            queryClient.setQueryData<TData[]>(queryKey, (old) => {
              if (!old) return [newRecord];
              const exists = old.some(
                (item) =>
                  (item as Record<string, unknown>).id ===
                  (newRecord as Record<string, unknown>).id,
              );
              if (exists) return old;
              return [...old, newRecord];
            });
            onInsert?.(newRecord);
          }
          break;
        }
        case "UPDATE": {
          const oldRecord = transformData(payload.old);
          const newRecord = transformData(payload.new);
          if (newRecord) {
            queryClient.setQueryData<TData[]>(queryKey, (old) => {
              if (!old) return old;
              return old.map((item) =>
                (item as Record<string, unknown>).id ===
                (newRecord as Record<string, unknown>).id
                  ? newRecord
                  : item,
              );
            });
            if (oldRecord && newRecord) {
              onUpdate?.({ old: oldRecord, new: newRecord });
            }
          }
          break;
        }
        case "DELETE": {
          const deletedRecord = transformData(payload.old);
          if (deletedRecord) {
            queryClient.setQueryData<TData[]>(queryKey, (old) => {
              if (!old) return old;
              return old.filter(
                (item) =>
                  (item as Record<string, unknown>).id !==
                  (deletedRecord as Record<string, unknown>).id,
              );
            });
            onDelete?.(deletedRecord);
          }
          break;
        }
      }
    },
    [queryClient, queryKey, onInsert, onUpdate, onDelete, transform],
  );

  const subscribe = React.useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    const channelName = `${tableName}-changes-${Date.now()}`;
    const channel = supabase.channel(channelName);

    events.forEach((event) => {
      const channelConfig = {
        event,
        schema,
        table: tableName,
        ...(filter ? { filter } : {}),
      };

      channel.on(
        "postgres_changes" as unknown as "system",
        channelConfig as unknown as { event: "system" },
        handlePayload as unknown as (payload: {
          extension: string;
          status: string;
          message: string;
        }) => void,
      );
    });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setIsConnected(true);
        setError(null);
      } else if (status === "CHANNEL_ERROR") {
        setIsConnected(false);
        setError(new Error(`Failed to subscribe to ${tableName} changes`));
      } else if (status === "CLOSED") {
        setIsConnected(false);
      }
    });

    channelRef.current = channel;
  }, [supabase, tableName, schema, filter, events, handlePayload]);

  const unsubscribe = React.useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
      setIsConnected(false);
    }
  }, []);

  React.useEffect(() => {
    if (enabled) {
      subscribe();
    }

    return () => {
      unsubscribe();
    };
  }, [enabled, subscribe, unsubscribe]);

  return {
    isConnected,
    error,
    subscribe,
    unsubscribe,
  };
}

interface UseDataTableWithRealtimeOptions<TData, TValue> {
  tableName: string;
  queryKey: string[];
  columns: import("@tanstack/react-table").ColumnDef<TData, TValue>[];
  select?: string;
  filter?: string;
  realtimeEvents?: RealtimeEvent[];
  realtimeEnabled?: boolean;
  initialData?: TData[];
  onRealtimeInsert?: (data: TData) => void;
  onRealtimeUpdate?: (data: { old: TData; new: TData }) => void;
  onRealtimeDelete?: (data: TData) => void;
  enableRowSelection?: boolean;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  getRowId?: (row: TData) => string;
}

export function useDataTableWithRealtime<
  TData extends Record<string, unknown>,
  TValue = unknown,
>({
  tableName,
  queryKey,
  realtimeEvents = ["*"],
  realtimeEnabled = true,
  onRealtimeInsert,
  onRealtimeUpdate,
  onRealtimeDelete,
  filter,
}: UseDataTableWithRealtimeOptions<TData, TValue>) {
  const realtime = useSupabaseRealtime<TData>({
    tableName,
    queryKey,
    events: realtimeEvents,
    enabled: realtimeEnabled,
    filter,
    onInsert: onRealtimeInsert,
    onUpdate: onRealtimeUpdate,
    onDelete: onRealtimeDelete,
  });

  return {
    realtime,
  };
}

interface CreateRealtimeCollectionOptions {
  tableName: string;
  schema?: string;
  filter?: string;
  events?: RealtimeEvent[];
}

export function createRealtimeSubscription({
  tableName,
  schema = "public",
  filter,
  events = ["*"],
}: CreateRealtimeCollectionOptions) {
  const supabase = createBrowserClient();

  return {
    subscribe: (
      callback: (
        eventType: "INSERT" | "UPDATE" | "DELETE",
        payload: Record<string, unknown>,
      ) => void,
    ) => {
      const channelName = `${tableName}-${Date.now()}`;
      const channel = supabase.channel(channelName);

      events.forEach((event) => {
        const channelConfig = {
          event,
          schema,
          table: tableName,
          ...(filter ? { filter } : {}),
        };

        channel.on(
          "postgres_changes" as unknown as "system",
          channelConfig as unknown as { event: "system" },
          ((payload: RealtimePayload) => {
            callback(payload.eventType, payload.new ?? payload.old ?? {});
          }) as unknown as (payload: {
            extension: string;
            status: string;
            message: string;
          }) => void,
        );
      });

      channel.subscribe();

      return () => {
        channel.unsubscribe();
      };
    },
  };
}

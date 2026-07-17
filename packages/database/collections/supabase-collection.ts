"use client";

import { supabaseCollectionOptions } from "@supabase-labs/tanstack-db";
import { createCollection } from "@tanstack/react-db";
import { type z } from "zod";

import { getQueryClient } from "../providers/query-client";
import { createClient } from "../supabase/client";

type AdapterOptions<TSchema extends z.ZodType> = Parameters<
  typeof supabaseCollectionOptions<TSchema>
>[0];

type SchemaOutput<TSchema extends z.ZodType> = z.output<TSchema>;

export type SupabaseCollectionKey<TSchema extends z.ZodType> = Extract<
  keyof SchemaOutput<TSchema>,
  string
>;

export type SupabaseCollectionRealtimeOption =
  | boolean
  | {
      enabled: boolean;
      reason?: string;
    };

export interface SupabaseCollectionMetadata<
  TSchema extends z.ZodType = z.ZodType,
> {
  kind: "supabase-table";
  tableName: string;
  keys: Array<SupabaseCollectionKey<TSchema>>;
  realtime: boolean;
  realtimeDisabledReason?: string;
}

export interface SupabaseCollectionConfig<TSchema extends z.ZodType> {
  tableName: string;
  schema: TSchema;
  keys: ReadonlyArray<SupabaseCollectionKey<TSchema>>;
  realtime?: SupabaseCollectionRealtimeOption;
  queryClient?: ReturnType<typeof getQueryClient>;
}

export interface LazySupabaseCollection<TSchema extends z.ZodType> {
  readonly metadata: SupabaseCollectionMetadata<TSchema>;
  readonly value: ReturnType<typeof createSupabaseCollection<TSchema>>;
}

export function resolveSupabaseCollectionRealtime(
  realtime: SupabaseCollectionRealtimeOption = true,
): { enabled: boolean; reason?: string } {
  if (typeof realtime === "boolean") {
    return { enabled: realtime };
  }

  return realtime;
}

export function createSupabaseCollection<TSchema extends z.ZodType>(
  config: SupabaseCollectionConfig<TSchema>,
) {
  const realtime = resolveSupabaseCollectionRealtime(config.realtime);
  const options: AdapterOptions<TSchema> = {
    tableName: config.tableName,
    schema: config.schema,
    keys: [...config.keys] as AdapterOptions<TSchema>["keys"],
    // Default to the app-wide query client so collection queries share the
    // same cache/invalidation surface as the rest of the app. Without this the
    // adapter falls back to its own internal QueryClient singleton.
    queryClient: config.queryClient ?? getQueryClient(),
    supabase: createClient() as AdapterOptions<TSchema>["supabase"],
    realtime: realtime.enabled,
  };

  return createCollection(supabaseCollectionOptions(options));
}

export function defineSupabaseCollection<TSchema extends z.ZodType>(
  config: SupabaseCollectionConfig<TSchema>,
): LazySupabaseCollection<TSchema> {
  const realtime = resolveSupabaseCollectionRealtime(config.realtime);
  const metadata: SupabaseCollectionMetadata<TSchema> = {
    kind: "supabase-table",
    tableName: config.tableName,
    keys: [...config.keys],
    realtime: realtime.enabled,
    ...(realtime.reason
      ? { realtimeDisabledReason: realtime.reason }
      : undefined),
  };
  let collection:
    | ReturnType<typeof createSupabaseCollection<TSchema>>
    | undefined;

  return {
    metadata,
    get value() {
      collection ??= createSupabaseCollection(config);
      return collection;
    },
  };
}

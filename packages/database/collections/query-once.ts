import { queryOnce as supabaseQueryOnce } from "@supabase-labs/tanstack-db";

import { createClient } from "../supabase/server";

type QueryOnceCallback = Parameters<typeof supabaseQueryOnce>[0];
type QueryOnceSupabaseClient = Parameters<typeof supabaseQueryOnce>[1];

export async function querySupabaseCollectionOnce<
  TCallback extends QueryOnceCallback,
>(
  callback: TCallback,
  supabase?: Awaited<ReturnType<typeof createClient>>,
): Promise<Awaited<ReturnType<typeof supabaseQueryOnce<TCallback>>>> {
  const client = supabase ?? (await createClient());

  return supabaseQueryOnce(
    callback,
    client as QueryOnceSupabaseClient,
  ) as Promise<Awaited<ReturnType<typeof supabaseQueryOnce<TCallback>>>>;
}

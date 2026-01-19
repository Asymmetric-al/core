"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

type MutationType = "insert" | "update" | "delete" | "upsert";

interface OptimisticMutationConfig<TData, TVariables> {
  tableName: string;
  queryKey: string[];
  type: MutationType;
  getId: (data: TData | TVariables) => string;
  onMutate?: (variables: TVariables) => Promise<void> | void;
  onSuccess?: (data: TData, variables: TVariables) => Promise<void> | void;
  onError?: (
    error: Error,
    variables: TVariables,
    context: unknown,
  ) => Promise<void> | void;
  onSettled?: (
    data: TData | undefined,
    error: Error | null,
  ) => Promise<void> | void;
  select?: string;
  matchColumn?: string;
}

interface UseDataTableMutationReturn<TData, TVariables> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | null;
  reset: () => void;
}

export function useDataTableMutation<
  TData extends Record<string, unknown>,
  TVariables = Partial<TData>,
>({
  tableName,
  queryKey,
  type,
  getId,
  onMutate,
  onSuccess,
  onError,
  onSettled,
  select = "*",
  matchColumn = "id",
}: OptimisticMutationConfig<TData, TVariables>): UseDataTableMutationReturn<
  TData,
  TVariables
> {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const mutation = useMutation<
    TData,
    Error,
    TVariables,
    { previousData: TData[] | undefined }
  >({
    mutationFn: async (variables) => {
      let result;

      switch (type) {
        case "insert": {
          const { data, error } = await supabase
            .from(tableName)
            .insert(variables as Record<string, unknown>)
            .select(select)
            .single();
          if (error) throw new Error(error.message);
          result = data as unknown as TData;
          break;
        }
        case "update": {
          const id = getId(variables);
          const { data, error } = await supabase
            .from(tableName)
            .update(variables as Record<string, unknown>)
            .eq(matchColumn, id)
            .select(select)
            .single();
          if (error) throw new Error(error.message);
          result = data as unknown as TData;
          break;
        }
        case "delete": {
          const id = getId(variables);
          const { error } = await supabase
            .from(tableName)
            .delete()
            .eq(matchColumn, id);
          if (error) throw new Error(error.message);
          result = variables as unknown as TData;
          break;
        }
        case "upsert": {
          const { data, error } = await supabase
            .from(tableName)
            .upsert(variables as Record<string, unknown>)
            .select(select)
            .single();
          if (error) throw new Error(error.message);
          result = data as unknown as TData;
          break;
        }
        default:
          throw new Error(`Unknown mutation type: ${type}`);
      }

      return result;
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<TData[]>(queryKey);

      queryClient.setQueryData<TData[]>(queryKey, (old) => {
        if (!old) return old;
        const id = getId(variables);

        switch (type) {
          case "insert":
            return [
              ...old,
              {
                ...variables,
                id: id ?? crypto.randomUUID(),
                created_at: new Date().toISOString(),
              } as unknown as TData,
            ];
          case "update":
          case "upsert":
            return old.map((item) =>
              getId(item) === id
                ? {
                    ...item,
                    ...variables,
                    updated_at: new Date().toISOString(),
                  }
                : item,
            );
          case "delete":
            return old.filter((item) => getId(item) !== id);
          default:
            return old;
        }
      });

      await onMutate?.(variables);

      return { previousData };
    },
    onError: async (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      await onError?.(error, variables, context);
    },
    onSuccess: async (data, variables) => {
      await onSuccess?.(data, variables);
    },
    onSettled: async (data, error) => {
      queryClient.invalidateQueries({ queryKey });
      await onSettled?.(data, error);
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}

interface BulkMutationConfig<TData, TVariables> {
  tableName: string;
  queryKey: string[];
  type: Exclude<MutationType, "upsert">;
  getId: (data: TData | TVariables) => string;
  onSuccess?: (count: number) => void;
  onError?: (error: Error) => void;
  matchColumn?: string;
}

export function useDataTableBulkMutation<
  TData extends Record<string, unknown>,
  TVariables = Partial<TData>,
>({
  tableName,
  queryKey,
  type,
  getId,
  onSuccess,
  onError,
  matchColumn = "id",
}: BulkMutationConfig<TData, TVariables>) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const mutation = useMutation<
    number,
    Error,
    TVariables[],
    { previousData: TData[] | undefined }
  >({
    mutationFn: async (items) => {
      const ids = items.map(getId);
      let count = 0;

      switch (type) {
        case "insert": {
          const { error, count: insertCount } = await supabase
            .from(tableName)
            .insert(items as Record<string, unknown>[]);
          if (error) throw new Error(error.message);
          count = insertCount ?? items.length;
          break;
        }
        case "update": {
          for (const item of items) {
            const id = getId(item);
            const { error } = await supabase
              .from(tableName)
              .update(item as Record<string, unknown>)
              .eq(matchColumn, id);
            if (error) throw new Error(error.message);
            count++;
          }
          break;
        }
        case "delete": {
          const { error, count: deleteCount } = await supabase
            .from(tableName)
            .delete()
            .in(matchColumn, ids);
          if (error) throw new Error(error.message);
          count = deleteCount ?? ids.length;
          break;
        }
      }

      return count;
    },
    onMutate: async (items) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<TData[]>(queryKey);

      queryClient.setQueryData<TData[]>(queryKey, (old) => {
        if (!old) return old;
        const ids = new Set(items.map(getId));

        switch (type) {
          case "insert":
            return [
              ...old,
              ...(items.map((item) => ({
                ...item,
                id: getId(item) ?? crypto.randomUUID(),
                created_at: new Date().toISOString(),
              })) as unknown as TData[]),
            ];
          case "update":
            return old.map((existing) => {
              const id = getId(existing);
              if (ids.has(id)) {
                const update = items.find((item) => getId(item) === id);
                return update ? { ...existing, ...update } : existing;
              }
              return existing;
            });
          case "delete":
            return old.filter((item) => !ids.has(getId(item)));
          default:
            return old;
        }
      });

      return { previousData };
    },
    onError: async (error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      onError?.(error);
    },
    onSuccess: (count) => {
      onSuccess?.(count);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    reset: mutation.reset,
  };
}

interface CollectionMutationConfig<TData> {
  collection: {
    insert: (data: Partial<TData>) => void;
    update: (id: string, updater: (draft: TData) => void) => void;
    delete: (id: string) => void;
  };
  getId: (data: TData | Partial<TData>) => string;
  onMutate?: () => void;
  onError?: (error: Error) => void;
}

export function useCollectionMutation<TData extends Record<string, unknown>>({
  collection,
  getId,
  onMutate,
  onError,
}: CollectionMutationConfig<TData>) {
  const insert = React.useCallback(
    (data: Partial<TData>) => {
      try {
        onMutate?.();
        collection.insert(data);
      } catch (error) {
        onError?.(error as Error);
      }
    },
    [collection, onMutate, onError],
  );

  const update = React.useCallback(
    (data: Partial<TData>, updater: (draft: TData) => void) => {
      try {
        onMutate?.();
        const id = getId(data);
        collection.update(id, updater);
      } catch (error) {
        onError?.(error as Error);
      }
    },
    [collection, getId, onMutate, onError],
  );

  const remove = React.useCallback(
    (data: TData | string) => {
      try {
        onMutate?.();
        const id = typeof data === "string" ? data : getId(data);
        collection.delete(id);
      } catch (error) {
        onError?.(error as Error);
      }
    },
    [collection, getId, onMutate, onError],
  );

  return {
    insert,
    update,
    remove,
  };
}

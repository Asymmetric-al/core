import { queryOnce as supabaseQueryOnce } from "@supabase-labs/tanstack-db";
import { Query } from "@tanstack/db";

import { createClient } from "../supabase/server";

type QueryOnceCallback = Parameters<typeof supabaseQueryOnce>[0];
type QueryOnceSupabaseClient = Parameters<typeof supabaseQueryOnce>[1];
type InternalQueryBuilder = ReturnType<QueryOnceCallback> & {
  _getQuery(): QueryIr;
};

interface QueryRefExpression {
  type: "ref";
  path: string[];
}

interface QueryValueExpression {
  type: "val";
  value: unknown;
}

interface QueryFunctionExpression {
  type: "func";
  name: string;
  args: QueryExpression[];
}

type QueryExpression =
  | QueryFunctionExpression
  | QueryRefExpression
  | QueryValueExpression
  | { type: string; [key: string]: unknown };

interface QueryIr {
  from:
    | {
        type: "collectionRef";
        collection: { id: string };
      }
    | { type: string };
  where?: QueryExpression[];
  orderBy?: Array<{
    expression: QueryExpression;
    compareOptions: { direction: "asc" | "desc" };
  }>;
  select?: Record<string, QueryExpression>;
  fnSelect?: unknown;
  fnWhere?: unknown;
  fnHaving?: unknown;
  join?: unknown[];
  groupBy?: unknown[];
  having?: unknown[];
  distinct?: boolean;
  limit?: number;
  offset?: number;
  singleResult?: boolean;
}

interface SupabaseReadResult {
  data: unknown[] | null;
  error: unknown;
}

interface SupabaseReadQuery extends PromiseLike<SupabaseReadResult> {
  eq(column: string, value: unknown): SupabaseReadQuery;
  neq(column: string, value: unknown): SupabaseReadQuery;
  gt(column: string, value: unknown): SupabaseReadQuery;
  gte(column: string, value: unknown): SupabaseReadQuery;
  lt(column: string, value: unknown): SupabaseReadQuery;
  lte(column: string, value: unknown): SupabaseReadQuery;
  is(column: string, value: null): SupabaseReadQuery;
  in(column: string, value: readonly unknown[]): SupabaseReadQuery;
  order(column: string, options: { ascending: boolean }): SupabaseReadQuery;
  limit(value: number): SupabaseReadQuery;
  range(from: number, to: number): SupabaseReadQuery;
}

function getSourceTableName(query: QueryIr): string {
  const source = query.from as {
    type: string;
    collection?: { id: string };
  };
  if (source.type !== "collectionRef" || !source.collection) {
    throw new Error("queryOnce only supports collection-backed source tables.");
  }

  return source.collection.id;
}

function getQuery(callback: QueryOnceCallback): QueryIr {
  return (callback(new Query()) as InternalQueryBuilder)._getQuery();
}

function getColumnName(expression: unknown): string {
  if (
    typeof expression !== "object" ||
    expression === null ||
    !("type" in expression) ||
    expression.type !== "ref" ||
    !("path" in expression) ||
    !Array.isArray(expression.path)
  ) {
    throw new Error("queryOnce filters must use table column references.");
  }

  return expression.path.slice(1).join(".");
}

function getValue(expression: unknown): unknown {
  if (
    typeof expression !== "object" ||
    expression === null ||
    !("type" in expression) ||
    expression.type !== "val" ||
    !("value" in expression)
  ) {
    throw new Error("queryOnce filters must compare against literal values.");
  }

  return expression.value;
}

function applyWhere(
  query: SupabaseReadQuery,
  expression: QueryExpression,
): SupabaseReadQuery {
  if (
    typeof expression !== "object" ||
    expression === null ||
    !("type" in expression) ||
    expression.type !== "func" ||
    !("name" in expression) ||
    !("args" in expression) ||
    !Array.isArray(expression.args)
  ) {
    throw new Error("queryOnce only supports simple function filters.");
  }

  if (expression.name === "and") {
    return expression.args.reduce(
      (currentQuery: SupabaseReadQuery, childExpression: QueryExpression) =>
        applyWhere(currentQuery, childExpression),
      query,
    );
  }

  const [columnRef, literalValue] = expression.args;
  const columnName = getColumnName(columnRef);
  const value = getValue(literalValue);

  switch (expression.name) {
    case "eq":
      return query.eq(columnName, value);
    case "neq":
      return query.neq(columnName, value);
    case "gt":
      return query.gt(columnName, value);
    case "gte":
      return query.gte(columnName, value);
    case "lt":
      return query.lt(columnName, value);
    case "lte":
      return query.lte(columnName, value);
    case "isNull":
      return query.is(columnName, null);
    case "inArray":
      return query.in(columnName, value as readonly unknown[]);
    default:
      throw new Error(
        `queryOnce does not support filter operator "${String(expression.name)}".`,
      );
  }
}

function hasServerOnlyFeatures(query: QueryIr): boolean {
  return Boolean(
    query.fnSelect !== undefined ||
    query.fnWhere !== undefined ||
    query.fnHaving !== undefined ||
    query.groupBy?.length ||
    query.having?.length ||
    Object.values(query.select ?? {}).some(
      (value) =>
        typeof value === "object" &&
        value !== null &&
        "type" in value &&
        value.type === "agg",
    ),
  );
}

function assertSimpleReadShape(query: QueryIr): void {
  if (query.join?.length) {
    throw new Error("queryOnce simple reads do not support joins.");
  }

  if (query.select !== undefined) {
    throw new Error("queryOnce simple reads return full rows only.");
  }

  if (query.distinct) {
    throw new Error("queryOnce simple reads do not support distinct.");
  }
}

async function executeSimpleSupabaseRead<TCallback extends QueryOnceCallback>(
  callback: TCallback,
  supabase: QueryOnceSupabaseClient,
): Promise<Awaited<ReturnType<typeof supabaseQueryOnce<TCallback>>>> {
  const query = getQuery(callback);
  assertSimpleReadShape(query);

  let supabaseQuery = supabase
    .from(getSourceTableName(query))
    .select("*") as unknown as SupabaseReadQuery;
  for (const whereExpression of query.where ?? []) {
    supabaseQuery = applyWhere(supabaseQuery, whereExpression);
  }

  for (const order of query.orderBy ?? []) {
    const columnName = getColumnName(order.expression);
    supabaseQuery = supabaseQuery.order(columnName, {
      ascending: order.compareOptions.direction === "asc",
    });
  }

  if (query.limit !== undefined) {
    supabaseQuery = supabaseQuery.limit(query.limit);
  }

  if (query.offset !== undefined) {
    const end = query.offset + (query.limit ?? 1000) - 1;
    supabaseQuery = supabaseQuery.range(query.offset, end);
  }

  const { data, error } = await supabaseQuery;
  if (error) {
    throw error;
  }

  if (query.singleResult) {
    return data?.[0] as Awaited<ReturnType<typeof supabaseQueryOnce<TCallback>>>;
  }

  return (data ?? []) as Awaited<
    ReturnType<typeof supabaseQueryOnce<TCallback>>
  >;
}

export async function querySupabaseCollectionOnce<
  TCallback extends QueryOnceCallback,
>(
  callback: TCallback,
  supabase?: Awaited<ReturnType<typeof createClient>>,
): Promise<Awaited<ReturnType<typeof supabaseQueryOnce<TCallback>>>> {
  const client = supabase ?? (await createClient());
  const query = getQuery(callback);

  if (hasServerOnlyFeatures(query)) {
    return supabaseQueryOnce(
      callback,
      client as QueryOnceSupabaseClient,
    ) as Promise<Awaited<ReturnType<typeof supabaseQueryOnce<TCallback>>>>;
  }

  return executeSimpleSupabaseRead(callback, client as QueryOnceSupabaseClient);
}

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

type SimpleFilterOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "isNull"
  | "in"
  | "inArray";

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

  return getResolvedColumnName(expression);
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

function isColumnRefExpression(
  expression: unknown,
): expression is QueryRefExpression {
  return (
    typeof expression === "object" &&
    expression !== null &&
    "type" in expression &&
    expression.type === "ref" &&
    "path" in expression &&
    Array.isArray(expression.path)
  );
}

function getResolvedColumnName(expression: QueryRefExpression): string {
  return expression.path.slice(1).join(".");
}

function isSupportedColumnRefExpression(
  expression: unknown,
): expression is QueryRefExpression {
  if (!isColumnRefExpression(expression)) {
    return false;
  }

  const columnSegment = expression.path[1];

  return (
    typeof columnSegment === "string" &&
    columnSegment.length > 0 &&
    !columnSegment.startsWith("$")
  );
}

function isValueExpression(
  expression: unknown,
): expression is QueryValueExpression {
  return (
    typeof expression === "object" &&
    expression !== null &&
    "type" in expression &&
    expression.type === "val" &&
    "value" in expression
  );
}

function isFunctionExpression(
  expression: QueryExpression,
): expression is QueryFunctionExpression {
  return (
    typeof expression === "object" &&
    expression !== null &&
    "type" in expression &&
    expression.type === "func" &&
    "name" in expression &&
    typeof expression.name === "string" &&
    "args" in expression &&
    Array.isArray(expression.args)
  );
}

function isSimpleFilterOperator(
  operator: string,
): operator is SimpleFilterOperator {
  return [
    "eq",
    "neq",
    "gt",
    "gte",
    "lt",
    "lte",
    "isNull",
    "in",
    "inArray",
  ].includes(operator);
}

function canApplyWhere(expression: QueryExpression): boolean {
  if (!isFunctionExpression(expression)) {
    return false;
  }

  if (expression.name === "and") {
    return expression.args.every(canApplyWhere);
  }

  if (!isSimpleFilterOperator(expression.name)) {
    return false;
  }

  const [columnRef, literalValue] = expression.args;
  if (!isSupportedColumnRefExpression(columnRef)) {
    return false;
  }

  if (expression.name === "isNull") {
    return expression.args.length === 1;
  }

  if (expression.args.length !== 2) {
    return false;
  }

  if (!isValueExpression(literalValue)) {
    return false;
  }

  if (expression.name === "in" || expression.name === "inArray") {
    return Array.isArray(literalValue.value);
  }

  return true;
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

  if (expression.name === "isNull") {
    return query.is(columnName, null);
  }

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
    case "in":
      return query.in(columnName, value as readonly unknown[]);
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

function isSimpleSupabaseRead(query: QueryIr): boolean {
  const hasOrderBy = Boolean(query.orderBy?.length);
  const requiresStableOrdering = query.limit !== undefined;

  return Boolean(
    query.from.type === "collectionRef" &&
      query.select === undefined &&
      (query.where ?? []).every(canApplyWhere) &&
      (query.orderBy ?? []).every((order) =>
        isSupportedColumnRefExpression(order.expression),
      ) &&
      (!requiresStableOrdering || hasOrderBy) &&
      (query.offset === undefined || query.limit !== undefined) &&
      !query.join?.length &&
      !query.distinct &&
      !hasServerOnlyFeatures(query),
  );
}

async function executeSimpleSupabaseRead<TCallback extends QueryOnceCallback>(
  query: QueryIr,
  supabase: QueryOnceSupabaseClient,
): Promise<Awaited<ReturnType<typeof supabaseQueryOnce<TCallback>>>> {
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

  if (query.offset !== undefined && query.limit !== undefined) {
    const end = query.offset + query.limit - 1;
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

  if (!isSimpleSupabaseRead(query)) {
    return supabaseQueryOnce(
      callback,
      client as QueryOnceSupabaseClient,
    ) as Promise<Awaited<ReturnType<typeof supabaseQueryOnce<TCallback>>>>;
  }

  return executeSimpleSupabaseRead<TCallback>(
    query,
    client as QueryOnceSupabaseClient,
  );
}

export type SupabaseColumn<TRow extends object> = Extract<keyof TRow, string>;

export type SupabaseFilterValue = string | number | boolean | null;

export interface SupabaseListResult<TRow extends object> {
  data: TRow[] | null;
  error: { message: string } | null;
}

export interface AdminSupabaseFilterBuilder<TRow extends object>
  extends
    PromiseLike<SupabaseListResult<TRow>>,
    AdminSupabaseFilterMethods<TRow, AdminSupabaseFilterBuilder<TRow>> {}

export type AdminSupabaseFluentFilterBuilder<
  TRow extends object,
  TSelf,
> = AdminSupabaseFilterMethods<TRow, TSelf>;

interface AdminSupabaseFilterMethods<TRow extends object, TSelf> {
  eq(column: SupabaseColumn<TRow>, value: SupabaseFilterValue): TSelf;
  neq(column: SupabaseColumn<TRow>, value: SupabaseFilterValue): TSelf;
  gt(column: SupabaseColumn<TRow>, value: SupabaseFilterValue): TSelf;
  lt(column: SupabaseColumn<TRow>, value: SupabaseFilterValue): TSelf;
  gte(column: SupabaseColumn<TRow>, value: SupabaseFilterValue): TSelf;
  lte(column: SupabaseColumn<TRow>, value: SupabaseFilterValue): TSelf;
  in(
    column: SupabaseColumn<TRow>,
    values: readonly SupabaseFilterValue[],
  ): TSelf;
  is(column: SupabaseColumn<TRow>, value: null): TSelf;
  not(
    column: SupabaseColumn<TRow>,
    operator: string,
    value: SupabaseFilterValue,
  ): TSelf;
  overlaps(
    column: SupabaseColumn<TRow>,
    value: readonly SupabaseFilterValue[],
  ): TSelf;
  /**
   * Raw PostgREST OR filter expression, for example:
   * `name.ilike.%ada%,email.ilike.%ada%`.
   */
  or(filters: string): TSelf;
  order(
    column: SupabaseColumn<TRow>,
    options?: {
      ascending?: boolean;
      nullsFirst?: boolean;
    },
  ): TSelf;
  limit(count: number): TSelf;
}

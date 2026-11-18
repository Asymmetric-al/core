/**
 * AL-2675 (WP2a sweep): an in-memory stand-in for the service-key Supabase
 * client, enough for the queries the sweep moved to membership. `from(table)`
 * filters fixture rows (`eq`, `neq`, `in`, `is`, `not … is null`, `order`,
 * `range`, `limit`, `single`, `maybeSingle`, `setHeader`);
 * `rpc("tenant_member_directory")` answers as the member directory does, and
 * `rpc("tenant_member_profiles")`
 * answers from fixture memberships joined to profiles by login, as the SQL
 * function does: its filters, ordered by membership id, a page of `p_limit`
 * (1,000 at most) after `p_after_membership_id`. Like the Data API, the
 * client returns at most `DATA_API_MAX_ROWS` rows per response and cuts the
 * rest without an error (council round 1 on WP2a, F7). Every `from` and `rpc`
 * call is recorded.
 */
type Row = Record<string, unknown>;

export interface FakeMembership {
  id: string;
  user_id: string;
  tenant_id: string;
  role: "donor" | "missionary" | "staff";
  staff_role: string | null;
  is_tenant_admin: boolean;
  is_active: boolean;
}

export interface FakeServiceData {
  tables: Record<string, Row[]>;
  memberships: FakeMembership[];
}

type Filter = (row: Row) => boolean;

/** `max_rows` in supabase/config.toml: the Data API's cut on any response. */
export const DATA_API_MAX_ROWS = 1000;

class FakeQuery implements PromiseLike<{ data: unknown; error: null }> {
  private filters: Filter[] = [];
  private bounds: [number, number] | null = null;
  private max: number | null = null;
  private sortKey: string | null = null;
  private ascending = true;
  private mode: "many" | "single" | "maybe" = "many";

  constructor(private rows: Row[]) {}

  select(_columns?: string) {
    return this;
  }
  eq(column: string, value: unknown) {
    this.filters.push((row) => row[column] === value);
    return this;
  }
  neq(column: string, value: unknown) {
    this.filters.push((row) => row[column] !== value);
    return this;
  }
  in(column: string, values: readonly unknown[]) {
    this.filters.push((row) => values.includes(row[column]));
    return this;
  }
  is(column: string, value: unknown) {
    this.filters.push((row) => (row[column] ?? null) === value);
    return this;
  }
  not(column: string, operator: string, value: unknown) {
    if (operator !== "is" || value !== null)
      throw new Error(`fake client: unsupported not(${operator})`);
    this.filters.push(
      (row) => row[column] !== null && row[column] !== undefined,
    );
    return this;
  }
  order(column: string, options?: { ascending?: boolean }) {
    this.sortKey = column;
    this.ascending = options?.ascending ?? true;
    return this;
  }
  range(from: number, to: number) {
    this.bounds = [from, to];
    return this;
  }
  limit(count: number) {
    this.max = count;
    return this;
  }
  single() {
    this.mode = "single";
    return this;
  }
  /** Request headers the query would send (`x-asym-assignment`). */
  readonly headers: Record<string, string> = {};
  setHeader(name: string, value: string) {
    this.headers[name] = value;
    return this;
  }
  maybeSingle() {
    this.mode = "maybe";
    return this;
  }

  private result() {
    let rows = this.rows.filter((row) => this.filters.every((f) => f(row)));
    if (this.sortKey) {
      const key = this.sortKey;
      rows = [...rows].sort(
        (a, b) =>
          String(a[key]).localeCompare(String(b[key])) *
          (this.ascending ? 1 : -1),
      );
    }
    if (this.bounds) rows = rows.slice(this.bounds[0], this.bounds[1] + 1);
    if (this.max !== null) rows = rows.slice(0, this.max);
    if (this.mode === "many") return { data: rows, error: null };
    if (rows.length === 1) return { data: rows[0]!, error: null };
    if (this.mode === "maybe" && rows.length === 0)
      return { data: null, error: null };
    return {
      data: null,
      error: { code: "PGRST116", message: "not exactly one row" },
    };
  }

  then<A = { data: unknown; error: null }, B = never>(
    resolve?:
      ((value: { data: unknown; error: null }) => A | PromiseLike<A>) | null,
    reject?: ((reason: unknown) => B | PromiseLike<B>) | null,
  ): PromiseLike<A | B> {
    return Promise.resolve(
      this.result() as { data: unknown; error: null },
    ).then(resolve, reject);
  }
}

export function fakeServiceClient(data: FakeServiceData) {
  const calls: string[] = [];
  const client = {
    calls,
    from(table: string) {
      calls.push(`from:${table}`);
      return new FakeQuery(data.tables[table] ?? []);
    },
    rpc(fn: string, args: Record<string, unknown>) {
      calls.push(`rpc:${fn}`);
      if (fn === "tenant_member_directory")
        return new FakeQuery(directoryRows(data, args.p_tenant_id as string));
      if (fn !== "tenant_member_profiles")
        return Promise.resolve({
          data: null,
          error: { message: `unknown rpc ${fn}` },
        });
      const profileIds = args.p_profile_ids as string[] | null;
      const userIds = args.p_user_ids as string[] | null;
      const role = (args.p_role ?? null) as string | null;
      const tenantAdmin = (args.p_tenant_admin ?? null) as boolean | null;
      const after = (args.p_after_membership_id ?? null) as string | null;
      const limit = Math.min(Math.max(Number(args.p_limit ?? 1000), 1), 1000);
      const profiles = data.tables.profiles ?? [];
      const rows = [...data.memberships]
        .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
        .filter(
          (m) =>
            m.tenant_id === args.p_tenant_id &&
            (args.p_include_revoked === true || m.is_active) &&
            (role === null || m.role === role) &&
            (tenantAdmin === null || m.is_tenant_admin === tenantAdmin) &&
            (after === null || m.id > after),
        )
        .flatMap((m) => {
          const profile = profiles.find((p) => p.user_id === m.user_id);
          if (!profile) return [];
          if (profileIds && !profileIds.includes(profile.id as string))
            return [];
          if (userIds && !userIds.includes(m.user_id)) return [];
          return [
            {
              membership_id: m.id,
              user_id: m.user_id,
              profile_id: profile.id,
              role: m.role,
              staff_role: m.staff_role,
              is_tenant_admin: m.is_tenant_admin,
              is_live: m.is_active,
            },
          ];
        });
      return Promise.resolve({
        data: rows.slice(0, Math.min(limit, DATA_API_MAX_ROWS)),
        error: null,
      });
    },
  };
  return client;
}

/**
 * `public.tenant_member_directory(tenant)`'s rows, as the SQL function
 * returns them on the caller's token: every live member of the tenant with
 * its profile's display name and email (council round 1 on WP2a, F8). The
 * function's check of the caller's staff row is proved on the real stack.
 */
function directoryRows(data: FakeServiceData, tenantId: string) {
  const profiles = data.tables.profiles ?? [];
  const text = (value: unknown) =>
    typeof value === "string" && value.trim() ? value.trim() : null;
  return data.memberships
    .filter((m) => m.tenant_id === tenantId && m.is_active)
    .map((m) => {
      const profile = profiles.find((p) => p.user_id === m.user_id);
      return {
        membership_id: m.id,
        user_id: m.user_id,
        profile_id: (profile?.id as string | undefined) ?? null,
        display_name:
          text(profile?.display_name) ??
          text(profile?.full_name) ??
          text(
            [profile?.first_name, profile?.last_name].filter(Boolean).join(" "),
          ),
        email: (profile?.email as string | undefined) ?? null,
        role: m.role,
        staff_role: m.staff_role,
        is_tenant_admin: m.is_tenant_admin,
      } as Row;
    });
}

/** One `tenant_member_profiles` row, for tests that mock `rpc` directly. */
export function memberRow(input: {
  profileId: string;
  userId?: string;
  role?: "donor" | "missionary" | "staff";
  staffRole?: string | null;
  isTenantAdmin?: boolean;
  isLive?: boolean;
}) {
  return {
    membership_id: `membership-${input.profileId}`,
    user_id: input.userId ?? `user-${input.profileId}`,
    profile_id: input.profileId,
    role: input.role ?? "staff",
    staff_role:
      input.staffRole === undefined
        ? (input.role ?? "staff") === "staff"
          ? "development"
          : null
        : input.staffRole,
    is_tenant_admin: input.isTenantAdmin ?? false,
    is_live: input.isLive ?? true,
  };
}

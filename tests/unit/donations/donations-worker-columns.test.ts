import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "../../../packages/api/src/donations";
import { DONATION_WITH_PARTIES_SELECT } from "../../../packages/api/src/donations/select";

import type * as AuthModule from "../../../packages/auth/context";
import type { AuthContext } from "../../../packages/auth/context";
import { membershipsForRole } from "../../fixtures/auth-memberships";

type Row = Record<string, unknown>;

const PRIVATE_WORKER_COLUMNS = [
  "phone",
  "birth_date",
  "location",
  "region",
  "timezone",
  "social_links",
  "health_status",
  "health_signals",
  "last_check_in",
  "manual_attention",
  "party_id",
  "profile_id",
  "legal_entity_id",
  "import_batch_id",
  "tagline",
];

const WORKER_ROW: Row = {
  id: "missionary-1",
  tenant_id: "tenant-a",
  profile_id: "profile-m",
  party_id: "party-m",
  legal_entity_id: "entity-a",
  import_batch_id: null,
  bio: "Bio",
  mission_field: "Field",
  funding_goal: 100,
  current_funding: 50,
  tagline: "Tagline",
  location: "Precise place",
  region: "Region",
  timezone: "UTC",
  phone: "+15555550100",
  birth_date: "1980-01-01",
  social_links: {},
  cover_url: null,
  health_status: "watch",
  health_signals: {},
  last_check_in: null,
  manual_attention: false,
  created_at: "2026-10-24T00:00:00.000Z",
  updated_at: "2026-10-24T00:00:00.000Z",
  worker_public_name: "Cedar",
  profile: { id: "profile-m", avatar_url: null, full_name: "Profile Rowan" },
};

const EMBEDDED = new Set(["profile"]);

function matching(text: string, open: number) {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === "(") depth++;
    if (text[i] === ")" && --depth === 0) return i;
  }
  return -1;
}

function topLevel(text: string) {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "(") depth++;
    if (text[i] === ")") depth--;
    if (text[i] === "," && depth === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts.map((p) => p.trim()).filter(Boolean);
}

function project(row: Row, select: string): Row {
  const out: Row = {};
  for (const part of topLevel(select)) {
    const embed = /^(?:(\w+):)?(\w+)(?:![\w!]+)?\((.+)\)$/s.exec(part);
    const key = embed ? (embed[1] ?? embed[2]!) : null;
    if (embed && key !== null && EMBEDDED.has(key)) {
      const value = row[key] as Row | null | undefined;
      out[key] = value ? project(value, embed[3]!) : (value ?? null);
    } else if (part === "*") {
      for (const [k, v] of Object.entries(row))
        if (!EMBEDDED.has(k)) out[k] = v;
    } else if (/^\w+$/.test(part)) {
      if (!Object.hasOwn(row, part))
        throw new Error(`the stub's row has no column "${part}"`);
      out[part] = row[part];
    } else throw new Error(`the stub cannot project "${part}"`);
  }
  return out;
}

function workerSelect(select: string) {
  const at = select.indexOf("missionary:missionaries(");
  if (at < 0) throw new Error(`no worker embed in "${select}"`);
  const open = at + "missionary:missionaries".length;
  const close = matching(select, open);
  if (close < 0) throw new Error(`an unclosed worker embed in "${select}"`);
  return select.slice(open + 1, close);
}

const s = vi.hoisted(() => ({
  auth: null as unknown,
  donation: null as Row | null,
}));

vi.mock("@asym/auth/context", async (orig) => ({
  ...(await orig<typeof AuthModule>()),
  getAuthContext: async () => s.auth,
}));
vi.mock("@asym/database/supabase/admin", () => {
  const fetchStub = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input));
    const table = url.pathname.split("/").pop();
    const one = (new Headers(init?.headers).get("accept") ?? "").includes(
      "vnd.pgrst.object",
    );
    if (table === "account_links") {
      const rows = [{ party_id: "party-1" }];
      return Response.json(one ? rows[0] : rows);
    }
    if (table === "donors") {
      const rows = [{ id: "donor-1" }];
      return Response.json(one ? rows[0] : rows);
    }
    if (table === "donations" && s.donation) {
      const select = url.searchParams.get("select") ?? "*";
      const row = {
        ...s.donation,
        missionary: project(s.donation.missionary as Row, workerSelect(select)),
      };
      return Response.json(one ? row : [row]);
    }
    return Response.json(one ? null : []);
  };
  const client = createClient("http://postgrest.test", "service-key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: fetchStub },
  });
  return { getAdminClient: () => ({ client, error: null }) };
});
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));
vi.mock("../../../packages/api/src/stripe/tenant-client", () => ({
  resolveTenantStripe: async () => ({ ok: true, stripe: {} }),
}));
vi.mock("../../../packages/api/src/donate/saga", () => ({
  processDonationSagaOutboxEvent: async () => ({ status: "completed" }),
}));
vi.mock("../../../packages/api/src/donate/begin-gift-intake", () => ({
  beginGiftIntake: async () => ({
    ok: true,
    donationId: "gift-1",
    outboxId: "outbox-1",
    replayed: false,
  }),
}));

const donor: AuthContext = {
  userId: "profile-d",
  email: null,
  tenantId: "tenant-a",
  role: "donor",
  memberships: membershipsForRole("donor", "tenant-a"),
  profileId: "profile-d",
  isAuthenticated: true,
};

const request = (method: "GET" | "POST", body?: object) =>
  new NextRequest("http://localhost/api/donations", {
    method,
    headers: { "content-type": "application/json", "idempotency-key": "k-1" },
    body: body && JSON.stringify(body),
  });

beforeEach(() => {
  s.auth = donor;
  s.donation = {
    id: "gift-1",
    tenant_id: "tenant-a",
    donor_id: "donor-1",
    missionary_id: "missionary-1",
    fund_id: null,
    amount: 2500,
    currency: "usd",
    status: "completed",
    donor: { id: "donor-1", profile: { id: "profile-d" } },
    missionary: WORKER_ROW,
  };
});

describe("AL-2678 r1 (Q4): a donor's donations responses carry none of a worker's private columns", () => {
  it("GET /api/donations names the worker by its public name and returns none of its private columns or its profile's name (D-18, AL-2678 WP5 rest: the stub answers the caller's account link, through which the donor is found)", async () => {
    const response = await GET(request("GET"));
    const body = (await response.json()) as {
      donations: Array<{ missionary: Row & { profile: Row } }>;
    };
    expect(response.status, JSON.stringify(body)).toBe(200);
    const worker = body.donations[0]!.missionary;
    expect(worker.worker_public_name).toBe("Cedar");
    expect(PRIVATE_WORKER_COLUMNS.filter((column) => column in worker)).toEqual(
      [],
    );
    expect(Object.keys(worker.profile).sort()).toEqual(["avatar_url", "id"]);
  });

  it("POST /api/donations returns the created gift with none of the worker's private columns", async () => {
    const response = await POST(
      request("POST", { missionaryId: "missionary-1", amount: 2500 }),
    );
    const body = (await response.json()) as {
      donation: { missionary: Row & { profile: Row } } | null;
    };
    expect(response.status, JSON.stringify(body)).toBe(201);
    const worker = body.donation!.missionary;
    expect(worker.worker_public_name).toBe("Cedar");
    expect(PRIVATE_WORKER_COLUMNS.filter((column) => column in worker)).toEqual(
      [],
    );
  });
});

describe("AL-2678 r2a (gate g): the projecting stub refuses a select part it cannot project, instead of dropping it", () => {
  it.each([
    ["an aliased column", "id, name:display_name", "name:display_name"],
    ["a cast", "id, id::text", "id::text"],
    ["a spread embed", "id, ...profile(id)", "...profile(id)"],
    ["an aggregate", "id, count()", "count()"],
  ])("project throws on %s, naming the part", (_label, select, part) => {
    expect(() => project(WORKER_ROW, select)).toThrow(part);
  });

  it("project throws on a requested column the fixture row does not hold, naming it, and keeps a column that is present and null (second round B5)", () => {
    expect(() => project(WORKER_ROW, "id, missing_column")).toThrow(
      "missing_column",
    );
    expect(project({ id: "x", note: null }, "id, note")).toEqual({
      id: "x",
      note: null,
    });
  });

  it("workerSelect throws on a select with no worker embed and on one whose embed is not closed", () => {
    expect(() => workerSelect("id, amount")).toThrow();
    expect(() =>
      workerSelect("*, missionary:missionaries(id, worker_public_name"),
    ).toThrow();
  });

  it("guard (passes on the base): the stub still projects DONATION_WITH_PARTIES_SELECT's worker", () => {
    expect(
      project(WORKER_ROW, workerSelect(DONATION_WITH_PARTIES_SELECT)),
    ).toEqual({
      id: "missionary-1",
      tenant_id: "tenant-a",
      bio: "Bio",
      mission_field: "Field",
      funding_goal: 100,
      current_funding: 50,
      created_at: "2026-10-24T00:00:00.000Z",
      updated_at: "2026-10-24T00:00:00.000Z",
      worker_public_name: "Cedar",
      profile: { id: "profile-m", avatar_url: null },
    });
  });
});

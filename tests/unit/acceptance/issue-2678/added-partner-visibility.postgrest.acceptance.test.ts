import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  anon,
  database,
  required,
  service,
  url,
} from "./identity-keys.postgrest-fixture";
import { GET as getSnapshot } from "../../../../packages/api/src/missionary-portal";
import { POST as addPartner } from "../../../../packages/api/src/missionary-portal/add-partner";
import {
  PATCH,
  POST_ACTIVITY,
} from "../../../../packages/api/src/missionary-portal/donor";
import { GET as listPartners } from "../../../../packages/api/src/missionary-portal/donors";
import { GET as getTasks } from "../../../../packages/api/src/missionary-portal/tasks";
import { membershipsForRole } from "../../../fixtures/auth-memberships";

import type { AuthContext } from "../../../../packages/auth/context";
import type * as AuthModule from "../../../../packages/auth/context";

const s = vi.hoisted(() => ({ auth: null as unknown }));
vi.mock("@asym/auth/context", async (orig) => ({
  ...(await orig<typeof AuthModule>()),
  getAuthContext: async () => s.auth,
}));
vi.mock("@asym/database/supabase/admin", () => {
  let client: ReturnType<typeof createClient> | undefined;
  return {
    getAdminClient: () => {
      client ??= createClient(
        process.env.WP5_IDENTITY_IT_URL ?? "http://127.0.0.1:1",
        process.env.WP5_IDENTITY_IT_SERVICE_KEY ?? "no-key",
        { auth: { persistSession: false, autoRefreshToken: false } },
      );
      return { client, error: null };
    },
  };
});
vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

const PEOPLE = ["adder", "other"] as const;
type Person = (typeof PEOPLE)[number];

describe.skipIf(!required && ![url, database, anon, service].some(Boolean))(
  "AL-2678 WP5 rest, fix round F1 and F7 (the ruling on an added partner's visibility, items 1, 4, 5 and 6, and F1 rule 7): a partner added by hand is named, with its name and phone and no e-mail, to the missionary who added it and to no one else; a restricted Party or a preference that is not false hides it again; on real tokens and a real stack",
  () => {
    const TA = randomUUID();
    const user = {} as Record<Person, string>;
    const token = {} as Record<Person, string>;
    const membership = {} as Record<Person, string>;
    const workerParty = {} as Record<Person, string>;
    const partner = {
      name: `Hand Added ${TA.slice(0, 6)}`,
      phone: "+256 700 000 001",
      type: "Individual",
      frequency: "Monthly",
      location: "Gulu",
    };
    const added = { donorId: "", partyId: "" };
    const publicEnv = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };
    const db = new pg.Client({ connectionString: database });
    const api = (path: string, init: RequestInit & { key: string }) =>
      fetch(`${url}/${path}`, {
        ...init,
        headers: {
          apikey: init.key,
          Authorization: `Bearer ${init.key}`,
          "Content-Type": "application/json",
          ...init.headers,
        },
      });

    const auth = (who: Person): AuthContext =>
      ({
        userId: user[who],
        email: null,
        tenantId: TA,
        role: "missionary",
        memberships: membershipsForRole("missionary", TA),
        profileId: user[who],
        isAuthenticated: true,
        assignment: {
          assignmentId: membership[who],
          userId: user[who],
          tenantId: TA,
          revision: "1",
          membershipRole: "missionary",
          staffRole: null,
          isTenantAdmin: false,
        },
      }) as AuthContext;
    const request = (
      who: Person,
      method: string,
      path: string,
      body?: unknown,
      headers: Record<string, string> = {},
    ) => {
      s.auth = auth(who);
      return new NextRequest(`http://localhost${path}`, {
        method,
        headers: {
          authorization: `Bearer ${token[who]}`,
          "sec-fetch-site": "same-origin",
          ...(body ? { "content-type": "application/json" } : {}),
          ...headers,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    };
    const withDonor = () => ({
      params: Promise.resolve({ donorId: added.donorId }),
    });

    async function listed(who: Person) {
      const response = await listPartners(
        request(who, "GET", "/api/missionary/donors"),
      );
      expect(response.status).toBe(200);
      const { donors } = (await response.json()) as {
        donors: {
          id: string;
          name: string;
          email: string;
          phone: string;
          is_anonymous: boolean;
        }[];
      };
      const row = donors.find((donor) => donor.id === added.donorId);
      return row
        ? {
            name: row.name,
            email: row.email,
            phone: row.phone,
            is_anonymous: row.is_anonymous,
          }
        : "absent";
    }

    async function writes(who: Person) {
      const path = `/api/missionary/donors/${added.donorId}`;
      const tags = await PATCH(
        request(who, "PATCH", path, { tags: ["wp5-rest"] }),
        withDonor(),
      );
      const activity = await POST_ACTIVITY(
        request(who, "POST", `${path}/activities`, {
          activityType: "note",
          note: "Met after the service",
        }),
        withDonor(),
      );
      const edit = await PATCH(
        request(who, "PATCH", path, {
          name: partner.name,
          email: `wp5rest-edit-${randomUUID()}@example.test`,
          phone: partner.phone,
          mobile: "",
          work_phone: "",
          preferred_contact: "phone",
          type: "Individual",
          status: "Active",
          frequency: "Monthly",
          location: partner.location,
          website: "",
          organization: "",
          title: "",
          spouse: "",
          birthday: "",
          anniversary: "",
          notes: "",
          street: "",
          street2: "",
          city: "",
          state: "",
          zip: "",
        }),
        withDonor(),
      );
      return {
        tags: tags.status,
        activity: activity.status,
        edit: edit.status,
      };
    }

    beforeAll(async () => {
      if (
        !url ||
        !database ||
        !anon ||
        !service ||
        ![url, database].every((value) =>
          ["localhost", "127.0.0.1", "[::1]"].includes(new URL(value).hostname),
        )
      )
        throw Error("A disposable local Supabase stack is required");
      process.env.NEXT_PUBLIC_SUPABASE_URL = url;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = anon;
      for (const who of PEOPLE) {
        const credentials = {
          email: `wp5rest-added-${who}-${TA}@example.test`,
          password: randomUUID(),
        };
        const created = await api("auth/v1/admin/users", {
          key: service,
          method: "POST",
          body: JSON.stringify({ ...credentials, email_confirm: true }),
        });
        expect(created.ok, `Auth fixture ${who}: ${created.status}`).toBe(true);
        user[who] = (await created.json()).id;
        const login = await api("auth/v1/token?grant_type=password", {
          key: anon,
          method: "POST",
          body: JSON.stringify(credentials),
        });
        expect(login.ok, `Sign-in ${who}: ${login.status}`).toBe(true);
        token[who] = (await login.json()).access_token;
        membership[who] = randomUUID();
        workerParty[who] = randomUUID();
      }
      await db.connect();
      await db.query("begin");
      try {
        await db.query(
          "insert into public.tenants (id, name, slug) values ($1::uuid, 'WP5 rest added', 'wp5rest-added-' || $1::text)",
          [TA],
        );
        await db.query(
          "insert into public.legal_entities (id, tenant_id, name, country_code, currency, legal_name) values ($1, $1, 'A', 'US', 'usd', 'A')",
          [TA],
        );
        await db.query(
          "delete from authz.memberships where user_id = any($1::uuid[])",
          [Object.values(user)],
        );
        for (const who of PEOPLE) {
          await db.query(
            "insert into authz.memberships (id, user_id, tenant_id, role) values ($1, $2, $3, 'missionary')",
            [membership[who], user[who], TA],
          );
          await db.query(
            "insert into public.parties (id, tenant_id, display_name) values ($1, $2, $3)",
            [workerParty[who], TA, `Worker ${who}`],
          );
          await db.query(
            "insert into public.missionaries (tenant_id, party_id, profile_id, legal_entity_id) values ($1, $2, $3, $1)",
            [TA, workerParty[who], user[who]],
          );
          await db.query(
            "insert into public.account_links (tenant_id, user_id, party_id, linked_via) values ($1, $2, $3, 'profile_backfill')",
            [TA, user[who], workerParty[who]],
          );
        }
        await db.query("commit");
      } catch (error) {
        await db.query("rollback");
        throw error;
      }
    });

    afterAll(async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = publicEnv.url;
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = publicEnv.key;
      try {
        await db.query("begin");
        for (const sql of [
          "delete from public.donor_activities where tenant_id = $1",
          "delete from public.crm_command_logs where tenant_id = $1",
          "delete from public.donors where tenant_id = $1",
          "delete from public.account_links where tenant_id = $1",
          "delete from public.missionaries where tenant_id = $1",
          "delete from public.parties where tenant_id = $1",
          "delete from public.legal_entities where tenant_id = $1",
          "delete from authz.memberships where tenant_id = $1",
          "delete from public.tenants where id = $1",
        ])
          await db.query(sql, [TA]);
        await db.query("commit");
      } catch (error) {
        await db.query("rollback");
        throw error;
      } finally {
        await db.end();
        const failures: string[] = [];
        for (const who of PEOPLE)
          if (user[who]) {
            const deleted = await api(`auth/v1/admin/users/${user[who]}`, {
              key: service!,
              method: "DELETE",
            });
            if (!deleted.ok) failures.push(`${who}: ${deleted.status}`);
          }
        expect(failures, "auth users the fixture could not delete").toEqual([]);
      }
    });

    it("the adding missionary adds a partner with a name and a phone and no e-mail and sees it named: its name and phone, no e-mail, not anonymous; tags, a logged activity and an edit succeed (F7 item 1 and F1 rule 7; red: the route requires an e-mail, and the row reads Anonymous partner with 404 on every write)", async () => {
      const response = await addPartner(
        request("adder", "POST", "/api/missionary/donors", partner, {
          "idempotency-key": randomUUID(),
        }),
      );
      expect(
        response.status,
        JSON.stringify(await response.clone().json()),
      ).toBe(201);
      Object.assign(added, await response.json());
      const stored = await db.query(
        "select email, giving_preferences from public.donors where id = $1",
        [added.donorId],
      );
      expect(stored.rows).toEqual([
        {
          email: null,
          giving_preferences: { defaultAnonymousToRecipient: false },
        },
      ]);
      expect(await listed("adder")).toEqual({
        name: partner.name,
        email: "",
        phone: partner.phone,
        is_anonymous: false,
      });
      expect(await writes("adder")).toEqual({
        tags: 200,
        activity: 201,
        edit: 200,
      });
    });

    it("another missionary of the organization never holds the row: not in their partner list, snapshot or tasks, and their writes to it are 404 (F7 item 5)", async () => {
      expect(added.donorId).not.toBe("");
      expect(await listed("other")).toBe("absent");
      for (const response of [
        await getSnapshot(request("other", "GET", "/api/missionary/portal")),
        await getTasks(request("other", "GET", "/api/missionary/tasks")),
      ]) {
        expect(response.status).toBe(200);
        const text = await response.text();
        expect(text).not.toContain(added.donorId);
        expect(text).not.toContain(partner.name);
      }
      expect(await writes("other")).toEqual({
        tags: 404,
        activity: 404,
        edit: 404,
      });
    });

    it("a restricted Party wins over the preference: the adding missionary sees Anonymous partner and every write is 404 (F7 item 4)", async () => {
      expect(added.partyId).not.toBe("");
      await db.query(
        "update public.parties set security_level = 'restricted', security_level_source = 'manual' where tenant_id = $1 and id = $2",
        [TA, added.partyId],
      );
      try {
        expect(await listed("adder")).toEqual({
          name: "Anonymous partner",
          email: "",
          phone: "",
          is_anonymous: true,
        });
        expect(await writes("adder")).toEqual({
          tags: 404,
          activity: 404,
          edit: 404,
        });
      } finally {
        await db.query(
          "update public.parties set security_level = 'standard' where tenant_id = $1 and id = $2",
          [TA, added.partyId],
        );
      }
    });

    it.each([
      ["an empty preference", {}],
      ["a preference switched on", { defaultAnonymousToRecipient: true }],
    ])(
      "%s, set in the fixture, hides the partner from the adding missionary again, and false names it again (F7 item 6: a hand-added partner has no e-mail to claim a login by)",
      async (_case, preference) => {
        expect(added.donorId).not.toBe("");
        await db.query(
          "update public.donors set giving_preferences = $2::jsonb where tenant_id = $1 and id = $3",
          [TA, preference, added.donorId],
        );
        try {
          expect(await listed("adder")).toMatchObject({
            name: "Anonymous partner",
            is_anonymous: true,
          });
          expect(await writes("adder")).toEqual({
            tags: 404,
            activity: 404,
            edit: 404,
          });
        } finally {
          await db.query(
            "update public.donors set giving_preferences = $2::jsonb where tenant_id = $1 and id = $3",
            [TA, { defaultAnonymousToRecipient: false }, added.donorId],
          );
        }
        expect(await listed("adder")).toMatchObject({
          name: partner.name,
          is_anonymous: false,
        });
      },
    );
  },
);

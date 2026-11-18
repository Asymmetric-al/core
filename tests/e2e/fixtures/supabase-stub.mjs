// A canned stand-in for the few Supabase Auth and Data API calls that a
// signed-in page of Mission Control or the missionary workspace makes, for
// the tenant-address suites on a production build (AL-2675).
//
// Why it exists: `next start` runs with NODE_ENV=production, where the E2E
// auth bypass is off by design (packages/auth/e2e-auth.ts), so nobody can sign
// in to a production build without a Supabase project. This stub lets a
// production build run the real-session code path (the proxy's membership
// decision, `getAuthContext`, the chooser) against the fixture people in
// tests/e2e/fixtures/tenant-people.json, with no Supabase stack, hosted
// project or container. It holds no data and verifies no signature: it
// decodes the caller's token and answers from the fixtures. Build and start
// the app with NEXT_PUBLIC_SUPABASE_URL pointing at it.
//
// Web Studio (AL-2675, WP2b slice C) adds what its suite needs: a refresh
// token that names its person (`stub-refresh:<user id>`), so the admin proxy's
// session refresh runs for real; an access token past its expiry is refused,
// as Supabase Auth refuses one; the `tenants` read Payload's strategy makes;
// and two control routes, `POST /__stub/revoke` ({ membershipId }) and
// `POST /__stub/reset`, which change the rows the stub serves the way
// revoking a membership changes the live rows.
//
// Usage: node tests/e2e/fixtures/supabase-stub.mjs
//   (port: SUPABASE_STUB_PORT, default 33998; bound to 127.0.0.1)
import { readFileSync } from "node:fs";
import http from "node:http";

const PORT = Number(process.env.SUPABASE_STUB_PORT ?? 33998);
function loadFixtures() {
  return JSON.parse(
    readFileSync(new URL("./tenant-people.json", import.meta.url), "utf8"),
  );
}

const { tenantNames } = loadFixtures();
let USERS = new Map();
function reset() {
  USERS = new Map(
    Object.values(loadFixtures().people).map((person) => [
      person.userId,
      person,
    ]),
  );
}
reset();

function claimsOf(token) {
  try {
    return JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString("utf8"),
    );
  } catch {
    return null;
  }
}

function callerOf(req) {
  const token = /^Bearer (.+)$/.exec(req.headers.authorization ?? "")?.[1];
  if (!token) return null;
  const payload = claimsOf(token);
  if (!payload) return null;
  // An access token past its expiry is refused, as Supabase Auth refuses it.
  if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
    return null;
  }
  return USERS.get(payload.sub) ?? null;
}

function userOf(person) {
  return {
    id: person.userId,
    aud: "authenticated",
    role: "authenticated",
    email: `${person.userId}@example.test`,
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {},
    created_at: "2026-11-17T00:00:00.000Z",
  };
}

/** A fresh session for a refresh token that names its person. */
function refreshedSession(refreshToken) {
  const userId = /^stub-refresh:([0-9a-f-]{36})(?::\d+)?$/.exec(
    refreshToken ?? "",
  )?.[1];
  const person = userId ? USERS.get(userId) : null;
  if (!person) return null;
  const expiresAt = Math.floor(Date.now() / 1000) + 6 * 3600;
  const accessToken = [
    { alg: "HS256", typ: "JWT" },
    {
      sub: userId,
      exp: expiresAt,
      aud: "authenticated",
      role: "authenticated",
    },
  ]
    .map((part) => Buffer.from(JSON.stringify(part)).toString("base64url"))
    .concat("stub-not-a-real-signature")
    .join(".");
  return {
    access_token: accessToken,
    token_type: "bearer",
    expires_in: 6 * 3600,
    expires_at: expiresAt,
    refresh_token: `stub-refresh:${userId}:${Date.now()}`,
    user: userOf(person),
  };
}

function slugOf(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function send(res, status, body) {
  res.writeHead(status, {
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "*",
    "access-control-allow-methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
    "content-type": "application/json",
  });
  res.end(body === undefined ? "" : JSON.stringify(body));
}

function assignmentRows(person) {
  return person.memberships.map((membership) => ({
    id: membership.id,
    user_id: person.userId,
    tenant_id: membership.tenantId,
    role: membership.role,
    staff_role: membership.staffRole,
    is_tenant_admin: membership.isTenantAdmin,
    updated_at: "2026-11-17T00:00:00.000000+00:00",
  }));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (req.method === "OPTIONS") return send(res, 204);

  let raw = "";
  req.on("data", (chunk) => (raw += chunk));
  req.on("end", () => {
    const person = callerOf(req);
    const wantsObject = (req.headers.accept ?? "").includes("vnd.pgrst.object");

    if (url.pathname === "/__stub/reset" && req.method === "POST") {
      reset();
      return send(res, 200, { ok: true });
    }
    if (url.pathname === "/__stub/revoke" && req.method === "POST") {
      const { membershipId } = raw ? JSON.parse(raw) : {};
      for (const [userId, holder] of USERS) {
        USERS.set(userId, {
          ...holder,
          memberships: holder.memberships.filter((m) => m.id !== membershipId),
        });
      }
      return send(res, 200, { ok: true });
    }
    if (url.pathname === "/auth/v1/user") {
      if (!person) return send(res, 401, { message: "invalid token" });
      return send(res, 200, userOf(person));
    }
    if (
      url.pathname === "/auth/v1/token" &&
      url.searchParams.get("grant_type") === "refresh_token"
    ) {
      const session = refreshedSession(
        raw ? JSON.parse(raw).refresh_token : null,
      );
      return session
        ? send(res, 200, session)
        : send(res, 400, {
            error: "invalid_grant",
            error_description: "Invalid Refresh Token: Refresh Token Not Found",
          });
    }
    if (url.pathname.startsWith("/auth/v1/")) return send(res, 200, {});
    if (url.pathname === "/rest/v1/tenants") {
      // What Payload's strategy reads to mirror the organization it acts in.
      const id = /^eq\.(.+)$/.exec(url.searchParams.get("id") ?? "")?.[1];
      const name = id ? tenantNames[id] : undefined;
      const rows = name ? [{ id, name, slug: slugOf(name) }] : [];
      if (wantsObject) {
        return rows.length
          ? send(res, 200, rows[0])
          : send(res, 406, { code: "PGRST116", message: "no rows (stub)" });
      }
      return send(res, 200, rows);
    }
    if (url.pathname === "/rest/v1/profiles" && person) {
      const profile = {
        id: `00000000-0000-4000-9000-${person.userId.slice(-12)}`,
        user_id: person.userId,
        email: `${person.userId}@example.test`,
        first_name: "Fixture",
        last_name: "Person",
        avatar_url: null,
      };
      return send(res, 200, wantsObject ? profile : [profile]);
    }
    if (url.pathname === "/rest/v1/rpc/current_user_assignments" && person) {
      return send(res, 200, assignmentRows(person));
    }
    if (url.pathname === "/rest/v1/rpc/current_user_organizations" && person) {
      // As the function does: a name only for a tenant the caller holds a row in.
      const tenantIds = [
        ...new Set(person.memberships.map((m) => m.tenantId)),
      ].sort();
      return send(
        res,
        200,
        tenantIds.map((tenant_id) => ({
          tenant_id,
          name: tenantNames[tenant_id],
        })),
      );
    }
    if (url.pathname === "/rest/v1/rpc/current_user_memberships" && person) {
      const target = raw ? JSON.parse(raw).target_tenant : null;
      return send(
        res,
        200,
        assignmentRows(person)
          .filter((row) => row.tenant_id === target)
          .map(({ tenant_id, role, staff_role, is_tenant_admin }) => ({
            tenant_id,
            role,
            staff_role,
            is_active: true,
            is_tenant_admin,
          })),
      );
    }
    if (wantsObject) {
      return send(res, 406, { code: "PGRST116", message: "no rows (stub)" });
    }
    return send(res, 200, []);
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[supabase-stub] listening on http://127.0.0.1:${PORT}`);
});

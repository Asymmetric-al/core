import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { createRequire } from "node:module";

import {
  createTrackedFixtureUser,
  fixtureAuthUserCleanupOperations,
  isDeniedSelfRoleUpdate,
  runFixtureCleanup,
  verifyLocalFixtureTarget,
} from "./client-runtime-checks.mjs";

// Feed credentials from an owned local CLI status response through stdin only.
// Never invoke this fixture against a shared or hosted project.
const checks = [];
let step = "validate-local-target";
let failedCheck;
let providerErrorCode;
let realtimeStatus;
let cleanupFailures;

function check(condition, label) {
  if (!condition) failedCheck = label;
  assert.ok(condition, label);
  checks.push(label);
}

function successful(result) {
  if (result.error) {
    failedCheck = "provider-request";
    const code = result.error.code;
    providerErrorCode = /^[A-Za-z0-9_]{1,50}$/.test(code)
      ? code
      : "unclassified";
  }
  assert.equal(result.error, null, `Provider check failed: ${step}`);
  return result.data;
}

function bounded(operation, label) {
  let timer;
  return Promise.race([
    operation,
    new Promise((_, reject) => {
      timer = setTimeout(() => {
        failedCheck = label;
        reject(new Error(label));
      }, 15_000);
    }),
  ]).finally(() => clearTimeout(timer));
}

async function verify(input) {
  assert.ok(
    input.simulateLostUserCreationResponse === undefined ||
      typeof input.simulateLostUserCreationResponse === "boolean",
  );
  const { url } = await verifyLocalFixtureTarget(input);
  checks.push("local-target-bound-to-owned-gateway");

  const require = createRequire(
    new URL("../../../packages/database/package.json", import.meta.url),
  );
  const { createClient } = require("@supabase/supabase-js");
  const { createServerClient } = require("@supabase/ssr");
  let simulateLostResponse = input.simulateLostUserCreationResponse === true;
  const global = {
    fetch: async (request, init) => {
      const response = await fetch(request, {
        ...init,
        redirect: "error",
        signal: AbortSignal.timeout(15_000),
      });
      const requestUrl = new URL(
        request instanceof Request ? request.url : String(request),
      );
      if (
        simulateLostResponse &&
        init?.method === "POST" &&
        requestUrl.pathname === "/auth/v1/admin/users" &&
        response.ok
      ) {
        simulateLostResponse = false;
        await response.arrayBuffer();
        checks.push("simulated-committed-user-creation-response-loss");
        throw new TypeError("Synthetic fixture creation response loss");
      }
      return response;
    },
  };
  const options = {
    global,
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  };
  const admin = createClient(url.href, input.SERVICE_ROLE_KEY, options);
  const browser = createClient(url.href, input.PUBLIC_KEY, options);
  const anonymous = createClient(url.href, input.PUBLIC_KEY, options);
  const tenantIds = [randomUUID(), randomUUID()];
  const users = [];
  const runId = randomUUID();
  const fundId = randomUUID();
  const cookies = new Map();
  const server = () =>
    createServerClient(url.href, input.PUBLIC_KEY, {
      global,
      cookies: {
        getAll: () => [...cookies].map(([name, value]) => ({ name, value })),
        setAll: (updates) => {
          for (const { name, value, options: cookieOptions } of updates) {
            if (!value || cookieOptions.maxAge === 0) cookies.delete(name);
            else cookies.set(name, value);
          }
        },
      },
    });
  const census = async (validate = successful) => {
    const counts = {};
    await Promise.all(
      ["tenants", "profiles", "funds"].map(async (table) => {
        const result = await admin.from(table).select("id", {
          count: "exact",
          head: true,
        });
        validate(result);
        counts[table] = result.count;
      }),
    );
    return counts;
  };
  const before = await census();
  let verificationFailed = false;
  let cleaningUp = false;
  try {
    step = "create-owned-fixtures";
    successful(
      await admin.from("tenants").insert(
        tenantIds.map((id) => ({
          id,
          name: "SDK qualification fixture",
          slug: `sdk-qualification-${id}`,
        })),
      ),
    );
    for (const tenantId of tenantIds) {
      const email = `sdk-${randomUUID()}@example.invalid`;
      const password = randomBytes(32).toString("base64url");
      const { user } = successful(
        await createTrackedFixtureUser(admin.auth.admin, users, {
          id: randomUUID(),
          email,
          password,
          tenantId,
          runId,
        }),
      );
      assert.ok(user);
      check(
        user.app_metadata.tenant_id === tenantId &&
          user.app_metadata.sdk_qualification_run === runId,
        "fixture-user-tenant-metadata",
      );
      // Provision the domain fixture explicitly; Auth metadata is not a
      // substitute for verifying the profile's actual tenant assignment.
      const profile = successful(
        await admin
          .from("profiles")
          .update({ tenant_id: tenantId })
          .eq("id", user.id)
          .select("tenant_id")
          .single(),
      );
      check(profile.tenant_id === tenantId, "fixture-profile-tenant-assigned");
    }

    step = "browser-auth-and-row-isolation";
    const login = successful(await browser.auth.signInWithPassword(users[0]));
    check(login.user.id === users[0].id, "password-session");
    check(
      successful(await browser.auth.getUser()).user.id === users[0].id,
      "verified-user",
    );
    const own = successful(
      await browser
        .from("profiles")
        .select("id,tenant_id,role")
        .eq("id", users[0].id),
    );
    check(own.length === 1, "own-profile-visible");
    check(own[0].tenant_id === tenantIds[0], "own-profile-tenant-preserved");
    const other = successful(
      await browser.from("profiles").select("id").eq("id", users[1].id),
    );
    check(other.length === 0, "cross-tenant-profile-denied");
    const anon = await anonymous.from("profiles").select("id");
    check(
      anon.error ? anon.error.code === "42501" : anon.data.length === 0,
      "anonymous-profiles-denied",
    );
    const tenantSecrets = await browser.from("tenants").select("id");
    check(
      tenantSecrets.error?.code === "42501" && !tenantSecrets.data,
      "tenant-secret-table-denied",
    );
    const roleUpdate = await browser
      .from("profiles")
      .update({ role: "super_admin" })
      .eq("id", users[0].id)
      .select("id,role");
    const unchanged = successful(
      await admin
        .from("profiles")
        .select("role")
        .eq("id", users[0].id)
        .single(),
    );
    check(
      isDeniedSelfRoleUpdate(roleUpdate, unchanged.role),
      "self-role-escalation-denied",
    );

    step = "authenticated-realtime-and-money-contract";
    let acceptChange;
    const changed = new Promise((resolve) => {
      acceptChange = resolve;
    });
    let acceptSubscription;
    let rejectSubscription;
    const subscribed = new Promise((resolve, reject) => {
      acceptSubscription = resolve;
      rejectSubscription = reject;
    });
    browser
      .channel(`sdk-qualification-${fundId}`, {
        config: {
          postgres_changes_options: { wait: true, timeout: 8_000 },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "funds",
          filter: `id=eq.${fundId}`,
        },
        acceptChange,
      )
      .subscribe((status, error) => {
        if (cleaningUp) return;
        if (/^[A-Z_]{1,30}$/.test(status)) realtimeStatus = status;
        if (status === "SUBSCRIBED") acceptSubscription();
        else if (["CHANNEL_ERROR", "TIMED_OUT"].includes(status)) {
          failedCheck = "realtime-subscription";
          providerErrorCode = /token|jwt|signature/i.test(error?.message ?? "")
            ? "realtime-authentication"
            : "realtime-transport-or-server";
          rejectSubscription(new Error("Realtime subscription failed"));
        }
      });
    await bounded(subscribed, "Realtime subscription deadline");
    successful(
      await admin.from("funds").insert({
        id: fundId,
        tenant_id: tenantIds[0],
        name: "SDK qualification fund",
        goal_amount: 12345,
        currency: "USD",
      }),
    );
    const event = await bounded(changed, "Realtime delivery deadline");
    check(
      event.new.id === fundId &&
        event.new.goal_amount === 12345 &&
        event.new.currency === "usd",
      "realtime-preserves-minor-units-and-currency",
    );
    check(
      successful(await browser.auth.refreshSession()).user.id === users[0].id,
      "browser-session-refresh",
    );
    successful(await browser.auth.signOut());

    step = "ssr-request-cookie-lifecycle";
    successful(await server().auth.signInWithPassword(users[0]));
    check(cookies.size > 0, "ssr-writes-session-cookies");
    check(
      successful(await server().auth.getUser()).user.id === users[0].id,
      "ssr-recreated-request-verifies-user",
    );
    check(
      successful(await server().auth.refreshSession()).user.id === users[0].id,
      "ssr-session-refresh",
    );
    successful(await server().auth.signOut());
    check(cookies.size === 0, "ssr-signout-clears-session-cookies");
  } catch (error) {
    verificationFailed = true;
    throw error;
  } finally {
    const primaryFailure = {
      step,
      failedCheck,
      providerErrorCode,
      realtimeStatus,
    };
    cleaningUp = true;
    step = "remove-owned-fixtures";
    const cleanupSuccessful = (result) => {
      assert.equal(result.error, null, "Fixture cleanup request failed");
      return result.data;
    };
    const failures = await runFixtureCleanup([
      {
        label: "remove-channels",
        run: async () => {
          const results = await browser.removeAllChannels();
          assert.ok(results.every((result) => result === "ok"));
        },
      },
      {
        label: "delete-fund",
        run: async () =>
          cleanupSuccessful(
            await admin.from("funds").delete().eq("id", fundId),
          ),
      },
      ...fixtureAuthUserCleanupOperations(admin.auth.admin, users),
      {
        label: "delete-tenants",
        run: async () =>
          cleanupSuccessful(
            await admin.from("tenants").delete().in("id", tenantIds),
          ),
      },
      {
        label: "restore-census",
        run: async () =>
          assert.deepEqual(
            await census(cleanupSuccessful),
            before,
            "Fixture census changed",
          ),
      },
    ]);
    if (failures.length === 0) checks.push("fixture-census-restored");
    if (failures.length > 0) cleanupFailures = failures;
    if (verificationFailed) {
      ({ step, failedCheck, providerErrorCode, realtimeStatus } =
        primaryFailure);
    } else if (failures.length > 0) {
      failedCheck = "fixture-cleanup";
      providerErrorCode = undefined;
      realtimeStatus = undefined;
      throw new Error("Fixture cleanup failed");
    } else {
      step = primaryFailure.step;
    }
  }
}

try {
  let body = "";
  for await (const chunk of process.stdin) {
    body += chunk;
    assert.ok(Buffer.byteLength(body) <= 64 * 1024, "Input exceeds limit");
  }
  await verify(JSON.parse(body));
  console.log(
    JSON.stringify({ passed: true, checks, productionTouched: false }),
  );
} catch {
  // SDK errors and assertion values can contain credentials or fixture identity.
  console.error(
    JSON.stringify({
      passed: false,
      step,
      failedCheck,
      providerErrorCode,
      realtimeStatus,
      cleanupFailures,
      checks,
    }),
  );
  process.exitCode = 1;
}

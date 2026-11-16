import assert from "node:assert/strict";
import test from "node:test";

import * as preflight from "./fixture-preflight.mjs";
import { installModuleFixtures } from "./fixtures/module-fixtures.mjs";
import * as routeErrors from "./route-errors.mjs";
import * as states from "./workspace-states.mjs";

test("the New page template picker waits for its heading, past hidden duplicate text", async () => {
  const state = states
    .createStates({})
    .find((entry) => entry.name === "studio-new-page-template-picker");
  const waits = [];
  const page = {
    getByText() {
      throw new Error("the first New page text match is hidden");
    },
    getByRole(role, options) {
      assert.equal(role, "heading");
      assert.deepEqual(options, { name: "New page", exact: true });
      return { waitFor: async (options) => waits.push(options) };
    },
  };

  await states.waitForStateReady(page, state, 50);

  assert.deepEqual(waits, [{ state: "visible", timeout: 50 }]);
});

test("route boundaries and missing routes are reported from visible headings", async () => {
  const page = {
    getByRole(role) {
      assert.equal(role, "heading");
      return {
        allTextContents: async () => [
          "Reports",
          " This page couldn’t load ",
          "Something went wrong!",
          "Page not found",
          "Application error: a client-side exception has occurred",
        ],
      };
    },
  };

  assert.deepEqual(await routeErrors.readRouteErrorHeadings(page), [
    "This page couldn’t load",
    "Something went wrong!",
    "Page not found",
    "Application error: a client-side exception has occurred",
  ]);
});

test("intentional failed lookups and form validation are not route crashes", () => {
  assert.deepEqual(
    routeErrors.findRouteErrorHeadings([
      "Couldn't load CRM records",
      "Couldn't load templates",
      "Unavailable",
      "New page",
      "Please fix the errors below",
      "Giving trend unavailable",
    ]),
    [],
  );
});

test("capture fixtures are rebuilt and verified after candidate type proof, without writing JSON", () => {
  const calls = [];
  const bundle = { captureMeta: { crmFirstName: "Candidate fixture" } };
  const result = preflight.prepareFixtureBundle({
    run(command, args, options) {
      calls.push({ command, args, options });
      return {
        status: 0,
        stdout: calls.length === 2 ? JSON.stringify(bundle) : "checks passed",
        stderr: "",
      };
    },
  });

  assert.equal(calls.length, 3);
  assert(calls[0].args.includes("--noEmit"));
  assert(
    calls[0].args
      .at(-1)
      .replaceAll("\\", "/")
      .endsWith("fixtures/tsconfig.json"),
  );
  assert(calls[1].args.at(-1) === "--stdout");
  assert.equal(calls[1].options.env?.SKIP_ENV_VALIDATION, "1");
  assert.equal(calls[1].options.env?.SUPABASE_SERVICE_ROLE_KEY, "");
  assert(calls[2].args.at(-1) === "--stdin");
  assert.equal(calls[2].options.input, JSON.stringify(bundle));
  assert(calls.every((call) => call.options.cwd === result.proof.repoRoot));
  assert.deepEqual(result.bundle, bundle);
  assert.equal(result.proof.typecheck, "passed");
  assert.match(result.proof.bundleSha256, /^[a-f0-9]{64}$/);
});

for (const failedStep of [1, 2, 3]) {
  test(`fixture preflight stops at failed step ${failedStep} without falling back to saved data`, () => {
    let calls = 0;
    assert.throws(
      () =>
        preflight.prepareFixtureBundle({
          run() {
            calls += 1;
            return {
              status: calls === failedStep ? 1 : 0,
              stdout: "{}",
              stderr: "contract drift",
            };
          },
        }),
      /Fixture preflight failed:.*\(exit 1\)/,
    );
    assert.equal(calls, failedStep);
  });
}

test("the current Reports fixture carries completeness and preserves deliberate API failures", async () => {
  const call = async (scenario) => {
    const handlers = [];
    await installModuleFixtures(
      {
        route: async (_pattern, handler) => handlers.push(handler),
      },
      { scenario },
    );
    let response;
    await handlers[0]({
      request: () => ({
        method: () => "GET",
        url: () => "https://fixture.invalid/api/admin/crm/reports?slice=funds",
        postDataJSON: () => null,
      }),
      fulfill: async (result) => {
        response = { ...result, body: JSON.parse(result.body) };
      },
      fallback: async () =>
        assert.fail("Reports must be served by module fixtures"),
    });
    return response;
  };
  const loaded = await call("populated");
  assert.equal(loaded.status, 200);
  assert.deepEqual(loaded.body.completeness, {
    complete: true,
    donationLimit: 50_000,
    includedGiftCount: 537,
  });
  assert.equal(loaded.body.totals.amountCents, 10_562_800);
  const failed = await call("error");
  assert.equal(failed.status, 500);
  assert.equal(failed.body.requestId, "req_fixture_error");
});

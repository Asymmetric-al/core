/**
 * #2224 acceptance: demo-auth readiness, CI fail-instead-of-skip, and the
 * unchanged API tests in tests/e2e/upload-crop.spec.ts (spec r1 §4 criteria
 * 10, 11, 12).
 *
 * Owned by Acceptance; implementers must not edit this file, the harness, or
 * the fixtures in this directory.
 * Spec: https://github.com/Asymmetric-al/core/issues/2224#issuecomment-6369737684
 */
import { describe, expect, it } from "vitest";

import { TITLES, loadSpec, pick, runFresh, runTest } from "./harness";

const DONOR_READY = { roles: { donor: true } };
const posts = (r: { world: { requests: { method: string; url: string }[] } }) =>
  r.world.requests.filter(
    (q) => q.method === "POST" && q.url.includes("/api/auth/demo-account"),
  );

describe("#2224 criterion 10: a non-2xx readiness response is reported as unavailable (`ok()` is called)", () => {
  it("locally, a 503 with a donor-ready body skips with a reason naming 503 and installs no session", async () => {
    const r = await runFresh(pick.open, {
      demo: { status: 503, body: DONOR_READY },
    });
    expect(r.outcome, r.details.join("\n")).toBe("skipped");
    expect(r.skipReason).toMatch(/503/);
    expect(posts(r)).toEqual([]);
  });

  it("under CI, the same 503 fails the test with a reason naming 503", async () => {
    const r = await runFresh(
      pick.open,
      { demo: { status: 503, body: DONOR_READY } },
      { env: { CI: "1" } },
    );
    expect(r.outcome).toBe("failed");
    expect(r.error).toMatch(/503/);
  });

  it("control: a 200 donor-ready response proceeds to install the demo session", async () => {
    const r = await runFresh(
      pick.open,
      { demo: { status: 200, body: DONOR_READY } },
      { env: { CI: "1" } },
    );
    expect(r.outcome, r.details.join("\n")).toBe("passed");
    expect(posts(r).length).toBeGreaterThan(0);
  });
});

describe("#2224 criterion 11: under CI, unavailable demo auth fails the auth-required tests; locally they skip", () => {
  const authRequired = () =>
    loadSpec().tests.filter((t) => t.describes[0] !== TITLES.apiSuite);

  it.each([
    ["1", 500],
    ["1", 503],
    ["1", 404],
    ["true", 503],
  ])(
    "CI=%s with demo-account %i: every auth-required test fails and none is skipped",
    async (ci, status) => {
      const titles = authRequired().map((t) => t.title);
      expect(titles.length).toBeGreaterThan(0);
      for (const title of titles) {
        const reg = loadSpec({ env: { CI: ci } });
        const r = await runTest(
          reg,
          reg.tests.find((t) => t.title === title)!,
          {
            demo: { status, body: {} },
          },
        );
        expect(r.outcome, `${title}: ${r.details.join("\n")}`).toBe("failed");
      }
    },
  );

  it("without CI, every auth-required test skips with a reason", async () => {
    for (const t of authRequired()) {
      const reg = loadSpec();
      const r = await runTest(
        reg,
        reg.tests.find((x) => x.title === t.title)!,
        {
          demo: { status: 500, body: {} },
        },
      );
      expect(r.outcome, t.title).toBe("skipped");
      expect(r.skipReason, t.title).toBeTruthy();
    }
  });

  it("CI fails (and local skips) when the donor role is not available", async () => {
    const cfg = { demo: { status: 200, body: { roles: { donor: false } } } };
    expect((await runFresh(pick.open, cfg, { env: { CI: "1" } })).outcome).toBe(
      "failed",
    );
    expect((await runFresh(pick.open, cfg)).outcome).toBe("skipped");
  });

  it("CI fails (and local skips) when installing the demo session fails", async () => {
    const cfg = { session: { status: 500 } };
    expect((await runFresh(pick.open, cfg, { env: { CI: "1" } })).outcome).toBe(
      "failed",
    );
    expect((await runFresh(pick.open, cfg)).outcome).toBe("skipped");
  });

  it("the auth-optional API suite still runs under CI when demo auth is down", async () => {
    for (const choose of [pick.apiInvalid, pick.apiMissing]) {
      const r = await runFresh(
        choose,
        { demo: { status: 503, body: {} } },
        { env: { CI: "1" } },
      );
      expect(r.outcome, r.details.join("\n")).toBe("passed");
    }
  });

  it("no test is declared skip, fixme, fail or only", () => {
    for (const t of loadSpec({ env: { CI: "1" } }).tests)
      expect(
        t.modifiers.filter((m) =>
          ["skip", "fixme", "fail", "only"].includes(m),
        ),
        t.title,
      ).toEqual([]);
  });
});

describe("#2224 criterion 12: the API 401 tests and the controls test are kept", () => {
  it("the invalid-token test passes on a 401 and fails on a 501", async () => {
    expect((await runFresh(pick.apiInvalid)).outcome).toBe("passed");
    const r = await runFresh(pick.apiInvalid, {
      upload: { missing: 401, invalid: 501, other: 501, errorBody: true },
    });
    expect(r.outcome).toBe("failed");
  });

  it("the missing-auth test passes on a 401 with an error body and fails otherwise", async () => {
    expect((await runFresh(pick.apiMissing)).outcome).toBe("passed");
    const wrongStatus = await runFresh(pick.apiMissing, {
      upload: { missing: 501, invalid: 401, other: 501, errorBody: true },
    });
    expect(wrongStatus.outcome).toBe("failed");
    const noBody = await runFresh(pick.apiMissing, {
      upload: { missing: 401, invalid: 401, other: 501, errorBody: false },
    });
    expect(noBody.outcome).toBe("failed");
  });

  it("the controls test passes on the real page and fails without Remove or with Upload New disabled", async () => {
    expect((await runFresh(pick.controls)).outcome).toBe("passed");
    expect(
      (await runFresh(pick.controls, { removeButton: false })).outcome,
    ).toBe("failed");
    expect(
      (await runFresh(pick.controls, { uploadNewEnabled: false })).outcome,
    ).toBe("failed");
  });
});

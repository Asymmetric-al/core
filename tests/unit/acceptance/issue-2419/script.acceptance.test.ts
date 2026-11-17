/**
 * #2419 acceptance (owned by Acceptance): scripts/verify-money-units.ts must
 * require SUPABASE_SERVICE_ROLE_KEY explicitly, with no anon-key fallback.
 * Black-box at the script seam: each case runs `bun scripts/verify-money-units.ts`
 * from an empty temp cwd with an explicit env against a local REST stub
 * (see ./harness). Criteria C2–C5 of the #2419 acceptance design.
 *
 * Expected verdict lines are worked examples of the base (2a4f70a8) analysis
 * rules, which #2419 must leave unchanged (brief item 5).
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  ANON_SENTINEL,
  ANON_VAR,
  KEY_VAR,
  SERVICE_SENTINEL,
  TABLES,
  URL_VAR,
  type Fixture,
  type RunResult,
  lines,
  removeTempDirs,
  runScript,
} from "./harness";

afterAll(removeTempDirs);

const output = (r: RunResult) => `${r.stdout}\n${r.stderr}`;
const why = (r: RunResult) =>
  `status=${r.status} signal=${r.signal}\nstdout:\n${r.stdout.slice(-1500)}\nstderr:\n${r.stderr.slice(-1500)}`;

/**
 * C2: the key is unset, empty or whitespace-only. In every case an anon key is
 * available (process env or a .env file in the cwd), so a surviving fallback
 * would show up as requests to the stub.
 */
const MISSING_KEY_CASES: [
  string,
  Record<string, string | undefined>,
  Record<string, string>,
][] = [
  ["unset (anon key in env)", { [ANON_VAR]: ANON_SENTINEL }, {}],
  ["unset (no anon key either)", {}, {}],
  ["empty string", { [KEY_VAR]: "", [ANON_VAR]: ANON_SENTINEL }, {}],
  ["whitespace only", { [KEY_VAR]: "  \t  ", [ANON_VAR]: ANON_SENTINEL }, {}],
  [
    "unset (anon key only in cwd .env and .env.local)",
    {},
    {
      ".env": `${ANON_VAR}=${ANON_SENTINEL}\n`,
      ".env.local": `${ANON_VAR}="${ANON_SENTINEL}"\n`,
    },
  ],
];

describe.each(MISSING_KEY_CASES)(
  "#2419 C2: %s SUPABASE_SERVICE_ROLE_KEY",
  (_label, env, files) => {
    let r: RunResult;
    beforeAll(async () => {
      r = await runScript({ env, files });
    });

    it("C2: exits non-zero (not by timeout/signal)", () => {
      expect(r.signal, why(r)).toBeNull();
      expect(r.status, why(r)).not.toBe(0);
    });
    it("C2: makes no network request", () => {
      expect(r.requests, why(r)).toEqual([]);
    });
    it("C2: stderr names SUPABASE_SERVICE_ROLE_KEY", () => {
      expect(r.stderr, why(r)).toContain(KEY_VAR);
    });
    it("C2: the error states the key is required (not merely preferred or optional)", () => {
      expect(r.stderr, why(r)).toMatch(
        /\b(required|requires|missing|must be set|is not set|not set|unset|empty|blank)\b/i,
      );
      expect(r.stderr, why(r)).not.toMatch(/\b(preferred|optional)\b/i);
    });
    it("C2: output does not suggest the anon key", () => {
      expect(output(r), why(r)).not.toMatch(/ANON_KEY/i);
    });
    it("C4: output never echoes the anon key value", () => {
      expect(output(r), why(r)).not.toContain(ANON_SENTINEL);
    });
  },
);

describe("#2419 C3: NEXT_PUBLIC_SUPABASE_URL missing-check is kept", () => {
  let r: RunResult;
  beforeAll(async () => {
    r = await runScript({
      env: { [KEY_VAR]: SERVICE_SENTINEL, [ANON_VAR]: ANON_SENTINEL },
      withUrl: false,
    });
  });
  it("C3: exits non-zero (not by timeout/signal)", () => {
    expect(r.signal, why(r)).toBeNull();
    expect(r.status, why(r)).not.toBe(0);
  });
  it("C3: stderr names NEXT_PUBLIC_SUPABASE_URL", () => {
    expect(r.stderr, why(r)).toContain(URL_VAR);
  });
  it("C4: output never echoes the service-role key value", () => {
    expect(output(r), why(r)).not.toContain(SERVICE_SENTINEL);
  });
});

/** Mixed fixture: YES, INCONCLUSIVE and ERROR verdicts, no NO → exit 0. */
const MIXED: Record<string, Fixture> = {
  donations: {
    status: 200,
    rows: [
      { amount: 2599, refund_amount: null },
      { amount: 1000, refund_amount: null },
    ],
  },
  donor_pledges: {
    status: 403,
    body: '{"message":"permission denied for table donor_pledges"}',
  },
  funds: {
    status: 200,
    rows: [{ target_amount: 20000 }, { target_amount: "30000" }],
  },
  campaigns: { status: 200, rows: [{ goal_amount: 500, current_amount: 300 }] },
};
const MIXED_LINES = [
  "donations.amount: YES | samples=2 | min=1000 median=1000 max=2599 | decimals=0 nonHundredMultiples=1",
  "  -> Found integer values not divisible by 100 (e.g. 2599), which strongly suggests cents.",
  "donations.refund_amount: INCONCLUSIVE | samples=0 | min=0 median=0 max=0 | decimals=0 nonHundredMultiples=0",
  "  -> No numeric values sampled.",
  "donor_pledges.amount: ERROR | samples=0 | min=0 median=0 max=0 | decimals=0 nonHundredMultiples=0",
  '  -> HTTP 403 for donor_pledges: {"message":"permission denied for table donor_pledges"}',
  "funds.target_amount: YES | samples=2 | min=20000 median=20000 max=30000 | decimals=0 nonHundredMultiples=0",
  "  -> Values are large integers; this looks like cents entered in whole-dollar increments.",
  "campaigns.goal_amount: INCONCLUSIVE | samples=1 | min=500 median=500 max=500 | decimals=0 nonHundredMultiples=0",
  "  -> All sampled values are integer multiples of 100, which can represent whole-dollar values in either dollars or cents storage.",
  "missionaries.funding_goal: INCONCLUSIVE | samples=0 | min=0 median=0 max=0 | decimals=0 nonHundredMultiples=0",
];

const PRESENT_CASES: [
  string,
  Record<string, string | undefined>,
  Record<string, string>,
][] = [
  [
    "process env (anon key also set)",
    { [KEY_VAR]: SERVICE_SENTINEL, [ANON_VAR]: ANON_SENTINEL },
    {},
  ],
  [
    "cwd .env.local (anon key also in .env)",
    {},
    {
      ".env.local": `${KEY_VAR}=${SERVICE_SENTINEL}\n`,
      ".env": `${ANON_VAR}=${ANON_SENTINEL}\n`,
    },
  ],
];

describe.each(PRESENT_CASES)(
  "#2419 C5: key present via %s",
  (_label, env, files) => {
    let r: RunResult;
    beforeAll(async () => {
      r = await runScript({ env, files, fixtures: MIXED });
    });

    it("C5: exits 0 when no verdict is NO (ERROR/INCONCLUSIVE do not fail)", () => {
      expect(r.signal, why(r)).toBeNull();
      expect(r.status, why(r)).toBe(0);
    });
    it("C5: samples each of the eight money tables exactly once", () => {
      expect(r.requests.map((q) => q.table).sort(), why(r)).toEqual(TABLES);
    });
    it("C5: keeps the select list and the default sample size of 200", () => {
      const q = r.requests.find((x) => x.table === "donations");
      const params = new URLSearchParams(q?.search ?? "");
      expect([params.get("select"), params.get("limit")], why(r)).toEqual([
        "amount,refund_amount",
        "200",
      ]);
    });
    it("C1/C5: authenticates every request with SUPABASE_SERVICE_ROLE_KEY only", () => {
      expect(
        r.requests.map((q) => [q.apikey, q.authorization]),
        why(r),
      ).toEqual(
        TABLES.map(() => [SERVICE_SENTINEL, `Bearer ${SERVICE_SENTINEL}`]),
      );
    });
    it("C5: verdict lines are unchanged", () => {
      expect(lines(r.stdout), why(r)).toEqual(
        expect.arrayContaining(MIXED_LINES),
      );
    });
    it("C4: output never echoes either key value", () => {
      const out = output(r);
      expect(
        [out.includes(SERVICE_SENTINEL), out.includes(ANON_SENTINEL)],
        why(r),
      ).toEqual([false, false]);
    });
    it("C4: an 'Auth key in use' line, if kept, names only SUPABASE_SERVICE_ROLE_KEY", () => {
      const authLines = lines(r.stdout).filter((l) =>
        /^auth key in use/i.test(l),
      );
      for (const l of authLines)
        expect(l, why(r)).toBe(`Auth key in use: ${KEY_VAR}`);
    });
  },
);

describe("#2419 C5: a NO verdict still fails the run", () => {
  let r: RunResult;
  beforeAll(async () => {
    r = await runScript({
      env: { [KEY_VAR]: SERVICE_SENTINEL },
      fixtures: {
        donors: {
          status: 200,
          rows: [{ total_given: 12.5, last_gift_amount: 2500 }],
        },
      },
    });
  });
  it("C5: prints the NO verdict", () => {
    expect(lines(r.stdout), why(r)).toContain(
      "donors.total_given: NO | samples=1 | min=12.5 median=12.5 max=12.5 | decimals=1 nonHundredMultiples=0",
    );
  });
  it("C5: exits 1", () => {
    expect(r.signal, why(r)).toBeNull();
    expect(r.status, why(r)).toBe(1);
  });
});

import { describe, expect, it } from "vitest";

import {
  judgeLedgerKey,
  judgePoolingProbe,
  judgeSuppliedMediaIds,
  poolingPlan,
  summarizeQualification,
} from "../../../scripts/cms/lib/qualify-checks.mjs";

const DIRECT = "postgresql://cms_runtime:pw@127.0.0.1:25760/qualify_x";

describe("cms:qualify's pooling check (plan 6.7 and 9.3; WP6 rest, pull request 2)", () => {
  it("is SKIPPED, never PASS, when no pooler address is given: the run is on direct Postgres", () => {
    expect(poolingPlan({ poolerUrl: undefined, directUrl: DIRECT })).toEqual({
      kind: "skipped",
      reason: expect.stringMatching(/direct Postgres/),
    });
    expect(poolingPlan({ poolerUrl: "  ", directUrl: DIRECT }).kind).toBe(
      "skipped",
    );
  });

  it("is SKIPPED when the pooler address is the direct server itself", () => {
    expect(
      poolingPlan({
        poolerUrl: "postgresql://other:pw@127.0.0.1:25760/elsewhere",
        directUrl: DIRECT,
      }).kind,
    ).toBe("skipped");
  });

  it.each([
    ["localhost", "127.0.0.1"],
    ["127.0.0.1", "localhost"],
    ["[::1]", "localhost"],
    ["LOCALHOST", "127.0.0.1"],
  ])(
    "is SKIPPED, the pooler not tested, when the pooler address names the direct server under another loopback name (%s for %s; fix round F11)",
    (poolerHost, directHost) => {
      const plan = poolingPlan({
        poolerUrl: `postgresql://cms_runtime.ref:pw@${poolerHost}:25760/postgres`,
        directUrl: `postgresql://cms_runtime:pw@${directHost}:25760/qualify_x`,
      });
      expect(plan).toEqual({
        kind: "skipped",
        reason: expect.stringMatching(/pooler was not tested/),
      });
    },
  );

  it("runs on a pooler address that differs from the direct server", () => {
    expect(
      poolingPlan({
        poolerUrl: "postgresql://cms_runtime.ref:pw@127.0.0.1:34159/postgres",
        directUrl: DIRECT,
      }),
    ).toEqual({
      kind: "run",
      url: "postgresql://cms_runtime.ref:pw@127.0.0.1:34159/postgres",
    });
  });

  it("answers PASS only when every concurrent autosave succeeded and the stored draft is one of them", () => {
    const written = ["a", "b", "c"];
    expect(
      judgePoolingProbe({ written, errors: [], stored: "b", versions: 3 }),
    ).toBe(true);
    expect(
      judgePoolingProbe({
        written,
        errors: ['prepared statement "s1" already exists'],
        stored: "b",
        versions: 3,
      }),
    ).toBe(false);
    expect(
      judgePoolingProbe({ written, errors: [], stored: "z", versions: 3 }),
    ).toBe(false);
    expect(
      judgePoolingProbe({ written: [], errors: [], stored: null, versions: 0 }),
    ).toBe(false);
    expect(judgePoolingProbe(null)).toBe(false);
  });

  it("counts SKIPPED apart: it neither fails the run nor counts as a pass", () => {
    expect(
      summarizeQualification([
        { name: "a", outcome: "PASS" },
        { name: "pooling", outcome: "SKIPPED" },
      ]),
    ).toEqual({ passed: 1, failed: 0, skipped: 1, exitCode: 0 });
    expect(
      summarizeQualification([{ name: "pooling", outcome: "SKIPPED" }]),
    ).toEqual({ passed: 0, failed: 0, skipped: 1, exitCode: 1 });
    expect(
      summarizeQualification([
        { name: "a", outcome: "PASS" },
        { name: "b", outcome: "FAIL" },
      ]).exitCode,
    ).toBe(1);
  });
});

describe("cms:qualify's media record with a supplied id and no upload (plan 6.7)", () => {
  const proof = {
    servicePortKept: true,
    restCreateStatus: 403,
    actorCreateRefused: true,
    pageCreateDiscardedId: true,
  };

  it("passes when the service port keeps the id, REST and the actor port are refused, and a page create discards its id", () => {
    expect(judgeSuppliedMediaIds(proof)).toBe(true);
  });

  it.each([
    ["the service port", { servicePortKept: false }],
    ["REST", { restCreateStatus: 201 }],
    ["the actor port", { actorCreateRefused: false }],
    ["a page create", { pageCreateDiscardedId: false }],
  ])("fails when %s does otherwise", (_label, change) => {
    expect(judgeSuppliedMediaIds({ ...proof, ...change })).toBe(false);
  });

  it("fails with no proof", () => {
    expect(judgeSuppliedMediaIds(undefined)).toBe(false);
  });
});

describe("cms:qualify's migration ledger keyed by UUID (2b Q3)", () => {
  it("passes a uuid id with no payload_migrations_id_seq", () => {
    expect(judgeLedgerKey({ idType: "uuid", sequence: null })).toBe(true);
  });

  it("fails a serial ledger or a sequence left behind", () => {
    expect(
      judgeLedgerKey({
        idType: "integer",
        sequence: "cms.payload_migrations_id_seq",
      }),
    ).toBe(false);
    expect(
      judgeLedgerKey({
        idType: "uuid",
        sequence: "cms.payload_migrations_id_seq",
      }),
    ).toBe(false);
    expect(judgeLedgerKey(null)).toBe(false);
  });
});

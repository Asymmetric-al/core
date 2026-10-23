/**
 * Acceptance tests for #2223 done criteria 6, 8, 9 (spec §1.2): `verify:e2e:loop`
 * validates the attempt count before any spawn and honors the child's exit.
 * Owned by Acceptance; implementers must not edit this file to satisfy their PR.
 * Spec: https://github.com/Asymmetric-al/core/issues/2223#issuecomment-6369083832
 */
import { describe, expect } from "vitest";

import {
  itPosix as it,
  json,
  LOOP,
  PASSING,
  report,
  result,
  run,
  type Step,
  spec,
  test,
} from "./harness";

const line = (ok: unknown, failed: unknown[] = []) =>
  json({ ok, failed, artifacts: { reportPath: "/r/results.json" } });
const PASS: Step = { exit: 0, stdout: `${line(true)}\n` };
const FAIL: Step = {
  exit: 1,
  stdout: `${line(false, [{ test: "t", message: "m", file: "f", line: 1 }])}\n`,
};
const loop = (steps: Step[], args?: string[], e2e?: Step[]) =>
  run(LOOP, { loop: steps, e2e }, { args });
const VERIFY = ["run", "verify:e2e"];

describe("#2223 criterion 8: attempt count is validated before any spawn", () => {
  it.each([
    "0",
    "-1",
    "+3",
    "2.5",
    "3abc",
    "1e3",
    " 3",
    "abc",
    "NaN",
    "Infinity",
    "9007199254740993",
  ])("rejects %j: exit 1, exact message, zero bun invocations", (raw) => {
    const r = loop([PASS], [raw]);
    expect(r.status, r.stderr).toBe(1);
    expect(r.stderr).toContain(
      `verify:e2e:loop: attempt count must be a positive integer, got "${raw}"`,
    );
    expect(r.calls.loop).toEqual([]);
    expect(r.stdout).toBe("");
  });
  it.each([
    ["absent", undefined, 3],
    ['""', [""], 3],
    ["1", ["1"], 1],
    ["5", ["5"], 5],
    ["03", ["03"], 3],
  ] as const)(
    "%s: an always-failing child runs exactly N attempts, then exit 1",
    (_l, args, n) => {
      const r = loop([FAIL], args ? [...args] : undefined);
      expect(r.status, r.stderr).toBe(1);
      expect(r.calls.loop).toEqual(Array.from({ length: n }, () => VERIFY));
      for (let k = 1; k <= n; k++)
        expect(r.stderr).toContain(`Attempt ${k}/${n}\n`);
      expect(r.stderr).toContain(`Reached max attempts (${n}) without a pass`);
      expect(r.stdout.trim().split("\n")).toEqual(
        Array.from({ length: n }, () => FAIL.stdout!.trim()),
      );
    },
  );
  it("1000000 is accepted with no cap and stops at the first pass", () => {
    const r = loop([FAIL, PASS], ["1000000"]);
    expect(r.status, r.stderr).toBe(0);
    expect(r.calls.loop).toHaveLength(2);
    expect(r.stderr).toContain("Attempt 2/1000000\n");
    expect(r.stderr).toContain(
      "Passed on attempt 2/1000000 after 1 failed attempt(s)",
    );
  });
});

describe("#2223 criterion 9: an attempt passes only when exit 0 AND ok:true", () => {
  it("exit 1 with ok:true is a failed attempt; N of them → exit 1", () => {
    const r = loop([{ exit: 1, stdout: line(true) }], ["2"]);
    expect(r.status).toBe(1);
    expect(r.calls.loop).toHaveLength(2);
    expect(r.stderr).toContain(
      "verify:e2e exited 1 with ok=true; treating attempt as failed",
    );
    expect(r.stderr).toContain("Reached max attempts (2) without a pass");
  });
  it("exit 0 with ok:false is a failed attempt and is retried", () => {
    const r = loop([{ exit: 0, stdout: line(false) }, PASS], ["3"]);
    expect([r.status, r.calls.loop.length]).toEqual([0, 2]);
    expect(r.stderr).toContain(
      "verify:e2e exited 0 with ok=false; treating attempt as failed",
    );
  });
  it.each([
    [[{ exit: 1, stdout: line(true) }, PASS], 2],
    [[FAIL, FAIL, PASS], 3],
  ])(
    "fail then pass → exit 0 with the 'Passed on attempt k/N' line (case %#)",
    (steps, k) => {
      const r = loop(steps, ["3"]);
      expect([r.status, r.calls.loop.length], r.stderr).toEqual([0, k]);
      expect(r.stderr).toContain(
        `Passed on attempt ${k}/3 after ${k - 1} failed attempt(s)`,
      );
    },
  );
  it("a first-try pass runs once, exits 0 and claims no earlier failure", () => {
    const r = loop([PASS]);
    expect([r.status, r.calls.loop]).toEqual([0, [VERIFY]]);
    expect(r.stdout).toBe(PASS.stdout);
    expect(r.stderr).not.toMatch(/after [1-9]\d* failed attempt/);
  });
  it.each([
    "not json",
    "42",
    "null",
    '"ok"',
    json({ ok: "true" }),
    json({ ok: 1 }),
    json({ failed: [] }),
  ])(
    "stdout %s (unparsable, non-object or non-boolean ok) → exit 1 immediately",
    (stdout) => {
      const r = loop([{ exit: 0, stdout }], ["3"]);
      expect([r.status, r.calls.loop.length], r.stderr).toEqual([1, 1]);
    },
  );
  it("bun cannot be spawned → exit 1 without retrying", () => {
    const r = run(LOOP, {}, { bun: false });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("Attempt 1/3");
    expect(r.stderr).not.toContain("Attempt 2/3");
  });
});

describe("#2223 criterion 6: loop interface unchanged", () => {
  it("prints the top-3 failures (with trace/video) to stderr", () => {
    const f = (n: number) => ({
      test: `t${n}`,
      message: `m${n}`,
      file: "f",
      line: n,
      tracePath: `/t${n}.zip`,
      videoPath: `/v${n}.webm`,
    });
    const r = loop(
      [{ exit: 1, stdout: line(false, [1, 2, 3, 4].map(f)) }],
      ["1"],
    );
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("Failures:\n");
    for (const n of [1, 2, 3])
      expect(r.stderr).toContain(
        `t${n}: m${n} | trace: /t${n}.zip | video: /v${n}.webm`,
      );
    expect(r.stderr).not.toContain("t4: m4");
  });
  it("end to end through the real wrapper: a failing E2E run is never a loop pass", () => {
    const failing = json(
      report([
        spec(
          "fails",
          test("unexpected", [result("failed", { message: "boom" })]),
        ),
      ]),
    );
    const r = loop([{ wrapper: true }], ["2"], [{ report: failing, exit: 1 }]);
    expect(
      [r.status, r.calls.loop.length, r.calls.e2e.length],
      r.stderr,
    ).toEqual([1, 2, 2]);
    const ok = loop(
      [{ wrapper: true }],
      ["2"],
      [{ report: json(PASSING()), exit: 0 }],
    );
    expect([ok.status, ok.calls.e2e.length], ok.stderr).toEqual([0, 1]);
  });
});

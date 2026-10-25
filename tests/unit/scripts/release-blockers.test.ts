import { describe, expect, it } from "vitest";

import {
  assertNoReleaseBlockers,
  evaluateReleaseBlockers,
  queryReleaseBlockers,
} from "../../../scripts/release/release-blockers.mjs";

type Reply = { status: number | null; stdout?: string; stderr?: string };

const LABEL_OK: Reply = { status: 0, stdout: '{"name":"release-blocker"}' };

function fakeRun(...replies: Reply[]) {
  const calls: string[][] = [];
  const run = (command: string, args: string[]) => {
    calls.push([command, ...args]);
    return { stdout: "", stderr: "", ...replies[calls.length - 1] };
  };
  return { run, calls };
}

const issue = (fields: Record<string, unknown>) =>
  JSON.stringify({
    number: 1,
    title: "Hold",
    html_url: "https://github.com/Asymmetric-al/core/issues/1",
    state: "open",
    pull_request: null,
    ...fields,
  });

describe("release blockers query edge cases", () => {
  it("treats a 404 on the list call as a failure, not a missing label", () => {
    const { run } = fakeRun(LABEL_OK, {
      status: 1,
      stderr: "gh: Not Found (HTTP 404)",
    });
    const result = queryReleaseBlockers({ run });
    expect(result).toEqual({
      ok: false,
      reason: "gh api failed: gh: Not Found (HTTP 404)",
    });
    expect(evaluateReleaseBlockers(result).message).toContain(
      "could not verify release blockers",
    );
  });

  it("keeps the reason to one line when gh prints multi-line stderr", () => {
    const { run } = fakeRun({
      status: 1,
      stderr: '\nHTTP 401: Bad credentials\n{"message":"Bad credentials"}\n',
    });
    expect(queryReleaseBlockers({ run })).toEqual({
      ok: false,
      reason: "gh api failed: HTTP 401: Bad credentials",
    });
  });

  it.each([
    ["a missing number", { number: undefined }],
    ["a string number", { number: "12" }],
    ["a missing title", { title: undefined }],
    ["a JSON array line", null],
  ])("fails closed on an item with %s", (_name, fields) => {
    const line = fields === null ? "[1,2]" : issue(fields);
    const { run } = fakeRun(LABEL_OK, { status: 0, stdout: `${line}\n` });
    const result = queryReleaseBlockers({ run });
    expect(result.ok).toBe(false);
    expect(evaluateReleaseBlockers(result).allowed).toBe(false);
  });

  it("refuses a malformed or absent query result", () => {
    for (const result of [undefined, null, {}, { ok: false }]) {
      const verdict = evaluateReleaseBlockers(result);
      expect(verdict.allowed).toBe(false);
      expect(verdict.message).toContain("(unknown error)");
    }
  });
});

describe("assertNoReleaseBlockers", () => {
  it("throws on a failed query without logging the pass line", () => {
    const { run, calls } = fakeRun({ status: null, stderr: "" });
    const logged: string[] = [];
    expect(() =>
      assertNoReleaseBlockers({
        run,
        log: (line: string) => logged.push(line),
        stage: "pre-push",
      }),
    ).toThrow(
      /could not verify release blockers \(gh api failed: exit null\)/u,
    );
    expect(logged).toEqual([]);
    expect(calls).toHaveLength(1);
  });
});

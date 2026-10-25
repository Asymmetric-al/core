/**
 * #2277 done criteria 1-7 and the module half of 9. Spec r1 (approved, all
 * defaults) plus addendum 1:
 * {@link https://github.com/Asymmetric-al/core/issues/2277#issuecomment-6386065652}
 * Interpretation: `run` returns a spawnSync-shaped result (§2.1 default run);
 * run(args) and run("gh", args) are both accepted. List fixtures are real
 * `--jq` output, where issues carry `"pull_request": null`, so "has a
 * pull_request key" must mean a non-null value.
 * Owned by Acceptance. Implementers must not edit this file to satisfy their PR.
 */
import { describe, expect, it } from "vitest";

import {
  enoent,
  fail,
  fakeRun,
  item,
  LABEL_404,
  LABEL_ARGS,
  LABEL_MISSING_MESSAGE,
  LABEL_OK,
  LIST_ARGS,
  loadModule,
  MODULE_PATH,
  ok,
  passLine,
  read,
  REFUSED_LAST_LINE,
  refusedFirstLine,
  THROWS,
  timedOut,
  VERIFY_FAILED_RE,
  type QueryResult,
} from "./harness";

const lines = (...items: string[]) => `${items.join("\n")}\n`;

async function query(replies: Parameters<typeof fakeRun>[0]) {
  const mod = await loadModule();
  const fake = fakeRun(replies);
  const result = (await mod.queryReleaseBlockers({
    run: fake.run,
  })) as QueryResult;
  return { mod, result, calls: fake.calls, run: fake.run };
}

describe("issue #2277 criterion 1: module exports", () => {
  it("exports the label, the fixed repo and the three functions", async () => {
    const mod = await loadModule();
    expect(mod.RELEASE_BLOCKER_LABEL).toBe("release-blocker");
    expect(mod.RELEASE_REPO).toBe("Asymmetric-al/core");
    const fns = ["query", "evaluate", "assertNo"].map(
      (p) => `${p}ReleaseBlockers`,
    );
    for (const name of fns)
      expect(typeof mod[name as "queryReleaseBlockers"], name).toBe("function");
  });
});

describe("issue #2277 criterion 2: no blockers", () => {
  it("is allowed, does not throw and logs the none-open line", async () => {
    const { mod, result } = await query([LABEL_OK, ok("")]);
    expect(result).toEqual({ ok: true, blockers: [] });
    expect(mod.evaluateReleaseBlockers(result).allowed).toBe(true);

    for (const stage of ["pre-flight", "pre-push"]) {
      const fake = fakeRun([LABEL_OK, ok("")]);
      const logged: string[] = [];
      await mod.assertNoReleaseBlockers({
        run: fake.run,
        log: (line) => logged.push(String(line)),
        stage,
      });
      expect(logged).toContain(passLine(stage));
    }
  });
});

describe("issue #2277 criterion 3: N blockers", () => {
  const out = lines(
    item(2290, { title: "Third" }),
    item(17, { title: "First one" }),
    item(2273, { title: "Second: data loss" }),
  );
  const expectedBlockers = [
    { number: 17, title: "First one" },
    { number: 2273, title: "Second: data loss" },
    { number: 2290, title: "Third" },
  ].map((b) => ({
    ...b,
    url: `https://github.com/Asymmetric-al/core/issues/${b.number}`,
  }));
  const expectedMessage = [
    refusedFirstLine(3),
    ...expectedBlockers.map((b) => `  #${b.number} ${b.title} ${b.url}`),
    REFUSED_LAST_LINE,
  ];

  it("refuses and lists all three, ascending, in the §2.3 format", async () => {
    const { mod, result } = await query([LABEL_OK, ok(out)]);
    expect(result).toEqual({ ok: true, blockers: expectedBlockers });
    const verdict = mod.evaluateReleaseBlockers(result);
    expect(verdict.allowed).toBe(false);
    expect(verdict.message.split("\n")).toEqual(expectedMessage);
  });

  it("assertNoReleaseBlockers throws an Error with that message", async () => {
    const mod = await loadModule();
    const fake = fakeRun([LABEL_OK, ok(out)]);
    const logged: string[] = [];
    let thrown: unknown;
    try {
      await mod.assertNoReleaseBlockers({
        run: fake.run,
        log: (line) => logged.push(String(line)),
        stage: "pre-flight",
      });
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(Error);
    expect((thrown as Error).message.split("\n")).toEqual(expectedMessage);
    expect(logged).not.toContain(passLine("pre-flight"));
  });
});

describe("issue #2277 criterion 4: PRs and closed items are ignored", () => {
  it("reports exactly the one open issue", async () => {
    const { mod, result } = await query([
      LABEL_OK,
      ok(lines(item(9, { pr: true }), item(5), item(3, { state: "closed" }))),
    ]);
    expect(result).toEqual({
      ok: true,
      blockers: [
        {
          number: 5,
          title: "Blocker 5",
          url: "https://github.com/Asymmetric-al/core/issues/5",
        },
      ],
    });
    expect(mod.evaluateReleaseBlockers(result).message.split("\n")[0]).toBe(
      refusedFirstLine(1),
    );
  });

  it("is allowed when only a PR carries the label", async () => {
    const { mod, result } = await query([
      LABEL_OK,
      ok(lines(item(9, { pr: true }))),
    ]);
    expect(result).toEqual({ ok: true, blockers: [] });
    expect(mod.evaluateReleaseBlockers(result).allowed).toBe(true);
  });
});

describe("issue #2277 criterion 5: missing label", () => {
  it("refuses with the label-missing message and never lists", async () => {
    const { mod, result, calls } = await query([LABEL_404, ok(lines(item(1)))]);
    expect(result).toEqual({ ok: false, reason: "label missing" });
    const verdict = mod.evaluateReleaseBlockers(result);
    expect(verdict.allowed).toBe(false);
    expect(verdict.message).toBe(LABEL_MISSING_MESSAGE);
    expect(calls).toEqual([LABEL_ARGS]);
  });
});

describe("issue #2277 criterion 6: fail closed", () => {
  const cases = {
    "(a) spawn ENOENT (no gh)": [enoent()],
    "(a) run itself throws ENOENT": [THROWS],
    "(b) label call non-zero, not a 404 (not authenticated)": [
      fail("HTTP 401: Bad credentials (https://api.github.com/)"),
    ],
    "(c) list call non-zero after a page already printed": [
      LABEL_OK,
      fail("HTTP 502: Bad Gateway", lines(item(1))),
    ],
    "(d) timeout on the label call": [timedOut()],
    "(d) timeout on the list call": [LABEL_OK, timedOut()],
    "(e) a non-JSON output line": [
      LABEL_OK,
      ok(lines(item(1), "<html>rate limited</html>")),
    ],
  };

  for (const [name, replies] of Object.entries(cases)) {
    it(`${name}: refuses with "could not verify" and never throws`, async () => {
      const mod = await loadModule();
      const fake = fakeRun(replies);
      let result: unknown;
      expect(() => {
        result = mod.queryReleaseBlockers({ run: fake.run });
      }).not.toThrow();
      result = await result;
      expect((result as QueryResult).ok).toBe(false);
      const verdict = mod.evaluateReleaseBlockers(result);
      expect(verdict.allowed).toBe(false);
      expect(verdict.message).toMatch(VERIFY_FAILED_RE);
    });
  }
});

describe("issue #2277 criterion 7: exact commands", () => {
  it("makes exactly the two §2.1 calls, in order", async () => {
    const { calls } = await query([LABEL_OK, ok(lines(item(1)))]);
    expect(calls).toEqual([LABEL_ARGS, LIST_ARGS]);
    for (const call of calls) {
      const text = call.join(" ");
      expect(text).not.toMatch(/search\/issues|gh issue list|gh search/u);
    }
  });

  it("the module source never uses search or `issue list`", () => {
    const source = read(MODULE_PATH);
    expect(source).not.toMatch(/search\/issues|["']search["']|issue list/u);
    expect(source).not.toMatch(/["']issue["']\s*,\s*["']list["']/u);
  });
});

describe("issue #2277 criterion 9 (module): no secrets, no override", () => {
  it("release-blockers.mjs has no token, env, override or shell use", () => {
    const source = read(MODULE_PATH);
    expect(source).not.toMatch(
      /GH_TOKEN|GITHUB_TOKEN|ghp_|github_pat_|gho_|Authorization/u,
    );
    expect(source).not.toMatch(/OVERRIDE|BYPASS|[a-z](?:Override|Bypass)/u);
    expect(source).not.toMatch(/shell\s*:\s*true/u);
    // §2.1 default runner: spawnSync with a 30 s timeout.
    expect(source).toMatch(/spawnSync\(/u);
    expect(source).toMatch(/timeout\s*:\s*30_?000\b/u);
    // Only the spec'd `env: process.env` pass-through; no variable is read.
    expect(source).not.toMatch(/process\.env\s*\.|process\.env\s*\[/u);
  });
});

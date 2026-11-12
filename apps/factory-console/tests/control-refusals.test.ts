import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { harness } from "./fixtures/harness";
import { interpret } from "../src/server/control";

const PACK = path.resolve(
  import.meta.dirname,
  "../../../scripts/archon-factory/pack/.shared",
);

function refusal(code: string, exit = 1) {
  return {
    exit,
    json: { ok: false, code, message: `${code}: detail` },
    timedOut: false,
    overflow: false,
  };
}

describe("pack refusals", () => {
  it("reports a refusal the Console has no sentence for as refused, with the pack's own words", () => {
    const receipt = interpret("scope", refusal("invalid-end-states"));
    expect(receipt).toMatchObject({
      outcome: "refused",
      code: "invalid-end-states",
    });
    expect(receipt.message).toContain("invalid-end-states: detail");
    expect(receipt.message).not.toContain("effect is unknown");
  });

  it("classifies every refusal control.mjs and the work-item rules can raise as refused", () => {
    const codes = new Set<string>();
    for (const file of ["control.mjs", "workitem.mjs", "identity.mjs"])
      for (const match of readFileSync(path.join(PACK, file), "utf8").matchAll(
        /new (?:Refusal|NativeIdentityRefusal)\(\s*"([^"]+)"/g,
      ))
        codes.add(match[1]!);
    expect(codes.size).toBeGreaterThan(20);
    expect(codes).toContain("predecessor-release-unavailable");
    const leaked = [...codes].filter(
      (code) =>
        interpret("issue", refusal(code)).outcome !== "refused" ||
        interpret("issue", refusal(code, 2)).outcome !== "refused",
    );
    expect(leaked).toEqual([]);
  });

  it("keeps an unexpected failure unknown", () => {
    for (const code of ["error", "ENOENT", "ERR_INVALID_ARG_TYPE"])
      expect(interpret("issue", refusal(code)).outcome).toBe("unknown");
    expect(
      interpret("issue", {
        exit: 1,
        json: { ok: false, message: "boom" },
        timedOut: false,
        overflow: false,
      }).outcome,
    ).toBe("unknown");
  });
});

describe("per-issue end states survive a Console scope write", () => {
  function withExceptions() {
    const fixture = harness();
    const scope = fixture.state.docs.get("core/scope")!;
    fixture.state.set("core/scope", {
      ...(scope.value as Record<string, unknown>),
      endState: "MERGED",
      endStates: { "101": "PR_READY", "107": "PR_READY" },
    });
    return fixture;
  }

  it("carries the exceptions of issues that stay in the scope and drops the rest", async () => {
    const { factory, control, ids, state } = withExceptions();
    const receipt = await factory.execute(
      {
        kind: "scope",
        issues: [101, 110],
        endState: "MERGED",
        owner: "conrad",
      },
      ids.mint(),
    );
    const argv = control.calls.at(-1)!;
    expect(argv[argv.indexOf("--end-states") + 1]).toBe("101=PR_READY");
    expect(receipt.outcome).toBe("applied");
    expect(
      (state.docs.get("core/scope")!.value as Record<string, unknown>)
        .endStates,
    ).toEqual({ "101": "PR_READY" });
    expect(receipt.observed?.summary).toContain("#101 PR_READY");
  });

  it("carries them when Samson's proposal keeps the current end state", async () => {
    const { factory, control, state } = withExceptions();
    state.set("core/chat/op-fixture-scope", {
      v: 1,
      messages: [
        {
          role: "samson",
          request: "cr-fixturescp-0000000000000000-0000000000000000",
          at: new Date().toISOString(),
          text: "Add #110",
          operation: {
            kind: "assign-scope",
            issue: 0,
            issues: [101, 110],
            endState: "unchanged",
            reason: "Next phase",
            status: "proposed",
          },
        },
      ],
    });
    await factory.apply(
      "op-fixture-scope",
      "cr-fixturescp-0000000000000000-0000000000000000",
      {},
      false,
    );
    const argv = control.calls.at(-1)!;
    expect(argv.slice(0, 5)).toEqual([
      "scope",
      "--issues",
      "101,110",
      "--end-state",
      "MERGED",
    ]);
    expect(argv[argv.indexOf("--end-states") + 1]).toBe("101=PR_READY");
  });

  it("sends no exception flag when the scope has none", async () => {
    const { factory, control, ids } = harness();
    await factory.execute(
      { kind: "scope", issues: [101], endState: "PR_READY", owner: "conrad" },
      ids.mint(),
    );
    expect(control.calls.at(-1)).not.toContain("--end-states");
  });

  it("changes nothing when the current scope cannot be read", async () => {
    const { factory, control, ids, state } = withExceptions();
    state.set("core/scope", { v: 1, issues: "not-a-list" });
    const before = control.calls.length;
    await expect(
      factory.execute(
        { kind: "scope", issues: [101], endState: "MERGED", owner: "conrad" },
        ids.mint(),
      ),
    ).rejects.toThrow("current scope could not be read");
    expect(control.calls.length).toBe(before);
  });
});

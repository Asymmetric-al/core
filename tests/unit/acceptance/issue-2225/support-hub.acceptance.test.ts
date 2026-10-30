/**
 * #2225 acceptance, C3: tests/e2e/support-hub.smoke.spec.ts (spec r2 §4
 * criteria 1-4, 9). Q1 ruling: the unknown-id case is titled for the
 * load-failure state CI exercises, not a real not-found.
 */
import { describe, expect, it } from "vitest";

import {
  HUB,
  asserted,
  block,
  loadSpec,
  read,
  runOne,
  sha256,
} from "./harness";

const UNKNOWN = /unknown|non-?existent/i;
const KEPT = [
  "loads /support inside the Mission Control shell",
  "nested /support/reports/overview loads",
  "nested /support/settings/inbox loads",
];

describe("#2225 C3 Support Hub smoke", () => {
  it("criterion 1: no assertion accepts the John Anderson success state", () => {
    expect(read(HUB)).not.toMatch(/John Anderson|john\\?\.anderson/i);
  });

  it("criterion 1: only the unknown-id test asserts not-found, honestly titled", async () => {
    const spec = loadSpec(HUB);
    const hits: string[] = [];
    for (const t of spec.tests) {
      const { steps } = await spec.run(t);
      if (!asserted(steps, /not found/i).length) continue;
      hits.push(t.title);
      const urls = steps
        .filter((s) => s.kind === "goto")
        .map((s) => new URL(s.path));
      const ids = urls.map((u) => u.searchParams.get("id"));
      expect(
        ids.some((id) => id && id !== "conv-failed-receipt"),
        t.title,
      ).toBe(true);
      expect(asserted(steps, /#__next_error__/, /toHaveCount/)).not.toEqual([]);
    }
    expect(hits).toHaveLength(1);
    expect(hits[0]).toMatch(UNKNOWN);
    expect(hits[0], "Q1").toMatch(
      /\b(load|loading|unloadable|fail|failure|failed)\b/i,
    );
  });

  it("criterion 1: the unknown-id test fails when the route crashes", async () => {
    expect((await runOne(HUB, UNKNOWN)).outcome).toBe("passed");
    const crashed = await runOne(HUB, UNKNOWN, { world: { crashed: true } });
    expect(crashed.outcome).toBe("failed");
  });

  it("criterion 2: the layout test clicks Table and asserts the selected layout", async () => {
    const r = await runOne(HUB, /click/i);
    expect(r.outcome, r.error).toBe("passed");
    expect(r.title).toMatch(/table/i);
    const at = r.steps.findIndex(
      (s) => s.kind === "click" && /\bTable\b/.test(s.path),
    );
    expect(at).toBeGreaterThan(0);
    const [before, after] = [r.steps.slice(0, at), r.steps.slice(at)];
    const gotos = r.steps.filter((s) => s.kind === "goto").map((s) => s.path);
    expect(gotos.filter((u) => /layout=board/.test(u))).toHaveLength(1);
    expect(gotos.filter((u) => /layout=table/.test(u))).toEqual([]);
    expect(asserted(before, /board view/i, /toBeVisible/)).not.toEqual([]);
    expect(asserted(after, /\bTable\b/, /pressed|checked/i)).not.toEqual([]);
    expect(asserted(after, /\bBoard\b/, /pressed|checked/i)).not.toEqual([]);
    const gone = /toHaveCount.*\[0\]|toBeHidden/;
    expect(asserted(after, /board view/i, gone)).not.toEqual([]);
    const tableOrEmpty = /"table"|No conversations match your filters|"status"/;
    expect(asserted(after, tableOrEmpty, /toBeVisible/)).not.toEqual([]);
    const noop = await runOne(HUB, /click/i, { world: { noopToggle: true } });
    expect(noop.outcome, "mutation: no-op onValueChange").toBe("failed");
  });

  it("criterion 3: ?status=open is proven by the visible 'Status filter' trigger", async () => {
    const r = await runOne(HUB, /status/i);
    expect(r.outcome, r.error).toBe("passed");
    expect(asserted(r.steps, /Status filter/, /Text/)).not.toEqual([]);
    const opts = { world: { ignoreStatus: true } };
    const ignored = await runOne(HUB, /status/i, opts);
    expect(ignored.outcome, "mutation: StatusFilter ignores value").toBe(
      "failed",
    );
  });

  it.each([
    ["non-2xx readiness", { demoStatus: 503 }],
    ["no admin role", { roles: {} }],
    ["failed session install", { installOk: false }],
  ])("criterion 4: %s fails under CI, skips locally", async (_n, world) => {
    expect(loadSpec(HUB).tests).toHaveLength(6);
    for (let i = 0; i < 6; i++) {
      const ci = await runOne(HUB, i, { env: { CI: "1" }, world });
      expect(ci.outcome, `${ci.title} (CI)`).toBe("failed");
      expect(ci.error).toMatch(/^Required E2E setup unavailable: \S/);
      expect((await runOne(HUB, i, { world })).outcome, ci.title).toBe(
        "skipped",
      );
    }
  });

  it("criterion 9 (guard): shell, reports and settings tests are byte-identical", () => {
    const kept = KEPT.map((title) => block(read(HUB), title)).join("");
    expect(sha256(kept)).toBe(
      "6072b8b214114b18b1d16a3ae4bdd7ff56dd08ed1e73c772dba7a097f942a566",
    );
  });
});

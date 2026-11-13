import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  boundPacket,
  redact,
} from "../../../scripts/archon-factory/pack/analyze/scripts/collect-logic.mjs";
import { chatSnapshot } from "../../../scripts/archon-factory/pack/answer/scripts/facts-logic.mjs";

// The analysis collector freezes a bounded evidence packet. The packet must
// stay valid JSON within its character budget: whole excerpts are dropped
// (never cut mid-token), and every dropped excerpt is named as an omission
// and removed from the citable ids.

const excerpt = (n: number, size: number) => ({
  id: `E${n}`,
  kind: "work-item",
  source: `core/issues/${n}`,
  text: "x".repeat(size),
});

describe("analysis evidence packet budget", () => {
  it("keeps the packet valid JSON under the limit by dropping whole excerpts", () => {
    const evidence = Array.from({ length: 20 }, (_, index) =>
      excerpt(index + 1, 3000),
    );
    const { packet, kept, dropped } = boundPacket(evidence, 48_000);
    expect(packet.length).toBeLessThanOrEqual(48_000);
    expect(JSON.parse(packet)).toEqual(kept);
    expect(kept.length).toBeGreaterThan(0);
    expect(kept.length + dropped.length).toBe(20);
    expect(dropped).toEqual(evidence.slice(kept.length).map((item) => item.id));
  });

  it("keeps everything when it fits", () => {
    const evidence = [excerpt(1, 10), excerpt(2, 10)];
    expect(boundPacket(evidence, 48_000)).toEqual({
      packet: JSON.stringify(evidence, null, 2),
      kept: evidence,
      dropped: [],
    });
  });

  it("is what collect.ts uses, citing only kept excerpts and recording omissions", () => {
    const source = readFileSync(
      path.resolve("scripts/archon-factory/pack/analyze/scripts/collect.ts"),
      "utf8",
    );
    expect(source).toContain("boundPacket(");
    expect(source).not.toMatch(/packet\.slice\(0, LIMITS\.packetChars\)/);
    expect(source).toMatch(/ids: kept\.map/);
    expect(source).toContain("dropped");
  });
});

describe("analysis evidence redaction", () => {
  it("redacts tokens, webhook secrets and authorization values", () => {
    const text = redact(
      'ghp_abc123 sk-ant-xyz CORE_FACTORY_SIGNING_SECRET=whsec_QUJD+/= "Authorization": "Bearer abc.def" authorization: token ghs_123',
    );
    for (const secret of [
      "ghp_abc123",
      "sk-ant-xyz",
      "whsec_QUJD",
      "abc.def",
      "ghs_123",
    ])
      expect(text).not.toContain(secret);
  });
});

describe("material findings reach Samson's chat snapshot", () => {
  const issue = {
    name: "core/issues/12",
    lease: null,
    value: {
      issue: 12,
      status: "active",
      control: "run",
      route: "initial",
      round: 1,
      history: [],
    },
  };
  const attention = {
    v: 1,
    items: [
      {
        fingerprint: "a",
        title: "Repeated claim refusals",
        scope: "issue:12",
        report: "run-9",
        status: "open",
        at: "2026-11-11T09:00:00Z",
      },
      {
        fingerprint: "b",
        title: "Old",
        scope: "factory",
        report: "run-1",
        status: "accepted",
        at: "2026-11-10T09:00:00Z",
      },
    ],
  };

  it("includes open attention items and nothing else from core/attention", () => {
    const snapshot = chatSnapshot({
      observedAt: "2026-11-11T10:00:00Z",
      factory: { v: 1 },
      scope: null,
      selection: { decisions: [] },
      issues: {
        documents: [issue, { name: "core/issues/12/feedback", value: {} }],
      },
      attention,
    });
    expect(snapshot.attention).toEqual([attention.items[0]]);
    expect(snapshot.workItems).toHaveLength(1);
    expect(snapshot.workItems[0]).toMatchObject({
      issue: 12,
      status: "active",
      lease: null,
    });
  });

  it("is what the chat facts script uses", () => {
    const source = readFileSync(
      path.resolve("scripts/archon-factory/pack/answer/scripts/facts.ts"),
      "utf8",
    );
    expect(source).toContain("chatSnapshot(");
    expect(source).toContain('archon.get("core/attention")');
  });
});

// S11.16: Archon 0.14.0 has no node-level turn cap. The analyst's bound is no
// tools (one structured reply per attempt) and retry.max_attempts, which only
// bounds ordinary transient failures: capacity and rate-limit failures get the
// engine's own larger budgets. The node and its comment must say exactly that.
describe("analysis turn budget (S11.16)", () => {
  const workflow = readFileSync(
    path.resolve("scripts/archon-factory/pack/analyze/analyze.yaml"),
    "utf8",
  );
  const analyst = workflow.slice(
    workflow.indexOf("  - id: analyst"),
    workflow.indexOf("  - id: record"),
  );
  const comment = analyst
    .split("\n")
    .filter((line) => line.trim().startsWith("#"))
    .map((line) => line.trim().replace(/^#\s?/, ""))
    .join(" ");

  it("gives the analyst no tools and one ordinary retry, never retrying unknown failures", () => {
    expect(analyst).toMatch(/^\s+allowed_tools: \[\]$/m);
    expect(analyst).toMatch(/^\s+retry: \{ max_attempts: 1 \}$/m);
    expect(analyst).not.toMatch(/on_error:\s*all/);
  });

  it("documents that capacity and rate-limit retries fall outside max_attempts", () => {
    expect(comment).toMatch(/no node-level turn cap/);
    expect(comment).toMatch(/max_attempts[^.]*only[^.]*transient/i);
    expect(comment).toMatch(/capacity/i);
    expect(comment).toMatch(/rate[- ]limit/i);
    expect(comment).not.toMatch(/at most two attempts \(one retry\)\.?$/);
  });
});

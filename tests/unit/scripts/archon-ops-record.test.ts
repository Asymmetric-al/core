import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  assessAnalysis,
  nodeOutcome as analysisOutcome,
} from "../../../scripts/archon-factory/pack/analyze/scripts/record-logic.mjs";
import {
  chatMessages,
  nodeOutcome as answerOutcome,
  readNodeOutcomes,
} from "../../../scripts/archon-factory/pack/answer/scripts/record-logic.mjs";
import { parseWorkflowSource } from "../helpers/workflow-yaml";

// The chat and analysis record nodes run with trigger_rule all_done so a
// failed AI node is still written down. In Archon 0.14.0 a `with:` binding to
// a failed producer fails the consumer, so the record nodes must read the AI
// node's result from $NODE_OUTCOMES_FILE instead (completed entries carry the
// certified output; failed ones only an error).

const PACK = path.resolve("scripts/archon-factory/pack");
type Node = {
  id: string;
  trigger_rule?: string;
  depends_on?: string[];
  with?: unknown;
  retry?: { max_attempts?: number };
};
const workflow = (file: string) =>
  parseWorkflowSource(
    readFileSync(path.join(PACK, file), "utf8"),
  ) as unknown as { nodes: Node[]; budget?: unknown };
const node = (file: string, id: string) =>
  workflow(file).nodes.find((entry) => entry.id === id)!;

const RUN = "run-1";
const listing = (nodes: unknown[]) => ({
  run_id: RUN,
  first_failed_node: null,
  nodes,
});
const ANSWER = {
  answer: "Two issues are active.",
  sources: ["core/issues/12"],
  needs_clarification: false,
  clarification: "",
  operation: {
    kind: "none",
    issue: 0,
    issues: [],
    endState: "unchanged",
    reason: "",
  },
};
const ANALYSIS = {
  result: "findings",
  observations: [{ text: "Repeated claim refusals", evidence: ["E1"] }],
  findings: [
    {
      title: "Claims refused after policy change",
      material: true,
      explanation: "x",
      alternatives: [],
      evidence: ["E1"],
      next_step: "y",
      how_to_tell: "z",
    },
  ],
  coverage_limits: [],
};

const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0))
    rmSync(dir, { recursive: true, force: true });
});

describe("record nodes read the AI result from the node-outcome listing", () => {
  for (const [file, ai] of [
    ["answer/answer.yaml", "answer"],
    ["analyze/analyze.yaml", "analyst"],
  ] as const)
    it(`${file} binds nothing from the ${ai} node, so its failure cannot fail record`, () => {
      const record = node(file, "record");
      expect(record.trigger_rule).toBe("all_done");
      expect(record.depends_on).toContain(ai);
      expect(record.with).toBeUndefined();
      const source = readFileSync(
        path.join(PACK, path.dirname(file), "scripts", "record.ts"),
        "utf8",
      );
      expect(source).toContain("NODE_OUTCOMES_FILE");
      expect(source).not.toMatch(/INPUTS_(ANSWER|ANALYST)/);
    });

  it("reads a completed node's certified output, and a failed node's error", () => {
    const outcomes = listing([
      {
        node_id: "facts",
        state: "completed",
        output: { assignment: "a", reason: "r" },
      },
      {
        node_id: "answer",
        state: "failed",
        error: "Structured output did not match the schema",
      },
    ]);
    expect(answerOutcome(outcomes, "answer", RUN)).toEqual({
      state: "failed",
      output: null,
      error: "Structured output did not match the schema",
    });
    expect(answerOutcome(outcomes, "facts", RUN)).toMatchObject({
      state: "completed",
      output: { assignment: "a" },
    });
    expect(answerOutcome(outcomes, "missing", RUN)).toMatchObject({
      state: "unknown",
      output: null,
    });
  });

  it("ignores a listing for another run and an unreadable listing file", () => {
    const other = {
      ...listing([{ node_id: "answer", state: "completed", output: ANSWER }]),
      run_id: "run-2",
    };
    expect(answerOutcome(other, "answer", RUN)).toMatchObject({
      state: "unknown",
      output: null,
    });
    const dir = mkdtempSync(path.join(os.tmpdir(), "archon-ops-record-"));
    dirs.push(dir);
    writeFileSync(path.join(dir, "outcomes.json"), "{not json");
    expect(readNodeOutcomes(path.join(dir, "outcomes.json"))).toEqual({
      nodes: [],
    });
    expect(readNodeOutcomes(undefined)).toEqual({ nodes: [] });
    writeFileSync(path.join(dir, "ok.json"), JSON.stringify(listing([])));
    expect(readNodeOutcomes(path.join(dir, "ok.json"))).toEqual(listing([]));
  });
});

describe("chat record (core-answer)", () => {
  const turn = {
    request: "req-1",
    question: "What is running?",
    at: "2026-11-11T10:00:00.000Z",
    run: RUN,
  };

  it("records Samson's answer and marks the operator message answered", () => {
    const messages = chatMessages(
      [
        {
          role: "operator",
          text: "What is running?",
          request: "req-1",
          at: "2026-11-11T09:59:00.000Z",
          status: "pending",
        },
      ],
      { ...turn, outcome: { state: "completed", output: ANSWER, error: "" } },
    );
    expect(messages).toEqual([
      {
        role: "operator",
        text: "What is running?",
        request: "req-1",
        at: "2026-11-11T09:59:00.000Z",
        status: "answered",
      },
      {
        role: "samson",
        request: "req-1",
        at: turn.at,
        run: RUN,
        text: ANSWER.answer,
        sources: ANSWER.sources,
        operation: null,
      },
    ]);
  });

  it("records a failed answer node as a failed turn instead of leaving the message pending", () => {
    const messages = chatMessages(
      [
        {
          role: "operator",
          text: "What is running?",
          request: "req-1",
          at: "2026-11-11T09:59:00.000Z",
          status: "pending",
        },
      ],
      {
        ...turn,
        outcome: {
          state: "failed",
          output: null,
          error: "Idle timeout after 600000 ms",
        },
      },
    );
    expect(messages[0]).toMatchObject({ role: "operator", status: "failed" });
    expect(messages[1]).toMatchObject({
      role: "samson",
      failed: true,
      request: "req-1",
    });
    expect(messages[1].text).toContain("Idle timeout after 600000 ms");
  });

  it("treats a malformed answer as a failed turn rather than crashing", () => {
    const messages = chatMessages([], {
      ...turn,
      outcome: {
        state: "completed",
        output: { answer: "x", sources: "nope" },
        error: "",
      },
    });
    expect(messages.at(-1)).toMatchObject({ role: "samson", failed: true });
  });

  it("keeps a proposed operation as proposed", () => {
    const operation = {
      kind: "hold",
      issue: 12,
      issues: [],
      endState: "unchanged",
      reason: "Owner asked",
    };
    const messages = chatMessages([], {
      ...turn,
      outcome: {
        state: "completed",
        output: { ...ANSWER, operation },
        error: "",
      },
    });
    expect(messages.at(-1)).toMatchObject({
      operation: { ...operation, status: "proposed" },
    });
  });
});

describe("analysis record (core-analyze)", () => {
  const ids = ["E1", "E2"];
  const completed = (output: unknown) => ({
    state: "completed",
    output,
    error: "",
  });

  it("accepts a valid report", () => {
    expect(assessAnalysis({ outcome: completed(ANALYSIS), ids })).toEqual({
      status: "completed",
      problem: "",
      result: ANALYSIS,
    });
  });

  it("records a failed analyst node as a failed analysis with its error", () => {
    const verdict = assessAnalysis({
      outcome: { state: "failed", output: null, error: "Idle timeout" },
      ids,
    });
    expect(verdict).toMatchObject({ status: "failed", result: null });
    expect(verdict.problem).toContain("Idle timeout");
  });

  it("records malformed output as failed instead of throwing", () => {
    for (const output of [
      null,
      "text",
      { ...ANALYSIS, observations: "x" },
      { ...ANALYSIS, findings: [{ title: "t" }] },
    ])
      expect(assessAnalysis({ outcome: completed(output), ids })).toMatchObject(
        { status: "failed", result: null },
      );
  });

  it("marks unknown evidence, too many findings, uncited material findings and oversize output inconclusive", () => {
    const finding = ANALYSIS.findings[0];
    const cases = [
      { ...ANALYSIS, observations: [{ text: "x", evidence: ["E9"] }] },
      { ...ANALYSIS, findings: Array.from({ length: 6 }, () => finding) },
      { ...ANALYSIS, findings: [{ ...finding, evidence: [] }] },
      {
        ...ANALYSIS,
        findings: [{ ...finding, explanation: "x".repeat(8001) }],
      },
      { ...ANALYSIS, findings: [] },
    ];
    for (const output of cases)
      expect(assessAnalysis({ outcome: completed(output), ids })).toMatchObject(
        { status: "inconclusive", result: null },
      );
  });

  it("reads the analyst outcome from the listing", () => {
    expect(
      analysisOutcome(
        listing([{ node_id: "analyst", state: "completed", output: ANALYSIS }]),
        "analyst",
        RUN,
      ),
    ).toMatchObject({
      state: "completed",
      output: ANALYSIS,
    });
  });
});

describe("analysis budgets enforceable in the pinned engine", () => {
  // Archon 0.14.0 has no node-level turn cap (maxTurns exists only on inline
  // sub-agent definitions). The analyst is bounded instead by having no tools,
  // so each attempt is a single structured reply, and by at most two attempts.
  it("gives the analyst no tools and at most one retry", () => {
    const analyst = node("analyze/analyze.yaml", "analyst");
    expect((analyst as { allowed_tools?: string[] }).allowed_tools).toEqual([]);
    expect(analyst.retry?.max_attempts).toBe(1);
  });
});

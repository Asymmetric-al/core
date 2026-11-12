import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { afterDefinePlan } from "../../../scripts/archon-factory/pack/deliver/scripts/define-logic.mjs";
import { repairRoute } from "../../../scripts/archon-factory/pack/deliver/scripts/record-logic.mjs";
import {
  makeRepair,
  normalizeRepair,
} from "../../../scripts/archon-factory/pack/deliver/scripts/repair-logic.mjs";
import { planScopeStages } from "../../../scripts/archon-factory/pack/deliver/scripts/scope-logic.mjs";
import { parseWorkflowSource } from "../helpers/workflow-yaml";

// Replays the core-deliver route fixtures (the same files `archon workflow
// test core-deliver` runs on VM 100) through the subset of Archon 0.14.0 DAG
// semantics deliver.yaml uses: trigger rules are checked before `when:`, a
// skipped node passes its state on, a field reference to a skipped producer
// fails the consumer, a plain binding needs a completed producer, a time wait
// without a stub pauses the run, and every stub must satisfy output_format.
const PACK = path.resolve("scripts/archon-factory/pack/deliver");

type Schema = {
  type?: string;
  enum?: unknown[];
  properties?: Record<string, Schema>;
  required?: string[];
  additionalProperties?: boolean;
  items?: Schema;
};
type Node = {
  id: string;
  depends_on?: string[];
  trigger_rule?: string;
  when?: string;
  wait?: unknown;
  timeout?: number;
  output_format?: Schema;
  with?: Record<string, unknown>;
};
type Settled = {
  state: "completed" | "skipped";
  value?: Record<string, unknown>;
};
type Fixture = {
  fixture: { reached: string[]; expect?: string };
  [node: string]: unknown;
};

const workflow = parseWorkflowSource(
  readFileSync(path.join(PACK, "deliver.yaml"), "utf8"),
) as unknown as { nodes: Node[] };
const node = (id: string) => {
  const found = workflow.nodes.find((entry) => entry.id === id);
  if (!found) throw new Error(`deliver.yaml has no node ${id}`);
  return found;
};

function schemaErrors(value: unknown, schema: Schema, at = "$"): string[] {
  const errors: string[] = [];
  if (schema.enum && !schema.enum.includes(value))
    errors.push(`${at} must be one of ${schema.enum.join("|")}`);
  if (schema.type === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value))
      return [...errors, `${at} must be an object`];
    const record = value as Record<string, unknown>;
    for (const key of schema.required ?? [])
      if (!(key in record)) errors.push(`${at}.${key} is required`);
    for (const [key, child] of Object.entries(record)) {
      const property = schema.properties?.[key];
      if (property)
        errors.push(...schemaErrors(child, property, `${at}.${key}`));
      else if (schema.additionalProperties === false)
        errors.push(`${at}.${key} is not declared`);
    }
  } else if (schema.type === "array") {
    if (!Array.isArray(value)) return [...errors, `${at} must be an array`];
    value.forEach((item, index) =>
      errors.push(...schemaErrors(item, schema.items ?? {}, `${at}[${index}]`)),
    );
  } else if (schema.type === "string" && typeof value !== "string")
    errors.push(`${at} must be a string`);
  else if (schema.type === "boolean" && typeof value !== "boolean")
    errors.push(`${at} must be a boolean`);
  return errors;
}

function field(
  reference: string,
  outputs: Map<string, Settled>,
  consumer: string,
) {
  const match = /^\$([\w-]+)\.output(?:\.(\w+))?$/.exec(reference.trim());
  if (!match)
    throw new Error(`${consumer}: unsupported reference ${reference}`);
  const producer = outputs.get(match[1]);
  if (!producer)
    throw new Error(`${consumer}: ${match[1]} has not settled before it`);
  if (producer.state !== "completed")
    throw new Error(
      `${consumer}: ${match[1]} did not run, so ${reference} fails the node`,
    );
  return match[2] === undefined ? producer.value : producer.value?.[match[2]];
}

// `&&` binds tighter than `||`; both short-circuit left to right.
function condition(
  expression: string,
  outputs: Map<string, Settled>,
  consumer: string,
) {
  return expression.split("||").some((clause) =>
    clause.split("&&").every((atom) => {
      const match =
        /^\s*(\$[\w-]+\.output\.\w+)\s*(==|!=)\s*'([^']*)'\s*$/.exec(atom);
      if (!match) throw new Error(`${consumer}: unsupported condition ${atom}`);
      const actual = String(field(match[1], outputs, consumer) ?? "");
      return match[2] === "==" ? actual === match[3] : actual !== match[3];
    }),
  );
}

function simulate(stubs: Record<string, unknown>) {
  const outputs = new Map<string, Settled>();
  for (const entry of workflow.nodes) {
    const states = (entry.depends_on ?? []).map((dependency) => {
      const settled = outputs.get(dependency);
      if (!settled)
        throw new Error(
          `${entry.id} depends on ${dependency}, declared after it`,
        );
      return settled.state;
    });
    const rule = entry.trigger_rule ?? "all_success";
    let runs: boolean;
    if (rule === "all_success")
      runs = states.every((state) => state === "completed");
    else if (rule === "none_failed_min_one_success")
      runs = states.some((state) => state === "completed");
    else if (rule === "all_done") runs = true;
    else throw new Error(`${entry.id}: unsupported trigger_rule ${rule}`);
    if (runs && entry.when) runs = condition(entry.when, outputs, entry.id);
    if (!runs) {
      outputs.set(entry.id, { state: "skipped" });
      continue;
    }
    for (const binding of Object.values(entry.with ?? {})) {
      if (typeof binding === "string") field(binding, outputs, entry.id);
      else if (binding && typeof binding === "object" && "from" in binding) {
        const producer =
          /^\$([\w-]+)\.output/.exec(
            String((binding as { from: string }).from),
          )?.[1] ?? "";
        if (
          outputs.get(producer)?.state !== "completed" &&
          !("if_skipped" in binding)
        )
          throw new Error(
            `${entry.id}: binding to skipped ${producer} without if_skipped`,
          );
      }
    }
    if (entry.wait && !(entry.id in stubs))
      return { outcome: "paused", outputs };
    const stub = stubs[entry.id];
    if (stub === undefined)
      throw new Error(`No stub for reachable node ${entry.id}`);
    if (entry.output_format) {
      const errors = schemaErrors(stub, entry.output_format);
      if (errors.length)
        throw new Error(
          `Stub for ${entry.id} does not satisfy its output_format: ${errors.join("; ")}`,
        );
    }
    outputs.set(entry.id, {
      state: "completed",
      value: stub as Record<string, unknown>,
    });
  }
  return { outcome: "completed", outputs };
}

const fixtures = readdirSync(path.join(PACK, "fixtures"))
  .filter((file) => file.endsWith(".stubs.yaml"))
  .sort();
const load = (file: string) =>
  parseWorkflowSource(
    readFileSync(path.join(PACK, "fixtures", file), "utf8"),
  ) as unknown as Fixture;
const completed = (outputs: Map<string, Settled>) =>
  [...outputs]
    .filter(([, settled]) => settled.state === "completed")
    .map(([id]) => id);

describe("core-deliver route fixtures", () => {
  it("reacquires reservations before feedback readiness and stops a parked merge route", () => {
    const { fixture, ...stubs } = load("feedback-ready.stubs.yaml");
    const run = simulate(stubs);
    expect(completed(run.outputs).indexOf("after-scope")).toBeGreaterThan(-1);
    expect(completed(run.outputs).indexOf("after-scope")).toBeLessThan(
      completed(run.outputs).indexOf("feedback-facts"),
    );
    stubs["after-scope"] = {
      proceed: "no",
      define: "no",
      build: "no",
      ezra_assignment: "",
      reason: "Parked",
    };
    const parked = simulate(stubs);
    for (const id of ["feedback-facts", "dispose", "readiness"])
      expect(parked.outputs.get(id)?.state).toBe("skipped");
  });

  it.each(fixtures)("%s reaches exactly its declared nodes", (file) => {
    const { fixture, ...stubs } = load(file);
    const run = simulate(stubs);
    expect(run.outcome).toBe(fixture.expect ?? "completed");
    expect(completed(run.outputs)).toEqual(fixture.reached);
  });

  it("keeps a review-only route that skips scope, define and build", () => {
    const { fixture, ...stubs } = load("review-round.stubs.yaml");
    const run = simulate(stubs);
    for (const skipped of ["scope", "define", "build"])
      expect(run.outputs.get(skipped)?.state).toBe("skipped");
    expect(completed(run.outputs)).toEqual(fixture.reached);
  });

  it("runs no AI stage after after-scope parks an issue on a reserved shared area (I4)", () => {
    const { fixture, ...stubs } = load("parked-round.stubs.yaml");
    const run = simulate(stubs);
    for (const skipped of [
      "define",
      "build",
      "freeze",
      "micaiah",
      "luke",
      "assess",
      "agabus",
      "final",
      "publish",
    ])
      expect(run.outputs.get(skipped)?.state, skipped).toBe("skipped");
    expect(completed(run.outputs)).toEqual(fixture.reached);
  });

  it("keeps an oracle route that runs Ezra before Bezalel (I2)", () => {
    const { fixture, ...stubs } = load("oracle-round.stubs.yaml");
    const run = simulate(stubs);
    expect(run.outputs.get("scope")?.state).toBe("skipped");
    expect(completed(run.outputs)).toEqual(fixture.reached);
  });

  it("ends an oracle round whose correction left Bezalel nothing to do before the build (S5.16)", () => {
    const { fixture, ...stubs } = load("oracle-rereview.stubs.yaml");
    const run = simulate(stubs);
    for (const skipped of [
      "scope",
      "build",
      "freeze",
      "micaiah",
      "luke",
      "final",
      "publish",
    ])
      expect(run.outputs.get(skipped)?.state, skipped).toBe("skipped");
    expect(run.outputs.get("define")?.state).toBe("completed");
    expect(completed(run.outputs)).toEqual(fixture.reached);
  });

  it("reviews a review round with a changed context, then returns it to Ezra instead of final (I1)", () => {
    const { fixture, ...stubs } = load("review-context-change.stubs.yaml");
    const run = simulate(stubs);
    for (const skipped of ["scope", "define", "build", "final", "publish"])
      expect(run.outputs.get(skipped)?.state, skipped).toBe("skipped");
    for (const reviewed of [
      "freeze",
      "micaiah",
      "luke",
      "seal",
      "after-assess",
    ])
      expect(run.outputs.get(reviewed)?.state, reviewed).toBe("completed");
    expect(completed(run.outputs)).toEqual(fixture.reached);
  });

  it("asks Ezra's final pass to name the owner of every criterion (S5.8, R6.4)", () => {
    const criterion = node("final").output_format?.properties?.criteria?.items;
    expect(criterion?.required).toContain("owner");
    expect(criterion?.properties?.owner?.enum).toEqual([
      "implementation",
      "acceptance",
    ]);
    const command = readFileSync(
      path.join(PACK, "commands", "final.md"),
      "utf8",
    );
    expect(command).toMatch(/owner/);
    expect(command).toMatch(/implementation/);
    expect(command).toMatch(/acceptance/);
  });

  it("lets readiness report who merged the PR (I3)", () => {
    const schema = node("readiness").output_format!;
    expect(
      schemaErrors(
        { verdict: "MERGED", reason: "merged", merged_by: "external" },
        schema,
      ),
    ).toEqual([]);
    expect(
      schemaErrors(
        { verdict: "MERGED", reason: "merged", merged_by: "factory" },
        schema,
      ),
    ).toEqual([]);
    expect(
      schemaErrors({ verdict: "WAIT", reason: "checks pending" }, schema),
    ).toEqual([]);
    // Readiness owner request: only the two I3 values are valid, and it stays optional.
    expect(schema.properties?.merged_by?.enum).toEqual(["factory", "external"]);
    expect(
      schemaErrors(
        { verdict: "MERGED", reason: "merged", merged_by: "someone" },
        schema,
      ),
    ).not.toEqual([]);
    expect(schema.required).not.toContain("merged_by");
  });

  it("gives freeze room for clean hook dependencies, two commits, reinstall and views", () => {
    // Boundary owner request: freeze.ts runs git add (2 min) and a hooked commit
    // (30 min), once more when the hooks rewrite content, with a clean
    // install before hooks and another after commit (30 min each), plus views.
    expect(node("freeze").timeout).toBeGreaterThanOrEqual(4_200_000);
    expect(node("freeze").timeout).toBeGreaterThanOrEqual(
      (30 + 2 * (2 + 30) + 30 + 5) * 60_000,
    );
  });

  it("carries a review-only repair to seal and final acceptance without a build (I1, wiring-bugs#5)", () => {
    // Every review-only repair, including a legacy readiness 'review-again' and
    // the S5.16 hand-off from after-define, routes to a review round.
    const s516 = afterDefinePlan({
      route: "oracle",
      planned: "yes",
      hasAcceptance: true,
      scopeStopped: false,
      defined: true,
      hasHead: true,
      implementationRepairs: 0,
      testsChanged: false,
    });
    for (const repair of [
      makeRepair({ reviewOnly: true, source: "readiness" }),
      { kind: "review-again", items: ["Reviews must be redone"] },
      s516.repair,
    ])
      expect(
        repairRoute(normalizeRepair(repair, "readiness")),
        JSON.stringify(repair),
      ).toBe("review");
    const brief = {
      summary: "s",
      source_paths: ["apps/x/**"],
      test_paths: ["tests/x/**"],
      contextFingerprint: "f1",
      repair: makeRepair({ reviewOnly: true, source: "readiness" }),
    };
    const scope = planScopeStages({
      route: "review",
      brief,
      contextChanged: false,
      fingerprint: "f1",
    });
    expect(scope).toMatchObject({ define: false, build: false });
    const define = afterDefinePlan({
      route: "review",
      planned: scope.build ? "yes" : "no",
      hasAcceptance: true,
      scopeStopped: false,
    });
    expect(define).toMatchObject({ build: false, freeze: true });
    const { fixture, ...stubs } = load("review-round.stubs.yaml");
    expect(stubs["after-scope"]).toMatchObject({
      define: scope.define ? "yes" : "no",
      build: scope.build ? "yes" : "no",
    });
    expect(stubs["after-define"]).toMatchObject({ build: "no", freeze: "yes" });
    const run = simulate(stubs);
    for (const reached of [
      "freeze",
      "micaiah",
      "luke",
      "seal",
      "after-assess",
      "after-adjudicate",
      "final",
      "publish",
    ])
      expect(run.outputs.get(reached)?.state, reached).toBe("completed");
    expect(completed(run.outputs)).toEqual(fixture.reached);
  });

  it("gates the build on after-define build and the freeze on after-define freeze", () => {
    expect(node("build").when).toBe("$after-define.output.build == 'yes'");
    expect(node("freeze").when).toBe("$after-define.output.freeze == 'yes'");
    expect(node("after-define").output_format?.required).toContain("freeze");
    expect(
      node("after-define").output_format?.properties?.freeze?.enum,
    ).toEqual(["yes", "no"]);
  });

  it("gives readiness and publish room for a merge, the pre-push hook and the push", () => {
    // publication.mjs: pre-push 85 min plus a 10 min mirror push; readiness may
    // first merge the base (10 min) before republishing.
    expect(node("readiness").timeout).toBeGreaterThanOrEqual(95 * 60_000);
    expect(node("readiness").timeout).toBeGreaterThanOrEqual(
      (10 + 85 + 10) * 60_000,
    );
    expect(node("publish").timeout).toBeGreaterThanOrEqual((85 + 10) * 60_000);
  });
});

import { describe, expect, it } from "vitest";

import {
  conjuncts,
  evaluateExpression,
  exprEquals,
  parseExpression,
  usesStatusFunction,
  type EvalContext,
} from "./github-expression";

const ctx = (github: Record<string, unknown>): EvalContext => ({
  contexts: { github: github as never, needs: {} },
});

const evalIn = (expr: string, github: Record<string, unknown>) =>
  evaluateExpression(parseExpression(expr), ctx(github));

describe("github-expression parser/evaluator", () => {
  it("&& / || return operands (ternary idiom)", () => {
    const expr =
      "${{ github.event_name == 'pull_request' && 'ubuntu-latest' || fromJSON('[\"a\",\"b\"]') }}";
    expect(evalIn(expr, { event_name: "pull_request" })).toBe("ubuntu-latest");
    expect(evalIn(expr, { event_name: "push" })).toEqual(["a", "b"]);
  });

  it("precedence: && binds tighter than ||; ! binds tighter than ==", () => {
    expect(evalIn("true || false && false", {})).toBe(true);
    expect(evalIn("!false == true", {})).toBe(true);
  });

  it("string comparison is case-insensitive; missing properties are null", () => {
    expect(evalIn("github.event_name == 'PUSH'", { event_name: "push" })).toBe(
      true,
    );
    expect(
      evalIn("github.event.pull_request.head == null", { event: {} }),
    ).toBe(true);
  });

  it("supports index access and contains/startsWith", () => {
    expect(evalIn("github['ref']", { ref: "refs/heads/x" })).toBe(
      "refs/heads/x",
    );
    expect(
      evalIn("startsWith(github.ref, 'refs/heads/')", { ref: "refs/heads/x" }),
    ).toBe(true);
    expect(evalIn("contains(fromJSON('[\"a\"]'), 'A')", {})).toBe(true);
  });

  it("throws on unknown contexts and functions instead of guessing", () => {
    expect(() => evalIn("secrets.X", {})).toThrow(/Unknown context/);
    expect(() => evalIn("hashFiles('x')", {})).toThrow(/Unsupported function/);
  });

  it("throws on malformed expressions", () => {
    expect(() => parseExpression("a ==")).toThrow();
    expect(() => parseExpression("(a")).toThrow();
    expect(() => parseExpression("a b")).toThrow();
  });

  it("structural equality ignores parentheses and == operand order", () => {
    expect(
      exprEquals(
        parseExpression("(a.b == 'x')"),
        parseExpression("'x' == a.b"),
      ),
    ).toBe(true);
    expect(
      exprEquals(parseExpression("a || b"), parseExpression("b || a")),
    ).toBe(false);
  });

  it("conjuncts flattens only top-level &&", () => {
    expect(conjuncts(parseExpression("a && (b || c) && d"))).toHaveLength(3);
    expect(conjuncts(parseExpression("a || b && c"))).toHaveLength(1);
  });

  it("detects status functions", () => {
    expect(usesStatusFunction(parseExpression("always() && a"))).toBe(true);
    expect(usesStatusFunction(parseExpression("a == 'b'"))).toBe(false);
  });
});

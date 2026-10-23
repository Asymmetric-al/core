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

  it("string comparison is case-insensitive; members of a modelled null are null", () => {
    expect(evalIn("github.event_name == 'PUSH'", { event_name: "push" })).toBe(
      true,
    );
    expect(
      evalIn("github.event.pull_request.head == null", {
        event: { pull_request: null },
      }),
    ).toBe(true);
  });

  it.each([
    ["github.job", { event_name: "push" }, "github.job"],
    [
      "github.event.pull_request.head.repo.fork",
      { event: { pull_request: { head: { repo: { full_name: "a/b" } } } } },
      "github.event.pull_request.head.repo.fork",
    ],
    [
      "github.event.pull_request.head",
      { event: {} },
      "github.event.pull_request",
    ],
    ["github['ref_name']", { ref: "refs/heads/x" }, 'github["ref_name"]'],
    ["needs.build.outputs.other", {}, "needs.build"],
  ])(
    "an unmodelled member fails closed instead of defaulting to null: %s",
    (expr, github, member) => {
      expect(() => evalIn(`${expr} != 'x'`, github)).toThrow(/is not modelled/);
      expect(() => evalIn(expr, github)).toThrow(member);
    },
  );

  it("unknown context roots fail closed as not modelled", () => {
    for (const root of [
      "env",
      "vars",
      "secrets",
      "runner",
      "steps",
      "matrix",
    ]) {
      expect(() => evalIn(`${root}.X`, {})).toThrow(/not modelled/);
    }
  });

  it("member names still match case-insensitively (ASCII only)", () => {
    expect(evalIn("GITHUB.Event_Name", { event_name: "push" })).toBe("push");
    // A non-ASCII member name reaches the fold and fails closed.
    expect(() => evalIn("github['\u0131d']", { id: "x" })).toThrow(/Non-ASCII/);
  });

  it.each([
    ["'a' < 'z'", true],
    ["'z' < 'a'", false],
    ["'a' > 'Z'", false],
    ["'A' < 'z'", true],
    ["'abc' < 'abd'", true],
    ["'ab' < 'abc'", true],
    ["'b' <= 'B'", true],
    ["'b' >= 'B'", true],
    ["'b' < 'B'", false],
    // Ordinal on upper-cased units: 'a' -> 'A' (65) sorts before '_' (95).
    ["'a' < '_'", true],
    ["'10' < '9'", true],
  ])(
    "string vs string compares case-insensitive ordinal: %s is %s",
    (expr, expected) => {
      expect(evalIn(expr, {})).toBe(expected);
    },
  );

  it("ordering a string against the fork-aware runs-on ternary picks the runner side", () => {
    // Reviewer mutation M1: on GitHub 'a' < 'z' is true, so the fork branch
    // resolves to the self-hosted labels, not 'ubuntu-latest'.
    expect(
      evalIn(
        "('a' < 'z' && fromJSON('[\"self-hosted\"]') || 'ubuntu-latest')",
        {},
      ),
    ).toEqual(["self-hosted"]);
  });

  it.each([
    ["'10' < 9", false],
    ["'8' < 9", true],
    ["9 > '10'", false],
    ["'abc' < 1", false],
    ["'abc' > 1", false],
    ["'abc' >= 1", false],
    ["true > false", true],
    ["false < true", true],
    ["true > 0", true],
    ["null < 1", true],
    ["null >= 0", true],
    ["'' < 1", true],
    ["2 >= 2", true],
    ["2 <= 1", false],
  ])("mismatched types coerce to numbers: %s is %s", (expr, expected) => {
    expect(evalIn(expr, {})).toBe(expected);
  });

  it.each([
    ["'abc' == 'ABC'", true],
    ["'abc' != 'ABC'", false],
    ["'1' == 1", true],
    ["'1.0' == 1", true],
    ["'abc' == 0", false],
    ["null == 0", true],
    ["null == ''", true],
    ["null == null", true],
    ["true == 1", true],
    ["true == '1'", true],
    ["false == ''", true],
    ["true == 'true'", false],
    ["fromJSON('[]') == fromJSON('[]')", false],
    ["fromJSON('[]') == 0", false],
    ["fromJSON('{}') == null", false],
    ["fromJSON('[]') < 1", false],
    ["fromJSON('[]') > 'a'", false],
  ])(
    "== / != and ordering follow runner coercion: %s is %s",
    (expr, expected) => {
      expect(evalIn(expr, {})).toBe(expected);
    },
  );

  it("a non-numeric string coerced to NaN is never equal or ordered", () => {
    expect(evalIn("'abc' <= 1 || 'abc' >= 1 || 'abc' == 1", {})).toBe(false);
    expect(evalIn("'abc' != 1", {})).toBe(true);
  });

  it.each([
    ["'ı' == 'I'"],
    ["'ı' == 'i'"],
    ["'ſ' == 'S'"],
    ["'ſ' == 's'"],
    ["'ı' != 'I'"],
    ["'ı' < 'J'"],
    ["'é' == 'é'"],
    ["contains('ı', 'I')"],
    ["startsWith('ſx', 'S')"],
    ["endsWith('xı', 'I')"],
  ])(
    "non-ASCII string comparison fails closed (throws, never true): %s",
    (expr) => {
      expect(() => evalIn(expr, {})).toThrow(/Non-ASCII/);
    },
  );

  it("ASCII case-insensitive comparison still works next to the non-ASCII guard", () => {
    expect(evalIn("'ubuntu-LATEST' == 'Ubuntu-latest'", {})).toBe(true);
    expect(evalIn("'a' < 'B' && 'Z' > 'y'", {})).toBe(true);
    expect(evalIn("contains('Refs/Heads/X', 'heads')", {})).toBe(true);
    // A non-ASCII literal that is never compared is just a value.
    expect(evalIn("'ı'", {})).toBe("ı");
  });

  it.each([
    ["toJSON(github)", "github"],
    ["toJSON(github.event)", "github.event"],
    ["contains(toJSON(github.event), 'fork')", "github.event"],
    ["contains(github.event, 'fork')", "github.event"],
    ["startsWith(github.event, 'x')", "github.event"],
    ["endsWith(github, 'x')", "github"],
    ["fromJSON(github.event)", "github.event"],
    ["contains(github.labels, 'x')", "github.labels"],
  ])(
    "a function on a whole (non-leaf) context value fails closed: %s",
    (expr, member) => {
      const github = {
        event_name: "push",
        event: { a: { b: 1 } },
        labels: ["x"],
      };
      expect(() => evalIn(expr, github)).toThrow(
        /non-leaf context value .*is not modelled/,
      );
      expect(() => evalIn(expr, github)).toThrow(`'${member}'`);
    },
  );

  it.each([
    ["format('{0}', github)"],
    ["join(github.labels, ',')"],
    ["hashFiles('x')"],
  ])("unimplemented functions fail closed: %s", (expr) => {
    expect(() => evalIn(expr, { labels: ["x"] })).toThrow(
      /Unsupported function .*is not modelled/,
    );
  });

  it("functions on leaf values and expression-built values still work", () => {
    expect(evalIn("toJSON(github.event_name)", { event_name: "push" })).toBe(
      '"push"',
    );
    expect(
      evalIn("contains(github.event_name, 'us')", { event_name: "push" }),
    ).toBe(true);
    expect(evalIn("contains(fromJSON('[\"a\"]'), 'a')", {})).toBe(true);
    expect(evalIn("toJSON(fromJSON('{\"a\":1}'))", {})).toBe('{"a":1}');
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

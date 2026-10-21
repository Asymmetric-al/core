/**
 * Minimal GitHub Actions expression parser and evaluator for workflow tests.
 *
 * Covers the expression language actually used by this repo's workflows:
 * literals, context property access (`a.b`, `a['b']`), `!`, `==`, `!=`, `<`,
 * `<=`, `>`, `>=`, `&&`, `||`, parentheses, and the functions listed in
 * {@link FUNCTIONS}. Semantics follow the GitHub docs and actions/runner
 * `EvaluationResult.cs`: `&&` / `||` return an operand; two strings compare
 * (including `<`, `>`, `<=`, `>=`) with case-insensitive ordinal comparison;
 * only mismatched types coerce to numbers, and arrays/objects never coerce.
 * Unknown functions and unknown context roots throw, so a test can
 * never silently evaluate an expression it does not understand.
 */

export type ExprValue =
  string | number | boolean | null | ExprValue[] | { [key: string]: ExprValue };

export type ExprNode =
  | { kind: "literal"; value: string | number | boolean | null }
  | { kind: "ident"; name: string }
  | { kind: "member"; object: ExprNode; property: string }
  | { kind: "index"; object: ExprNode; index: ExprNode }
  | { kind: "call"; name: string; args: ExprNode[] }
  | { kind: "not"; operand: ExprNode }
  | {
      kind: "binary";
      op: "==" | "!=" | "<" | "<=" | ">" | ">=" | "&&" | "||";
      left: ExprNode;
      right: ExprNode;
    };

type Token =
  | { type: "str"; value: string }
  | { type: "num"; value: number }
  | { type: "word"; value: string }
  | { type: "op"; value: string }
  | { type: "end" };

const OPERATORS = [
  "==",
  "!=",
  "<=",
  ">=",
  "&&",
  "||",
  "<",
  ">",
  "!",
  "(",
  ")",
  "[",
  "]",
  ".",
  ",",
];

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < source.length) {
    const ch = source[i]!;
    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }
    if (ch === "'") {
      let value = "";
      i += 1;
      for (;;) {
        if (i >= source.length) throw new Error("Unterminated string literal");
        if (source[i] === "'") {
          if (source[i + 1] === "'") {
            value += "'";
            i += 2;
            continue;
          }
          i += 1;
          break;
        }
        value += source[i];
        i += 1;
      }
      tokens.push({ type: "str", value });
      continue;
    }
    const num = /^(?:0x[0-9a-fA-F]+|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(
      source.slice(i),
    );
    if (num && (tokens.length === 0 || tokens.at(-1)?.type === "op")) {
      tokens.push({ type: "num", value: Number(num[0]) });
      i += num[0].length;
      continue;
    }
    const word = /^[A-Za-z_][A-Za-z0-9_-]*/.exec(source.slice(i));
    if (word) {
      tokens.push({ type: "word", value: word[0] });
      i += word[0].length;
      continue;
    }
    const op = OPERATORS.find((candidate) => source.startsWith(candidate, i));
    if (op) {
      tokens.push({ type: "op", value: op });
      i += op.length;
      continue;
    }
    throw new Error(`Unexpected character ${JSON.stringify(ch)} at ${i}`);
  }
  tokens.push({ type: "end" });
  return tokens;
}

/** Strip a single surrounding `${{ ... }}` (whole-string) wrapper, if present. */
export function unwrapExpression(source: string): string {
  const trimmed = source.trim();
  const match = /^\$\{\{([\s\S]*)\}\}$/.exec(trimmed);
  if (match && !match[1]!.includes("${{")) return match[1]!.trim();
  return trimmed;
}

export function parseExpression(source: string): ExprNode {
  const tokens = tokenize(unwrapExpression(source));
  let pos = 0;
  const peek = (): Token => tokens[pos]!;
  const isOp = (value: string): boolean => {
    const token = peek();
    return token.type === "op" && token.value === value;
  };
  const expectOp = (value: string): void => {
    if (!isOp(value)) {
      throw new Error(`Expected '${value}' in expression: ${source}`);
    }
    pos += 1;
  };

  const parseOr = (): ExprNode => {
    let left = parseAnd();
    while (isOp("||")) {
      pos += 1;
      left = { kind: "binary", op: "||", left, right: parseAnd() };
    }
    return left;
  };
  const parseAnd = (): ExprNode => {
    let left = parseEquality();
    while (isOp("&&")) {
      pos += 1;
      left = { kind: "binary", op: "&&", left, right: parseEquality() };
    }
    return left;
  };
  const parseEquality = (): ExprNode => {
    let left = parseComparison();
    while (isOp("==") || isOp("!=")) {
      const op = (peek() as { value: "==" | "!=" }).value;
      pos += 1;
      left = { kind: "binary", op, left, right: parseComparison() };
    }
    return left;
  };
  const parseComparison = (): ExprNode => {
    let left = parseUnary();
    while (isOp("<") || isOp("<=") || isOp(">") || isOp(">=")) {
      const op = (peek() as { value: "<" | "<=" | ">" | ">=" }).value;
      pos += 1;
      left = { kind: "binary", op, left, right: parseUnary() };
    }
    return left;
  };
  const parseUnary = (): ExprNode => {
    if (isOp("!")) {
      pos += 1;
      return { kind: "not", operand: parseUnary() };
    }
    return parsePostfix();
  };
  const parsePostfix = (): ExprNode => {
    let node = parsePrimary();
    for (;;) {
      if (isOp(".")) {
        pos += 1;
        const token = peek();
        if (
          token.type !== "word" &&
          !(token.type === "op" && token.value === "*")
        ) {
          throw new Error(`Expected property name in expression: ${source}`);
        }
        pos += 1;
        node = { kind: "member", object: node, property: String(token.value) };
        continue;
      }
      if (isOp("[")) {
        pos += 1;
        const index = parseOr();
        expectOp("]");
        node = { kind: "index", object: node, index };
        continue;
      }
      return node;
    }
  };
  const parsePrimary = (): ExprNode => {
    const token = peek();
    if (token.type === "str" || token.type === "num") {
      pos += 1;
      return { kind: "literal", value: token.value };
    }
    if (token.type === "op" && token.value === "(") {
      pos += 1;
      const inner = parseOr();
      expectOp(")");
      return inner;
    }
    if (token.type === "word") {
      pos += 1;
      if (token.value === "true") return { kind: "literal", value: true };
      if (token.value === "false") return { kind: "literal", value: false };
      if (token.value === "null") return { kind: "literal", value: null };
      if (isOp("(")) {
        pos += 1;
        const args: ExprNode[] = [];
        if (!isOp(")")) {
          args.push(parseOr());
          while (isOp(",")) {
            pos += 1;
            args.push(parseOr());
          }
        }
        expectOp(")");
        return { kind: "call", name: token.value.toLowerCase(), args };
      }
      return { kind: "ident", name: token.value };
    }
    throw new Error(`Unexpected token in expression: ${source}`);
  };

  const ast = parseOr();
  if (peek().type !== "end") {
    throw new Error(`Trailing tokens in expression: ${source}`);
  }
  return ast;
}

/** Structural AST equality; `==` / `!=` operands compare order-insensitively. */
export function exprEquals(a: ExprNode, b: ExprNode): boolean {
  if (a.kind !== b.kind) return false;
  switch (a.kind) {
    case "literal":
      return a.value === (b as typeof a).value;
    case "ident":
      return a.name === (b as typeof a).name;
    case "member": {
      const other = b as typeof a;
      return (
        a.property === other.property && exprEquals(a.object, other.object)
      );
    }
    case "index": {
      const other = b as typeof a;
      return (
        exprEquals(a.object, other.object) && exprEquals(a.index, other.index)
      );
    }
    case "call": {
      const other = b as typeof a;
      return (
        a.name === other.name &&
        a.args.length === other.args.length &&
        a.args.every((arg, i) => exprEquals(arg, other.args[i]!))
      );
    }
    case "not":
      return exprEquals(a.operand, (b as typeof a).operand);
    case "binary": {
      const other = b as typeof a;
      if (a.op !== other.op) return false;
      const direct =
        exprEquals(a.left, other.left) && exprEquals(a.right, other.right);
      if (direct) return true;
      return (
        (a.op === "==" || a.op === "!=") &&
        exprEquals(a.left, other.right) &&
        exprEquals(a.right, other.left)
      );
    }
  }
}

/** Flatten a top-level `&&` chain into its conjuncts (parentheses are already gone). */
export function conjuncts(node: ExprNode): ExprNode[] {
  if (node.kind === "binary" && node.op === "&&") {
    return [...conjuncts(node.left), ...conjuncts(node.right)];
  }
  return [node];
}

export function walkExpression(
  node: ExprNode,
  visit: (n: ExprNode) => void,
): void {
  visit(node);
  switch (node.kind) {
    case "member":
      walkExpression(node.object, visit);
      return;
    case "index":
      walkExpression(node.object, visit);
      walkExpression(node.index, visit);
      return;
    case "call":
      node.args.forEach((arg) => walkExpression(arg, visit));
      return;
    case "not":
      walkExpression(node.operand, visit);
      return;
    case "binary":
      walkExpression(node.left, visit);
      walkExpression(node.right, visit);
      return;
    default:
      return;
  }
}

export const STATUS_FUNCTIONS = ["always", "success", "failure", "cancelled"];

export function usesStatusFunction(node: ExprNode): boolean {
  let found = false;
  walkExpression(node, (n) => {
    if (n.kind === "call" && STATUS_FUNCTIONS.includes(n.name)) found = true;
  });
  return found;
}

export type EvalContext = {
  contexts: Record<string, ExprValue>;
  /** Result for `success()` / `failure()` / `cancelled()`. */
  status?: { success: boolean; failure: boolean; cancelled: boolean };
};

export function truthy(value: ExprValue): boolean {
  if (value === null || value === false || value === "" || value === 0)
    return false;
  if (typeof value === "number" && Number.isNaN(value)) return false;
  return true;
}

function toNumber(value: ExprValue): number {
  if (value === null) return 0;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    if (value.trim() === "") return 0;
    const n = Number(value);
    return Number.isNaN(n) ? Number.NaN : n;
  }
  return Number.NaN;
}

type ValueKind = "null" | "boolean" | "number" | "string" | "object";

function kindOf(value: ExprValue): ValueKind {
  if (value === null) return "null";
  if (typeof value === "object") return "object";
  return typeof value as "boolean" | "number" | "string";
}

/**
 * actions/runner `EvaluationResult.CoerceTypes`: values of the same kind are
 * left alone; number/string pairs convert the string; a boolean or null side
 * converts to a number and coercion repeats. Arrays and objects never coerce,
 * so they only ever compare against their own kind.
 */
function coerceTypes(
  left: ExprValue,
  right: ExprValue,
): [ExprValue, ExprValue] {
  const leftKind = kindOf(left);
  const rightKind = kindOf(right);
  if (leftKind === rightKind) return [left, right];
  if (leftKind === "number" && rightKind === "string") {
    return [left, toNumber(right)];
  }
  if (leftKind === "string" && rightKind === "number") {
    return [toNumber(left), right];
  }
  if (leftKind === "boolean" || leftKind === "null") {
    return coerceTypes(toNumber(left), right);
  }
  if (rightKind === "boolean" || rightKind === "null") {
    return coerceTypes(left, toNumber(right));
  }
  return [left, right];
}

/**
 * .NET `OrdinalIgnoreCase`: compare UTF-16 code units after simple per-unit
 * upper-casing (no multi-character mappings such as `ß` -> `SS`).
 */
function foldOrdinalIgnoreCase(value: string): string {
  let folded = "";
  for (const unit of value.split("")) {
    const upper = unit.toUpperCase();
    folded += upper.length === 1 ? upper : unit;
  }
  return folded;
}

function compareOrdinalIgnoreCase(a: string, b: string): number {
  const left = foldOrdinalIgnoreCase(a);
  const right = foldOrdinalIgnoreCase(b);
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

/** actions/runner `EvaluationResult.AbstractEqual`. */
function looseEquals(a: ExprValue, b: ExprValue): boolean {
  const [left, right] = coerceTypes(a, b);
  const kind = kindOf(left);
  if (kind !== kindOf(right)) return false;
  switch (kind) {
    case "null":
      return true;
    case "string":
      return compareOrdinalIgnoreCase(left as string, right as string) === 0;
    default:
      // Numbers (NaN never equals anything), booleans, and arrays/objects by reference.
      return left === right;
  }
}

/** actions/runner `EvaluationResult.AbstractGreaterThan`. */
function looseGreaterThan(a: ExprValue, b: ExprValue): boolean {
  const [left, right] = coerceTypes(a, b);
  const kind = kindOf(left);
  if (kind !== kindOf(right)) return false;
  switch (kind) {
    case "number":
      return (left as number) > (right as number);
    case "string":
      return compareOrdinalIgnoreCase(left as string, right as string) > 0;
    case "boolean":
      return left === true && right === false;
    default:
      return false;
  }
}

/** actions/runner `EvaluationResult.AbstractLessThan`. */
function looseLessThan(a: ExprValue, b: ExprValue): boolean {
  return looseGreaterThan(b, a);
}

function stringify(value: ExprValue): string {
  if (value === null) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function lookup(object: ExprValue, key: string): ExprValue {
  if (object === null || typeof object !== "object" || Array.isArray(object)) {
    return null;
  }
  const match = Object.keys(object).find(
    (candidate) => candidate.toLowerCase() === key.toLowerCase(),
  );
  return match === undefined ? null : object[match]!;
}

const FUNCTIONS: Record<
  string,
  (args: ExprValue[], ctx: EvalContext) => ExprValue
> = {
  always: () => true,
  success: (_args, ctx) => ctx.status?.success ?? true,
  failure: (_args, ctx) => ctx.status?.failure ?? false,
  cancelled: (_args, ctx) => ctx.status?.cancelled ?? false,
  fromjson: ([value]) => JSON.parse(stringify(value ?? null)) as ExprValue,
  tojson: ([value]) => JSON.stringify(value ?? null),
  contains: ([haystack, needle]) =>
    Array.isArray(haystack)
      ? haystack.some((item) => looseEquals(item, needle ?? null))
      : stringify(haystack ?? null)
          .toLowerCase()
          .includes(stringify(needle ?? null).toLowerCase()),
  startswith: ([s, p]) =>
    stringify(s ?? null)
      .toLowerCase()
      .startsWith(stringify(p ?? null).toLowerCase()),
  endswith: ([s, p]) =>
    stringify(s ?? null)
      .toLowerCase()
      .endsWith(stringify(p ?? null).toLowerCase()),
};

export function evaluateExpression(
  node: ExprNode,
  ctx: EvalContext,
): ExprValue {
  switch (node.kind) {
    case "literal":
      return node.value;
    case "ident": {
      const root = Object.keys(ctx.contexts).find(
        (key) => key.toLowerCase() === node.name.toLowerCase(),
      );
      if (root === undefined) {
        throw new Error(`Unknown context '${node.name}' in expression`);
      }
      return ctx.contexts[root]!;
    }
    case "member":
      return lookup(evaluateExpression(node.object, ctx), node.property);
    case "index": {
      const object = evaluateExpression(node.object, ctx);
      const index = evaluateExpression(node.index, ctx);
      if (Array.isArray(object) && typeof index === "number") {
        return object[index] ?? null;
      }
      return lookup(object, stringify(index));
    }
    case "call": {
      const fn = FUNCTIONS[node.name];
      if (!fn) throw new Error(`Unsupported function '${node.name}()'`);
      return fn(
        node.args.map((arg) => evaluateExpression(arg, ctx)),
        ctx,
      );
    }
    case "not":
      return !truthy(evaluateExpression(node.operand, ctx));
    case "binary": {
      if (node.op === "&&") {
        const left = evaluateExpression(node.left, ctx);
        return truthy(left) ? evaluateExpression(node.right, ctx) : left;
      }
      if (node.op === "||") {
        const left = evaluateExpression(node.left, ctx);
        return truthy(left) ? left : evaluateExpression(node.right, ctx);
      }
      const left = evaluateExpression(node.left, ctx);
      const right = evaluateExpression(node.right, ctx);
      switch (node.op) {
        case "==":
          return looseEquals(left, right);
        case "!=":
          return !looseEquals(left, right);
        case "<":
          return looseLessThan(left, right);
        case "<=":
          return looseLessThan(left, right) || looseEquals(left, right);
        case ">":
          return looseGreaterThan(left, right);
        case ">=":
          return looseGreaterThan(left, right) || looseEquals(left, right);
      }
    }
  }
  throw new Error("Unreachable expression node");
}

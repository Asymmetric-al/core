// Calls from a page to the app's own API carry the tenant (plan 5.2; WP2b,
// AL-2675). Page code calls the app's `/api` routes through one wrapper,
// `ownApiFetch` in `@asym/database/own-api`, which sends the document's tenant
// and assignment as request headers. This rule refuses any other way of
// reaching an own-API path from page code: a direct `fetch`, a beacon, an
// event source or request object, an XMLHttpRequest, and a navigation (a link,
// `window.open`, a location change), which can carry no header at all.
//
// The rule has no exemption mechanism of its own, and none is configured: a
// call that cannot move onto the wrapper is a finding, not an exception.
//
// What it can see. ESLint reads one module at a time, so the rule follows an
// address statically: a string or template literal, a `const` (or a `let`
// assigned only own-API values), a conditional or `??`/`||` choice, a `+`
// concatenation, `new URL(…)`, `String(…)` and `.toString()`, and a parameter
// of a function in the same module whose call sites pass one. An address
// built in another module and handed over as a value is out of its sight.

const OWN_API_PATH = /^\/api(?:[/?#]|$)/;
const GLOBAL_OBJECTS = new Set(["window", "globalThis", "self"]);
const HTTP_METHODS = new Set([
  "GET",
  "HEAD",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
]);
const NAVIGATION_ATTRIBUTES = new Set(["href", "action", "formAction"]);
const MAX_DEPTH = 12;

const CALL_MESSAGE =
  "Call the app's own API through ownApiFetch from @asym/database/own-api: it sends the document's tenant and assignment (plan 5.2). A direct call to an own-API path is refused.";
const NAVIGATION_MESSAGE =
  "An own-API path opened as a page address carries no tenant header (plan 5.2). Fetch it with ownApiFetch, or download it with ownApiDownload, from @asym/database/own-api.";

function unwrap(node) {
  let current = node;
  while (
    current &&
    (current.type === "TSAsExpression" ||
      current.type === "TSSatisfiesExpression" ||
      current.type === "TSNonNullExpression" ||
      current.type === "TSTypeAssertion" ||
      current.type === "ChainExpression" ||
      current.type === "ParenthesizedExpression")
  ) {
    current = current.expression;
  }
  return current;
}

function findVariable(scope, name) {
  for (let current = scope; current; current = current.upper) {
    const variable = current.set.get(name);
    if (variable) return variable;
  }
  return null;
}

/** Whether `name` is the global binding here, not a local or imported one. */
function isGlobalName(sourceCode, node, name) {
  const variable = findVariable(sourceCode.getScope(node), name);
  return !variable || variable.defs.length === 0;
}

function isGlobalObject(sourceCode, node) {
  const object = unwrap(node);
  return (
    object?.type === "Identifier" &&
    GLOBAL_OBJECTS.has(object.name) &&
    isGlobalName(sourceCode, object, object.name)
  );
}

function propertyName(member) {
  if (member.type !== "MemberExpression") return null;
  if (!member.computed && member.property.type === "Identifier") {
    return member.property.name;
  }
  if (member.property.type === "Literal") return String(member.property.value);
  return null;
}

/** `location`, `window.location` or `document.location`. */
function isLocation(sourceCode, node) {
  const target = unwrap(node);
  if (target?.type === "Identifier") {
    return (
      target.name === "location" && isGlobalName(sourceCode, target, "location")
    );
  }
  if (
    target?.type !== "MemberExpression" ||
    propertyName(target) !== "location"
  )
    return false;
  const object = unwrap(target.object);
  return (
    isGlobalObject(sourceCode, object) ||
    (object?.type === "Identifier" &&
      object.name === "document" &&
      isGlobalName(sourceCode, object, "document"))
  );
}

/** The function a parameter belongs to, and the name its module calls it by. */
function functionBinding(fn) {
  if (fn.type === "FunctionDeclaration" && fn.id) return fn.id;
  const parent = fn.parent;
  if (parent?.type === "VariableDeclarator" && parent.id.type === "Identifier")
    return parent.id;
  // `const f = useCallback((url) => …, [])` and other single wrappers.
  if (
    parent?.type === "CallExpression" &&
    parent.arguments[0] === fn &&
    parent.parent?.type === "VariableDeclarator" &&
    parent.parent.id.type === "Identifier"
  )
    return parent.parent.id;
  return null;
}

function createResolver(sourceCode) {
  function resolvesToOwnApi(rawNode, depth, seen) {
    const node = unwrap(rawNode);
    if (!node || depth > MAX_DEPTH || seen.has(node)) return false;
    seen.add(node);
    const next = (child) => resolvesToOwnApi(child, depth + 1, seen);

    switch (node.type) {
      case "Literal":
        return typeof node.value === "string" && OWN_API_PATH.test(node.value);
      case "TemplateLiteral": {
        const head = node.quasis[0]?.value.cooked ?? "";
        if (head.length > 0) return OWN_API_PATH.test(head);
        return node.expressions.length > 0 && next(node.expressions[0]);
      }
      case "ConditionalExpression":
        return next(node.consequent) || next(node.alternate);
      case "LogicalExpression":
        return next(node.left) || next(node.right);
      case "BinaryExpression":
        return node.operator === "+" && next(node.left);
      case "NewExpression":
        return (
          node.callee.type === "Identifier" &&
          node.callee.name === "URL" &&
          node.arguments.length > 0 &&
          next(node.arguments[0])
        );
      case "CallExpression": {
        const callee = unwrap(node.callee);
        if (
          callee.type === "Identifier" &&
          ["String", "encodeURI"].includes(callee.name)
        )
          return node.arguments.length > 0 && next(node.arguments[0]);
        if (
          callee.type === "MemberExpression" &&
          ["toString", "concat", "trim"].includes(propertyName(callee))
        )
          return next(callee.object);
        return false;
      }
      case "MemberExpression":
        return (
          ["href", "pathname"].includes(propertyName(node)) && next(node.object)
        );
      case "Identifier":
        return resolveIdentifier(node, depth, seen);
      default:
        return false;
    }
  }

  function resolveIdentifier(node, depth, seen) {
    const variable = findVariable(sourceCode.getScope(node), node.name);
    if (!variable) return false;
    const next = (child) => resolvesToOwnApi(child, depth + 1, seen);
    for (const def of variable.defs) {
      if (def.type === "Variable") {
        if (def.node.init && next(def.node.init)) return true;
        const written = variable.references.some(
          (reference) =>
            reference.isWrite() &&
            reference.writeExpr &&
            reference.writeExpr !== def.node.init &&
            next(reference.writeExpr),
        );
        if (written) return true;
      }
      if (def.type === "Parameter" && resolveParameter(def, node, depth, seen))
        return true;
    }
    return false;
  }

  function resolveParameter(def, identifier, depth, seen) {
    const fn = def.node;
    const index = fn.params.findIndex((param) => {
      const target = param.type === "AssignmentPattern" ? param.left : param;
      return target.type === "Identifier" && target.name === identifier.name;
    });
    if (index === -1) return false;
    const param = fn.params[index];
    if (
      param.type === "AssignmentPattern" &&
      resolvesToOwnApi(param.right, depth + 1, seen)
    )
      return true;
    const binding = functionBinding(fn);
    if (!binding) return false;
    const variable = findVariable(sourceCode.getScope(binding), binding.name);
    if (!variable) return false;
    return variable.references.some((reference) => {
      const call = reference.identifier.parent;
      return (
        call?.type === "CallExpression" &&
        call.callee === reference.identifier &&
        call.arguments.length > index &&
        resolvesToOwnApi(call.arguments[index], depth + 1, seen)
      );
    });
  }

  return (node) => resolvesToOwnApi(node, 0, new Set());
}

/** The address argument of a direct transport call, or `null`. */
function callTarget(sourceCode, node) {
  const callee = unwrap(node.callee);
  const args = node.arguments;
  if (callee.type === "Identifier") {
    if (
      ["fetch", "open"].includes(callee.name) &&
      isGlobalName(sourceCode, callee, callee.name)
    )
      return args[0] ?? null;
    return null;
  }
  if (callee.type !== "MemberExpression") return null;
  const name = propertyName(callee);
  const object = unwrap(callee.object);
  if (
    (name === "fetch" || name === "open") &&
    isGlobalObject(sourceCode, object)
  )
    return args[0] ?? null;
  if (name === "sendBeacon") return args[0] ?? null;
  if (
    (name === "assign" || name === "replace") &&
    isLocation(sourceCode, object)
  )
    return args[0] ?? null;
  // XMLHttpRequest#open(method, url)
  if (
    name === "open" &&
    args.length >= 2 &&
    unwrap(args[0])?.type === "Literal" &&
    typeof unwrap(args[0]).value === "string" &&
    HTTP_METHODS.has(unwrap(args[0]).value.toUpperCase())
  )
    return args[1];
  return null;
}

export const noDirectOwnApiCall = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Refuse a direct call to the app's own API; page code uses ownApiFetch (plan 5.2).",
    },
    schema: [],
    messages: { call: CALL_MESSAGE, navigation: NAVIGATION_MESSAGE },
  },
  create(context) {
    const { sourceCode } = context;
    const isOwnApi = createResolver(sourceCode);
    return {
      CallExpression(node) {
        const target = callTarget(sourceCode, node);
        if (!target || !isOwnApi(target)) return;
        const callee = unwrap(node.callee);
        const name =
          callee.type === "Identifier" ? callee.name : propertyName(callee);
        const isNavigation =
          (name === "open" && node.arguments[0] === target) ||
          name === "assign" ||
          name === "replace";
        context.report({
          node: target,
          messageId: isNavigation ? "navigation" : "call",
        });
      },
      NewExpression(node) {
        const callee = unwrap(node.callee);
        if (
          callee.type !== "Identifier" ||
          !["EventSource", "Request", "WebSocket"].includes(callee.name) ||
          !isGlobalName(sourceCode, callee, callee.name)
        )
          return;
        const target = node.arguments[0];
        if (target && isOwnApi(target))
          context.report({ node: target, messageId: "call" });
      },
      AssignmentExpression(node) {
        const left = unwrap(node.left);
        const isLocationWrite =
          isLocation(sourceCode, left) ||
          (left.type === "MemberExpression" &&
            propertyName(left) === "href" &&
            isLocation(sourceCode, left.object));
        if (isLocationWrite && isOwnApi(node.right))
          context.report({ node: node.right, messageId: "navigation" });
      },
      JSXAttribute(node) {
        if (
          node.name.type !== "JSXIdentifier" ||
          !NAVIGATION_ATTRIBUTES.has(node.name.name) ||
          !node.value
        )
          return;
        const value =
          node.value.type === "JSXExpressionContainer"
            ? node.value.expression
            : node.value;
        if (value.type !== "JSXEmptyExpression" && isOwnApi(value))
          context.report({ node: value, messageId: "navigation" });
      },
    };
  },
};

export const ownApiPlugin = {
  meta: { name: "@asym/own-api" },
  rules: { "no-direct-call": noDirectOwnApiCall },
};

/**
 * The rule as a flat-config block. Each product workspace (the three apps and
 * the packages their pages import) composes it into its own config, because
 * `bun run lint` lints every workspace with that workspace's config.
 */
export const ownApiConfig = [
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
    plugins: { "own-api": ownApiPlugin },
    rules: { "own-api/no-direct-call": "error" },
  },
];

export default ownApiConfig;
